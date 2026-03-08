import { config } from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

config();

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    try {
        console.log('Listing models...');
        // The SDK might not have listModels exposed the same way in all versions
        // Let's try to fetch them
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const data = await response.json();
        console.log('Available models:', JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Error listing models:', err);
    }
}

listModels();
