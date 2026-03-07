import { authMiddleware, roleMiddleware } from '../_lib/middleware.js';
import { inviteUser, getUsers } from '../_lib/userService.js';

async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const users = await getUsers();
            return res.status(200).json(users);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    if (req.method === 'POST') {
        const { name, email, role } = req.body;

        if (!name || !email || !role) {
            return res.status(400).json({ error: 'Nombre, email y rol son requeridos' });
        }

        try {
            const user = await inviteUser({ name, email, role });
            return res.status(201).json(user);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
}

// Only admin can access user management
export default authMiddleware(roleMiddleware(['admin'], handler));

