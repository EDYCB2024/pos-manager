import { supabase } from './api/_lib/supabase.js';

async function resetPassword() {
    const newHash = '$2b$10$bGEBS4iFDECwj4CfkUP7HeK9.4bK3YQwDxCeMX2B.5bz5CyrRF81a';
    console.log('Actualizando contraseña para admin@posmanager.com...');

    const { error } = await supabase
        .from('users')
        .update({ password_hash: newHash })
        .eq('email', 'admin@posmanager.com');

    if (error) {
        console.error('Error actualizando hash:', error.message);
    } else {
        console.log('¡Contraseña actualizada con éxito! Prueba login con admin123 ahora.');
    }
}

resetPassword();
