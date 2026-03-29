import { verifyToken } from './jwt.js';

export function authMiddleware(handler) {
    return async (req, res) => {
        // --- BYPASS AUTH FOR DEMO ---
        // For a demo/portfolio environment, we can fallback to a demo user
        // if no session is active.
        const demoFallback = {
            id: 'bfc8b318-be54-4473-840c-e5e861ad3107',
            email: 'demo@posmanager.app',
            role: 'admin',
            name: 'Demo Admin'
        };

        const cookiesHeader = req.headers.cookie;
        if (!cookiesHeader) {
            req.user = demoFallback;
            return handler(req, res);
        }

        const cookies = cookiesHeader.split(';').reduce((acc, cookieString) => {
            const [key, value] = cookieString.trim().split('=');
            acc[key] = value;
            return acc;
        }, {});

        const token = cookies.auth_token;
        if (!token) {
            req.user = demoFallback;
            return handler(req, res);
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            // Even if expired, return demo for smooth UX
            req.user = demoFallback;
            return handler(req, res);
        }

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
