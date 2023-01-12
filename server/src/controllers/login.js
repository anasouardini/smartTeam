const Bcript = require('bcrypt');
const UserM = require('../models/user');

const login = async (req, res, next) => {
  if (!req.body?.username || !req.body?.password) {
    res.status(400).jsong({ data: 'the entered information is not complete' });
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

  if (passwordCorrect) {
    return res.json({ data: 'logged in successfully' });
  }

  return res.status(400).json({ data: 'credentials are not correct.' });

  // create tokens
  // if(passwordCorrect){
  //
};

module.exports = login;
