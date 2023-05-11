const express = require('express')
const router = express.Router();

const controllers = require('./controllers');

router.use(controllers.checkAuth);

router.post('/login', controllers.login);
router.post('/signup', controllers.signup);
router.post('/logout', controllers.logout);

// oauthServer example: google, instagram
router.get('/oauth/:method', controllers.oauth);

router.get('/verifyEmail/:token', controllers.verifyEmail);

router.post('/portfolio', controllers.portfolio.create);
router.get('/portfolio/all', controllers.portfolio.readAll);
router.get('/portfolio/:id', controllers.portfolio.readSingle);
router.put('/portfolio', controllers.portfolio.update);
router.delete('/portfolio', controllers.portfolio.remove);

router.post('/project', controllers.project.create);
router.get('/project/all', controllers.project.readAll);
router.get('/project/:id', controllers.project.readSingle);
router.put('/project', controllers.project.update);
router.delete('/project', controllers.project.remove);

router.post('/task', controllers.task.create);
router.get('/task/all', controllers.task.readAll);
router.get('/task/:id', controllers.task.readSingle);
router.put('/task', controllers.task.update);
router.delete('/task', controllers.task.remove);

router.post('/privileges', controllers.privileges.create);
router.post('/privileges/all', controllers.privileges.readAll);
router.put('/privileges', controllers.privileges.update);
router.delete('/privileges', controllers.privileges.remove);

router.post('/privilegesCategories', controllers.privilegesCategories.create);
router.get('/privilegesCategories/all', controllers.privilegesCategories.readAll);
router.put('/privilegesCategories', controllers.privilegesCategories.update);
router.delete('/privilegesCategories', controllers.privilegesCategories.remove);

router.post('/user/:user', controllers.user.create);
router.get('/user/:user', controllers.user.read);
router.put('/user/:user', controllers.user.update);
router.delete('/user/:user', controllers.user.remove);

router.get('/connectionLink', controllers.connection.genLink);
router.get('/verifyConnection/:token', controllers.connection.verify);

router.post('/itemsList', controllers.itemsList.read);

router.post('/initDB', controllers.db.init);

router.get('/media/:section/:file', controllers.media.getFile);

module.exports = router
