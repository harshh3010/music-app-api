const path = require('path');

const Artist = require('./../models/artistModel');
const DBFeatures = require('./../utilities/dbFeatures');
const catchAsync = require('./../utilities/catchAsync');
const allowedImageFormats = require('./../utilities/allowedImageFormats');

exports.getAllArtists = catchAsync(async(req, res, next) => {

    const dbFeatures = new DBFeatures(Artist.find(), req.query)
        .filter()
        .sort()
        .filterFields()
        .paginate();

    const artists = await dbFeatures.dbQuery;

    res.status(200).json({
        status: 'success',
        result: artists.length,
        data: {
            artists: artists
        }
    })

});

// Function to add a new artist to the server
exports.addArtist = catchAsync(async(req, res, next) => {

    const newArtist = await Artist.create(req.body);

    let artistId = newArtist._id;

    if (req.files && req.files.coverImage) {

        let coverImage = req.files.coverImage;
        let imageFileExtension = path.extname(coverImage.name);

        if (!allowedImageFormats.includes(imageFileExtension)) {
            return next(new AppError(`Cover image should have one of the following formats: ${allowedImageFormats.join(',')}`, 400));
        }

        let imagePath = `${path.resolve('./')}/app-data/artists/coverImages/${artistId}${imageFileExtension}`.replace(/\\/g, '/');
        coverImage.mv(imagePath);
        newArtist.coverImageUrl = `${req.protocol}://${req.get('host')}/api/v1/artists/cover/${artistId}${imageFileExtension}`;

        await newArtist.save();
    }

    res.status(200).json({
        status: 'success',
        message: 'Artist added successfully!',
        data: {
            artist: newArtist
        }
    });

});