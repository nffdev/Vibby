const PUBLIC_VIDEO_FIELDS = [
    'id',
    'userId',
    'playback_id',
    'title',
    'description',
    'likes',
    'status',
    'createdAt',
];

function publicVideoProjection(extraFields = []) {
    const projection = { _id: 0 };
    [...PUBLIC_VIDEO_FIELDS, ...extraFields].forEach(f => { projection[f] = 1; });
    return projection;
}

function toPublicVideo(video) {
    const source = typeof video.toJSON === 'function' ? video.toJSON() : video;
    const json = {};
    PUBLIC_VIDEO_FIELDS.forEach(f => {
        if (source[f] !== undefined) json[f] = source[f];
    });
    return json;
}

module.exports = { PUBLIC_VIDEO_FIELDS, publicVideoProjection, toPublicVideo };
