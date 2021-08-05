const express = require('express');
const morgan = require('morgan');

const AppError = require('./utilities/appError');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./controllers/errorController');

const app = express();

// Do log the info about http requests to console
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Middleware to read the body of http post request
app.use(express.json());

// Creating all routes
app.use('/api/v1/users', userRoutes);

app.all('*', (req, res, next) => {
    next(new AppError('This route is not defined!', 404));
})

app.use(errorHandler);

module.exports = app;