import { authMiddleware } from './_lib/middleware.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Instancia del cliente de Gemini (se reutiliza entre peticiones)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { prompt } = req.body;

        if (!prompt?.trim()) {
            return res.status(400).json({ error: 'El prompt no puede estar vacío.' });
        }

        // Configuramos el modelo
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ message: text });

    } catch (error) {
        console.error('Error en el servidor:', error);
        res.status(500).json({ error: 'Algo salió mal con Gemini' });
    }
}

// Protegido: solo usuarios autenticados
export default authMiddleware(handler);
