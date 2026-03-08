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
        console.log('Status set to:', code);
        return res;
    },
    json: (data) => {
        console.log('JSON returned:', JSON.stringify(data, null, 2));
        return res;
    }
};

console.log('Testing handler for 500 error...');
handler(req, res).catch(err => {
    console.error('FATAL ERROR:', err);
});
