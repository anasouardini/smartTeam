const Models = {
  users: require('../models/user'),
  portfolios: require('../models/portfolio'),
  projects: require('../models/project'),
  tasks: require('../models/task'),
  privileges: require('../models/privileges'),
  privilegesCategories: require('../models/privilegesCategories'),
};
const read = async (req, res, next) => {
  const queryResp = {};
  const itemsList = Object.values(req.query);
  for(let i=0; i<itemsList.length; i++){
    const item = itemsList[i];
    let queryFilter = {ownerID: req.userID}
    if(item == 'users'){queryFilter = {}}
    // console.log(item)
    queryResp[item] = (await Models[item].list(queryFilter))[0];
  };

  if (queryResp.err) {
    return next(`err while listing ${item}`);
  }

  res.json({data: queryResp})
};

module.exports = {read}
