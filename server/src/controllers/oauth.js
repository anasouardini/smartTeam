require('dotenv').config();
const OauthLib = require('./oauthLib');
const MUser = require('../models/user');

// for presisting login
const fs = require('fs/promises');
const jwt = require('jsonwebtoken');

const upsertUser = async (req, res, next, method, oauthAccessToken) => {

  let accountInfo = {};
  if (method == 'github') {
    const { id } = oauthAccessToken;
    const accountID = `${method}-${id}`;

    accountInfo = {
      username: accountID,
      password: '',
      email: '',
      fullname: '',
      title: '',
      description: '',
      avatar: '',
    };
  }
  else if (method == 'google') {
    const { email} = oauthAccessToken;

    accountInfo = {
      username: email,
      password: '',
      email: '',
      fullname: '',
      title: '',
      description: '',
      avatar: '',
    };
  }
  const readUserResponse = await MUser.read({ id: accountID });

  if (readUserResponse?.err) {
    return next('error while checking account existence - upsertUser');
  }

  const createUserResponse = await MUser.create(accountInfo);

  if (createUserResponse?.err || !createUserResponse[0]?.affectedRows) {
    return next('error while creating account');
  }

  // TODO mark as verified
  // github: github-id
  // google: email
};

const presistAuth = async (req, res, upsertionData) => {
  // creating the refresh token
  {
    const privKey = await fs.readFile(`${process.cwd()}/rsa/auth/key.pem`, {
      encoding: 'utf8',
    });
    const jwtOptions = { algorithm: 'RS256', expiresIn: '1h' };
    const refreshToken = jwt.sign(
      { userID: checkUserResponse[0][0].id },
      privKey,
      jwtOptions
    );

    res.cookie(process.env.COOKIE_NAME, refreshToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 24h
    });
  }
  // creating the access token
  {
    const privKey = await fs.readFile(`${process.cwd()}/rsa/auth/key.pem`, {
      encoding: 'utf8',
    });
    const jwtOptions = { algorithm: 'RS256', expiresIn: '1h' };
    const accessToken = jwt.sign(
      { userID: checkUserResponse[0][0].id },
      privKey,
      jwtOptions
    );

    return res.json({
      data: 'logged in successfully',
      accessToken,
      redirect: `/user/${req.body?.username}`,
    });
  }
};

const oauth = async (req, res) => {
  const method = req.params.method;

  // check if function exists
  if (!OauthLib[method]) {
    return res
      .status(404)
      .json({ data: 'this oauth method is not implementd in the server' });
  }

  // start of -- using my oauth lib
  const options = {
    redirect_uri: process.env.DEV_SERVER_ADDRESS + `/oauth/${method}`,
    client_id: process.env[`auth_${method}_id`],
    client_secret: process.env[`auth_${method}_secret`],

    onError: (err) => {
      console.log(err);
      return res.redirect(
        `${process.env.DEV_CLIENT_ADDRESS}/login?error=${err}`
      );
    },
  };

  const accessTokenResponse = await OauthLib[method](req, res, options);
  // end of -- using my oauth lib

  // console.log(accessTokenResponse)
  if (accessTokenResponse.status == 'success') {
    const upsertionData = upsertUser(
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
