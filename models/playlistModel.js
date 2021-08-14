const mongoose = require('mongoose');

const playlistSchema = mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: [true, 'A playlist must have a name.'],
        maxlength: [40, 'Playlist name cannot exceed 40 characters.']
    },
    type: {
        type: String,
        required: [true, 'Please specify playlist type.'],
        enum: {
            values: ['liked', 'public', 'private'],
            message: 'A playlist must be of one of the following types: liked, public, private'
        }
    },
    songs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Song'
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: Date
});

playlistSchema.pre('save', function(next) {
    if (this.isNew) {
        this.createdAt = Date.now();
    }
    next();
});

const Playlist = mongoose.model('Playlist', playlistSchema);

module.exports = Playlist;