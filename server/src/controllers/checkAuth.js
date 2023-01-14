const jwt = require('jsonwebtoken');
const fs = require('fs/promises');

require('dotenv').config();

const genNewAccessToken = async (userID) => {
  const privKey = await fs.readFile(`${process.cwd()}/rsa/auth/key`, {
    encoding: 'utf-8',
  });

  const token = jwt.sign({ userID }, privKey, {
    algorithm: 'RS256',
    expiresIn: '1h',
  });

  return token;
};

const checkAuth = async (req, res, next) => {

  // TODO: clean up the syntax

  let accessTokenValid = false;
  {
    let accessToken = req.headers?.accesstoken;
    if (accessToken) {
      const pubKey = await fs.readFile(`${process.cwd()}/rsa/auth/key.pub`, {
        encoding: 'utf-8',
      });

      try {
        res.userID = jwt.verify(accessToken, pubKey);
        accessTokenValid = true;
      } catch (err) {}
    }
  }
  console.log('accessTokenValid: ', accessTokenValid);

  let refreshTokenValid = false;
  {
    const refreshToken = req?.cookies?.[process.env.COOKIE_NAME];
    if (refreshToken) {
      const pubKey = await fs.readFile(`${process.cwd()}/rsa/auth/key.pub`, {
        encoding: 'utf-8',
      });

      let usrID = null;
      let newAccessToken = null;
      try {
        const { userID } = jwt.verify(refreshToken, pubKey);
        if (accessTokenValid) {
          refreshTokenValid = true;
        } else {
          return res.json({
            data: 'new access token',
            accessToken: await genNewAccessToken(userID),
          });
        }
      } catch (err) {}
    }
  }
  console.log('refreshTokenValid: ', refreshTokenValid);

  const tokensValid = accessTokenValid && refreshTokenValid;

  // order matters
  const exceptionRoutes = ['/login', '/signup', '/oauth', '/initDB'];

  const theFirst3Items = [0, 3];
  if (exceptionRoutes.slice(theFirst3Items).includes(req.path) && tokensValid) {
    return res.json({ data: 'you are already logged in' });
  }

  if (!exceptionRoutes.includes(req.path) && !tokensValid) {
    return res.json({ data: 'you have to log in first' });
  }

  // the other two cases are passed to the proper route
  next();
};

module.exports = checkAuth;
