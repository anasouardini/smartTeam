const pool = require('./dbPool');
const { v4: uuid } = require('uuid');

const create = async (userData, explicitID) => {
  if (userData?.id && !explicitID) {
    return { err: 'id is provided and explicitID was not specified' };
  }
  // TODO: refactore

  // this simply resuls in this -> ?, ?, ?, ?... times the length of userData
  let placeholders =
    '?, '.repeat(Object.entries(userData).length) + '?';
  if(explicitID){
    placeholders = placeholders.slice(0, placeholders.length-3)
  }

  const response = await pool(
    `insert into users(${explicitID ? '' : 'id, '}${Object.keys(userData).join(
      ', '
    )})
     values(${placeholders});`,
    explicitID ? Object.values(userData) : [uuid(), ...Object.values(userData)]
  );

  return response;
};

const read = async (filter) => {
  let query = 'select * from users';
  let vars = [];

  // where 1=1 and filter=value...
  query += ' where 1=1';
  Object.entries(filter).forEach((item) => {
    query += ` and ${item[0]}=?`;
    vars.push(item[1]);
  });

  const response = await pool(query, vars);

  return response;
};

const update = async (filter, newData) => {
  if (!newData || Object.keys(newData).length == 0) {
    return { err: 'no data is provided' };
  }

  let query = `update users set`;
  let vars = [];

  // data=value, data=value...
  Object.entries(newData).forEach((item, index) => {
    if (index == 0) {
      query += ` ${item[0]}=?`;
      vars.push(item[1]);
    }
    query += `, ${item[0]}=?`;
    vars.push(item[1]);
  });

  // where 1=1 and filter=value...
  query += ' where 1=1';
  Object.entries(filter).forEach((item) => {
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
