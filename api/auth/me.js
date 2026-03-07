import { authMiddleware } from '../_lib/middleware.js';

async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    return res.status(200).json({
        user: req.user
    });
}

export default authMiddleware(handler);

