const Pool = require('./dbPool');
const AutoQuery = require('./tools/autoQuery');
const { v4: uuid } = require('uuid');

// TS treats modules as scripts without this dummy import
import {} from './portfolio'

// I cna't recal why that explicitID in there :)
const create = async (newData, explicitID) => {
  if (!newData || Object.keys(newData).length == 0) {
    return { err: 'no data is provided' };
  }

  if (newData?.id) {
    if (!explicitID) {
      return { err: 'id is provided and explicitID was not specified' };
    }
  }else{
    newData.id = uuid();
  }


  const autoQuery = AutoQuery.create('users', newData);
  const response = await Pool(autoQuery.query, autoQuery.vars);

  return response;
};

const read = async (filter) => {

  const autoQuery = AutoQuery.read('users', filter);
  const response = await Pool(autoQuery.query, autoQuery.vars);

  return response;
};

const list = async (filter) => {
  const autoQuery = AutoQuery.read('users', filter, ['id', 'username']);
  const response = await Pool(autoQuery.query, autoQuery.vars);

  return response;
};

const update = async (filter, newData) => {
  if (!newData || Object.keys(newData).length == 0) {
    return { err: 'no data is provided' };
  }

  const autoQuery = AutoQuery.update('users', filter, newData);
  const response = await Pool(autoQuery.query, autoQuery.vars);

  return response;
};

const remove = async (filter) => {
  const autoQuery = AutoQuery.remove('users', filter);
  const response = await Pool(autoQuery.query, autoQuery.vars);

  return response;
};

module.exports = { create, read, list, update, remove };
