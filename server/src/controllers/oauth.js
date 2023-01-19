const axios = require('axios');
require('dotenv').config();

// for presisting login
const fs = require('fs/promises');
const jwt = require('jsonwebtoken');

const oauth = async (req, res, oauthServer, options) => {
  // AUTH_GOOGLE_INFO_ENDPOINT='https://www.googleapis.com/oauth2/v1/userinfo'

  const defaults = {
    google: {
      accessTokenEndpoint: 'https://oauth2.googleapis.com/token',
      consentEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    },
  };

  if (req.query?.code) {
    const accessTokenRequest = {
      redirect_uri: options.redirect_uri,
      client_id: options.client_id,
      client_secret: options.client_secret,
      grant_type: 'authorization_code',
      code: req.query.code,
    };
    const response = await axios
      .post(defaults[oauthServer].accessTokenEndpoint, accessTokenRequest, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      .then((res) => res.data)
      .catch((error) => ({ error: error.response.data.error }));

    if (response?.error) {
      options.onError('oauth server error');
      return { status: 'error' };
    }

    try {
      const accessTokenResponse = jwt.decode(response.id_token);

      // CHECK EMAIL VERIFICATION
      if (!accessTokenResponse.email_verified) {
        options.onError('email is not verified');
        return { status: 'error' };
      }

      return { status: 'success', ...accessTokenResponse };
    } catch (err) {
      options.onError(
        oauthServer + ' auth server sent an invalid access token'
      );

      return { status: 'error' };
    }
  }

  // NO ID TOKEN: REDIRECTING TO THE CONSENT SCREEN
  consentData = {
    response_type: 'code',
    scope: 'email profile',
    nonce: '161581761691-3tjdu1rca5q35h60qcgrd7eb0tb2ulmpakonamatata',
    redirect_uri: options.redirect_uri,
    client_id: options.client_id,
  };

  res.redirect(
    `${defaults[oauthServer].consentEndpoint}?${new URLSearchParams(
      consentData
    )}`
  );

  return { status: 'consent' };
};

const upsertUser = async (oauthAccessToken) => {
  const { email, email_verified } = oauthAccessToken;
  // TODO
};

const presistAuth = async (req, res) => {
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

const google = async (req, res) => {
  const options = {
    redirect_uri: process.env.DEV_SERVER_ADDRESS + '/oauth/google',
    client_id: process.env.AUTH_GOOGLE_ID,
    client_secret: process.env.AUTH_GOOGLE_SECRET,

    onError: (err) => {
      return res.redirect(`${process.env.DEV_CLIENT_ADDRESS}?error=${err}`);
    },
  };

  const accessTokenResponse = await oauth(req, res, 'google', options);

  // console.log(accessTokenResponse)
  if (accessTokenResponse.status == 'success') {
    upsertUser(accessTokenResponse);
    presistAuth(req, res);
    return res.redirect(`${process.env.DEV_CLIENT_ADDRESS}`);
  }
};

module.exports = { google };
