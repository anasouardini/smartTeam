// TS treats modules as scripts without this dummy import
import {} from './index'

const Bcript = require('bcrypt');
const UserM = require('../models/user');
const fs = require('fs/promises');
const jwt = require('jsonwebtoken');

const presistLogin = async (req, res, userID) => {
  // creating the refresh token
  let refreshToken;
  {
    const privKey = await fs.readFile(`${process.cwd()}/rsa/auth/key.pem`, {
      encoding: 'utf8',
    });
    const jwtOptions = { algorithm: 'RS256', expiresIn: '1d' };
    refreshToken = jwt.sign(
      { userID: userID },
      privKey,
      jwtOptions
    );

    const oneHoure = 1000 * 60 * 60
    res.cookie(process.env.COOKIE_NAME, refreshToken, {
      httpOnly: true,
      maxAge: oneHoure * 24,
    });
  }

  // creating the access token
  let accessToken;
  {
    const privKey = await fs.readFile(`${process.cwd()}/rsa/auth/key.pem`, {
      encoding: 'utf8',
    });
    const jwtOptions = { algorithm: 'RS256', expiresIn: '1d' };
    accessToken = jwt.sign(
      { userID: userID },
      privKey,
      jwtOptions
    );
  }

  return {accessToken, refreshToken};
};

const login = async (req, res, next) => {

  if (!req.body?.username || !req.body?.password) {
    return res.status(200).json({ error: 'the entered information is not complete' });
  }

  // check if username exists
  // console.log(req.body);
  const checkUserResponse = await UserM.read({ username: req.body.username });
  if (checkUserResponse?.err) {
    return next('something went bad in the server while loggin in');
  }
  // console.log(checkUserResponse)
  if (!checkUserResponse[0].length) {
    return res.status(200).json({ error: 'credentials are not correct.' });
  }

  if (!checkUserResponse[0][0].verified) {
    return res.status(200).json({ error: 'verify your account before you can login.' });
  }

  // checking if passwords match up
  const passwordCorrect = await Bcript.compare(
    req.body.password,
    checkUserResponse[0][0].password
  );

  // empty password are not accepted but this is in case I decided to expermente with the code later.
  if (!passwordCorrect || req.body.password == '') {
    return res.status(200).json({ error: 'credentials are not correct.' });
  }

  const tokens = await presistLogin(req, res, checkUserResponse[0][0].id);
  if (tokens) {
    return res.json({
      data: 'logged in successfully',
      accessToken: tokens.accessToken,
      redirect: `/user/${req.body?.username}`,
    });
  }
  // console.log(tokens);

  return next('Something went bad while trying to login');
};

module.exports = login;
