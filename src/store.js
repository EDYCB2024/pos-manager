import { supabase } from './lib/supabase';

// ─── Opciones de campos de selección ────────────────────────────
export const ESTATUSES_CASO = [
    'Abierto',
    'En proceso',
    'Cerrado',
    'Cancelado',
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
    'Verifone VX520',
    'Verifone VX670',
    'Verifone VX680',
    'Ingenico iWL220',
    'Ingenico iCT220',
    'Ingenico Move5000',
    'PAX S300',
    'PAX A920',
    'Newland N910',
    'Otro',
];

// ─── CRUD usando Supabase ─────────────────────────────────────────

export async function getAllDevices() {
    const { data, error } = await supabase
        .from('casos_pos')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data;
}

export async function getDeviceBySerial(serial) {
    const { data, error } = await supabase
        .from('casos_pos')
        .select('*')
        .ilike('serial', serial)
        .single();
    if (error) return null;
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
        serial_reemplazo: device.serial_reemplazo,
        falla_notificada: device.falla_notificada,
        categoria: device.categoria,
        estatus_caso: device.estatus_caso,
        estatus_reparacion: device.estatus_reparacion,
        garantia: device.garantia === true || device.garantia === 'Sí',
        cotizacion: parseFloat(device.cotizacion) || 0,
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
        serial_reemplazo: updates.serial_reemplazo,
        falla_notificada: updates.falla_notificada,
        categoria: updates.categoria,
        estatus_caso: updates.estatus_caso,
        estatus_reparacion: updates.estatus_reparacion,
        garantia: updates.garantia === true || updates.garantia === 'Sí',
        cotizacion: parseFloat(updates.cotizacion) || 0,
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
    const { data, error } = await supabase.from('casos_pos').select('estatus_caso, estatus_reparacion');
    if (error) throw new Error(error.message);

    const total = data.length;
    const byCaso = {};
    const byReparacion = {};

    ESTATUSES_CASO.forEach(s => { byCaso[s] = 0; });
    ESTATUSES_REPARACION.forEach(s => { byReparacion[s] = 0; });

    data.forEach(d => {
        if (byCaso[d.estatus_caso] !== undefined) byCaso[d.estatus_caso]++;
        if (byReparacion[d.estatus_reparacion] !== undefined) byReparacion[d.estatus_reparacion]++;
    });

    return { total, byCaso, byReparacion };
}
