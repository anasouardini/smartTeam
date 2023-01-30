const MProject = require('../models/project');

const readAll = async (req, res, next) => {
  const projectsResp = await MProject.read({ portfolio_fk: req.query.portfolio_fk });

  if (projectsResp.err) {
    return next('err while reading all projects');
  }

  return res.json({ data: projectsResp[0] });
};

const readSingle = async (req, res) => {};

const create = async (req, res, next) => {
  const {portfolio_fk, title, description, dueDate, bgColor, status, milestone, progress, budget, expense } = req.body;
  const projectsResp = await MProject.create({
    portfolio_fk,
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
  const { id, title, description, bgImg, status } = req.body;
  const projectsResp = await MProject.update(
    {
      ownerID: req.userID,
      id,
    },
    {
      title,
      description,
      bgImg,
      status,
      progress: 0,
      projectsNumber: 0,
      doneProjectsNumber: 0,
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

module.exports = { readSingle, readAll, create, update, remove };
