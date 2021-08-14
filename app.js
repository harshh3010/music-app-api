const express = require('express');
const upload = require('express-fileupload');
const morgan = require('morgan');

const AppError = require('./utilities/appError');
const userRoutes = require('./routes/userRoutes');
const songRoutes = require('./routes/songRoutes');
const artistRoutes = require('./routes/artistRoutes');
const albumRoutes = require('./routes/albumRoutes');
const playlistRoutes = require('./routes/playlistRoutes');
const errorHandler = require('./controllers/errorController');

const app = express();

// Do log the info about http requests to console
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Middleware to read the body of http post request
app.use(express.json());

// Middleware to allow reading form data
app.use(upload());

// Creating all routes
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/songs', songRoutes);
app.use('/api/v1/artists', artistRoutes);
app.use('/api/v1/albums', albumRoutes);
app.use('/api/v1/playlists', playlistRoutes);

app.all('*', (req, res, next) => {
    next(new AppError('This route is not defined!', 404));
})

app.use(errorHandler);

module.exports = app;