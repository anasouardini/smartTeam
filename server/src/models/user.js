const pool = require('./dbPool');
const { v4: uuid } = require('uuid');

const create = async ({ username, password, email, description, avatar }) => {
  const response = await pool(
    `insert into users(id, username, password, email, avatar, description)
     values(?, ?, ?, ?, ?, ?);`,
    [uuid(), username, password, email, description, avatar]
  );

  return response;
};

const read = async ({ username }) => {
  const response = await pool('select * from users where username=?;', [
    username,
  ]);

  return response;
};

const update = async ({
  username,
  password,
  email,
  description,
  avatar,
}) => {
  const response = await pool(
    `update users set username=?, password=?,
     email=?, description=?, avatar=?;`,
    [username, password, email, description, avatar]
  );

  return response;
};

const remove = async ({ username }) => {
  const response = await pool('delete from users where username=?;', [
    username,
  ]);

  return response;
};

module.exports = { create, read, update, remove };
