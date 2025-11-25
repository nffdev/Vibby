const { Schema, model } = require('mongoose');

const likeSchema = new Schema({
    userId: String,
    videoId: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = model('like', likeSchema);
