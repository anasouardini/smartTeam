const MTask = require('../models/task');
const privileges = require('../tools/privileges');

const readAll = async (req, res, next) => {
  const tasksResp = await MTask.read({
    owner_FK: req.query.owner_FK,
    project_FK: req.query.project,
  });

  if (tasksResp.err) {
    return next('err while reading all tasks');
  }


  const privilegesResult = await privileges.check({
    tableName: 'tasks',
    action: 'readAll',
    userID: req.userID,
    owner_FK: req.query.owner_FK,
    items: tasksResp[0],
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

  // console.log(tasksResp[0])
  return res.json({ data: tasksResp[0] });
};

const readSingle = async (req, res) => {};

const create = async (req, res, next) => {
  const { project, owner_FK, title, description, bgColor, status, dueDate } =
    req.body;


  const privilegesResult = await privileges.check({
    tableName: 'tasks',
    owner_FK,
    action: 'create',
    userID: req.userID,
    items: [{ parentID: project }],
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

  const tasksResp = await MTask.create({
    owner_FK,
    project_FK: project,
    title,
    description,
    bgColor,
    status,
    dueDate,
  });

  if (tasksResp.err) {
    return next('err while creating a task');
  }

  if (!tasksResp[0].affectedRows) {
    return next('err while creating a task, zero affected rows');
  }

  return res.json({ data: 'task created successfully' });
};

const update = async (req, res, next) => {
  const { id, owner_FK } = req.body;
  // console.log(newData)
  const canBeModifiedFields = ['title', 'description', 'bgColor', 'dueDate'];
  const newData = {};
  canBeModifiedFields.forEach((fieldKey) => {
    if (req.body[fieldKey] !== undefined && req.body[fieldKey] !== null) {
      newData[fieldKey] = req.body[fieldKey];
    }
  });

  const privilegesResult = await privileges.check({
    tableName: 'tasks',
    owner_FK,
    action: 'update',
    userID: req.userID,
    items: [{ parentID: req.body.project, id }],
    columnsNames: Object.keys(newData),
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

  const tasksResp = await MTask.update({ owner_FK, id }, newData);

  // console.log(query)

  if (tasksResp.warning) {
    return res.status(400).json({ data: tasksResp.warning });
  }

  if (tasksResp.err) {
    return next('err while updating a task');
  }

  if (!tasksResp[0].affectedRows) {
    return next('err while updating a task, zero affected rows');
  }

  return res.json({ data: 'task updated successfully' });
};

const remove = async (req, res, next) => {
  const { id, owner_FK } = req.body;

  const privilegesResult = await privileges.check({
    tableName: 'tasks',
    owner_FK,
    action: 'remove',
    userID: req.userID,
    items: [{ parentID: req.body.project, id }],
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

  const tasksResp = await MTask.remove({ owner_FK, id });

  if (tasksResp.err) {
    return next('err while removing a task');
  }

  return res.json({ data: 'task removed successfully' });
};

module.exports = { readSingle, readAll, create, update, remove };
