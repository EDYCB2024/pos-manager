import { config } from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

config();

async function test() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    console.log('Testing simple generateContent...');
    try {
        const result = await model.generateContent('Cual es el status de mi API key? Responde "OK" si puedes leer esto.');
        console.log('Response:', result.response.text());
    } catch (err) {
        console.error('Error:', err);
    }
}

test();
