
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function processTask() {
    console.log('--- Buscando usuario "eD" ---');
    const { data: users, error: findError } = await supabase
        .from('users')
        .select('*')
        .ilike('name', 'eD');

    if (findError) {
        console.error('Error al buscar:', findError.message);
        return;
    }

    if (users.length === 0) {
        console.log('No se encontró ningún usuario con el nombre "eD".');
    } else {
        for (const user of users) {
            console.log(`Eliminando a ${user.name} (${user.email})...`);
            await supabase.from('activation_tokens').delete().eq('user_id', user.id);
            const { error: delError } = await supabase.from('users').delete().eq('id', user.id);
            if (delError) console.error(`Error al eliminar ${user.name}:`, delError.message);
            else console.log(`Usuario ${user.name} eliminado.`);
        }
    }

    console.log('\n--- Probando invitación (envío de correo) ---');
    const testEmail = 'edcastilloblanco@gmail.com';
    const testName = 'Test User';

    // Importamos la lógica directamente
    const { inviteUser } = await import('./api/_lib/userService.js');

    try {
        console.log(`Intentando invitar a ${testEmail}...`);
        const result = await inviteUser({ name: testName, email: testEmail, role: 'tecnico' });
        console.log('¡Éxito! Usuario invitado y correo enviado sin errores.');
        console.log('ID del nuevo usuario:', result.id);
    } catch (err) {
        console.error('Error en la prueba de invitación:', err.message);
    }
}

processTask();
