const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// POST /register
router.post('/register', userController.registerUser);

// POST /login
router.post('/login', userController.loginUser);

module.exports = router;