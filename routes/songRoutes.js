const express = require('express');

const songController = require('./../controllers/songController');
const authController = require('./../controllers/authController');
const mediaController = require('./../controllers/mediaController');

const router = express.Router();

// Add song route
// Accessible by logged in admins only
router.route('/')
    .post(
        authController.protectRoute,
        authController.restrictTo('admin'),
        songController.addSong
    );

router.route('/play/:songId')
    .get(
        // authController.protectRoute,
        mediaController.playMusic
    );


module.exports = router;