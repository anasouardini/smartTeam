const MTask = require('../models/task');

const readAll = async (req, res, next) => {
  const tasksResp = await MTask.read({
    project_fk: req.query.project_fk,
    portfolio_fk: req.query.portfolio_fk,
    ownerID: req.userID,
  });

  if (tasksResp.err) {
    return next('err while reading all tasks');
  }

  // console.log(tasksResp[0])
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
  const {
    portfolio_fk,
    project_fk,
    assignee_fk,
    title,
    description,
    bgColor,
    status,
    dueDate,
  } = req.body;
  const tasksResp = await MTask.create({
    ownerID: req.userID,
    portfolio_fk,
    project_fk,
    assignee_fk,
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
      ownerID: req.userID,
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
  const { id } = req.body;
  const tasksResp = await MTask.remove({ ownerID: req.userID, id });

  if (tasksResp.err) {
    return next('err while removing a task');
  }

  return res.json({ data: 'task removed successfully' });
};

module.exports = { readSingle, list, readAll, create, update, remove };
