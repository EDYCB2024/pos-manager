import { supabase } from './lib/supabase';

// ─── Opciones de campos de selección ────────────────────────────
export const ESTATUSES_CASO = [
    'CASO ABIERTO',
    'CASO CERRADO',
];

export const ESTATUSES_REPARACION = [
    'Pendiente',
    'En diagnóstico',
    'En reparación',
    'Reparado',
    'Sin reparación',
    'Entregado',
];

export const CATEGORIAS = [
    'Hardware',
    'Software',
    'Conectividad',
    'Pantalla',
    'Teclado / Pinpad',
    'Batería',
    'Lector de tarjetas',
    'Impresora',
    'Otro',
];

export const MODELOS = [
    'N950S',
    'N970',
    'N910A7',
    'N910A10',
    'ME60',
    'ME51',
    'SP600',
    'Otro',
];

export const PROCESADORAS = [
    'Platco',
    'Credicard',
    'Banesco',
    'Pueblo',
    'Otro',
];

export const TECNICOS = [
    'Técnico 1',
    'Técnico 2',
    'Técnico 3',
    'Otro',
];

export function getReportUrl(code) {
    if (!code) return null;
    const url = import.meta.env.VITE_SUPABASE_URL;
    return `${url}/storage/v1/object/public/reports/${code}.pdf`;
}

// ─── CRUD usando Supabase ─────────────────────────────────────────

export async function getAllDevices() {
    const { data, error } = await supabase
        .from('casos_pos')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000); // Límite de seguridad para listas recientes
    if (error) throw new Error(error.message);
    return data;
}

/**
 * Obtiene dispositivos con paginación, búsqueda y filtros en el servidor.
 */
export async function getDevicesPaged({ page = 1, pageSize = 50, search = '', filterCaso = '', filterRep = '', filterAliado = '' }) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
        .from('casos_pos')
        .select('*', { count: 'exact' });

    // Filtros en servidor
    if (filterCaso) query = query.eq('estatus_caso', filterCaso);
    if (filterRep) query = query.eq('estatus', filterRep);
    if (filterAliado) query = query.eq('aliado', filterAliado);

    // Búsqueda en servidor (OR entre múltiples campos)
    if (search) {
        query = query.or(`serial.ilike.%${search}%,razon_social.ilike.%${search}%,rif.ilike.%${search}%,aliado.ilike.%${search}%,modelo.ilike.%${search}%`);
    }

    const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) throw new Error(error.message);
    return { data, count };
}

export async function getDeviceById(id) {
    const { data, error } = await supabase
        .from('casos_pos')
        .select('*')
        .eq('id', id)
        .single();
    if (error) return null;
    return data;
}

export async function getDeviceBySerial(serial) {
    const { data, error } = await supabase
        .from('casos_pos')
        .select('*')
        .ilike('serial', serial)
        .order('fecha', { ascending: false });
    if (error) return [];
    return data;
}

export async function addDevice(device) {
    const payload = {
        fecha: device.fecha || new Date().toISOString().slice(0, 10),
        aliado: device.aliado,
        modelo: device.modelo,
        razon_social: device.razon_social,
        serial: device.serial,
        informes: device.informes,
        rif: device.rif,
        ingreso: device.ingreso,
        serial_reemplazo: device.serial_reemplazo,
        falla_notificada: device.falla_notificada,
        categoria: device.categoria,
        fecha_final: device.fecha_final,
        estatus_caso: device.estatus_caso,
        estatus: device.estatus,
        nivel: device.nivel,
        garantia: device.garantia,
        informe: device.informe,
        cotizacion: device.cotizacion,
        repuesto_1: device.repuesto_1,
        repuesto_2: device.repuesto_2,
        repuesto_3: device.repuesto_3,
        procesadora: device.procesadora,
        tecnico: device.tecnico,
    };
    const { data, error } = await supabase.from('casos_pos').insert([payload]).select().single();
    if (error) throw new Error(error.message);
    return data;
}

export async function updateDevice(id, updates) {
    const payload = {
        fecha: updates.fecha,
        aliado: updates.aliado,
        modelo: updates.modelo,
        razon_social: updates.razon_social,
        serial: updates.serial,
        informes: updates.informes,
        rif: updates.rif,
        ingreso: updates.ingreso,
        serial_reemplazo: updates.serial_reemplazo,
        falla_notificada: updates.falla_notificada,
        categoria: updates.categoria,
        fecha_final: updates.fecha_final,
        estatus_caso: updates.estatus_caso,
        estatus: updates.estatus,
        nivel: updates.nivel,
        garantia: updates.garantia,
        informe: updates.informe,
        cotizacion: updates.cotizacion,
        repuesto_1: updates.repuesto_1,
        repuesto_2: updates.repuesto_2,
        repuesto_3: updates.repuesto_3,
        procesadora: updates.procesadora,
        tecnico: updates.tecnico,
    };
    const { data, error } = await supabase.from('casos_pos').update(payload).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return data;
}

export async function deleteDevice(id) {
    const { error } = await supabase.from('casos_pos').delete().eq('id', id);
    if (error) throw new Error(error.message);
}

export async function getStats() {
    const byCaso = {};
    const byReparacion = {};

    // Consultamos los conteos por estatus de forma eficiente
    await Promise.all([
        ...ESTATUSES_CASO.map(async s => {
            const { count } = await supabase.from('casos_pos').select('*', { count: 'exact', head: true }).eq('estatus_caso', s);
            byCaso[s] = count || 0;
        }),
        ...ESTATUSES_REPARACION.map(async s => {
            const { count } = await supabase.from('casos_pos').select('*', { count: 'exact', head: true }).eq('estatus', s);
            byReparacion[s] = count || 0;
        })
    ]);

    // El total real es la suma de los estatus de caso actuales
    const total = Object.values(byCaso).reduce((a, b) => a + b, 0);

    return { total, byCaso, byReparacion };
}

export async function getUniqueAliados() {
    const { data, error } = await supabase
        .from('casos_pos')
        .select('aliado')
        .not('aliado', 'is', null)
        .order('aliado');
    if (error) throw new Error(error.message);
    const unique = [...new Set(data.map(d => d.aliado))];
    return unique.filter(Boolean);
}
