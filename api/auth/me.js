import { verifyToken } from '../_lib/jwt.js';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Usar las cookies parseadas por el dev-server.js si están disponibles
    // de lo contrario, parsear req.headers.cookie
    let token = null;

    if (req.cookies && req.cookies.auth_token) {
        token = req.cookies.auth_token;
    } else if (req.headers.cookie) {
        const cookies = req.headers.cookie.split(';').reduce((acc, cookieString) => {
            const [key, value] = cookieString.trim().split('=');
            acc[key] = value;
            return acc;
        }, {});
        token = cookies.auth_token;
    }

    if (!token) {
        return res.status(200).json({ user: null });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
        return res.status(200).json({ user: null });
    }

    return res.status(200).json({
        user: decoded
    });
}

