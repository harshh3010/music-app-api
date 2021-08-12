const express = require('express');

const authController = require('./../controllers/authController');
const albumController = require('./../controllers/albumController');

const router = express.Router();

router.route('/')
    .get(authController.protectRoute, albumController.getAllAlbums)
    .post(authController.protectRoute, authController.restrictTo('admin'), albumController.addAlbum);

module.exports = router;