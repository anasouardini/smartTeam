const Bcript = require('bcrypt');
const UserM = require('../models/user');

const login = async (req, res)=>{
  if(!req.body?.username || !req.body?.password){
    res.status(400).jsong({data: 'the entered information is not complete'})
  }

  // check if username exists
  const checkUserResponse = await UserM.read(req.body.username);
  if(!checkUserResponse){throw Error('error while loging in')}
  if(!checkUserResponse[0].length){res.status(400).json({data: 'credentials are not correct.'})}

  // checking if passwords match up
  const passwordCorrect = Bcript.compare(req.body.password, checkUserResponse[0][0].password);
  
  // create tokens
  if(passwordCorrect){
    
  }

}

module.exports = login
