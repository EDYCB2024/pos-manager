import { supabase } from '../_lib/supabase.js';
import { comparePassword } from '../_lib/hash.js';
import { signToken } from '../_lib/jwt.js';
import cookie from 'cookie';

// In-memory rate limit
const loginAttempts = new Map();

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const ip = req.headers['x-forwarded-for'] || '127.0.0.1';
    const now = Date.now();

    const attemptsInfo = loginAttempts.get(ip) || { count: 0, time: now };
    if (now - attemptsInfo.time > 15 * 60 * 1000) {
        attemptsInfo.count = 0;
        attemptsInfo.time = now;
    }

    if (attemptsInfo.count >= 5) {
        return res.status(429).json({ error: 'Demasiados intentos. Inténtalo más tarde.' });
    }

    attemptsInfo.count += 1;
    loginAttempts.set(ip, attemptsInfo);

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Faltan credenciales' });
    }

    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('id, name, email, password_hash, role, active')
            .eq('email', email)
            .single();

        if (error || !user) {
            return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
        }

        if (!user.active) {
            return res.status(403).json({ error: 'Usuario inactivo. Revisa tu correo para activar la cuenta.' });
        }

        const isMatch = await comparePassword(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
        }

        // Success: clear rate limit
        loginAttempts.delete(ip);

        // JWT
        const token = signToken({
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name
        });

        // Set Cookie
        res.setHeader('Set-Cookie', cookie.serialize('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 8 * 60 * 60, // 8 hours
            path: '/',
        }));

        const { password_hash, ...safeUser } = user;
        return res.status(200).json({ user: safeUser });

    } catch (err) {
        console.error('Error in login:', err);
        return res.status(500).json({ error: 'Error del servidor' });
    }
}

