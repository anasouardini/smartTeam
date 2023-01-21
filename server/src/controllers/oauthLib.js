const axios = require('axios');
require('dotenv').config();

// for presisting login
const fs = require('fs/promises');
const jwt = require('jsonwebtoken');

const google = async (req, res, options) => {
  // you can use the accessToken to get user info
  // https://www.googleapis.com/oauth2/v1/userinfo

  // google con sole for oauth credentials
  //https://con sole.cloud.google.com/apis

  const shared = {
    accessTokenEndpoint: 'https://oauth2.googleapis.com/token',
    consentEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
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
      .post(shared.accessTokenEndpoint, accessTokenRequest, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      .then((res) => res.data)
      .catch((error) => {
        console.log('err: oauth requesting accessToken - google ', error);
        return { error: error.response.data.error };
      });

    if (response?.error) {
      options.onError('google oauth server error');
      return { status: 'error' };
    }

    try {
      const accessTokenResponse = jwt.decode(response.id_token);

      // CHECK EMAIL VERIFICATION
      if (!accessTokenResponse.email_verified) {
        options.onError('email is not verified');
        return { status: 'error' };
      }

      if (accessTokenResponse.nonce != process.env.randome_verification_token) {
        options.onError('the verification nonce was altered');
        return { status: 'error' };
      }

      return { status: 'success', ...accessTokenResponse };
    } catch (err) {
      options.onError('google auth server sent an invalid access token');

      console.log('oauth server err: ', err);
      return { status: 'error' };
    }
  }

  // NO ID TOKEN: REDIRECTING TO THE CONSENT SCREEN
  consentData = {
    response_type: 'code', // specific to google
    scope: 'email profile',
    nonce: process.env.randome_verification_token, // called state in github
    redirect_uri: options.redirect_uri,
    client_id: options.client_id,
  };

  res.redirect(`${shared.consentEndpoint}?${new URLSearchParams(consentData)}`);

  return { status: 'consent' };
};

const github = async (req, res, options) => {
  // github's docs for oauth
  // https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps#web-application-flow

  const shared = {
    accessTokenEndpoint: 'https://github.com/login/oauth/access_token',
    infoEndpoint: 'https://api.github.com/user',
    consentEndpoint: 'https://github.com/login/oauth/authorize',
  };

  if (req.query?.code) {
    if (req.query.state != process.env.randome_verification_token) {
      options.onError('the verification state was altered');
      return { status: 'error' };
    }

    const accessTokenRequest = {
      redirect_uri: options.redirect_uri,
      client_id: options.client_id,
      client_secret: options.client_secret,
      code: req.query.code,
    };
    // request the access token using the code
    const response = await axios
      .post(shared.accessTokenEndpoint, accessTokenRequest, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
      })
      .then((res) => res.data)
      .catch((error) => {
        console.log('err: requesting accessToken - github', error);
        return { error: error.response.data.error };
      });

    if (response?.error) {
      options.onError('oauth server error');
      return { status: 'error' };
    }

    // request user info using the access token
    const userInfoResponse = await axios
      .get(shared.infoEndpoint, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${response.access_token}`,
        },
      })
      .then((res) => res.data)
      .catch((error) => {
        console.log('err: requesting user info - github', error);
        return { error: error.response.data.error };
      });

    return { status: 'success', ...userInfoResponse };
  }

  // NO ID TOKEN: REDIRECTING TO THE CONSENT SCREEN
  consentData = {
    scope: 'email profile',
    state: process.env.randome_verification_token,
    redirect_uri: options.redirect_uri,
    client_id: options.client_id,
  };

  res.redirect(`${shared.consentEndpoint}?${new URLSearchParams(consentData)}`);

  return { status: 'consent' };
};

module.exports = { google, github };
