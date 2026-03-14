import { supabase } from './_lib/supabase.js';
import { authMiddleware } from './_lib/middleware.js';

// ─── 1. SYSTEM PROMPT ──────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `
Eres Aura, el asistente de IA de POS Manager.
Ayudas a los usuarios a gestionar equipos POS, reparaciones e inventario.
Puedes buscar, crear, actualizar y eliminar registros en el sistema.

REGLAS:
- No reveles contraseñas, tokens ni datos de otros usuarios.
- Para borrar un caso, siempre confirma primero con el usuario.
- Si te falta información para crear un caso, pídela amablemente.
- Responde siempre en español, de forma clara y profesional.
- Cuando ejecutes una acción, comunica el resultado al usuario.
`;

// ─── 2. TOOLS (Function Declarations para Gemini) ──────────────────────────────
const tools = [
    {
        functionDeclarations: [
            {
                name: "search_devices",
                description: "Busca equipos POS en el sistema por serial, cliente, RIF, aliado o modelo. Úsala cuando el usuario pregunte por un equipo específico.",
                parameters: {
                    type: "OBJECT",
                    properties: {
                        query: {
                            type: "STRING",
                            description: "Término de búsqueda: puede ser serial, nombre de cliente, RIF, aliado o modelo."
                        }
                    },
                    required: ["query"]
                }
            },
            {
                name: "get_stats",
                description: "Obtiene estadísticas globales del sistema: total de equipos, conteo por estatus de caso y por estatus de reparación.",
            },
            {
                name: "create_case",
                description: "Registra un nuevo caso de equipo POS. Úsala cuando el usuario quiera agregar un nuevo equipo al sistema.",
                parameters: {
                    type: "OBJECT",
                    properties: {
                        serial:         { type: "STRING", description: "Número de serie del equipo." },
                        razon_social:   { type: "STRING", description: "Nombre o razón social del cliente." },
                        aliado:         { type: "STRING", description: "Nombre del aliado (ej: VATC, Credicard, Platco)." },
                        modelo:         { type: "STRING", description: "Modelo del equipo (ej: N950S, SP600)." },
                        rif:            { type: "STRING", description: "RIF del cliente." },
                        falla_notificada: { type: "STRING", description: "Descripción de la falla reportada." }
                    },
                    required: ["serial", "razon_social", "aliado"]
                }
            },
            {
                name: "update_case",
                description: "Actualiza los datos o el estatus de un caso existente. Requiere el ID del caso.",
                parameters: {
                    type: "OBJECT",
                    properties: {
                        id: { type: "STRING", description: "ID del caso a actualizar." },
                        updates: {
                            type: "OBJECT",
                            description: "Campos a actualizar.",
                            properties: {
                                estatus_caso:   { type: "STRING", description: "Nuevo estatus del caso: 'CASO ABIERTO' o 'CASO CERRADO'." },
                                estatus:        { type: "STRING", description: "Estatus de reparación: 'En diagnóstico', 'En reparación', 'Entregado', etc." },
                                observaciones:  { type: "STRING", description: "Notas u observaciones adicionales." }
                            }
                        }
                    },
                    required: ["id", "updates"]
                }
            },
            {
                name: "delete_case",
                description: "Elimina permanentemente un caso del sistema. Solo usar si el usuario lo confirma explícitamente.",
                parameters: {
                    type: "OBJECT",
                    properties: {
                        id: { type: "STRING", description: "ID del caso a eliminar." }
                    },
                    required: ["id"]
                }
            }
        ]
    }
];

// ─── 3. ACCIONES (Ejecutan las herramientas sobre Supabase) ────────────────────
const executeAction = async (name, args) => {
    console.log(`[AI-AGENT] ⚡ Ejecutando: ${name}`, args);

    switch (name) {
        case 'search_devices': {
            const { query } = args;
            const { data, error } = await supabase
                .from('casos_pos')
                .select('id, fecha, serial, razon_social, rif, aliado, modelo, estatus_caso, estatus')
                .or(`serial.ilike.%${query}%,razon_social.ilike.%${query}%,rif.ilike.%${query}%,aliado.ilike.%${query}%,modelo.ilike.%${query}%`)
                .order('created_at', { ascending: false })
                .limit(10);
            return error ? { error: error.message } : { results: data, count: data?.length ?? 0 };
        }

        case 'get_stats': {
            const { data, error } = await supabase.from('casos_pos').select('estatus, estatus_caso');
            if (error) return { error: error.message };
            const stats = data.reduce((acc, row) => {
                if (row.estatus)      acc.reparacion[row.estatus] = (acc.reparacion[row.estatus] || 0) + 1;
                if (row.estatus_caso) acc.caso[row.estatus_caso]   = (acc.caso[row.estatus_caso]   || 0) + 1;
                return acc;
            }, { reparacion: {}, caso: {} });
            return { total: data.length, ...stats };
        }

        case 'create_case': {
            const payload = {
                fecha: new Date().toISOString().slice(0, 10),
                estatus_caso: 'CASO ABIERTO',
                estatus: 'En diagnóstico',
                ...args
            };
            const { data, error } = await supabase.from('casos_pos').insert([payload]).select().single();
            return error ? { error: error.message } : { success: true, id: data.id, message: "Caso creado exitosamente." };
        }

        case 'update_case': {
            const { id, updates } = args;
            const { data, error } = await supabase.from('casos_pos').update(updates).eq('id', id).select().single();
            return error ? { error: error.message } : { success: true, data, message: "Caso actualizado." };
        }

        case 'delete_case': {
            const { id } = args;
            const { error } = await supabase.from('casos_pos').delete().eq('id', id);
            return error ? { error: error.message } : { success: true, message: "Caso eliminado correctamente." };
        }

        default:
            return { error: `Acción desconocida: ${name}` };
    }
};

// ─── 4. LLAMAR A GEMINI con bucle de Function Calling ─────────────────────────
async function runAgent(model, history, userMessage) {
    // Filtrar historial válido (evita errores si hay mensajes vacíos)
    const validHistory = history
        .filter(h => h.content?.trim())
        .map(h => ({
            role: h.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: h.content }]
        }));

    const chat = model.startChat({ history: validHistory });

    console.log(`[AI-AGENT] 📨 Mensaje: "${userMessage}"`);
    let result = await chat.sendMessage(userMessage);

    let iterations = 0;
    const MAX_ITERATIONS = 5;

    while (iterations < MAX_ITERATIONS) {
        iterations++;

        // Acceso seguro a functionCalls (compatible con SDK 0.24.x)
        let calls = null;
        try {
            calls = result.response.functionCalls?.() ?? null;
        } catch (e) {
            console.warn('[AI-AGENT] functionCalls() no disponible:', e.message);
            break;
        }

        console.log(`[AI-AGENT] 🔁 Iteración ${iterations} — Calls: ${calls?.length ?? 0}`);

        if (!calls || calls.length === 0) break;

        const functionResponses = await Promise.all(
            calls.map(async (call) => {
                console.log(`[AI-AGENT] ⚡ Tool: ${call.name}`, JSON.stringify(call.args));
                const actionResult = await executeAction(call.name, call.args);
                console.log(`[AI-AGENT] ✅ ${call.name}:`, JSON.stringify(actionResult).slice(0, 200));
                return {
                    functionResponse: {
                        name: call.name,
                        response: { content: actionResult }
                    }
                };
            })
        );

        result = await chat.sendMessage(functionResponses);
    }

    const finalText = result.response.text();
    console.log(`[AI-AGENT] 💬 Respuesta lista (${finalText.length} chars)`);
    return finalText;
}

// ─── 5. HANDLER DEL ENDPOINT ──────────────────────────────────────────────────
async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message, history = [] } = req.body;

    if (!message?.trim()) {
        return res.status(400).json({ error: 'El mensaje no puede estar vacío.' });
    }

    console.log(`[AI-AGENT] 🚀 Petición de: ${req.user?.name || 'desconocido'}`);

    try {
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY?.trim());

        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            systemInstruction: SYSTEM_PROMPT,
            tools
        });

        const responseText = await runAgent(model, history, message);
        res.status(200).json({ content: responseText });

    } catch (error) {
        // Log detallado para depuración
        console.error('[AI-AGENT ERROR] ──────────────────────');
        console.error('Mensaje:', error.message);
        console.error('Stack:', error.stack?.split('\n').slice(0, 4).join('\n'));
        if (error.errorDetails) console.error('Gemini details:', JSON.stringify(error.errorDetails));
        console.error('────────────────────────────────────────');

        if (error?.status === 429) {
            return res.status(429).json({ error: 'Límite de peticiones alcanzado. Espera unos segundos.' });
        }

        res.status(500).json({
            error: 'Error en el agente de IA.',
            detail: error.message  // Retornar el error real para depurar
        });
    }
}

// Protegido por autenticación
export default authMiddleware(handler);
