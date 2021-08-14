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
        select: '-__v'
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