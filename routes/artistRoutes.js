const express = require('express');

const authController = require('./../controllers/authController');
const artistController = require('./../controllers/artistController');
const mediaController = require('./../controllers/mediaController');

const router = express.Router();

router.route('/')
    .get(authController.protectRoute, artistController.getAllArtists)
    .post(authController.protectRoute, authController.restrictTo('admin'), artistController.addArtist);

router.route('/')
    .patch(authController.protectRoute, authController.restrictTo('admin'), artistController.updateArtist)
    .delete(authController.protectRoute, authController.restrictTo('admin'), artistController.deleteArtist);

router.route('/cover/:imageFile')
    .get(authController.protectRoute, mediaController.getArtistCover);

module.exports = router;