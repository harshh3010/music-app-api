const express = require('express');

const authController = require('./../controllers/authController');
const userController = require('./../controllers/userController');

const router = express.Router();

// Signup request
router.post('/signup', authController.signUp);

// Email verification
router.post('/verifyEmail/:verificationToken', authController.verifyEmail);

// Login request
router.post('/login', authController.login);

// Forgot password request
router.post('/forgotPassword', authController.forgotPassword);

// Reset password request
router.post('/resetPassword/:passwordResetToken', authController.resetPassword);

// Get current logged in user
router.get('/me', authController.protectRoute, userController.getUser);

// FOR TESTING PURPOSE
router.route('/').get((req, res, next) => {
    res.status(200).send('Hello');
});

module.exports = router;