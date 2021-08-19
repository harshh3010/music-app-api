const catchAsync = require('./../utilities/catchAsync');

// Function to get current logged in user
exports.getUser = catchAsync(async(req, res, next) => {

    res.status(200).json({
        status: 'success',
        data: {
            user: req.user
        }
    });

});