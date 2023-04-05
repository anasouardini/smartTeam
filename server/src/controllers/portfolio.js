const MPortfolio = require('../models/portfolio');
const privileges = require('../tools/privileges');

const readAll = async (req, res, next) => {
  const portfoliosResp = await MPortfolio.read({});

  if (portfoliosResp.err) {
    return next('err while reading all portfolios');
  }

  const privilegesResult = await privileges.check({
    route: req.path,
    action: 'readAll',
    userID: req.userID,
    item: portfoliosResp[0],
  });
  if (privilegesResult.err) {
    return next(
      `err while checking privileges for ${req.path}/readAll\n${privilegesResult.data}`
    );
  }
  if (!privilegesResult.valid) {
    return res
      .status(403)
      .json({ data: 'You have no privileges to perfrom such action.' });
  }

  return res.json({ data: privilegesResult.data });
};

const readSingle = async (req, res) => {};

const create = async (req, res, next) => {
  const { title, description, bgImg, status } = req.body;
  const portfoliosResp = await MPortfolio.create({
    owner_FK: req.userID,
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
  const { id, title, description, bgImg, status } = req.body;
  const portfoliosResp = await MPortfolio.update(
    {
      owner_FK: req.userID,
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

  if (portfoliosResp.err) {
    return next('err while updating portfolios');
  }

  if (!portfoliosResp[0].affectedRows) {
    return next('err while updating a portfolio, zero affected rows');
  }

  return res.json({ data: 'portfolio updated successfully' });
};

const remove = async (req, res, next) => {
  const { id } = req.body;
  const portfoliosResp = await MPortfolio.remove({ owner_FK: req.userID, id });

  if (portfoliosResp.err) {
    return next('err while removing a portfolio');
  }

  return res.json({ data: 'portfolio removed successfully' });
};

module.exports = { readSingle, readAll, create, update, remove };
