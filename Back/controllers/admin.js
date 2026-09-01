const Report = require('../models/Report');
const Video = require('../models/Video');
const Profile = require('../models/Profile');
const User = require('../models/User');
const { removeVideo } = require('./videos');

const listReports = async (req, res) => {
    try {
        const status = String(req.query.status || 'pending').trim();
        const filter = status === 'all' ? {} : { status };

        const reports = await Report.find(filter).sort({ createdAt: -1, _id: -1 }).limit(200);

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
        if (!['reviewed', 'dismissed', 'pending'].includes(action)) {
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

const banUser = async (req, res) => {
    try {
        const userId = String(req.params.userId || '').trim();
        if (!userId) return res.status(400).json({ message: 'User id is required.' });
        if (userId === req.user.id) return res.status(400).json({ message: 'You cannot ban yourself.' });

        const user = await User.findOne({ id: userId });
        if (!user) return res.status(404).json({ message: 'User not found.' });
        if (user.role === 'admin') return res.status(400).json({ message: 'Cannot ban an admin.' });

        user.banned = true;
        user.tokenVersion = (user.tokenVersion || 0) + 1; 
        await user.save();

        const videos = await Video.find({ userId });
        for (const video of videos) {
            await removeVideo(video);
            await Report.updateMany({ videoId: video.id, status: 'pending' }, { status: 'reviewed' });
        }

        return res.status(200).json({ message: 'User banned.', removedVideos: videos.length });
    } catch {
        return res.status(500).json({ message: 'Server error.' });
    }
};

const listBannedUsers = async (req, res) => {
    try {
        const users = await User.find({ banned: true }).limit(200);
        const ids = users.map(u => u.id);
        const profiles = ids.length ? await Profile.find({ id: { $in: ids } }) : [];
        const profileById = new Map(profiles.map(p => [p.id, p]));

        const final = users.map(u => {
            const p = profileById.get(u.id);
            return {
                id: u.id,
                email: u.email,
                username: p?.username,
                name: p?.name,
                avatar: p?.avatar,
            };
        });

        return res.status(200).json(final);
    } catch {
        return res.status(500).json({ message: 'Server error.' });
    }
};

const unbanUser = async (req, res) => {
    try {
        const userId = String(req.params.userId || '').trim();
        if (!userId) return res.status(400).json({ message: 'User id is required.' });

        const user = await User.findOne({ id: userId });
        if (!user) return res.status(404).json({ message: 'User not found.' });

        user.banned = false;
        await user.save();

        return res.status(200).json({ message: 'User unbanned.' });
    } catch {
        return res.status(500).json({ message: 'Server error.' });
    }
};

module.exports = {
    listReports,
    resolveReport,
    deleteReportedVideo,
    banUser,
    listBannedUsers,
    unbanUser,
};
