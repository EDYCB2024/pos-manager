import { authMiddleware } from './_lib/middleware.js';
import { supabase } from './_lib/supabase.js';

// ─── SYSTEM PROMPT ────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `Eres Aura, el asistente de IA de POS Manager.
Ayudas a gestionar equipos POS, reparaciones e inventario.
Responde siempre en español, de forma clara y profesional.
No reveles contraseñas, tokens ni información confidencial.
Cuando tengas datos del sistema disponibles, úsalos para dar respuestas precisas.`;

// ─── ACCIONES SOBRE SUPABASE ──────────────────────────────────────────────────
async function buscarEquipos(query) {
    const { data, error } = await supabase
        .from('casos_pos')
        .select('id, fecha, serial, razon_social, rif, aliado, modelo, estatus_caso, estatus')
        .or(`serial.ilike.%${query}%,razon_social.ilike.%${query}%,rif.ilike.%${query}%,aliado.ilike.%${query}%,modelo.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(8);
    return error ? null : data;
}

async function obtenerEstadisticas() {
    const { data, error } = await supabase.from('casos_pos').select('estatus, estatus_caso');
    if (error) return null;
    return data.reduce((acc, row) => {
        if (row.estatus)      acc.reparacion[row.estatus] = (acc.reparacion[row.estatus] || 0) + 1;
        if (row.estatus_caso) acc.caso[row.estatus_caso]   = (acc.caso[row.estatus_caso]   || 0) + 1;
        acc.total++;
        return acc;
    }, { total: 0, reparacion: {}, caso: {} });
}

// ─── DETECTAR INTENCIÓN Y ENRIQUECER CON DATOS REALES ─────────────────────────
async function obtenerContexto(message) {
    const msg = message.toLowerCase();

    if (/busca|buscar|serial|equipo|cliente|rif/.test(msg)) {
        // Tomar las palabras más largas como término de búsqueda
        const terminos = message.split(/\s+/).filter(w => w.length > 3);
        const query = terminos[terminos.length - 1] || message;
        const resultados = await buscarEquipos(query);
        if (resultados?.length) {
            return `\n\n[DATOS DEL SISTEMA]\nResultados para "${query}":\n${JSON.stringify(resultados, null, 2)}`;
        }
        return `\n\n[DATOS DEL SISTEMA]\nNo se encontraron equipos para "${query}".`;
    }

    if (/estadística|resumen|cuántos|total|cuantos|stats/.test(msg)) {
        const stats = await obtenerEstadisticas();
        if (stats) return `\n\n[DATOS DEL SISTEMA]\nEstadísticas actuales:\n${JSON.stringify(stats, null, 2)}`;
    }

    return '';
}

// ─── HANDLER ──────────────────────────────────────────────────────────────────
async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { message, history = [] } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: 'Mensaje vacío.' });

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
        console.error('[AURA] ❌ GEMINI_API_KEY no configurada');
        return res.status(500).json({ error: 'API key no configurada.' });
    }

    console.log(`[AURA] 📨 "${message.slice(0, 60)}" | Usuario: ${req.user?.name}`);

    try {
        // 1. Enriquecer el mensaje con datos reales de Supabase si aplica
        const contexto = await obtenerContexto(message);
        const promptFinal = message + contexto;

        // 2. Construir el historial de conversación como texto plano para el prompt
        const historialTexto = history
            .filter(h => h.content?.trim())
            .slice(-6) // últimos 6 mensajes para no exceder tokens
            .map(h => `${h.role === 'user' ? 'Usuario' : 'Aura'}: ${h.content}`)
            .join('\n');

        // 3. Prompt completo: system + historial + mensaje actual
        const promptCompleto = `${SYSTEM_PROMPT}

${historialTexto ? `[HISTORIAL DE CONVERSACIÓN]\n${historialTexto}\n` : ''}
[MENSAJE ACTUAL DEL USUARIO]
${promptFinal}`;

        // 4. Llamar a Gemini usando el SDK oficial — generateContent (sin startChat)
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const result = await model.generateContent(promptCompleto);
        const response = await result.response;
        const text = response.text();

        console.log(`[AURA] ✅ Respuesta lista (${text.length} chars)`);
        res.status(200).json({ content: text });

    } catch (error) {
        console.error('[AURA ERROR]', error.message);

        if (error?.status === 429 || error.message?.includes('429')) {
            return res.status(429).json({ error: 'Límite de peticiones alcanzado. Espera unos segundos.' });
        }

        res.status(500).json({ error: 'Error procesando tu consulta.', detail: error.message });
    }
}

export default authMiddleware(handler);
