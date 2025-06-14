const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Auth routes
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

module.exports = router;