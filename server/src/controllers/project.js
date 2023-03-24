const MProject = require('../models/project');

const readAll = async (req, res, next) => {
  const projectsResp = await MProject.read({
    owner_FK: req.userID,
    portfolio_FK: req.query.portfolio,
  });

  if (projectsResp.err) {
    return next('err while reading all projects');
  }

  return res.json({ data: projectsResp[0] });
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
    owner_FK: req.userID,
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
      owner_FK: req.userID,
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
  const { id } = req.body;
  const projectsResp = await MProject.remove({ owner_FK: req.userID, id });

  if (projectsResp.err) {
    return next('err while removing a project');
  }

  return res.json({ data: 'project removed successfully' });
};

module.exports = { readSingle, readAll, create, update, remove };
