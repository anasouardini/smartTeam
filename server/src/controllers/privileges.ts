// TS treats modules as scripts without this dummy import
import {} from './index'

const MPriviledges = require('../models/privileges');
const MEntities = {
  portfolio_FK: require('../models/portfolio'),
  project_FK: require('../models/project'),
  task_FK: require('../models/task'),
};
const privileges = require('../tools/privileges');

const readAll = async (req, res, next) => {
  let privilegesFilter = {
    owner_FK: req.body.owner_FK,
    user: req.body.user,
    privCat_FK: req.body.privCat,
  };
  if (req.body?.targetEntity && req.body?.targetEntity?.type) {
    privilegesFilter[req.body.targetEntity.type] = req.body.targetEntity.value;
  }

  Object.keys(privilegesFilter).forEach((itemKey) => {
    if (!privilegesFilter[itemKey]) {
      delete privilegesFilter[itemKey];
    }
  });

  const rulesResp = await MPriviledges.read(privilegesFilter);

  if (rulesResp.err) {
    return next('err while reading all rules');
  }

  return res.json({ data: rulesResp[0] });
};

const create = async (req, res, next) => {
  // console.log(req.body);
  const { user, owner_FK, privilegesCategories, targetEntity } = req.body;
  const createQuery = {
    owner_FK,
    privCat_FK: privilegesCategories,
    user,
  };

  // console.log(targetEntity);
  if (!targetEntity || !targetEntity?.type || !targetEntity?.value) {
    return res
      .status(400)
      .json({ data: 'Tagerget Entity field is not filed out.' });
  }
  createQuery[targetEntity.type] = targetEntity.value;

  const privilegesResult = await privileges.check({
    tableName: targetEntity.type.slice(0, -3) + 's',
    owner_FK,
    action: 'assign',
    userID: req.userID,
    items: [{ id: targetEntity.value}],
  });
  if (privilegesResult.err) {
    return next(
      `err while checking privileges for ${req.path}\n${privilegesResult.data}`
    );
  }
  if (!privilegesResult.isValid) {
    return res
      .status(403)
      .json({ data: 'You have no privileges to perfrom such action.' });
  }


  // adding a privileges row
  const rulesResp = await MPriviledges.create(createQuery);
  if (rulesResp.err) {
    return next('err while creating a rule');
  }
  if (!rulesResp[0].affectedRows) {
    return next('err while creating a rule, zero affected rows');
  }

  return res.json({
    data: `user ${user} now has access to ${targetEntity.type}/${targetEntity.value}
    with privileges of ${privilegesCategories}`,
  });
};

const update = async (req, res, next) => {
  const newData = structuredClone(req.body);
  // console.log(newData)
  const editableFiels = ['user', 'portfolio_FK', 'project_FK','task_FK','privilegesCategories'];
  if(req.body.targetEntity && req.body.targetEntity.type && req.body.targetEntity.value){
    newData[req.body.targetEntity.type] = req.body.targetEntity.value;
    delete newData.targetEntity;
  }
  const query = [
    {
      owner_FK: newData.owner_FK,
      id: newData.id,
    },
    {},
  ];
  Object.keys(newData).forEach((fieldKey) => {
    if (editableFiels.includes(fieldKey)) {
      if (fieldKey == 'dueDate' && newData[fieldKey] == '') return;
      if(fieldKey == 'privilegesCategories'){
        query[1]['privCat_FK'] = newData[fieldKey];
        return;
      }
      query[1][fieldKey] = newData[fieldKey];
    }
  });

  const privilegesResult = await privileges.check({
    tableName: req.body.targetEntity.type.slice(0, -3) + 's',
    owner_FK: req.body.owner_FK,
    action: 'assign',
    userID: req.userID,
    items: [{ id: req.body.targetEntity.value}],
  });
  if (privilegesResult.err) {
    return next(
      `err while checking privileges for ${req.path}\n${privilegesResult.data}`
    );
  }
  if (!privilegesResult.isValid) {
    return res
      .status(403)
      .json({ data: 'You have no privileges to perfrom such action.' });
  }

  if (Object.keys(query[1]).length) {
    const rulesResp = await MPriviledges.update(...query);

    // console.log(query)

    if (rulesResp.err) {
      return next('err while updating a rule');
    }

    if (!rulesResp[0].affectedRows) {
      return next('err while updating a rule, zero affected rows');
    }

    return res.json({ data: 'rule updated successfully' });
  }

  return res.json({ data: 'there is nothing to update' });
};

const remove = async (req, res, next) => {
  const { id, owner_FK } = req.body;


  const entityResp = await MPriviledges.read({owner_FK, id});
  if (entityResp.err) {
    return next('err while reading all rules');
  }
  if(!entityResp[0].length){
    return next('err while remving rule, not such rule was found');
  }
  if(entityResp[0][0]?.portfolio_FK){
    targetEntity = {type: 'portfolios', value:entityResp[0][0]?.portfolio_FK}
  }
  else if(entityResp[0][0]?.project_FK){
    targetEntity = {type: 'projects', value:entityResp[0][0]?.project_FK}
  }
  else if(entityResp[0][0]?.task_FK){
    targetEntity = {type: 'tasks', value:entityResp[0][0]?.task_FK}
  }

  const privilegesResult = await privileges.check({
    tableName: targetEntity.type,
    owner_FK,
    action: 'assign',
    userID: req.userID,
    items: [{ id: targetEntity.value}],
  });
  if (privilegesResult.err) {
    return next(
      `err while checking privileges for ${req.path}\n${privilegesResult.data}`
    );
  }
  if (!privilegesResult.isValid) {
    return res
      .status(403)
      .json({ data: 'You have no privileges to perfrom such action.' });
  }

  const rulesResp = await MPriviledges.remove({ owner_FK, id });

  if (rulesResp.err) {
    return next('err while removing a rule');
  }

  return res.json({ data: 'rule removed successfully' });
};

module.exports = { readAll, create, update, remove };
