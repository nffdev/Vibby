const { Schema, model } = require('mongoose');

const commentSchema = new Schema({
    videoId: String,
    userId: String,
    text: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = model('comment', commentSchema);
