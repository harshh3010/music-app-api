const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const AppError = require('./../utilities/appError');
const User = require('./../models/userModel');
const catchAsync = require('./../utilities/catchAsync');
const sendMail = require('./../utilities/email');

// Function to issue a jwt when a user with given id is logged in
const signIn = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

// Function to register a new user
exports.signUp = catchAsync(async(req, res, next) => {

    // Generate an email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');

    // Save the token and expire time in request body
    req.body.emailVerificationToken = emailVerificationToken;
    req.body.emailVerificationExpiresAt = Date.now() + 10 * 60 * 1000;

    const userObj = {
        name: req.body.name,
        age: req.body.age,
        gender: req.body.gender,
        email: req.body.email,
        password: req.body.password
    };

    // Create a new user using request body
    const newUser = await User.create(userObj);

    // Create a verification url
    const verificationUrl = `${req.protocol}://${req.get('host')}/api/v1/users/verifyEmail/${emailVerificationToken}`;

    // Create the message body to be sent via email
    const message = `Post on this url to verify your email.\n${verificationUrl}`;

    try {

        // Sending the email to the user
        await sendMail({
            email: newUser.email,
            subject: 'Music-App email verification',
            message: message
        });

        // Send the response to the user
        res.status(200).json({
            status: 'success',
            message: 'You have been registered successfully. Please verify your email (within 10 minutes) to continue.'
        });

    } catch (err) {

        // In case of an error sending email, delete the newly created user
        await newUser.remove();
        return next(new AppError('Some problem occurred! Try again later.', 500));
    }

});

// Function to verify user email address
exports.verifyEmail = catchAsync(async(req, res, next) => {

    // Obtain the verification token from the url
    const verificationToken = req.params.verificationToken;

    // Search for user with valid verification token and email in database
    const user = await User.findOne({
        email: req.body.email,
        emailVerificationExpiresAt: { $gt: Date.now() },
        emailVerificationToken: verificationToken
    });

    // Report error if user not found
    if (!user) {
        return next(new AppError('Invalid user or verification token.', 400));
    }

    // Set verification status of user to true
    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiresAt = undefined;

    // Save changes to database
    await user.save();

    // Generate jwt token to login the user
    const token = signIn(user._id);

    // Send response to user
    res.status(200).json({
        status: 'success',
        message: 'You have been registered successfully!',
        token: token
    });
});

// Function to login the user
exports.login = catchAsync(async(req, res, next) => {

    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password) {
        return next(new AppError('Please provide email and password!', 400));
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.checkPassword(password, user.password))) {
        return next(new AppError('Invalid email or password!', 401));
    }

    if (!user.isVerified) {

        // Generate an email verification token
        const emailVerificationToken = crypto.randomBytes(32).toString('hex');

        // Save the token and expire time in request body
        user.emailVerificationToken = emailVerificationToken;
        user.emailVerificationExpiresAt = Date.now() + 10 * 60 * 1000;

        //Save changes to db
        await user.save();

        // Create a verification url
        const verificationUrl = `${req.protocol}://${req.get('host')}/api/v1/users/verifyEmail/${emailVerificationToken}`;

        // Create the message body to be sent via email
        const message = `Post on this url to verify your email.\n${verificationUrl}`;

        try {

            // Sending the email to the user
            await sendMail({
                email: user.email,
                subject: 'Music-App email verification',
                message: message
            });

        } catch (err) {

            // In case of an error sending email, delete the newly created user
            await user.remove();
            return next(new AppError('Some problem occurred! Try again later.', 500));
        }

        return next(new AppError('Account not verified. Please verify your email to proceed further.', 401));

    } else {
        const token = signIn(user._id);

        res.status(200).json({
            status: 'success',
            message: 'You have been successfully logged in!',
            token: token
        });
    }

});

// Function to send a password reset link to user
exports.forgotPassword = catchAsync(async(req, res, next) => {

    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new AppError('User does not exist!', 400));
    }

    const passwordResetToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/resetPassword/${passwordResetToken}`;
    const message = `Post on this url to reset your password.\n${resetUrl}`;

    try {

        // Sending the email to the user
        await sendMail({
            email: user.email,
            subject: 'Music-App password reset',
            message: message
        });

        res.status(200).json({
            status: 'success',
            message: 'The password reset link has been sent to your email address!'
        });

    } catch (err) {

        user.passwordResetToken = undefined;
        user.passwordResetExpiresAt = undefined;
        await user.save();

        return next(new AppError('Some problem occurred! Try again later.', 500));
    }
});

// Function to reset the user password
exports.resetPassword = catchAsync(async(req, res, next) => {

    const resetToken = crypto.createHash('sha256').update(req.params.passwordResetToken).digest('hex');

    const user = await User.findOne({
        email: req.body.email,
        passwordResetToken: resetToken,
        passwordResetExpiresAt: { $gt: Date.now() }
    });

    if (!user) {
        return next(new AppError('Invalid user or token!', 400));
    }

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpiresAt = undefined;

    await user.save();

    const token = signIn(user._id);

    res.status(200).json({
        status: 'success',
        message: 'Password reset successful! You have been logged in.',
        token: token
    });
});

// Middleware to protect the routes such that they can be accessed by authorized users only
exports.protectRoute = catchAsync(async(req, res, next) => {

    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new AppError('You are currently not logged in! Please login to continue.', 401));
    }

    // Decoding the jwt
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // Obtain the user corresponding to the jwt token
    const currentUser = await User.findById(decoded.id);

    // Report error if user does not exist
    if (!currentUser) {
        return next(new AppError('The user corresponding to the token no longer exist!', 401));
    }

    // Check if the token was issued before user changed the password
    if (currentUser.changedPassword(decoded.iat)) {
        return next(new AppError('The user recently changed the password, please login again!', 401));
    }

    // Store user info in request object as it may be required later
    req.user = currentUser;

    // Grant access to the route
    next();
});

// Function to restrict actions to specific users
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action!', 403));
        }
        next();
    };
};