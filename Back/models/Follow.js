const { Schema, model } = require('mongoose');

const followSchema = new Schema({
    followerId: String,
    userId: String,
    createdAt: { type: Date, default: Date.now }
});

followSchema.index({ followerId: 1, userId: 1 }, { unique: true });

module.exports = model('follow', followSchema);
