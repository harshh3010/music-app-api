const express = require('express');

const authController = require('./../controllers/authController');
const artistController = require('./../controllers/artistController');

const router = express.Router();

router.route('/')
    .get(authController.protectRoute, artistController.getAllArtists)
    .post(authController.protectRoute, authController.restrictTo('admin'), artistController.addArtist);

module.exports = router;