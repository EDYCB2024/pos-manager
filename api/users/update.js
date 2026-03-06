import { supabase } from '../_lib/supabase.js';
import { verifySession, isAdmin } from '../_lib/auth.js';

export default async function handler(req, res) {
    const session = verifySession(req);
    if (!session || !isAdmin(session)) {
        return res.status(403).json({ error: 'Acceso denegado' });
    }

    if (req.method !== 'PUT' && req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { id } = req.query;

    if (req.method === 'DELETE') {
        const { error } = await supabase
            .from('users')
            .update({ active: false })
            .eq('id', id);

        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json({ message: 'Usuario desactivado' });
    }

    if (req.method === 'PUT') {
        const { name, role, active } = req.body;
        const { error } = await supabase
            .from('users')
            .update({ name, role, active })
            .eq('id', id);

        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json({ message: 'Usuario actualizado' });
    }
}
