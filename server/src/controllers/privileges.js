const MPriviledges = require('../models/privileges');
const MEntities = {
  portfolio_FK: require('../models/portfolio'),
  project_FK: require('../models/project'),
  task_FK: require('../models/task'),
};

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

  // adding a privileges row
  const rulesResp = await MPriviledges.create(createQuery);
  if (rulesResp.err) {
    return next('err while creating a rule');
  }
  if (!rulesResp[0].affectedRows) {
    return next('err while creating a rule, zero affected rows');
  }

  // assigning user to the table/entity
  // const entityResp = await MEntities[targetEntity.type].update(
  //   { id: targetEntity.value },
  //   { assignee_FK: user }
  // );
  // if (entityResp.err) {
  //   return next(
  //     `err while assigning user/${user} to entity ${
  //       targetEntity.type / targetEntity.value
  //     } -- query error`
  //   );
  // }
  // if (!entityResp[0].affectedRows) {
  //   return next(
  //     `err while assigning user/${user} to entity ${
  //       targetEntity.type / targetEntity.value
  //     } -- zero affectedRows`
  //   );
  // }

  return res.json({
    data: `user ${user} now has access to ${targetEntity.type}/${targetEntity.value}
    with privileges of ${privilegesCategories}`,
  });
};

const update = async (req, res, next) => {
  const newData = req.body;
  // console.log(newData)
  const editableFiels = ['title', 'description', 'bgColor', 'dueDate'];
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
      query[1][fieldKey] = newData[fieldKey];
    }
  });
  // console.log(query)

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
  const rulesResp = await MPriviledges.remove({ owner_FK, id });

  if (rulesResp.err) {
    return next('err while removing a rule');
  }

  return res.json({ data: 'rule removed successfully' });
};

module.exports = { readAll, create, update, remove };
