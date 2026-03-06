import { supabase } from '../_lib/supabase.js';
import { verifySession, isAdmin } from '../_lib/auth.js';

export default async function handler(req, res) {
    const session = verifySession(req);
    if (!session || !isAdmin(session)) {
        return res.status(403).json({ error: 'Acceso denegado' });
    }

    if (req.method === 'GET') {
        const { data, error } = await supabase
            .from('users')
            .select('id, name, email, role, active, created_at')
            .order('created_at', { ascending: false });

        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json(data);
    }

    if (req.method === 'POST') {
        const { name, email, role, password } = req.body;

        // Hashing password with bcrypt (assuming we handle this in a helper)
        // For simplicity and to match current setup, let's use a dummy hash or import bcrypt
        // But the prompt said "use bcrypt for password hashing"
        const { default: bcrypt } = await import('bcryptjs');
        const password_hash = await bcrypt.hash(password || '123456', 10);

        const { data, error } = await supabase
            .from('users')
            .insert([{ name, email, role, password_hash }])
            .select();

        if (error) return res.status(500).json({ error: error.message });
        return res.status(201).json(data[0]);
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
}
