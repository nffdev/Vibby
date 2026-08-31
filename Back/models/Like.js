const { Schema, model } = require('mongoose');

const likeSchema = new Schema({
    userId: String,
    videoId: String,
    createdAt: { type: Date, default: Date.now }
});

likeSchema.index({ userId: 1, videoId: 1 }, { unique: true });

module.exports = model('like', likeSchema);
