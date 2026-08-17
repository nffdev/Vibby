const { Schema, model } = require('mongoose');

const reportSchema = new Schema({
    id: String,
    reporterId: String,
    videoId: String,
    reason: String,
    detail: String,
    status: { type: String, default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ reporterId: 1, videoId: 1 }, { unique: true });

module.exports = model('report', reportSchema);
