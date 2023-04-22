const MPortfolio = require('../models/portfolio');
const privileges = require('../tools/privileges');

const readAll = async (req, res, next) => {
  const { owner_FK } = req.query;
  const filter = {};
  if (owner_FK) {
    filter.owner_FK = owner_FK;
  }
  const portfoliosResp = await MPortfolio.read(filter);

  if (portfoliosResp.err) {
    return next('err while reading all portfolios');
  }
  // console.log(req.query);
  // console.log(portfoliosResp[0]);

  const privilegesResult = await privileges.check({
    tableName: 'portfolios',
    owner_FK,
    action: 'readAll',
    userID: req.userID,
    items: portfoliosResp[0],
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
  const { title, description, bgImg, status, owner_FK } = req.body;

  const privilegesResult = await privileges.check({
    tableName: 'portfolios',
    action: 'create',
    owner_FK: req.body.owner_FK,
    userID: req.userID,
    items: [{}],
  });
  if (privilegesResult.err) {
    return next(
      `err while checking privileges for ${req.path}\n${privilegesResult.data}`
    );
  }
  if (!privilegesResult.isValid) {
    return res.status(403).json({
      data: `You have no privileges to perfrom such action. ${privilegesResult.data}`,
    });
  }

  const portfoliosResp = await MPortfolio.create({
    owner_FK,
    title,
    description,
    bgImg,
    status,
    progress: 0,
    projectsNumber: 0,
    doneProjectsNumber: 0,
  });

  if (portfoliosResp.err) {
    return next('err while creating portfolios');
  }

  if (!portfoliosResp[0].affectedRows) {
    return next('err while creating a portfolio, zero affected rows');
  }

  return res.json({ data: 'portfolio created successfully' });
};

const update = async (req, res, next) => {
  const canBeModifiedFields = ['title', 'description', 'bgImg', 'status'];
  const { id, owner_FK } = req.body;
  const newData = {};
  canBeModifiedFields.forEach((fieldKey) => {
    if (req.body[fieldKey] !== undefined && req.body[fieldKey] !== null) {
      newData[fieldKey] = req.body[fieldKey];
    }
  });

  // checking changed columns
  const portfolioColumnsResp = await MPortfolio.read({id, owner_FK});
  if (portfolioColumnsResp.err) {
    return next('err while checking portfolio columns, syntax error');
  }
  if (!portfolioColumnsResp[0].length) {
    return next('err while checking portfolio columns, no such item');
  }
  const columns = portfolioColumnsResp[0][0];
  const mutatedColumns = {};
  Object.keys(columns).forEach((columnKey)=>{
    if(newData[columnKey] && columns[columnKey] != newData[columnKey]){
      mutatedColumns[columnKey] = newData[columnKey];
    }
  })

  // checking privileges
  const privilegesResult = await privileges.check({
    tableName: 'portfolios',
    action: 'update',
    userID: req.userID,
    owner_FK: req.body.owner_FK,
    items: [{ id, columnsNames: ['title'] }],
    columnsNames: Object.keys(mutatedColumns),
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

  const portfoliosResp = await MPortfolio.update(
    {
      owner_FK,
      id,
    },
    newData
  );

  if (portfoliosResp.warning) {
    return res.status(400).json({ data: portfoliosResp.warning });
  }

  if (portfoliosResp.err) {
    return next('err while updating portfolios');
  }

  if (!portfoliosResp[0].affectedRows) {
    return next('err while updating a portfolio, zero affected rows');
  }

  return res.json({ data: 'portfolio updated successfully' });
};

const remove = async (req, res, next) => {
  const { id, owner_FK } = req.body;

  const privilegesResult = await privileges.check({
    tableName: 'portfolios',
    action: 'remove',
    userID: req.userID,
    owner_FK: req.body.owner_FK,
    //TODO: I need a way to determin what columns have changed,
    items: [{ id }],
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

  const portfoliosResp = await MPortfolio.remove({ owner_FK, id });

  if (portfoliosResp.err) {
    return next('err while removing a portfolio');
  }

  return res.json({ data: 'portfolio removed successfully' });
};

module.exports = { readSingle, readAll, create, update, remove };
