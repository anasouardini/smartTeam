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
  if (!accessTokenValid && refreshTokenValid && !req.path.includes('/oauth/')) {
    return res.json({
      data: 'new access token',
      accessToken: await genNewAccessToken(refreshTokenValid.userID),
    });
  }

  const authenticated = accessTokenValid && refreshTokenValid;

  // the client is checking the login session
  if (req.path == '/isLogin') {
    if (!refreshTokenValid) {
      return res.json({ loginStatus: false });
    }

    const userResp = await MUser.read({ id: refreshTokenValid.userID });

    if (!userResp[0].length) {
      return res.json({ loginStatus: false});
    }

    const userInfo = {
      id: userResp[0][0].id,
      username: userResp[0][0].username,
    };
    if (userResp.err) {
      next('error while trying to get user info for the client sharedLayout');
    }
    return res.json({ loginStatus: true, loggedInUser: userInfo });
  }

  // order matters
  const authRoutes = ['/login', '/signup', '/oauth/google', '/oauth/github'];
  const authIndependent = ['/initDB'];

  const tryingToAuth = authRoutes.includes(req.path);
  if (tryingToAuth && authenticated) {
    // console.log('redirect to home', exceptionRoutes.slice(theFirst3Items))
    const userResp = await MUser.read({ id: refreshTokenValid.userID });

    if (!userResp[0].length) {
      return res.json({ redirect: '/login' });
    }
    return res.json({ redirect: `user/${userResp[0][0].username}` });
  }

  const visitingAfterAuthRoutes =
    !tryingToAuth &&
    !authIndependent.includes(req.path) &&
    !req.path.match('^/verifyEmail/');
  if (visitingAfterAuthRoutes && !authenticated) {
    return res.json({ redirect: '/login' });
  }

  // the other two cases are passed to the proper route
  next();
};

module.exports = checkAuth;
