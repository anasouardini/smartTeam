const Bcript = require('bcrypt');
const UserM = require('../models/user');
const fs = require('fs/promises');
const jwt = require('jsonwebtoken')

const login = async (req, res, next) => {
  if (!req.body?.username || !req.body?.password) {
    res.status(400).json({ data: 'the entered information is not complete' });
  }

  // check if username exists
  // console.log(req.body);
  const checkUserResponse = await UserM.read({ username: req.body.username });
  if (!checkUserResponse) {
    return next('something went bad in the server while loggin in');
  }
  // console.log(checkUserResponse)
  if (!checkUserResponse[0].length) {
    return res.status(400).json({ data: 'credentials are not correct.' });
  }

  // checking if passwords match up
  const passwordCorrect = await Bcript.compare(
    req.body.password,
    checkUserResponse[0][0].password
  );

  if (!passwordCorrect) {
    return res.status(400).json({ data: 'credentials are not correct.' });
  }

  // creating the refresh token
  {
    const privKey = await fs.readFile(`${process.cwd()}/rsa/auth/key.pem`, {
      encoding: 'utf8',
    });
    const jwtOptions = { algorithm: 'RS256', expiresIn: '1h' };
    const refreshToken = jwt.sign({ userID: checkUserResponse[0][0].id }, privKey, jwtOptions);

    res.cookie(process.env.COOKIE_NAME, refreshToken, {httpOnly: true, maxAge: 1000*60*60*24});
  }

  // creating the access token
  {
    const privKey = await fs.readFile(`${process.cwd()}/rsa/auth/key.pem`, {
      encoding: 'utf8',
    });
    const jwtOptions = { algorithm: 'RS256', expiresIn: '1h' };
    const accessToken = jwt.sign({ userID: checkUserResponse[0][0].id }, privKey, jwtOptions);

    res.json({ data: 'logged in successfully', accessToken, redirect: `/user/${req.body?.username}`});
  }

};

module.exports = login;
