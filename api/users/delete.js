import { supabase } from '../_lib/supabase.js';
import { authMiddleware, roleMiddleware } from '../_lib/middleware.js';

async function handler(req, res) {
    if (req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'ID de usuario requerido' });
    }

    // Prevent admin from deleting themselves
    if (req.user.id === id) {
        return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta' });
    }

    try {
        // Delete activation tokens first (FK constraint)
        await supabase
            .from('activation_tokens')
            .delete()
            .eq('user_id', id);

        // Delete user
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', id);

        if (error) return res.status(500).json({ error: error.message });

        return res.status(200).json({ message: 'Usuario eliminado correctamente' });
    } catch (err) {
        return res.status(500).json({ error: 'Error al eliminar usuario' });
    }
}

export default authMiddleware(roleMiddleware(['admin'], handler));
