import { config } from 'dotenv';
config();

async function findSupportedModels() {
    const key = process.env.GEMINI_API_KEY?.trim();
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.models) {
            console.log('Supported GenerateContent Models:');
            const supported = data.models.filter(m => m.supportedGenerationMethods.includes('generateContent'));
            supported.forEach(m => console.log(m.name));
        } else {
            console.log('No models found:', data);
        }
    } catch (err) {
        console.error('Error:', err);
    }
}

findSupportedModels();
