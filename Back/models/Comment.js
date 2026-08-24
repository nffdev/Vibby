const { Schema, model } = require('mongoose');

const commentSchema = new Schema({
    videoId: String,
    userId: String,
    text: String,
    createdAt: { type: Date, default: Date.now }
});

commentSchema.index({ videoId: 1 });

module.exports = model('comment', commentSchema);
