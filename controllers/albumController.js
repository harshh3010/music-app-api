const catchAsync = require('./../utilities/catchAsync');

exports.getAllAlbums = catchAsync(async(req, res, next) => {
    res.status(200).json({
        status: 'success',
        message: 'Get all albums'
    });
});