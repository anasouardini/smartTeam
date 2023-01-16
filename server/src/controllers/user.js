const MUser = require('../models/user');

const read = async (req, res) =>{

  const readUserResponse = await MUser.read({id: res.userID});
  if(readUserResponse?.err){
    return next('something went bad in the server while getting user info');
  }

  if(!readUserResponse[0].length){
    return res.status(404).json({error: 'there is no such user'});
  }

  const {id, username, email, fullname, title, description, avatar, createDate} = readUserResponse[0][0];

  res.json({data: {id, username, email, fullname, title, description, avatar, createDate}});
}

const update = async (req, res)=>{

}

const remove = async (req, res)=>{

}

module.exports = {read, update, remove}
