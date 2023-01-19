require('dotenv').config();
const OauthLib = require('./oauthLib');

// for presisting login
const fs = require('fs/promises');
const jwt = require('jsonwebtoken');

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

const oauth = async (req, res) => {
  const method = req.params.method;

  // check if function exists
  if (!OauthLib[method]) {
    return res.status(404).json({data: 'this oauth method is not implementd in the server'})
  }

  const options = {
    redirect_uri: process.env.DEV_SERVER_ADDRESS + '/oauth/google',
    client_id: process.env.AUTH_GOOGLE_ID,
    client_secret: process.env.AUTH_GOOGLE_SECRET,

    onError: (err) => {
      return res.redirect(`${process.env.DEV_CLIENT_ADDRESS}?error=${err}`);
    },
  };

  const accessTokenResponse = await OauthLib[method](req, res, method, options);

  // console.log(accessTokenResponse)
  if (accessTokenResponse.status == 'success') {
    upsertUser(accessTokenResponse);
    presistAuth(req, res);
    return res.redirect(`${process.env.DEV_CLIENT_ADDRESS}`);
  }
};

module.exports = oauth;
