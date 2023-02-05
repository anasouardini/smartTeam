const MTask = require('../models/task');

const readAll = async (req, res, next) => {
  const tasksResp = await MTask.read({ project_fk: req.query.project_fk,ownerID: req.userID });

  if (tasksResp.err) {
    return next('err while reading all tasks');
  }

  return res.json({ data: tasksResp[0] });
};

const list = async (req, res, next) => {
  const tasksResp = await MTask.read({ ownerID: req.userID }, ['id', 'title']);

  if (tasksResp.err) {
    return next('err while listing tasks');
  }

  // console.log(tasksResp[0])
  return res.json({ data: tasksResp[0] });
};

const readSingle = async (req, res) => {};

const create = async (req, res, next) => {
  const { project_fk, title, description, bgColor, status } = req.body;
  const tasksResp = await MTask.create({
    ownerID: req.userID,
    project_fk,
    title,
    description,
    bgColor,
    status,
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
  const { id, title, description, bgImg, status } = req.body;
  const tasksResp = await MTask.update(
    {
      ownerID: req.userID,
      id,
    },
    {
      title,
      description,
      bgColor,
      status,
    }
  );

  if (tasksResp.err) {
    return next('err while updating a task');
  }

  if (!tasksResp[0].affectedRows) {
    return next('err while updating a task, zero affected rows');
  }

  return res.json({ data: 'task updated successfully' });
};

const remove = async (req, res, next) => {
  const { id } = req.body;
  const tasksResp = await MTask.remove({ ownerID: req.userID, id });

  if (tasksResp.err) {
    return next('err while removing a task');
  }

  return res.json({ data: 'task removed successfully' });
};

module.exports = { readSingle, list, readAll, create, update, remove };
