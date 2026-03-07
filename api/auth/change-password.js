import { authMiddleware } from '../_lib/middleware.js';
import { supabase } from '../_lib/supabase.js';
import { hashPassword, comparePassword } from '../_lib/hash.js';
import { validatePassword } from '../_lib/validator.js';

async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        return res.status(400).json({ error: 'Faltan datos' });
    }

    if (!validatePassword(newPassword)) {
        return res.status(400).json({
            error: 'La nueva contraseña no cumple con los requisitos mínimos de seguridad.'
        });
    }

    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('password_hash')
            .eq('id', req.user.id)
            .single();

        if (error || !user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const isMatch = await comparePassword(oldPassword, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'La contraseña actual es incorrecta' });
        }

        const password_hash = await hashPassword(newPassword);
        const { error: updateError } = await supabase
            .from('users')
            .update({ password_hash })
            .eq('id', req.user.id);

        if (updateError) throw new Error(updateError.message);

        return res.status(200).json({ message: 'Contraseña actualizada con éxito' });
    } catch (error) {
        return res.status(500).json({ error: 'Error al cambiar la contraseña' });
    }
}

export default authMiddleware(handler);
