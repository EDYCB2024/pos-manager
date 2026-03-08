import { config } from 'dotenv';
import handler from './api/ai/chat.js';

config();

const req = {
    method: 'POST',
    body: {
        message: 'Hola',
        history: []
    }
};

const res = {
    status: (code) => {
        console.log('Status:', code);
        return res;
    },
    json: (data) => {
        console.log('Response:', JSON.stringify(data, null, 2));
        return res;
    }
};

console.log('Testing AI Handler...');
console.log('API Key present:', !!process.env.GEMINI_API_KEY);

handler(req, res).catch(err => {
    console.error('Fatal Error during execution:');
    console.error(err);
});
