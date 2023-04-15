const Pool = require('./dbPool');
const AutoQuery = require('./tools/autoQuery');
const { v4: uuid } = require('uuid');

const create = async (newData) => {
  if (!newData || Object.keys(newData).length == 0) {
    return { warning: 'no data is provided' };
  }
  newData.id = uuid();

  // const response2 = await Pool(`select * from privilegesCategories;`, [newData.user]);
  // console.log(newData.owner_FK)
  // console.log(newData.user)
  // console.log(response2)

  const autoQuery = AutoQuery.create('privileges', newData);
  const response = await Pool(autoQuery.query, autoQuery.vars);

  return response;
};

const read = async (filter, fields) => {
  const autoQuery = AutoQuery.read('privileges', filter, fields);
  // console.log(autoQuery)
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
    return { warning: 'no data is provided' };
  }

  const autoQuery = AutoQuery.update('privileges', filter, newData);
  const response = await Pool(autoQuery.query, autoQuery.vars);

  return response;
};

const remove = async (filter) => {
  const autoQuery = AutoQuery.remove('privileges', filter);
  const response = await Pool(autoQuery.query, autoQuery.vars);

  return response;
};

//TODO: need to filter by user as well
const check = async ({route, itemID}) => {
  const tableSingular = route.slice(0, -1) + '_FK';// removing the plural 's'
  const response = await Pool(`
    select * from privileges P
    inner join privilegesCategories C on P.privCat_FK=C.id
    where P.${tableSingular}=?;
    `,
    [itemID]);

  // console.log(itemID)
  // console.log(response[0])
  return response;
}

module.exports = { create, read, list, update, remove, check };
