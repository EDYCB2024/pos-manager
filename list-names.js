import { config } from 'dotenv';
config();

async function listModelNames() {
    const key = process.env.GEMINI_API_KEY?.trim();
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.models) {
            console.log('Model Names:');
            data.models.forEach(m => console.log(m.name));
        } else {
            console.log('No models found in response:', data);
        }
    } catch (err) {
        console.error('Error:', err);
    }
}

listModelNames();
