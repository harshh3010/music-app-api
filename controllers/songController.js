const path = require('path');

const Song = require('./../models/songModel');
const AppError = require('./../utilities/appError');
const DBFeatures = require('./../utilities/dbFeatures');
const catchAsync = require('./../utilities/catchAsync');
const allowedAudioFormats = require('./../utilities/allowedAudioFormats');
const allowedLyricsFormats = require('./../utilities/allowedLyricsFormats');
const allowedImageFormats = require('./../utilities/allowedImageFormats');

// Function to add a new song to the server
exports.addSong = catchAsync(async(req, res, next) => {

    // If no files to be uploaded are provided, report error
    if (!req.files) {
        return next(new AppError('Please provide the required data!', 400));
    }

    // Fetch the files provided in POST request
    var audioFile = req.files.audioFile;
    var lyricsFile = req.files.lyricsFile;
    var coverImage = req.files.coverImage;

    // Report error if audio file is missing
    if (!audioFile) {
        return next(new AppError('Please upload an audio file!', 400));
    }

    // Report error if audio file in not in correct format
    let audioFileExtension = path.extname(audioFile.name);
    if (!(allowedAudioFormats.includes(audioFileExtension))) {
        return next(new AppError(`Audio file should have one of following formats: ${allowedAudioFormats.join(',')}`, 400));
    }

    // Report error if lyrics file in not in correct format
    let lyricsFileExtension;
    if (lyricsFile) {
        lyricsFileExtension = path.extname(lyricsFile.name);
        if (!allowedLyricsFormats.includes(lyricsFileExtension)) {
            return next(new AppError(`Lyrics file should have one of following formats: ${allowedLyricsFormats.join(',')}`, 400));
        }
    }

    // Report error id image file is not in correct format
    let imageFileExtension;
    if (coverImage) {
        imageFileExtension = path.extname(coverImage.name);
        if (!allowedImageFormats.includes(imageFileExtension)) {
            return next(new AppError(`Cover image should have one of the following formats: ${allowedImageFormats.join(',')}`, 400));
        }
    }

    const songObj = {
        name: req.body.name,
        genre: req.body.genre,
        language: req.body.language,
        albumId: req.body.albumId,
        artistIds: req.body.artistIds,
        rating: 0.0
    };

    // Add the song details to database
    const newSong = await Song.create(songObj);
    const songId = newSong._id;

    // Save the audio file in app-data directory
    let audioPath = `${path.resolve('./')}/app-data/songs/audio/${songId}${audioFileExtension}`.replace(/\\/g, '/');
    audioFile.mv(audioPath);
    newSong.songUrl = `${req.protocol}://${req.get('host')}/api/v1/songs/play/${songId}${audioFileExtension}`;

    // Save the lyrics file in app-data directory
    if (lyricsFile) {
        let lyricsPath = `${path.resolve('./')}/app-data/songs/lyrics/${songId}${lyricsFileExtension}`.replace(/\\/g, '/');
        lyricsFile.mv(lyricsPath);
        newSong.lyricsUrl = `${req.protocol}://${req.get('host')}/api/v1/songs/lyrics/${songId}${lyricsFileExtension}`;
    }

    // Save the cover image in app-data directory
    if (coverImage) {
        let imagePath = `${path.resolve('./')}/app-data/songs/coverImages/${songId}${imageFileExtension}`.replace(/\\/g, '/');
        coverImage.mv(imagePath);
        newSong.coverImageUrl = `${req.protocol}://${req.get('host')}/api/v1/songs/cover/${songId}${imageFileExtension}`;
    }

    // Save the file paths to database
    await newSong.save();

    // Send response to the user
    res.status(200).json({
        status: 'success',
        message: 'Song added successfully!'
    });
});

// Function to get all songs from database
exports.getAllSongs = catchAsync(async(req, res, next) => {

    const dbFeatures = new DBFeatures(Song.find(), req.query)
        .filter()
        .sort()
        .filterFields()
        .paginate();

    songs = await dbFeatures.dbQuery;

    res.status(200).json({
        status: 'success',
        result: songs.length,
        data: {
            songs: songs
        }
    });

});

// Function to get a song with given id
exports.getSongWithId = catchAsync(async(req, res, next) => {
    const song = await Song.findById(req.params.songId);

    res.status(200).json({
        status: 'success',
        data: {
            song: song
        }
    });
});

exports.updateSong = catchAsync(async(req, res, next) => {

    // TODO: Implement file updates

    const song = await Song.findByIdAndUpdate(req.params.songId, req.body, {
        new: true,
        runValidators: true
    });

    if (!song) {
        return next(new AppError('Song not found!', 404));
    }

    res.status(201).json({
        status: 'success',
        message: 'Song updated successfully!',
        data: {
            song: song
        }
    });
});

exports.deleteSong = catchAsync(async(req, res, next) => {

    // TODO: Delete song data from app-data directory
    // TODO: Remove songs from playlists

    const song = await Song.findByIdAndDelete(req.params.songId);

    if (!song) {
        return next(new AppError('Song not found!', 404));
    }

    res.status(204).json({
        status: 'success',
        message: 'Song deleted successfully!'
    });
});