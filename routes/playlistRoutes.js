const express = require('express');

const authController = require('./../controllers/authController');
const playlistController = require('./../controllers/playlistController');

const router = express.Router();

router.route('/')
    .get(authController.protectRoute, playlistController.getAllPlaylists)
    .post(authController.protectRoute, playlistController.createPlaylist);

router.route('/:playlistId')
    .get(authController.protectRoute, playlistController.getPlaylistById)
    .patch(authController.protectRoute, playlistController.updatePlaylist)
    .delete(authController.protectRoute, playlistController.deletePlaylist);

router.route('/:playlistId/addSongs')
    .patch(authController.protectRoute, playlistController.addSongsToPlaylist);

router.route('/:playlistId/removeSongs')
    .patch(authController.protectRoute, playlistController.removeSongsFromPlaylist);

module.exports = router;