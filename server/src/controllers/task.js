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
  const {
    project,
    owner_FK,
    title,
    description,
    bgColor,
    status,
    dueDate,
  } = req.body;
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
    const tasksResp = await MTask.update(...query);

    // console.log(query)

    if (tasksResp.err) {
      return next('err while updating a task');
    }

    if (!tasksResp[0].affectedRows) {
      return next('err while updating a task, zero affected rows');
    }

    return res.json({ data: 'task updated successfully' });
  }

  return res.json({ data: 'there is nothing to update' });
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
