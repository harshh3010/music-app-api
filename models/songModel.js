const mongoose = require('mongoose');

const genreList = require('./../utilities/genreList');
const languageList = require('./../utilities/languageList');

const songSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A song must have a name.'],
        minlength: [4, 'Length of song name must be at least 4.'],
        maxlength: [40, 'Length of song name must be at most 40.'],
        trim: true
    },
    genre: {
        type: String,
        enum: {
            values: genreList,
            message: `Genre must be one of: ${genreList.join(',')}`
        },
        default: 'Other'
    },
    language: {
        type: String,
        enum: {
            values: languageList,
            message: `Language must be one of: ${languageList.join(',')}`
        },
        default: 'Other'
    },
    albumId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Album',
    },
    artistIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Artist'
    }],
    rating: {
        type: Number,
        min: [0, 'Rating must be at least 0.'],
        max: [5, 'Rating cannot exceed 5.'],
        default: 0
    },
    coverImageUrl: String,
    songUrl: String,
    lyricsUrl: String,
    releasedAt: Date
});

const Song = mongoose.model('Song', songSchema);

module.exports = Song;