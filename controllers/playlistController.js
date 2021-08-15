const Playlist = require('./../models/playlistModel');
const AppError = require('./../utilities/appError');
const catchAsync = require('./../utilities/catchAsync');

exports.getAllPlaylists = catchAsync(async(req, res, next) => {

    const playlists = await Playlist.find({ createdBy: req.user._id });

    res.status(200).json({
        status: 'success',
        result: playlists.length,
        data: {
            playlists: playlists
        }
    });

});

exports.getPlaylistById = catchAsync(async(req, res, next) => {

    const playlist = await Playlist.findOne({
        $or: [{
                _id: req.params.playlistId,
                type: 'private',
                createdBy: req.user._id
            },
            {
                _id: req.params.playlistId,
                type: 'liked',
                createdBy: req.user._id
            },
            {
                _id: req.params.playlistId,
                type: 'public'
            }
        ]
    }).populate({

        // TODO: change select fields

        path: 'songs',
        model: 'Song',
        select: '-__v -artistIds'
    });

    if (!playlist) {
        return next(new AppError('Playlist not found!', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            playlist: playlist
        }
    });

});

exports.createPlaylist = catchAsync(async(req, res, next) => {

    const playlistObj = {
        name: req.body.name,
        type: req.body.type,
        songs: req.body.songs,
        createdBy: req.user._id
    };

    const playlist = await Playlist.create(playlistObj);

    res.status(201).json({
        status: 'success',
        message: 'Playlist created successfully!',
        data: {
            playlist: playlist
        }
    });

});

exports.updatePlaylist = catchAsync(async(req, res, next) => {

    const playlist = await Playlist.findOneAndUpdate({
        _id: req.params.playlistId,
        createdBy: req.user._id
    }, req.body, {
        new: true,
        runValidators: true
    });

    if (!playlist) {
        return next(new AppError('Playlist not found!', 404));
    }

    res.status(201).json({
        status: 'success',
        message: 'Playlist updated successfully!',
        data: {
            playlist: playlist
        }
    });

});

exports.deletePlaylist = catchAsync(async(req, res, next) => {

    const playlist = await Playlist.findOneAndDelete({
        _id: req.params.playlistId,
        createdBy: req.user._id
    });

    if (!playlist) {
        return next(new AppError('Playlist not found!', 404));
    }

    res.status(204).json({
        status: 'success',
        message: 'Playlist deleted successfully!'
    });

});

exports.addSongsToPlaylist = catchAsync(async(req, res, next) => {

    const playlist = await Playlist.findOneAndUpdate({
        _id: req.params.playlistId,
        createdBy: req.user._id
    }, {
        $addToSet: {
            songs: {
                $each: req.body.songs
            }
        }
    }, {
        new: true,
        runValidators: true
    });

    if (!playlist) {
        return next(new AppError('Playlist not found!', 404));
    }

    res.status(201).json({
        status: 'success',
        message: 'Playlist updated successfully!',
        data: {
            playlist: playlist
        }
    });

});

exports.removeSongsFromPlaylist = catchAsync(async(req, res, next) => {

    const playlist = await Playlist.findOneAndUpdate({
        _id: req.params.playlistId,
        createdBy: req.user._id
    }, {
        $pull: {
            songs: {
                $in: req.body.songs
            }
        }
    }, {
        new: true,
        runValidators: true
    });

    if (!playlist) {
        return next(new AppError('Playlist not found!', 404));
    }

    res.status(201).json({
        status: 'success',
        message: 'Playlist updated successfully!',
        data: {
            playlist: playlist
        }
    });

});