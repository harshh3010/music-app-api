const express = require('express');

const songController = require('./../controllers/songController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.route('/addSong')
    .post(authController.protectRoute, authController.restrictTo('admin'), songController.addSong);

module.exports = router;