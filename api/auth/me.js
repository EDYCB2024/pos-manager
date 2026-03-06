import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'mi_clave_super_secreta_en_produccion';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Leemos la cookie manualmente
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

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        // Retornamos el payload de la sesión
        return res.status(200).json({
            user: {
                id: decoded.id,
                name: decoded.name,
                email: decoded.email,
                role: decoded.role
            }
        });
    } catch (error) {
        return res.status(401).json({ error: 'Sesión expirada o inválida' });
    }
}
