const mongoose = require('mongoose');

const artistSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'An artist must have a name.'],
        trim: true,
        minlength: [2, 'Artist name must be atleast 2 characters long.'],
        maxlength: [40, 'Artist name cannot exceed 40 characters.']
    },
    bio: {
        type: String,
        trim: true,
        minlength: [5, 'Bio must be atleast 5 characters long.'],
        maxlength: [100, 'Bio cannot exceed 100 characters.']
    },
    rating: {
        type: Number,
        min: [0, 'Rating must be at least 0.'],
        max: [5, 'Rating cannot exceed 5.'],
        default: 0
    },
    coverImageUrl: String
});

const Artist = mongoose.model('Artist', artistSchema);

module.exports = Artist;