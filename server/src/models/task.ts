const Pool = require('./dbPool');
const AutoQuery = require('./tools/autoQuery');
const { v4: uuid } = require('uuid');

// TS treats modules as scripts without this dummy import
import {} from './portfolio'

const create = async (newData) => {
  if (!newData || Object.keys(newData).length == 0) {
    return { warning: 'no data is provided' };
  }
  newData.id = uuid();

  const autoQuery = AutoQuery.create('tasks', newData);
  const response = await Pool(autoQuery.query, autoQuery.vars);

  return response;
};

const read = async (filter, fields) => {
  const autoQuery = AutoQuery.read('tasks', filter, fields);
  const response = await Pool(autoQuery.query, autoQuery.vars);

  // console.log(response[0]);
  return response;
};

const list = async (filter) => {
  const autoQuery = AutoQuery.read('tasks', filter, ['id', 'title']);
  const response = await Pool(autoQuery.query, autoQuery.vars);

  return response;
};

const update = async (filter, newData) => {
  if (!newData || Object.keys(newData).length == 0) {
    return { warning: 'no data is provided' };
  }

  const autoQuery = AutoQuery.update('tasks', filter, newData);
  const response = await Pool(autoQuery.query, autoQuery.vars);

  return response;
};

const remove = async (filter) => {
  const autoQuery = AutoQuery.remove('tasks', filter);
  const response = await Pool(autoQuery.query, autoQuery.vars);

  return response;
};

module.exports = { create, read, list, update, remove };
