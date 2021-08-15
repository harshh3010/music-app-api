const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

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
            message: 'Gender must be either male, female or other.'
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
    role: {
        type: String,
        enum: {
            values: ['admin', 'user'],
            message: 'Role must be either admin or user.'
        },
        default: 'user'
    },
    createdAt: Date,
    emailVerificationToken: String,
    emailVerificationExpiresAt: Date,
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpiresAt: Date
});

userSchema.methods.checkPassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
}

userSchema.methods.generatePasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpiresAt = Date.now() + 10 * 60 * 1000;

    return resetToken;
}

userSchema.methods.changedPassword = function(JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTime = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimestamp < changedTime;
    }

    return false;
}

userSchema.pre('save', function(next) {
    if (this.isNew) {
        this.createdAt = Date.now();
    }
    next();
});

userSchema.pre('save', function(next) {
    if (!this.isModified('password') || this.isNew) {
        return next();
    }

    // -2000 is to ensure that the jwt issue time is always more than password change time
    this.passwordChangedAt = Date.now() - 2000;

    next();
});

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;