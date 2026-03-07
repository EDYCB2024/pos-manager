import { verifyToken } from './jwt.js';

export function authMiddleware(handler) {
    return async (req, res) => {
        const cookiesHeader = req.headers.cookie;
        if (!cookiesHeader) {
            return res.status(401).json({ error: 'No autenticado' });
        }

        const cookies = cookiesHeader.split(';').reduce((acc, cookieString) => {
            const [key, value] = cookieString.trim().split('=');
            acc[key] = value;
            return acc;
        }, {});

        const token = cookies.auth_token;
        if (!token) {
            return res.status(401).json({ error: 'No autenticado' });
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(401).json({ error: 'Sesión expirada o inválida' });
        }

        // Inject user info into request
        req.user = decoded;

        return handler(req, res);
    };
}

export function roleMiddleware(allowedRoles, handler) {
    return async (req, res) => {
        // This expects authMiddleware to have run already
        if (!req.user) {
            return res.status(401).json({ error: 'No autenticado' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: 'No tienes permisos para esta acción' });
        }

        return handler(req, res);
    };
}
