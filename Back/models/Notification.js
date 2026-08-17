const { Schema, model } = require('mongoose');

const notificationSchema = new Schema({
    id: String,
    userId: String,
    actorId: String,
    type: String,
    videoId: String,
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

notificationSchema.index({ userId: 1, createdAt: -1 });

module.exports = model('notification', notificationSchema);
