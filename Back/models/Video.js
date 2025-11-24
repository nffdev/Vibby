const { Schema, model } = require('mongoose');

const videoSchema = new Schema({
    id: String,
    userId: String,
    upload_id: String,
    asset_id: String,
    playback_id: String,
    title: String,
    description: String,
    status: { type: String, default: 'preparing' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = model('video', videoSchema);
