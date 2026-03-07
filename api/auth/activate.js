import { activateUser } from '../_lib/userService.js';
import { validatePassword } from '../_lib/validator.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { token, password } = req.body;

    if (!token || !password) {
        return res.status(400).json({ error: 'Token y contraseña son requeridos' });
    }

    if (!validatePassword(password)) {
        return res.status(400).json({
            error: 'La contraseña debe tener al menos 10 caracteres, una mayúscula, un número y un símbolo.'
        });
    }

    try {
        await activateUser(token, password);
        return res.status(200).json({ message: 'Cuenta activada con éxito' });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}
