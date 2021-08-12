const path = require('path');

const Album = require('./../models/albumModel');
const DBFeatures = require('./../utilities/dbFeatures');
const catchAsync = require('./../utilities/catchAsync');
const allowedImageFormats = require('./../utilities/allowedImageFormats');

exports.getAllAlbums = catchAsync(async(req, res, next) => {

    const dbFeatures = new DBFeatures(Album.find(), req.query)
        .filter()
        .sort()
        .filterFields()
        .paginate();

    const albums = await dbFeatures.dbQuery;

    res.status(200).json({
        status: 'success',
        result: albums.length,
        data: {
            albums: albums
        }
    });

});

// Function to add a new album to the server
exports.addAlbum = catchAsync(async(req, res, next) => {

    const newAlbum = await Album.create(req.body);

    let albumId = newAlbum._id;

    if (req.files && req.files.coverImage) {

        let coverImage = req.files.coverImage;
        let imageFileExtension = path.extname(coverImage.name);

        if (!allowedImageFormats.includes(imageFileExtension)) {
            return next(new AppError(`Cover image should have one of the following formats: ${allowedImageFormats.join(',')}`, 400));
        }

        let imagePath = `${path.resolve('./')}/app-data/albums/coverImages/${albumId}${imageFileExtension}`.replace(/\\/g, '/');
        coverImage.mv(imagePath);
        newAlbum.coverImageUrl = `${req.protocol}://${req.get('host')}/api/v1/albums/cover/${albumId}${imageFileExtension}`;

        await newAlbum.save();
    }

    res.status(200).json({
        status: 'success',
        message: 'Album added successfully!',
        data: {
            album: newAlbum
        }
    });

});