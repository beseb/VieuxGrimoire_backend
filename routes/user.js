const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user');


// Vérifier les routes pour l'autorisation !!  Pas besoin de auth ! 
router.post('/signup', userCtrl.signup);
router.post('/login',  userCtrl.login);


module.exports = router;
