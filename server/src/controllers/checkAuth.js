const jwt = require('jsonwebtoken');
const fs = require('fs/promises');
const MUser = require('../models/user');

require('dotenv').config();

const genNewAccessToken = async (userID) => {
  const privKey = await fs.readFile(`${process.cwd()}/rsa/auth/key.pem`, {
    encoding: 'utf-8',
  });

  const token = jwt.sign({ userID }, privKey, {
    algorithm: 'RS256',
    expiresIn: '1h',
  });

  return token;
};

const checkAccessToken = async (accessToken) => {
  if (accessToken) {
    const pubKey = await fs.readFile(`${process.cwd()}/rsa/auth/key.pub`, {
      encoding: 'utf-8',
    });

    try {
      return jwt.verify(accessToken, pubKey);
    } catch (err) {
      // console.log('verifying access token: ', err);
    }
  }

  return undefined;
};

const checkRefreshToken = async (refreshToken) => {
  if (refreshToken) {
    const pubKey = await fs.readFile(`${process.cwd()}/rsa/auth/key.pub`, {
      encoding: 'utf-8',
    });

    // console.log(refreshToken);
    // console.log(pubKey);

    try {
      return jwt.verify(refreshToken, pubKey);
    } catch (err) {
      console.log('erro verifying refresh token: ', err);
    }
  }

  return undefined;
};

const checkAuth = async (req, res, next) => {
  // console.log(req.headers?.accesstoken);

  let accessTokenValid = await checkAccessToken(req.headers?.accesstoken);
  // console.log('accessTokenValid: ', accessTokenValid);
  if (accessTokenValid) res.userID = accessTokenValid.userID;

  let refreshTokenValid = await checkRefreshToken(
    req?.cookies?.[process.env.COOKIE_NAME]
  );
  // console.log('refreshTokenValid: ', refreshTokenValid);

  // refreshing the access token
  if (!accessTokenValid && refreshTokenValid) {
    return res.json({
      data: 'new access token',
      accessToken: await genNewAccessToken(refreshTokenValid.userID),
    });
  }

  const tokensValid = accessTokenValid && refreshTokenValid;

  // the client is checking the login session
  if (req.path == '/isLogin') {
    if (!tokensValid) {
      return res.json({ loginStatus: false });
    }
    const userResp = await MUser.read({ id: accessTokenValid.userID });
    const userInfo = {
      id: userResp[0][0].id,
      username: userResp[0][0].username
    }
    if (userResp.err) {
      next('error while trying to get user info for the client sharedLayout');
    }
    return res.json({ loginStatus: true, loggedInUser: userInfo });
  }

  // order matters
  const exceptionRoutes = ['/login', '/signup', '/oauth', '/initDB'];

  const theFirst3Items = [0, 3];
  if (
    exceptionRoutes.slice(...theFirst3Items).includes(req.path) &&
    tokensValid
  ) {
    // console.log('redirect to home', exceptionRoutes.slice(theFirst3Items))
    return res.json({ redirect: '/' });
  }

  if (
    !exceptionRoutes.includes(req.path) &&
    !req.path.match('^/verifyEmail/') &&
    !tokensValid
  ) {
    return res.json({ redirect: '/login' });
  }

  // the other two cases are passed to the proper route
  next();
};

module.exports = checkAuth;
