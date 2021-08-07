const express = require('express');

const authController = require('./../controllers/authController');

const router = express.Router();

// Signup request
router.post('/signup', authController.signUp);

// Email verification
router.post('/verifyEmail/:verificationToken', authController.verifyEmail);

module.exports = router;