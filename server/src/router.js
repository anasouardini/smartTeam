const express = require('express')
const router = express.Router();

const controllers = require('./controllers');

router.use(controllers.checkAuth);

router.post('/login', controllers.login);
router.post('/signup', controllers.signup);

router.post('/user/:user', controllers.user.read);
router.get('/user/:user', controllers.user.read);
router.put('/user/:user', controllers.user.read);
router.delete('/user/:user', controllers.user.read);

router.post('/initDB', controllers.db.init);

module.exports = router
