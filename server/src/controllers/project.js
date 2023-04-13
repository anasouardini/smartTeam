const MProject = require('../models/project');
const privileges = require('../tools/privileges');

const readAll = async (req, res, next) => {
  // console.log(req.query)
  const projectsResp = await MProject.read({
    owner_FK: req.query.owner_FK,
    portfolio_FK: req.query.portfolio,
  });

  // console.log(projectsResp[0])
  if (projectsResp.err) {
    return next('err while reading all projects');
  }

  const privilegesResult = await privileges.check({
    tableName: 'projects',
    action: 'readAll',
    userID: req.userID,
    items: projectsResp[0],
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

  return res.json({ data: privilegesResult.data });
};

const readSingle = async (req, res) => {};

const create = async (req, res, next) => {
  const {
    owner_FK,
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

  const privilegesResult = await privileges.check({
    tableName: 'projects',
    action: 'create',
    userID: req.userID,
    items: [{parentID: portfolio}],
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

  const projectsResp = await MProject.create({
    owner_FK,
    portfolio_FK: portfolio,
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
    owner_FK,
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
      owner_FK,
      portfolio_FK: portfolio,
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
  // console.log(projectsResp)
  if (projectsResp.err) {
    return next('err while updating project');
  }

  if (!projectsResp[0].affectedRows) {
    return next('err while updating a project, zero affected rows');
  }

  return res.json({ data: 'project updated successfully' });
};

const remove = async (req, res, next) => {
  const { id, owner_FK } = req.body;
  const projectsResp = await MProject.remove({ owner_FK, id });

  if (projectsResp.err) {
    return next('err while removing a project');
  }

  return res.json({ data: 'project removed successfully' });
};

module.exports = { readSingle, readAll, create, update, remove };
