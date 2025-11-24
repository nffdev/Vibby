const Video = require('../models/Video');

const webhook = async (req, res) => {
    const { type, data } = req.body || {};
    if (!type || !data) return res.status(400).json({ message: 'Invalid webhook payload.' });

    try {
        if (type === 'video.upload.asset_created') {
            const assetId = data?.id;
            const uploadId = data?.upload_id;
            if (assetId && uploadId) {
                await Video.findOneAndUpdate(
                    { upload_id: uploadId },
                    { asset_id: assetId, status: 'processing', updatedAt: new Date() }
                );
            }
        }

        if (type === 'video.asset.ready') {
            const assetId = data?.id;
            const playbackId = Array.isArray(data?.playback_ids) && data.playback_ids.length > 0 ? data.playback_ids[0].id : undefined;
            if (assetId && playbackId) {
                await Video.findOneAndUpdate(
                    { asset_id: assetId },
                    { playback_id: playbackId, status: 'ready', updatedAt: new Date() }
                );
            }
        }

        return res.status(200).json({ received: true });
    } catch (err) {
        return res.status(500).json({ message: 'Webhook handling error.' });
    }
};

module.exports = { webhook };
