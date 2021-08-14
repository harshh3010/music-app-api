const express = require('express');

const authController = require('./../controllers/authController');
const playlistController = require('./../controllers/playlistController');

const router = express.Router();

router.route('/')
    .get(authController.protectRoute, playlistController.getAllPlaylists)
    .post(authController.protectRoute, playlistController.createPlaylist);

router.route('/:playlistId')
    .get(authController.protectRoute, playlistController.getPlaylistById);

module.exports = router;