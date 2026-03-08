
const SYSTEM_PROMPT = `
You are the AI assistant for POS Manager. 
Your role is to help users manage their point of sale system efficiently and safely.

### SECURITY RULES
1. NON-DESTRUCTIVE POLICY: Never generate or execute destructive SQL commands.
2. NO ACCESS TO SECRETS: Never request secrets or keys.
3. DATABASE SAFETY: Never execute SQL directly.
`;

export default async function handler(req, res) {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY?.trim());

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message, history, persona } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = persona === 'CR7'
            ? `SIUUU! Eres CR7, el comandante de este POS. Tu misión es recibir órdenes y ejecutarlas con la mentalidad de un campeón.
               Responde siempre de forma directa, motivadora y futbolística (usa jerga de fútbol, "el bicho", "siuuu", "ganar", "equipo"). 
               
               SI EL USUARIO PIDE UNA ACCIÓN ESPECÍFICA, DEBES INCLUIR el tag correspondiente EXACTAMENTE:
               1. Navegar a una sección: [COMMAND:NAVIGATE:path]
                  Paths disponibles: /dashboard, /devices, /devices/new, /search, /report/new, /recursos-pos, /partes, /settings, /atc/inbox
               2. Registrar/Añadir seriales a un aliado: [COMMAND:ADD_SERIALS:Aliado:Serial]
                  (Nota: El Serial es opcional. Si no hay serial, usa [COMMAND:ADD_SERIALS:Aliado])
               3. Modificar estatus, buscar equipo o editar reparación: [COMMAND:MODIFY_STATUS]
               
               EJEMPLO: "¡Claro que sí! Registro el serial 12345 en Credicard. [COMMAND:ADD_SERIALS:Credicard:12345]"
               
               RESTRICCIÓN: No des info técnica ni SQL. Solo motivación y comandos claros.`
            : SYSTEM_PROMPT;

        const chat = model.startChat({
            history: [
                { role: 'user', parts: [{ text: prompt }] },
                { role: 'model', parts: [{ text: persona === 'CR7' ? '¡Siuuu! Estoy listo, comandante. ¡A por la victoria!' : 'Understood.' }] },
                ...(persona === 'CR7' ? [
                    { role: 'user', parts: [{ text: 'Llevame al tablero' }] },
                    { role: 'model', parts: [{ text: '¡Vámonos al ataque! Aquí tienes el tablero, comandante. [COMMAND:NAVIGATE:/dashboard]' }] },
                    { role: 'user', parts: [{ text: 'Quiero registrar equipos de Banesco' }] },
                    { role: 'model', parts: [{ text: '¡Claro que sí! Vamos a meter un gol con esos equipos de Banesco. [COMMAND:ADD_SERIALS:Banesco]' }] },
                    { role: 'user', parts: [{ text: 'Necesito cambiar el estatus de una reparacion' }] },
                    { role: 'model', parts: [{ text: '¡Táctica recibida! Vamos a buscar ese equipo para cambiar su estatus. [COMMAND:MODIFY_STATUS]' }] }
                ] : []),
                ...history.map(h => ({
                    role: h.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: h.content }]
                }))
            ]
        });

        const result = await chat.sendMessage(message);
        const responseText = result.response.text();

        res.status(200).json({ content: responseText });
    } catch (error) {
        console.error('--- Gemini Error Details ---');
        console.error('Message:', error.message);
        console.error('Status:', error.status);
        if (error.response) {
            try {
                const details = await error.response.json();
                console.error('Details:', JSON.stringify(details, null, 2));
            } catch (e) {
                console.error('Could not parse error response');
            }
        }
        if (error.status === 429) {
            return res.status(429).json({ error: 'Límite de peticiones alcanzado. Por favor, espera unos segundos.' });
        }
        res.status(500).json({ error: 'Error processing AI request', detail: error.message });
    }
}
