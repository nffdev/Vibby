const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

app.disable('x-powered-by');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '5mb' }));

app.use(cors({
    origin: ['http://localhost:5173', 'http://192.168.1.80:5173'],
    methods: ['GET', 'POST', 'DELETE']
}));

app.listen(process.env.PORT, () => console.log(`Server listening on port ${process.env.PORT}`))

mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        console.log('Connected to mongodb');
    })
    .catch(err => console.log(`Error to connect to mongodb: ${err}`));

const base_route = '/v1';

const profileRoutes = require('./routes/profiles');
const uploadsRoutes = require('./routes/uploads');
const videosRoutes = require('./routes/videos');
const muxRoutes = require('./routes/mux');
const authRoutes = require('./routes/auth');
app.use(base_route + '/profiles', profileRoutes);
app.use(base_route + '/uploads', uploadsRoutes);
app.use(base_route + '/videos', videosRoutes);
app.use(base_route + '/mux', muxRoutes);
app.use(base_route + '/auth', authRoutes);

process
    .setMaxListeners(0)
    .on("uncaughtException", err => console.error(err))
    .on("unhandledRejection", err => console.error(err));
