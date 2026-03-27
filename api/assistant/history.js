import { supabase } from '../_lib/supabase.js';
import { authMiddleware } from '../_lib/middleware.js';

async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { data, error } = await supabase
            .from('chat_history')
            .select('*')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: true })
            .limit(50);

        if (error) throw error;

        return res.status(200).json({
            history: data || []
        });
    } catch (error) {
        console.error('History fetch error:', error);
        return res.status(500).json({ error: 'Error al obtener el historial' });
    }
}

export default authMiddleware(handler);
