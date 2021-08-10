const path = require('path');

const Song = require('./../models/songModel');
const AppError = require('./../utilities/appError');
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

    // Add the song details to database
    const newSong = await Song.create(req.body);
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
    let imagePath = `${path.resolve('./')}/app-data/songs/coverImages/`.replace(/\\/g, '/');
    let imageName = 'unknown.jpg';
    if (coverImage) {
        imageName = `${songId}${imageFileExtension}`;
        coverImage.mv(imagePath + imageName);
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