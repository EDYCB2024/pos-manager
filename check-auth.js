import { supabase } from './api/_lib/supabase.js';

async function checkUsers() {
    console.log('--- Diagnóstico de Usuarios ---');
    try {
        const { data, count, error } = await supabase
            .from('users')
            .select('*', { count: 'exact' });

        if (error) {
            console.error('Error al consultar tabla users:', error.message);
            if (error.code === '42P01') {
                console.log('SUGERENCIA: La tabla "users" NO existe. Ejecuta el script SQL en Supabase.');
            }
            return;
        }

        console.log(`Total de usuarios encontrados: ${count}`);
        if (data && data.length > 0) {
            data.forEach(u => {
                console.log(`- Usuario: ${u.email} | Rol: ${u.role} | Activo: ${u.active}`);
            });
        } else {
            console.log('RECOMENDACIÓN: La tabla "users" está vacía. Inserta el usuario admin inicial.');
        }
    } catch (err) {
        console.error('Error inesperado:', err);
    }
}

checkUsers();
