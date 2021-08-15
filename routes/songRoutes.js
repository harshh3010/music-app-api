const express = require('express');

const songController = require('./../controllers/songController');
const authController = require('./../controllers/authController');
const mediaController = require('./../controllers/mediaController');

const router = express.Router();

// Add song route
// Accessible by logged in admins only
router.route('/')
    .get(authController.protectRoute, songController.getAllSongs)
    .post(authController.protectRoute, authController.restrictTo('admin'), songController.addSong);

router.route('/:songId')
    .get(authController.protectRoute, songController.getSongWithId)
    .patch(authController.protectRoute, authController.restrictTo('admin'), songController.updateSong)
    .delete(authController.protectRoute, authController.restrictTo('admin'), songController.deleteSong);

router.route('/play/:songId')
    .get(authController.protectRoute, mediaController.playMusic);

router.route('/cover/:imageFile')
    .get(authController.protectRoute, mediaController.getSongCover);

module.exports = router;