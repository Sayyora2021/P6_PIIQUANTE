const express = require('express');
const router = express.Router();

//importation de middlware password
const password =require("../middleware/password");
const limit = require("../middleware/limiter")
const userCtrl = require('../controllers/user');


router.post('/signup', password, userCtrl.signup);
router.post('/login',  limit, password, userCtrl.login);

module.exports = router;