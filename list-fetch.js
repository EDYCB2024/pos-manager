import { config } from 'dotenv';
config();

async function listFetch() {
    const key = process.env.GEMINI_API_KEY?.trim();
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.models) {
            for (const m of data.models) {
                console.log(`${m.name} - ${m.supportedGenerationMethods.join(', ')}`);
            }
        } else {
            console.log('No models found or error:', data);
        }
    } catch (err) {
        console.error('Fetch Error:', err);
    }
}

listFetch();
