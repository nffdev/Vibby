const fetch = require('node-fetch').default;

const MUX_TOKEN_ID = process.env.MUX_TOKEN_ID;
const MUX_TOKEN_SECRET = process.env.MUX_TOKEN_SECRET;

const getUploadUrl = async (req, res) => {
    const response = await fetch('https://api.mux.com/video/v1/uploads', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64')}`
        },
        body: JSON.stringify({ "cors_origin": "*", "new_asset_settings": { "playback_policy": ["public"], "video_quality": "basic" } })
    });

    const json = await response.json();

    delete json.data.new_asset_settings;
    delete json.data.cors_origin;
    delete json.data.test;

    return res.status(200).json(json.data);
}

module.exports = {
    getUploadUrl
};