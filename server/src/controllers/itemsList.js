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
  const queryResp = {};
  let commonFilterCriteria = { owner_FK: req.userID };
  let tables = {
    users: {},
    connections: {userID: req.userID},
    portfolios: commonFilterCriteria,
    projects: commonFilterCriteria,
    tasks: commonFilterCriteria,
  };
  const itemsList = Object.entries(req.query);
  for (let i = 0; i < itemsList.length; i++) {
    const item = itemsList[i];
    // console.log(item);
    queryResp[item[0]] = (
      await Models[item[0]].list(tables[item[0]])
    )[0];
  }

  for (let i = 0; i < itemsList.length; i++) {
    const item = itemsList[i];
    // console.log(queryResp[item[0]])
    if (queryResp[item[0]]?.err) {
      return next(`err while listing ${item[0]}\n${queryResp[item[0]]?.err}`);
    }

    if(item[1]){
      queryResp[item[1]] = queryResp[item[0]];
      delete queryResp[item[0]];
    }
  }

  res.json({ data: queryResp });
};

module.exports = { read };
