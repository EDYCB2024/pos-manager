import { config } from 'dotenv';
config();

async function exhaustiveTest() {
    const key = process.env.GEMINI_API_KEY?.trim();
    const models = ['gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-pro', 'gemini-1.5-pro'];
    const versions = ['v1', 'v1beta'];

    for (const v of versions) {
        for (const m of models) {
            const url = `https://generativelanguage.googleapis.com/${v}/models/${m}:generateContent?key=${key}`;
            console.log(`Testing ${v} with ${m}...`);
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: 'OK' }] }] })
                });
                console.log(`Status: ${response.status}`);
                if (response.status === 200) {
                    console.log(`>>> SUCCESS with ${v} / ${m}`);
                    return;
                }
            } catch (err) {
                console.log(`Error: ${err.message}`);
            }
        }
    }
}

exhaustiveTest();
