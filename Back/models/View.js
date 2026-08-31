const { Schema, model } = require('mongoose');

const viewSchema = new Schema({
    userId: String,
    videoId: String,
    createdAt: { type: Date, default: Date.now }
});

viewSchema.index({ userId: 1, videoId: 1 }, { unique: true });

module.exports = model('view', viewSchema);
