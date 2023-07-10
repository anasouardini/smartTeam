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

  const autoQuery = AutoQuery.create('portfolios', newData);
  const response = await Pool(autoQuery.query, autoQuery.vars);

  return response;
};

const read = async (filter, fields) => {
  const autoQuery = AutoQuery.read('portfolios', filter, fields);
  const response = await Pool(autoQuery.query, autoQuery.vars);

  return response;
};

const list = async (filter) => {
  const autoQuery = AutoQuery.read('portfolios', filter, ['id', 'title']);
  const response = await Pool(autoQuery.query, autoQuery.vars);

  return response;
};

const update = async (filter, newData) => {
  if (!newData || Object.keys(newData).length == 0) {
    return { warning: 'no data is provided' };
  }

  const autoQuery = AutoQuery.update('portfolios', filter, newData);
  const response = await Pool(autoQuery.query, autoQuery.vars);

  return response;
};

const remove = async (filter) => {
  const autoQuery = AutoQuery.remove('portfolios', filter);
  const response = await Pool(autoQuery.query, autoQuery.vars);

  return response;
};

const increaseProjectsNumber = async (filter) => {
  const autoQuery = {
    query: `update portfolios set projectsNumber=projectsNumber+1`,
    vars: []
  };

  const filterKeys = Object.keys(filter);
  if(filterKeys.length){
    autoQuery.query += ` where`;

    filterKeys.forEach((filterKey)=>{
      autoQuery.query += ` ${filterKey}=? and`
      autoQuery.vars.push(filter[filterKey])
    })
    autoQuery.query = autoQuery.query.slice(0, -4);//removing the last " and"
  }

  const response = await Pool(autoQuery.query, autoQuery.vars);

  return response;
};


const decreaseProjectsNumber = async (filter) => {
  const autoQuery = {
    query: `update portfolios set projectsNumber=projectsNumber-1`,
    vars: []
  };

  const filterKeys = Object.keys(filter);
  if(filterKeys.length){
    autoQuery.query += ` where`;

    filterKeys.forEach((filterKey)=>{
      autoQuery.query += ` ${filterKey}=? and`
      autoQuery.vars.push(filter[filterKey])
    })
    autoQuery.query = autoQuery.query.slice(0, -4);//removing the last " and"
  }

  console.log(autoQuery)

  const response = await Pool(autoQuery.query, autoQuery.vars);

  return response;
};


const increaseDoneProjectsNumber = async (filter) => {
  const autoQuery = {
    query: `update portfolios set doneProjectsNumber=doneProjectsNumber+1`,
    vars: []
  };

  const filterKeys = Object.keys(filter);
  if(filterKeys.length){
    autoQuery.query += ` where`;

    filterKeys.forEach((filterKey)=>{
      autoQuery.query += ` ${filterKey}=? and`
      autoQuery.vars.push(filter[filterKey])
    })
    autoQuery.query = autoQuery.query.slice(0, -4);//removing the last " and"
  }

  console.log(autoQuery)

  const response = await Pool(autoQuery.query, autoQuery.vars);

  return response;
};

const decreaseDoneProjectsNumber = async (filter) => {
  const autoQuery = {
    query: `update portfolios set doneProjectsNumber=doneProjectsNumber+1`,
    vars: []
  };

  const filterKeys = Object.keys(filter);
  if(filterKeys.length){
    autoQuery.query += ` where`;

    filterKeys.forEach((filterKey)=>{
      autoQuery.query += ` ${filterKey}=? and`
      autoQuery.vars.push(filter[filterKey])
    })
    autoQuery.query = autoQuery.query.slice(0, -4);//removing the last " and"
  }

  console.log(autoQuery)

  const response = await Pool(autoQuery.query, autoQuery.vars);

  return response;
};

module.exports = {
  create,
  read,
  list,
  update,
  increaseProjectsNumber,
  decreaseProjectsNumber,
  increaseDoneProjectsNumber,
  decreaseDoneProjectsNumber,
  remove
};
