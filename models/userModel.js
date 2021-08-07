const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A user must have a name.'],
        trim: true,
        minlength: [2, 'Size of name must be at least 2'],
        maxlength: [40, 'Size of name must be at most 40']
    },
    age: {
        type: Number,
        required: [true, 'A user must have an age.'],
        min: [12, 'The user must be at least 12 years old.'],
        max: [120, 'The user must be at most 120 years old.']
    },
    gender: {
        type: String,
        required: [true, 'A user must have a gender.'],
        enum: {
            values: ['male', 'female', 'other'],
            message: ['Gender must be either male, female or other.']
        }
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'A user must have an email address.'],
        trim: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email address.']
    },
    password: {
        type: String,
        required: [true, 'A user must have a password.'],
        minlength: [8, 'Password must be at least 8 characters long.'],
        select: false
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: String,
    emailVerificationExpiresAt: Date,
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpiresAt: Date
});

userSchema.methods.checkPassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
}

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;