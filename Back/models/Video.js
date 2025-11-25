const { Schema, model } = require('mongoose');

const videoSchema = new Schema({
    id: String,
    userId: String,
    upload_id: String,
    uploadId: String,
    asset_id: String,
    playback_id: String,
    title: String,
    description: String,
    likes: { type: Number, default: 0 },
    status: { type: String, default: 'preparing' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = model('video', videoSchema);
