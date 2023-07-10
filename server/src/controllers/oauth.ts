// TS treats modules as scripts without this dummy import
import {} from './index'

require('dotenv').config();
const OauthLib = require('./oauthLib');
const MUser = require('../models/user');
const vars = require('./../vars.js');

// for presisting login
const fs = require('fs/promises');
const jwt = require('jsonwebtoken');

const upsertUser = async (req, res, next, method, oauthAccessToken) => {
  // console.log(oauthAccessToken);

  let accountInfo = {};
  if (method == 'github') {
    const { id, login, avatar_url, name } = oauthAccessToken;
    const accountID = `${method}-${id}`;

    accountInfo = {
      id: accountID,
      username: login,
      password: '',
      email: '',
      verified: 1,
      fullname: name,
      title: '',
      description: '',
      avatar: avatar_url,
    };
  } else if (method == 'google') {
    const { email, name, picture } = oauthAccessToken;
    const accountID = `${method}-${email.split('@')[0]}`;

    accountInfo = {
      id: accountID,
      username: accountID,
      password: '',
      email: email,
      verified: 1,
      fullname: name,
      title: '',
      description: '',
      avatar: picture,
    };
  }
  const readUserResponse = await MUser.read({ id: accountInfo.id });
  

  if (readUserResponse?.err) {
    return next('error while checking account existence - upsertUser');
  }

  if (readUserResponse[0].length) {
    return { status: 'success', accountInfo };
  }

  const createUserResponse = await MUser.create(accountInfo, true);
  if (createUserResponse?.err || !createUserResponse[0]?.affectedRows) {
    return next('error while creating account');
  }

  return { status: 'success', accountInfo };
};

const presistAuth = async (req, res, upsertionData) => {
  // creating the refresh token
  const privKey = await fs.readFile(`${process.cwd()}/rsa/auth/key.pem`, {
    encoding: 'utf8',
  });

  // console.log('refresh token data', upsertionData);
  const jwtOptions = { algorithm: 'RS256', expiresIn: '24h' };
  const refreshToken = jwt.sign(
    { userID: upsertionData.accountInfo.id },
    privKey,
    jwtOptions
  );

  res.cookie(process.env.COOKIE_NAME, refreshToken, {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24, // 24h
  });

  return res.redirect(
    `${vars.clientAddress}/user/${upsertionData.accountInfo.username}`
  );
};

const oauth = async (req, res, next) => {
  const method = req.params.method;
  console.log({method});

  // check if function exists
  if (!OauthLib[method]) {
    return res
      .status(404)
      .json({ data: 'this oauth method is not implementd in the server' });
  }

  // start of -- using my oauth lib
  const options = {
    redirect_uri:  `${req.protocol}://${req.headers.host}/oauth/${method}`,
    client_id: process.env[`auth_${method}_id`],
    client_secret: process.env[`auth_${method}_secret`],

    onError: (err) => {
      console.log(err);
      return res.redirect(
        `${vars.clientAddress}/login?error=${err}`
      );
    },
  };

  const accessTokenResponse = await OauthLib[method](req, res, options);
  // end of -- using my oauth lib

  // console.log(accessTokenResponse)
  if (accessTokenResponse.status == 'success') {
    const upsertionData = await upsertUser(
      req,
      res,
      next,
      method,
      accessTokenResponse
    );

    if (upsertionData.status == 'success') {
      presistAuth(req, res, upsertionData);
    }
  }
};

module.exports = oauth;
