const Bcript = require('bcrypt');
const MUser = require('../models/user');
const { v4: uuid } = require('uuid');
const mailer = require('./mailer');
const os = require('os');
const jwt = require('jsonwebtoken');
const fs = require('fs/promises');

require('dotenv').config();

const signup = async (req, res) => {
  const fullname = req.body.fullname;
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;

  if (!username || !password) {
    return res
      .status(400)
      .json({ data: 'the entered information is not complete' });
  }

  // check if username is taken
  const checkUserResponse = await MUser.read({ username });
  if (!checkUserResponse) {
    throw Error('error while signing up');
  }
  if (checkUserResponse[0].length) {
    return res
      .status(400)
      .json({ error: 'username is taken, choose another one.' });
  }

  // craete the new account with hashed password
  const hashedPassword = await Bcript.hash(password, 10);
  const createUserResponse = await MUser.create({
    username,
    password: hashedPassword,
    email,
    fullname,
    title: '',
    description: '',
    avatar: '',
  });

  if (createUserResponse?.err || !createUserResponse[0]?.affectedRows) {
    return res.status(500).json({ error: 'error while creating account' });
  }

  // email verification
  const privKey = await fs.readFile(`${process.cwd()}/rsa/emailverification/key.pem`, { encoding: 'utf8' });
  // console.log('l48 signup.js: ', privKey);
  const jwtOptions = { algorithm: 'RS256'};
  const token = jwt.sign({ username, email }, privKey, jwtOptions);
  const hostname = process.env.PRODUCTION==1 ? req.hostname : process.env.DEV_SERVER_ADDRESS;
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
