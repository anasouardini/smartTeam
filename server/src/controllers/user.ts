// TS treats modules as scripts without this dummy import
import {} from './index'

const MUser = require('../models/user');

const create = async (req, res) => {};

const read = async (req, res) => {
  const readUserResponse = await MUser.read({ id: req.userID });
  if (readUserResponse?.err) {
    return next('something went bad in the server while getting user info');
  }

  if (!readUserResponse[0].length) {
    return res.status(404).json({ error: 'there is no such user' });
  }

  const {
    id,
    username,
    email,
    fullname,
    title,
    description,
    avatar,
    createDate,
  } = readUserResponse[0][0];

  res.json({
    data: {
      id,
      username,
      email,
      fullname,
      title,
      description,
      avatar,
      createDate,
    },
  });
};

const update = async (req, res, next) => {
  const editableFiels = [
    'username',
    'title',
    'email',
    'fullname',
    'description',
  ];
  const newData = req.body;
  
  Object.keys(newData).forEach((fieldKey) =>{
    if(!editableFiels.includes(fieldKey)) delete newData[fieldKey];
  });

  const updateUserResp = await MUser.update(
    { username: req.params.user },
    newData
  );

  if(updateUserResp?.err){
    next('error while update user info')
  }

  if(!updateUserResp[0]?.affectedRows){
    next('error: cannot update user info')
  }

  return res.json({data: `The field(s): ${Object.keys(newData).join(', ')} updated successfully`})
};

const remove = async (req, res) => {};

module.exports = { create, read, update, remove };
