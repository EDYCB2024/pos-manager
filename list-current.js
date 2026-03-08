import { config } from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

config();

async function list() {
    const key = process.env.GEMINI_API_KEY?.trim();
    console.log('Using Key:', key.substring(0, 5) + '...');
    const genAI = new GoogleGenerativeAI(key);
    try {
        const models = await genAI.listModels();
        for (const m of models.models) {
            console.log(`${m.name} - ${m.supportedMethods.join(', ')}`);
        }
    } catch (err) {
        console.error('Error listing models:', err);
    }
}

list();
