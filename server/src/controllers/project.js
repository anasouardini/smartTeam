const MProject = require('../models/project');
const MPortfolio = require('../models/portfolio');
const privileges = require('../tools/privileges');

const readAll = async (req, res, next) => {
  // console.log(req.query)
  const projectsResp = await MProject.read({
    owner_FK: req.query.owner_FK,
    portfolio_FK: req.query.portfolio,
  });
  if (projectsResp.err) {
    return next('err while reading all projects');
  }

  const privilegesResult = await privileges.check({
    tableName: 'projects',
    action: 'readAll',
    userID: req.userID,
    owner_FK: req.query.owner_FK,
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
  // return res.json({data: 'testing'})

  const privilegesResult = await privileges.check({
    tableName: 'projects',
    owner_FK,
    action: 'create',
    userID: req.userID,
    items: [{ parentID: portfolio }],
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


  // increase the projects count in the portfolio
  const portfoliosResp = await MPortfolio.increaseProjectsNumber(
    {
      owner_FK,
    }
  );

  if (portfoliosResp.warning) {
    return res.status(400).json({ data: portfoliosResp.warning });
  }

  if (portfoliosResp.err) {
    return next('err while increaseProjectsNumber portfolios');
  }

  if (!portfoliosResp[0].affectedRows) {
    return next('err while increaseProjectsNumber portfolio, zero affected rows');
  }

  return res.json({ data: 'project created successfully' });
};

const update = async (req, res, next) => {
  const canBeModifiedFields = [
    'title',
    'description',
    'bgColor',
    'status',
    'portfolio',
    'dueDate',
    'budget',
    'expense',
  ];
  const { id, owner_FK } = req.body;
  // console.log('updtae controller', req.body)
  const newData = {};
  canBeModifiedFields.forEach((fieldKey) => {
    if (req.body[fieldKey] !== undefined && req.body[fieldKey] !== null) {
      newData[fieldKey] = req.body[fieldKey];
    }
  });

  const privilegesResult = await privileges.check({
    tableName: 'projects',
    owner_FK,
    action: 'update',
    userID: req.userID,
    items: [{ parentID: req.body.portfolio, id }],
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


  // console.log(req.body)
  const projectsResp = await MProject.update(
    {
      owner_FK,
      portfolio_FK: req.body.portfolio,
      id,
    },
    newData
  );

  if (projectsResp.warning) {
    return res.status(400).json({ data: projectsResp.warning });
  }

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
  console.log('updtae controller', req.body)

  const privilegesResult = await privileges.check({
    tableName: 'projects',
    owner_FK,
    action: 'remove',
    userID: req.userID,
    items: [{ parentID: req.body.portfolio, id }],
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

  const projectsResp = await MProject.remove({ owner_FK, id });

  if (projectsResp.err) {
    return next('err while removing a project');
  }


  const portfoliosResp = await MPortfolio.decreaseProjectsNumber(
    {
      owner_FK,
    }
  );
  if (portfoliosResp.warning) {
    return res.status(400).json({ data: portfoliosResp.warning });
  }

  if (portfoliosResp.err) {
    return next('err while increaseProjectsNumber portfolios');
  }

  if (!portfoliosResp[0].affectedRows) {
    return next('err while increaseProjectsNumber portfolio, zero affected rows');
  }

  return res.json({ data: 'project removed successfully' });
};

module.exports = { readSingle, readAll, create, update, remove };
