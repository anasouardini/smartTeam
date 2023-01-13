const Bcript = require('bcrypt');
const UserM = require('../models/user');
const { v4: uuid } = require('uuid');
const mailer = require('./mailer');
const os = require('os');
const jwt = require('jsonwebtoken');
const fs = require('fs/promises');

const signup = async (req, res) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;

  if (!username || !password) {
    // console.log(req.body);
    return res
      .status(400)
      .json({ data: 'the entered information is not complete' });
  }

  // check if username is taken
  const checkUserResponse = await UserM.read({ username });
  if (!checkUserResponse) {
    throw Error('error while signing up');
  }
  if (checkUserResponse[0].length) {
    return res
      .status(400)
      .json({ data: 'username is taken, choose another one.' });
  }

  // craete the new account with hashed password
  const hashedPassword = await Bcript.hash(password, 10);
  const createUserResponse = await UserM.create({
    username,
    password: hashedPassword,
    email,
    description: '',
    avatar: '',
  });

  if (createUserResponse?.err || !createUserResponse[0]?.affectedRows) {
    return res.status(500).json({ data: 'error while creating account' });
  }

  // email verification
  const privKey = await fs.readFile(`${process.cwd()}/rsa/emailVerification/key`, { encoding: 'utf8' });
  // console.log('l48 signup.js: ', privKey);
  const jwtOptions = { algorithm: 'RS256'};
  const token = jwt.sign({ username, email }, privKey, jwtOptions);
  const hostname = process.env.PRODUCTION ? req.hostname : '127.0.0.1:3000';
  const messageBody = `This email was linkded to an account on ${hostname},
                      If you are the one that linked it feel free to click on the link 
                      bellow to verify it.\n ${hostname}/verifyEmail/${token}`;
  // console.log('signup.js: ', messageBody);
  // async
  mailer(email, messageBody);

  return res.json({
    data: 'account created successfully. please check your email for a verification link.',
  });
};

module.exports = signup;
