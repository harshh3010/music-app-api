// Set the environment variables
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const mongoose = require('mongoose');
const app = require('./app');

// Establish connection to database
mongoose.connect(process.env.DATABASE_URL_LOCAL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to database.');
});

const hostname = process.env.SERVER_HOSTNAME;
const port = process.env.SERVER_PORT || 3000;

// Start the server
const server = app.listen(port, hostname, () => {
    console.log(`Server started on port ${port}.`);
});