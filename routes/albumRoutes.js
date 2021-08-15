const express = require('express');

const authController = require('./../controllers/authController');
const albumController = require('./../controllers/albumController');
const mediaController = require('./../controllers/mediaController');

const router = express.Router();

router.route('/')
    .get(authController.protectRoute, albumController.getAllAlbums)
    .post(authController.protectRoute, authController.restrictTo('admin'), albumController.addAlbum);

router.route('/:albumId')
    .patch(authController.protectRoute, authController.restrictTo('admin'), albumController.updateAlbum)
    .delete(authController.protectRoute, authController.restrictTo('admin'), albumController.deleteAlbum);

router.route('/cover/:imageFile')
    .get(authController.protectRoute, mediaController.getAlbumCover);

module.exports = router;