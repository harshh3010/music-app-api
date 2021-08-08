const catchAsync = require('./../utilities/catchAsync');

exports.addSong = catchAsync(async(req, res, next) => {
    res.status(200).json({
        status: 'success',
        message: 'Add song route.'
    });
});