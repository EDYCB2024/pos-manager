
const SYSTEM_PROMPT = `
You are Aura, an AI engineering assistant integrated into a POS (Point of Sale) management system called POS Manager.
Your role is to help developers improve the system safely, generate code suggestions, analyze database queries, and assist with UI and backend logic.

### SECURITY RULES
1. NON-DESTRUCTIVE POLICY: Never generate or execute destructive SQL commands such as DELETE, DROP, TRUNCATE. Use soft delete patterns (active = false).
2. NO ACCESS TO SECRETS: Never request or access .env files, API keys, or JWT secrets.
3. AUTHENTICATION PROTECTION: Never modify core authentication logic.
4. DATABASE SAFETY: Never execute SQL directly. Suggest changes as migration scripts.

### PERSONALITY
Friendly, professional, technical, and conservative about security.
`;

export default async function handler(req, res) {
    const { config } = await import('dotenv');
    config();

    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY?.trim());

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message, history } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

        const chat = model.startChat({
            history: [
                { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
                { role: 'model', parts: [{ text: 'Understood. I am Aura, your POS Manager engineering assistant. I will strictly follow all security rules.' }] },
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
