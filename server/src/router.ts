const express = require('express')
const router = express.Router();

const controllers = require('./controllers');

router.post('/user/:user', controllers.user.read);
router.get('/user/:user', controllers.user.read);
router.put('/user/:user', controllers.user.read);
router.delete('/user/:user', controllers.user.read);

router.post('/initDb', controllers.db.init);

module.exports = router
