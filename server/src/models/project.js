const Pool = require('./dbPool');
const AutoQuery = require('./tools/autoQuery');
const { v4: uuid } = require('uuid');

const create = async (newData) => {
  if (!newData || Object.keys(newData).length == 0) {
    return { err: 'no data is provided' };
  }
  newData.id = uuid();

  const autoQuery = AutoQuery.create('projects', newData);
  const response = await Pool(autoQuery.query, autoQuery.vars);

  return response;
};

const read = async (filter, fields) => {
  const autoQuery = AutoQuery.read('projects', filter, fields);
  const response = await Pool(autoQuery.query, autoQuery.vars);

  return response;
};

const list = async (filter) => {
  const autoQuery = AutoQuery.read('projects', filter, ['id', 'title']);
  const response = await Pool(autoQuery.query, autoQuery.vars);

  return response;
};

const update = async (filter, newData) => {
  if (!newData || Object.keys(newData).length == 0) {
    return { err: 'no data is provided' };
  }

  const autoQuery = AutoQuery.update('projects', filter, newData);
  const response = await Pool(autoQuery.query, autoQuery.vars);

  return response;
};

const remove = async (filter) => {
  const autoQuery = AutoQuery.remove('projects', filter);
  const response = await Pool(autoQuery.query, autoQuery.vars);

  return response;
};

module.exports = { create, read, list, update, remove };
