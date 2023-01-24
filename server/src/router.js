const express = require('express')
const router = express.Router();

const controllers = require('./controllers');

router.use(controllers.checkAuth);

router.post('/login', controllers.login);
router.post('/signup', controllers.signup);

// oauthServer example: google, instagram
router.get('/oauth/:method', controllers.oauth);

router.get('/verifyEmail/:token', controllers.verifyEmail);

router.post('/portfolio', controllers.portfolio.create);
router.put('/portfolio', controllers.portfolio.update);
router.get('/portfolio/all', controllers.portfolio.readAll);
router.get('/portfolio/:id', controllers.portfolio.readSingle);

router.post('/user/:user', controllers.user.create);
router.get('/user/:user', controllers.user.read);
router.put('/user/:user', controllers.user.update);
router.delete('/user/:user', controllers.user.remove);

router.post('/initDB', controllers.db.init);

module.exports = router
