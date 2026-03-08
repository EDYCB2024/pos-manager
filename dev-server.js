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
import { config } from 'dotenv';
config();

const app = express();
app.use(cors());
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

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Mock Vercel API running on http://localhost:${PORT}`);
});

