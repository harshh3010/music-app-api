const mongoose = require('mongoose');

const albumSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'An album must have a name.'],
        trim: true,
        minlength: [2, 'Album name must be atleast 2 characters long.'],
        maxlength: [40, 'Album name cannot exceed 40 characters.']
    },
    rating: {
        type: Number,
        min: [0, 'Rating must be at least 0.'],
        max: [5, 'Rating cannot exceed 5.'],
        default: 0
    },
    coverImageUrl: String
});

const Album = mongoose.model('Album', albumSchema);

module.exports = Album;