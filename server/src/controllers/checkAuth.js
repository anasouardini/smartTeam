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
      // when token experies, it's considered as an erro!! wierd.
      console.log('erro verifying refresh token: ', err);
    }
  }

  return undefined;
};

const checkAuth = async (req, res, next) => {
  // console.log(req.method, req.path, req.params, req.body)
  // console.log(req.headers?.accesstoken);
  // TODO: check if user exists in both token checks

  let accessTokenValid = await checkAccessToken(req.headers?.accesstoken);
  // console.log('accessTokenValid: ', accessTokenValid);

  let refreshTokenValid = await checkRefreshToken(
    req?.cookies?.[process.env.COOKIE_NAME]
  );
  if (refreshTokenValid) req.userID = refreshTokenValid.userID;
  // console.log('refreshTokenValid: ', refreshTokenValid);

  const fullyAuthenticated = accessTokenValid && refreshTokenValid;
  const authenticationNeedsRefreshing = !accessTokenValid && refreshTokenValid;

  //--- AUTH CONDITIONS
  const verifyingEmail = req.path.match('^/verifyEmail/');

  const tryingToAuth = [
    '/login',
    '/signup',
    '/oauth/google',
    '/oauth/github',
  ].includes(req.path);
  const verifyingConnection = req.path.match('^/verifyConnection/') ? true : false;

  const doesNotMatterIfAuthenticated = ['/initDB', '/isLogin'].includes(
    req.path || verifyingEmail
  ) || req.path.match('^/media/avatars/.*') ? true : false;

  const needsAuthentication = !doesNotMatterIfAuthenticated && !tryingToAuth;
  const alreadyAuthenticated = tryingToAuth && fullyAuthenticated;
  const tryingToSwitchAccounts = req.body.switchingAccounts ?? false;

  //---- authentication paths
  if (alreadyAuthenticated && !tryingToSwitchAccounts) {
    const userResp = await MUser.read({ id: refreshTokenValid.userID });

    if (!userResp[0].length) {
      return res.json({ redirect: '/login' });
    }

    return res.json({ redirect: `/user/${userResp[0][0].username}` });
  } else if (needsAuthentication && !fullyAuthenticated) {

    // Access Token is not valid, let's refresh it
    if (authenticationNeedsRefreshing && !verifyingConnection) {
      return res.json({
        data: 'new access token',
        accessToken: await genNewAccessToken(refreshTokenValid.userID),
      });
    } else if (!refreshTokenValid) {
      return res.json({ redirect: '/login' });
    }
  }

  // TODO: needs to be in its own route
  // the client is checking the login session
  if (req.path == '/isLogin') {
    if (!refreshTokenValid) {
      return res.json({ loginStatus: false });
    }

    const userResp = await MUser.read({ id: refreshTokenValid.userID });

    if (userResp.err || !userResp[0]?.length) {
      return res.json({ loginStatus: false });
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

  // the other cases are passed to the proper route
  next();
};

module.exports = checkAuth;
