const { Schema, model } = require('mongoose');

const TTL_DAYS = Number(process.env.NOTIFICATION_TTL_DAYS) || 30;

const notificationSchema = new Schema({
    id: String,
    userId: String,
    actorId: String,
    type: String,
    videoId: String,
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, default: () => new Date(Date.now() + TTL_DAYS * 24 * 60 * 60 * 1000) }
});

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = model('notification', notificationSchema);
