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

const read = async ({ username, email }) => {
  let query = 'select * from users where username=?';
  let vars = [username];

  if (email) {
    query += ' and email=?';
    vars.push(email);
  }

  const response = await pool(query, vars);

  return response;
};

const update = async (filter, newData) => {
  if (!newData || Object.keys(newData).length == 0) {
    return { err: 'no data is provided' };
  }

  let query = `update users set`;
  let vars = [username, email];

  // data=value, data=value...
  newData.entries.forEach((item, index) => {
    if (index == 0) {
      query += ` ${item[0]}=?`;
      vars.push(item[1]);
    }
    query += `, ${item[0]}=?`;
    vars.push(item[1]);
  });

  // where 1=1 and filter=value...
  query += ' where 1=1';
  filter.entries.forEach((item) => {
    query += ` and ${item[0]}=?`;
    vars.push(item[1]);
  });

  const response = await pool(query, vars);

  return response;
};

const remove = async ({ username }) => {
  const response = await pool('delete from users where username=?;', [
    username,
  ]);

  return response;
};

module.exports = { create, read, update, remove };
