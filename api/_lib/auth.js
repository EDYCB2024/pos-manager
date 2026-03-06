import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'mi_clave_super_secreta_en_produccion';

export function verifySession(req) {
    const cookiesHeader = req.headers.cookie;
    if (!cookiesHeader) return null;

    const cookies = cookiesHeader.split(';').reduce((acc, cookieString) => {
        const [key, value] = cookieString.trim().split('=');
        acc[key] = value;
        return acc;
    }, {});

    const token = cookies.auth_token;
    if (!token) return null;

    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
}

export function isAdmin(user) {
    return user && (user.role === 'admin' || user.role === 'supervisor');
}
