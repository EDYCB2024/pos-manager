import { supabase } from './lib/supabase';
import { utils, writeFile } from 'xlsx';

/**
 * Exporta todos los dispositivos a un archivo Excel.
 */
/**
 * Exporta dispositivos a un archivo Excel con filtros opcionales.
 */
export async function exportDevicesExcel(filters = {}) {
    try {
        const { year, aliado, modelo } = filters;

        let query = supabase.from('casos_pos').select('*').order('created_at', { ascending: false });

        if (year) {
            query = query.gte('fecha', `${year}-01-01`).lte('fecha', `${year}-12-31`);
        }
        if (aliado && aliado !== 'Todos') {
            query = query.eq('aliado', aliado);
        }
        if (modelo && modelo !== 'Todos') {
            query = query.eq('modelo', modelo);
        }

        const { data, error } = await query;
        if (error) throw new Error(error.message);

        // Formatear datos para Excel
        const formattedData = data.map(item => ({
            'ID': item.id,
            'Fecha': item.fecha,
            'Fecha Venta': item.fecha_venta || '',
            'Lote': item.lote || '',
            'N° Factura': item.nro_factura || '',
            'Aliado': item.aliado || '',
            'Modelo': item.modelo || '',
            'Razón Social': item.razon_social,
            'Serial': item.serial,
            'RIF': item.rif || '',
            'Ingreso': item.ingreso || '',
            'Serial Reemplazo': item.serial_reemplazo || '',
            'Falla Notificada': item.falla_notificada || '',
            'Categoría': item.categoria || '',
            'Estatus Caso': item.estatus_caso,
            'Estatus Reparación': item.estatus,
            'Nivel': item.nivel || '',
            'Garantía': item.garantia || '',
            'Acepta Plan': item.acepta_plan || '',
            'Técnico': item.tecnico || '',
            'Procesadora': item.procesadora || '',
            'Cotización': item.cotizacion || '',
            'Nro de guia': item.nro_guia || '',
            'Fecha Final': item.fecha_final || '',
            'Observaciones': item.observaciones || ''
        }));

        const ws = utils.json_to_sheet(formattedData);
        const wb = utils.book_new();
        utils.book_append_sheet(wb, ws, "Casos POS");

        let filterSuffix = "";
        if (year) filterSuffix += `_${year}`;
        if (aliado && aliado !== 'Todos') filterSuffix += `_${aliado}`;

        const fileName = `Reporte_POS${filterSuffix}_${new Date().toISOString().slice(0, 10)}.xlsx`;

        writeFile(wb, fileName);
    } catch (error) {
        console.error("Error al exportar Excel:", error);
        throw error;
    }
}

// ─── Opciones de campos de selección ────────────────────────────
export const ESTATUSES_CASO = [
    'CASO ABIERTO',
    'CASO CERRADO',
];

export const ESTATUSES_REPARACION = [
    'Pendiente por pago',
    'En diagnóstico',
    'En reparación',
    'Irreparable',
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
];

export const TECNICOS = [
    'Eduardo Castillo',
    'Andelis Nuñez',
    'Jenfil Gonzalez',
    'Eduardo Mendieta',
];

export const OPERADORAS = ['Digitel', 'Movistar'];

export const OPCIONES_SI_NO = ['Sí', 'No'];

export function getReportUrl(code) {
    if (!code) return null;
    const url = import.meta.env.VITE_SUPABASE_URL;
    return `${url}/storage/v1/object/public/reports/${code}.pdf`;
}

// ─── CRUD usando Supabase ─────────────────────────────────────────

export async function getAllDevices() {
    let allData = [];
    let from = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
        const { data, error } = await supabase
            .from('casos_pos')
            .select('*')
            .order('created_at', { ascending: false })
            .range(from, from + pageSize - 1);

        if (error) throw new Error(error.message);

        allData = [...allData, ...data];

        if (data.length < pageSize) {
            hasMore = false;
        } else {
            from += pageSize;
        }
    }

    return allData;
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
        acepta_plan: device.acepta_plan,
        nro_guia: device.nro_guia,
        nro_factura: device.nro_factura,
        lote: device.lote,
        fecha_venta: device.fecha_venta,
        observaciones: device.observaciones,
    };
    const { data, error } = await supabase.from('casos_pos').insert([payload]).select().single();
    if (error) throw new Error(error.message);
    return data;
}

export async function addDevicesBulk(devices) {
    const payloads = devices.map(device => ({
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
        acepta_plan: device.acepta_plan,
        nro_guia: device.nro_guia,
        nro_factura: device.nro_factura,
        lote: device.lote,
        fecha_venta: device.fecha_venta,
        observaciones: device.observaciones,
    }));

    const { data, error } = await supabase.from('casos_pos').insert(payloads).select();
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
        acepta_plan: updates.acepta_plan,
        nro_guia: updates.nro_guia,
        nro_factura: updates.nro_factura,
        lote: updates.lote,
        fecha_venta: updates.fecha_venta,
        observaciones: updates.observaciones,
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
