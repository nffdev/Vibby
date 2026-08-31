const crypto = require('node:crypto');

const SECRET = process.env.MUX_WEBHOOK_SECRET;

module.exports = (req, res, next) => {
    if (!SECRET || SECRET.startsWith('YOUR_')) {
        return res.status(500).json({ message: 'Webhook secret not configured.' });
    }

    const header = req.headers['mux-signature'];
    if (!header) return res.status(401).json({ message: 'Missing signature.' });

    const parts = Object.fromEntries(
        String(header).split(',').map(kv => kv.split('=').map(s => s.trim()))
    );
    const timestamp = parts.t;
    const signature = parts.v1;
    if (!timestamp || !signature) return res.status(401).json({ message: 'Malformed signature.' });

    const raw = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body || '');
    const expected = crypto
        .createHmac('sha256', SECRET)
        .update(`${timestamp}.${raw.toString('utf8')}`)
        .digest('hex');

    const sigBuf = Buffer.from(signature, 'hex');
    const expBuf = Buffer.from(expected, 'hex');
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
        return res.status(401).json({ message: 'Invalid signature.' });
    }

    const age = Math.abs(Date.now() / 1000 - Number(timestamp));
    if (!Number.isFinite(age) || age > 300) {
        return res.status(401).json({ message: 'Stale webhook.' });
    }

    try {
        req.body = JSON.parse(raw.toString('utf8'));
    } catch {
        return res.status(400).json({ message: 'Invalid JSON.' });
    }

    next();
};
