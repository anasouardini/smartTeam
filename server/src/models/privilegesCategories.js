const Pool = require('./dbPool');
const AutoQuery = require('./tools/autoQuery');
const { v4: uuid } = require('uuid');

const create = async (newData) => {
  if (!newData || Object.keys(newData).length == 0) {
    return { err: 'no data is provided' };
  }
  newData.id = uuid();

  const autoQuery = AutoQuery.create('privilegesCategories', newData);
  const response = await Pool(autoQuery.query, autoQuery.vars);

  return response;
};

const read = async (filter, fields) => {
  const autoQuery = AutoQuery.read('privilegesCategories', filter, fields);
  const response = await Pool(autoQuery.query, autoQuery.vars);

  // console.log(response[0]);
  return response;
};

const list = async (filter) => {
  const autoQuery = AutoQuery.read('privilegesCategories', filter, ['id']);
  const response = await Pool(autoQuery.query, autoQuery.vars);

  return response;
};

const update = async (filter, newData) => {
  if (!newData || Object.keys(newData).length == 0) {
    return { err: 'no data is provided' };
  }

  const autoQuery = AutoQuery.update('privilgesCategories', filter, newData);
  const response = await Pool(autoQuery.query, autoQuery.vars);

  return response;
};

const remove = async (filter) => {
  const autoQuery = AutoQuery.remove('privilgesCategories', filter);
  const response = await Pool(autoQuery.query, autoQuery.vars);

  return response;
};

module.exports = { create, read, list, update, remove };
