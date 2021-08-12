const fs = require('fs');
const path = require('path');

const AppError = require('./../utilities/appError');
const catchAsync = require('./../utilities/catchAsync');

exports.playMusic = catchAsync(async(req, res, next) => {

    const audioFile = `${path.resolve('./')}/app-data/songs/audio/${req.params.songId}`.replace('/\\/g', '/');

    fs.exists(audioFile, (exists) => {
        if (exists) {

            const total = fs.statSync(audioFile).size;

            const range = req.headers.range || 'bytes=0-';

            const parts = range.replace(/bytes=/, '').split('-');
            const partialStart = parts[0];
            const partialEnd = parts[1];

            const chunksize = 10 ** 6;
            const start = parseInt(partialStart, 10);
            const end = partialEnd ? parseInt(partialEnd, 10) : Math.min(start + chunksize, total - 1);

            const contentLength = end - start + 1;

            res.writeHead(206, {
                'Content-Range': 'bytes ' + start + '-' + end + '/' + total,
                'Accept-Ranges': 'bytes',
                'Content-Length': contentLength,
                'Content-Type': 'audio/mpeg'
            });

            const rstream = fs.createReadStream(audioFile, { start: start, end: end });
            rstream.pipe(res);

        } else {
            return next(new AppError('File not found!', 404));
        }
    });

});

exports.getSongCover = catchAsync(async(req, res, next) => {

    const coverImage = `${path.resolve('./')}/app-data/songs/coverImages/${req.params.imageFile}`.replace('/\\/g', '/');
    fs.exists(coverImage, (exists) => {
        if (exists) {
            res.status(200).sendFile(coverImage);
        } else {
            return next(new AppError('File not found!', 404));
        }
    });

});

exports.getArtistCover = catchAsync(async(req, res, next) => {

    const coverImage = `${path.resolve('./')}/app-data/artists/coverImages/${req.params.imageFile}`.replace('/\\/g', '/');
    fs.exists(coverImage, (exists) => {
        if (exists) {
            res.status(200).sendFile(coverImage);
        } else {
            return next(new AppError('File not found!', 404));
        }
    });

});

exports.getAlbumCover = catchAsync(async(req, res, next) => {

    const coverImage = `${path.resolve('./')}/app-data/albums/coverImages/${req.params.imageFile}`.replace('/\\/g', '/');
    fs.exists(coverImage, (exists) => {
        if (exists) {
            res.status(200).sendFile(coverImage);
        } else {
            return next(new AppError('File not found!', 404));
        }
    });

});