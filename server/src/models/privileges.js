const Pool = require('./dbPool');
const AutoQuery = require('./tools/autoQuery');
const { v4: uuid } = require('uuid');

const create = async (newData) => {
  if (!newData || Object.keys(newData).length == 0) {
    return { err: 'no data is provided' };
  }
  newData.id = uuid();

  const autoQuery = AutoQuery.create('privileges', newData);
  const response = await Pool(autoQuery.query, autoQuery.vars);

  return response;
};

const read = async (filter, fields) => {
  const autoQuery = AutoQuery.read('privileges', filter, fields);
  const response = await Pool(autoQuery.query, autoQuery.vars);

  // console.log(autoQuery)
  // console.log(response[0]);
  return response;
};

const list = async (filter) => {
  const autoQuery = AutoQuery.read('privileges', filter, ['privCat']);
  const response = await Pool(autoQuery.query, autoQuery.vars);

  return response;
};

const update = async (filter, newData) => {
  if (!newData || Object.keys(newData).length == 0) {
    return { err: 'no data is provided' };
  }

  const autoQuery = AutoQuery.update('privilges', filter, newData);
  const response = await Pool(autoQuery.query, autoQuery.vars);

  return response;
};

const remove = async (filter) => {
  const autoQuery = AutoQuery.remove('privilges', filter);
  const response = await Pool(autoQuery.query, autoQuery.vars);

  return response;
};

const check = async ({table, itemID}) => {
  const tableSingular = table.slice(0, -1);// removing the plural 's'
  const response = await Pool(`
    select C.privilege from ? I
    inner join privileges P on I.id=P.?_FK
    inner join privilegesCategories C on P.privCat_FK=C.id
    where I.id=?;`,
    [table, tableSingular, itemID]);

  return response;
  

}

module.exports = { create, read, list, update, remove, check };
