// TS treats modules as scripts without this dummy import
import {} from './index'

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
  // console.log('===================')
  if(!req.body.items){
    return res.status(404).json({data: 'no items were provided with the request!'})
  }
  const itemsListEntries = Object.entries(req.body.items);
  const promiseList = {};
  for (let i = 0; i < itemsListEntries.length; i++) {
    const item = itemsListEntries[i];

    // just in case the client doesn't provide a filter
    const commonFilter = {owner_FK: req.userID}
    // users are not filtered by owner_FK
    if(item[1].name === 'connections'){
      delete commonFilter.owner_FK;
      commonFilter.userID = req.userID;
    }
    // console.log('item', item)
    // console.log('filter', commonFilter)
    promiseList[item[0]] = Models[item[1].name].list({...commonFilter, ...item[1].filter});
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

  // console.log(promiseList)
  res.json({ data: promiseList });
};

module.exports = { read };
