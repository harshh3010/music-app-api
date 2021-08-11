const express = require('express');

const authController = require('./../controllers/authController');
const albumController = require('./../controllers/albumController');

const router = express.Router();

router.route('/')
    .get(authController.protectRoute, albumController.getAllAlbums);

module.exports = router;