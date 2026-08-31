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
    commentCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    status: { type: String, default: 'preparing' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

videoSchema.index({ id: 1 }, { unique: true });
videoSchema.index({ userId: 1, createdAt: -1 });
videoSchema.index({ status: 1, createdAt: -1 });

module.exports = model('video', videoSchema);
