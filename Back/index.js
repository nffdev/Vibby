const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
    if (req.originalUrl.endsWith('/mux/webhook')) return next();
    return bodyParser.json({ limit: '5mb' })(req, res, next);
});

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
const likesRoutes = require('./routes/likes');
const followsRoutes = require('./routes/follows');
const commentsRoutes = require('./routes/comments');
const notificationsRoutes = require('./routes/notifications');
const reportsRoutes = require('./routes/reports');
const adminRoutes = require('./routes/admin');
const searchRoutes = require('./routes/search');
const viewsRoutes = require('./routes/views');
app.use(base_route + '/profiles', profileRoutes);
app.use(base_route + '/uploads', uploadsRoutes);
app.use(base_route + '/videos', videosRoutes);
app.use(base_route + '/mux', muxRoutes);
app.use(base_route + '/auth', authRoutes);
app.use(base_route + '/likes', likesRoutes);
app.use(base_route + '/follows', followsRoutes);
app.use(base_route + '/comments', commentsRoutes);
app.use(base_route + '/notifications', notificationsRoutes);
app.use(base_route + '/reports', reportsRoutes);
app.use(base_route + '/admin', adminRoutes);
app.use(base_route + '/search', searchRoutes);
app.use(base_route + '/views', viewsRoutes);

process
    .setMaxListeners(0)
    .on("uncaughtException", err => console.error(err))
    .on("unhandledRejection", err => console.error(err));
