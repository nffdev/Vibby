const Report = require('../models/Report');
const Video = require('../models/Video');
const Profile = require('../models/Profile');
const { removeVideo } = require('./videos');

const listReports = async (req, res) => {
    try {
        const status = String(req.query.status || 'pending').trim();
        const filter = status === 'all' ? {} : { status };

        const reports = await Report.find(filter).sort({ createdAt: -1 }).limit(200);

        const videoIds = [...new Set(reports.map(r => r.videoId).filter(Boolean))];
        const reporterIds = [...new Set(reports.map(r => r.reporterId).filter(Boolean))];

        const [videos, reporters] = await Promise.all([
            videoIds.length ? Video.find({ id: { $in: videoIds } }) : [],
            reporterIds.length ? Profile.find({ id: { $in: reporterIds } }) : [],
        ]);

        const videoById = new Map(videos.map(v => [v.id, v]));
        const reporterById = new Map(reporters.map(p => [p.id, p]));

        const final = reports.map(r => {
            const v = videoById.get(r.videoId);
            const reporter = reporterById.get(r.reporterId);
            return {
                id: r.id,
                reason: r.reason,
                detail: r.detail,
                status: r.status,
                createdAt: r.createdAt,
                reporter: reporter
                    ? { id: reporter.id, username: reporter.username, name: reporter.name }
                    : { id: r.reporterId },
                video: v
                    ? { id: v.id, title: v.title, description: v.description, userId: v.userId, playback_id: v.playback_id }
                    : { id: r.videoId, deleted: true },
            };
        });

        return res.status(200).json(final);
    } catch {
        return res.status(500).json({ message: 'Server error.' });
    }
};

const resolveReport = async (req, res) => {
    try {
        const id = String(req.params.id || '').trim();
        const action = String(req.body?.action || '').trim();
        if (!['reviewed', 'dismissed'].includes(action)) {
            return res.status(400).json({ message: 'Invalid action.' });
        }

        const report = await Report.findOne({ id });
        if (!report) return res.status(404).json({ message: 'Report not found.' });

        report.status = action;
        await report.save();

        return res.status(200).json({ id: report.id, status: report.status });
    } catch {
        return res.status(500).json({ message: 'Server error.' });
    }
};

const deleteReportedVideo = async (req, res) => {
    try {
        const videoId = String(req.params.videoId || '').trim();
        if (!videoId) return res.status(400).json({ message: 'Video id is required.' });

        const video = await Video.findOne({ id: videoId });
        if (video) await removeVideo(video);

        await Report.updateMany({ videoId, status: 'pending' }, { status: 'reviewed' });

        return res.status(200).json({ message: 'Video removed.' });
    } catch {
        return res.status(500).json({ message: 'Server error.' });
    }
};

module.exports = {
    listReports,
    resolveReport,
    deleteReportedVideo,
};
