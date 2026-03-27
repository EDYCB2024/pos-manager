import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import loginHandler from './api/auth/login.js';
import logoutHandler from './api/auth/logout.js';
import meHandler from './api/auth/me.js';
import activateHandler from './api/auth/activate.js';
import changePasswordHandler from './api/auth/change-password.js';
import usersHandler from './api/users/index.js';
import updateUsersHandler from './api/users/update.js';
import deleteUserHandler from './api/users/delete.js';
import chatHandler from './api/chat.js';

const app = express();
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174', 'http://127.0.0.1:5174'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(cookieParser());

// Replicar las rutas de Vercel
app.all('/api/auth/login', async (req, res) => {
    try {
        await loginHandler(req, res);
    } catch (err) {
        console.error(err);
        if (!res.headersSent) res.status(500).json({ error: 'Internal Error' });
    }
});

app.all('/api/auth/logout', async (req, res) => {
    try {
        await logoutHandler(req, res);
    } catch (err) {
        console.error(err);
        if (!res.headersSent) res.status(500).json({ error: 'Internal Error' });
    }
});

app.all('/api/auth/me', async (req, res) => {
    try {
        if (!req.headers.cookie && req.cookies) {
            req.headers.cookie = Object.entries(req.cookies).map(([k, v]) => `${k}=${v}`).join('; ');
        }
        await meHandler(req, res);
    } catch (err) {
        console.error(err);
        if (!res.headersSent) res.status(500).json({ error: 'Internal Error' });
    }
});

app.all('/api/users', async (req, res) => {
    try {
        if (!req.headers.cookie && req.cookies) {
            req.headers.cookie = Object.entries(req.cookies).map(([k, v]) => `${k}=${v}`).join('; ');
        }
        await usersHandler(req, res);
    } catch (err) {
        console.error(err);
        if (!res.headersSent) res.status(500).json({ error: 'Internal Error' });
    }
});

app.all('/api/users/update', async (req, res) => {
    try {
        if (!req.headers.cookie && req.cookies) {
            req.headers.cookie = Object.entries(req.cookies).map(([k, v]) => `${k}=${v}`).join('; ');
        }
        await updateUsersHandler(req, res);
    } catch (err) {
        console.error(err);
        if (!res.headersSent) res.status(500).json({ error: 'Internal Error' });
    }
});

app.all('/api/users/delete', async (req, res) => {
    try {
        if (!req.headers.cookie && req.cookies) {
            req.headers.cookie = Object.entries(req.cookies).map(([k, v]) => `${k}=${v}`).join('; ');
        }
        await deleteUserHandler(req, res);
    } catch (err) {
        console.error(err);
        if (!res.headersSent) res.status(500).json({ error: 'Internal Error' });
    }
});

app.all('/api/auth/activate', async (req, res) => {
    try {
        await activateHandler(req, res);
    } catch (err) {
        console.error(err);
        if (!res.headersSent) res.status(500).json({ error: 'Internal Error' });
    }
});

app.all('/api/auth/change-password', async (req, res) => {
    try {
        if (!req.headers.cookie && req.cookies) {
            req.headers.cookie = Object.entries(req.cookies).map(([k, v]) => `${k}=${v}`).join('; ');
        }
        await changePasswordHandler(req, res);
    } catch (err) {
        console.error(err);
        if (!res.headersSent) res.status(500).json({ error: 'Internal Error' });
    }
});

app.all('/api/chat', async (req, res) => {
    try {
        await chatHandler(req, res);
    } catch (err) {
        console.error('Error in Express Chat Route:', err);
        if (!res.headersSent) res.status(500).json({ error: 'Internal Error' });
    }
});

const PORT = 3001;
// ─── Zoom PROD Proxy (Eitol/zoom-red-tracking) ───────────────────────
app.get('/api/zoom/track/:nro_guia', async (req, res) => {
    try {
        const { nro_guia } = req.params;
        // Production URL from github.com/Eitol/zoom-red-tracking
        // Changed to HTTPS and www.zoom.red to avoid potential port 80 blocks/timeouts
        const url = `https://www.zoom.red/baaszoom/public/canguroazul/getZoomTrackWs?tipo_busqueda=1&web=1&codigo=${nro_guia}`;
        
        const response = await fetch(url, {
            headers: { 
                'Connection': 'keep-alive',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error('Zoom PROD Proxy Error:', err);
        res.status(500).json({ error: 'Error al conectar con el servidor de ZOOM' });
    }
});

app.listen(PORT, () => {
    console.log(`Mock Vercel API running on http://localhost:${PORT}`);
});
