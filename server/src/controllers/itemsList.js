const Models = {
  users: require('../models/user'),
  connections: require('../models/connection'),
  portfolios: require('../models/portfolio'),
  projects: require('../models/project'),
  tasks: require('../models/task'),
  privileges: require('../models/privileges'),
  privilegesCategories: require('../models/privilegesCategories'),
};

const read = async (req, res, next) => {
  const itemsListEntries = Object.entries(req.body.items);
  const promiseList = {};
  for (let i = 0; i < itemsListEntries.length; i++) {
    const item = itemsListEntries[i];
    // console.log(item);
    // console.log(Models[item.name].list);
    // console.log(item[1])

    const commonFilter = {owner_FK: req.userID}
    // users are not filtered by owner_FK
    if(item[0] === 'users'){
      delete commonFilter.owner_FK;
    }
    console.log('common', commonFilter)
    console.log('item', item[1])
    promiseList[item[0]] = Models[item[0]].list({...commonFilter, ...item[1].filter});
  }

  // resolving promises
  for (let i = 0; i < Object.keys(promiseList).length; i++) {
    const itemKey = Object.keys(promiseList)[i]
    const itemValue = await Object.values(promiseList)[i]

    if (itemValue?.err) {
      return next(`err while listing ${itemKey}\n${itemValue?.err}`);
    }

    promiseList[itemKey] = itemValue[0];
  }


  // renaming the entities
  for (let i = 0; i < Object.keys(promiseList).length; i++) {
    const itemValue = Object.values(promiseList)[i]

    const entityKey = itemsListEntries[i][0];
    const entityValue = itemsListEntries[i][1];
    if (entityKey != entityValue.name) {
      promiseList[entityValue.name] = itemValue;
      delete promiseList[entityKey];
    }
  }

  // console.log(promiseList)
  res.json({ data: promiseList });
};

module.exports = { read };
