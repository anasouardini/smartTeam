const MTask = require('../models/task');

const readAll = async (req, res, next) => {
  const tasksResp = await MTask.read({
    owner_FK: req.query.owner_FK,
    project_FK: req.query.project,
  });

  if (tasksResp.err) {
    return next('err while reading all tasks');
  }

  // console.log(tasksResp[0])
  return res.json({ data: tasksResp[0] });
};

const readSingle = async (req, res) => {};

const create = async (req, res, next) => {
  const { project, owner_FK, title, description, bgColor, status, dueDate } =
    req.body;
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
  const tasksResp = await MTask.remove({ owner_FK, id });

  if (tasksResp.err) {
    return next('err while removing a task');
  }

  return res.json({ data: 'task removed successfully' });
};

module.exports = { readSingle, readAll, create, update, remove };
