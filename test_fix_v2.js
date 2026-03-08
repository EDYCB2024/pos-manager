
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function cleanAndTest() {
    const testEmail = 'edcastilloblanco@gmail.com';

    console.log(`\n--- Limpiando registro previo para ${testEmail} ---`);
    const { data: existing } = await supabase.from('users').select('id').eq('email', testEmail).single();
    if (existing) {
        await supabase.from('activation_tokens').delete().eq('user_id', existing.id);
        await supabase.from('users').delete().eq('id', existing.id);
        console.log('Registro previo eliminado.');
    }

    console.log('\n--- Probando invitación real ---');
    const { inviteUser } = await import('./api/_lib/userService.js');
    try {
        await inviteUser({ name: 'Test User', email: testEmail, role: 'tecnico' });
        console.log('¡ÉXITO! El correo se envió correctamente y el usuario fue creado.');
    } catch (err) {
        console.error('ERROR EN EL ENVÍO:', err.message);
    }
}

cleanAndTest();
