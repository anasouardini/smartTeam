const Bcript = require('bcrypt');
const UserM = require('../models/user');
const { v4: uuid } = require('uuid');

const signup = async (req, res) => {
  if (!req.body?.username || !req.body?.password) {
    // console.log(req.body);
    return res
      .status(400)
      .json({ data: 'the entered information is not complete' });
  }

  // check if username is taken
  const checkUserResponse = await UserM.read({ username: req.body.username });
  if (!checkUserResponse) {
    throw Error('error while signing up');
  }
  if (checkUserResponse[0].length) {
    return res
      .status(400)
      .json({ data: 'username is taken, choose another one.' });
  }

  // craete the new account with hashed password
  const hashedPassword = await Bcript.hash(req.body.password, 10);
  const createUserResponse = await UserM.create({
    username: req.body.username,
    password: hashedPassword,
    email: req.body.email,
    description: '',
    avatar: '',
  });

  if (!createUserResponse?.err && createUserResponse[0]?.affectedRows) {
    return res.json({ data: 'account created successfully.' });
  }

  res.status(500).json({data: 'error while creating account'})

  // email verification
};

module.exports = signup;
