
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

    const { message, history } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const chat = model.startChat({
            history: [
                { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
                { role: 'model', parts: [{ text: 'Understood.' }] },
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
