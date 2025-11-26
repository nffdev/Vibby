const { Schema, model } = require('mongoose');

const dislikeSchema = new Schema({
    userId: String,
    videoId: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = model('dislike', dislikeSchema);
