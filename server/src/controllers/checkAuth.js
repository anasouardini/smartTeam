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


const checkAccessToken = async ()=>{
    let accessToken = req.headers?.accesstoken;
    if (accessToken) {
      const pubKey = await fs.readFile(`${process.cwd()}/rsa/auth/key.pub`, {
        encoding: 'utf-8',
      });

      try {
        res.userID = jwt.verify(accessToken, pubKey);
        return true;
      } catch (err) {}
    }

    return false;
}

const checkRefreshToken = async ()=>{
    const refreshToken = req?.cookies?.[process.env.COOKIE_NAME];
    if (refreshToken) {
      const pubKey = await fs.readFile(`${process.cwd()}/rsa/auth/key.pub`, {
        encoding: 'utf-8',
      });

      try {
        const { userID } = jwt.verify(refreshToken, pubKey);
        if (accessTokenValid) {
          return true;
        } else {
          return res.json({
            data: 'new access token',
            accessToken: await genNewAccessToken(userID),
          });
        }
      } catch (err) {}
    }

  return false;
}

const checkAuth = async (req, res, next) => {

  let accessTokenValid = await checkAccessToken();
  console.log('accessTokenValid: ', accessTokenValid);

  let refreshTokenValid = checkRefreshToken();
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
