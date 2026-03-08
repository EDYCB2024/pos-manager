import { config } from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

config();

async function testV2() {
    const key = process.env.GEMINI_API_KEY?.trim();
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    console.log('Testing gemini-2.0-flash...');
    try {
        const result = await model.generateContent('OK?');
        console.log('Response:', result.response.text());
    } catch (err) {
        console.error('Error:', err);
    }
}

testV2();
