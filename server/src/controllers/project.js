const MProject = require('../models/project');

const readAll = async (req, res, next) => {
  const projectsResp = await MProject.read({
    portfolio: req.query.portfolio,
    ownerID: req.userID,
  });

  if (projectsResp.err) {
    return next('err while reading all projects');
  }

  return res.json({ data: projectsResp[0] });
};

const list = async (req, res, next) => {
  const tasksResp = await MProject.read({ ownerID: req.userID }, ['id', 'title']);

  if (tasksResp.err) {
    return next('err while listing all projects');
  }

  // console.log(tasksResp[0])
  return res.json({ data: tasksResp[0] });
};

const readSingle = async (req, res) => {};

const create = async (req, res, next) => {
  const {
    portfolio,
    title,
    description,
    dueDate,
    bgColor,
    status,
    milestone,
    progress,
    budget,
    expense,
  } = req.body;
  const projectsResp = await MProject.create({
    ownerID: req.userID,
    portfolio,
    title,
    description,
    bgColor,
    dueDate: dueDate ? dueDate : null,
    status,
    progress,
    milestone,
    budget,
    expense,
  });

  if (projectsResp.err) {
    return next('err while creating projects');
  }

  if (!projectsResp[0].affectedRows) {
    return next('err while creating a project, zero affected rows');
  }

  return res.json({ data: 'project created successfully' });
};

const update = async (req, res, next) => {
  const {
    portfolio,
    id,
    title,
    description,
    bgColor,
    dueDate,
    status,
    progress,
    milestone,
    budget,
    expense,
  } = req.body;
  // console.log(req.body)
  const projectsResp = await MProject.update(
    {
      ownerID: req.userID,
      portfolio,
      id,
    },
    {
      title,
      description,
      bgColor,
      dueDate: dueDate ? dueDate : null,
      status,
      progress,
      milestone,
      budget,
      expense,
    }
  );

  if (projectsResp.err) {
    return next('err while updating project');
  }

  if (!projectsResp[0].affectedRows) {
    return next('err while updating a project, zero affected rows');
  }

  return res.json({ data: 'project updated successfully' });
};

const remove = async (req, res, next) => {
  const { id } = req.body;
  const projectsResp = await MProject.remove({ ownerID: req.userID, id });

  if (projectsResp.err) {
    return next('err while removing a project');
  }

  return res.json({ data: 'project removed successfully' });
};

module.exports = { readSingle, readAll, list, create, update, remove };
