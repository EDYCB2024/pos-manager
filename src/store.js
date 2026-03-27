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

        let query = supabase.from('casos_pos').select('*').order('fecha', { ascending: false }).order('created_at', { ascending: false });

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

// Mapa de Aliados a sus Tablas específicas
export const ALLY_TO_TABLE = {
    'VAT&C': 'vatc',
    'CREDICARD': 'ccr',
    'PLATCO': 'platco',
    'PLATCO POS': 'platco',
    'BANCARIBE': 'bancaribe',
    'BANPLUS': 'banplus',
    'POSCOMERCIAL': 'poscom',
    'BANCO EXTERIOR': 'exterior',
    'TOKEN PAGOS': 'tokenp',
    'INSTAPAGO': 'instapago',
    'PAYTECH': 'paytech',
    'BANCO ACTIVO': 'bactivo',
    'BANCRECER': 'bancrecer',
    'DEL SUR': 'delsur',
    'BEST PAY': 'bestpay',
    'OTROS': 'otros'
};

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
            .order('fecha', { ascending: false })
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
 * Mapea un objeto de dispositivo a las columnas específicas de la tabla correspondiente.
 */
function mapDeviceToTable(device, tableName = 'vatc') {
    const isSpecialRep = ['vatc', 'banplus', 'ccr', 'platco', 'poscom', 'bancaribe'].includes(tableName);
    const data = {
        fecha: device.fecha || new Date().toISOString().slice(0, 10),
        aliado: device.aliado,
        modelo: device.modelo,
        razn_social: device.razon_social,
        serial: device.serial,
        informes: device.informes,
        rif: device.rif,
        ingreso: device.ingreso,
        serial_de_remplazo: device.serial_reemplazo,
        falla_notificada: device.falla_notificada,
        categora: device.categoria,
        fecha_final: device.fecha_final,
        estatus_del_caso: device.estatus_caso,
        estatus: device.estatus,
        nivel: device.nivel,
        garantia: device.garantia,
        informe: device.informe,
        cotizacin: device.cotizacion,
        procesadora: device.procesadora || null,
        tecnico: device.tecnico || null,
        acepta_plan: device.acepta_plan || null,
        nro_guia: device.nro_guia || null,
        factura: device.nro_factura || null,
        lote: device.lote || null,
        fecha_venta: device.fecha_venta || null,
        observaciones: device.observaciones || null,
    };

    if (isSpecialRep) {
        if (tableName === 'banplus') {
            data.repuesto__servicio = device.repuesto_1;
        } else {
            data.repuesto__servicio_1 = device.repuesto_1;
        }
        data.repuesto__servicio_2 = device.repuesto_2 || null;
        data.repuesto__servicio_3 = device.repuesto_3 || null;
    } else {
        data.repuesto_1 = device.repuesto_1 || null;
        data.repuesto_2 = device.repuesto_2 || null;
        data.repuesto_3 = device.repuesto_3 || null;
    }
    return data;
}

/**
 * Mapea una fila de cualquier tabla al formato estándar de la aplicación.
 */
function mapTableToDevice(row) {
    if (!row) return null;
    return {
        ...row,
        id: row.internal_id || row.id,
        razon_social: row.razn_social || row.razon_social,
        categoria: row.categora || row.categoria,
        estatus_caso: row.estatus_del_caso || row.estatus_caso,
        serial_reemplazo: row.serial_de_remplazo || row.serial_reemplazo,
        cotizacion: row.cotizacin || row.cotizacion,
        nro_factura: row.factura || row.nro_factura,
        nro_caso: row.n || row.nro_caso || row.nro,
        repuesto_1: row.repuesto_1 || row.repuesto__servicio_1 || row.repuesto__servicio,
        repuesto_2: row.repuesto_2 || row.repuesto__servicio_2,
        repuesto_3: row.repuesto_3 || row.repuesto__servicio_3,
    };
}

// ─── CRUD usando Supabase ─────────────────────────────────────────

/**
 * Obtiene dispositivos con paginación, búsqueda y filtros en el servidor.
 */
export async function getDevicesPaged({ page = 1, pageSize = 50, search = '', filterCaso = '', filterRep = '', filterAliado = '' }) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const tableName = ALLY_TO_TABLE[filterAliado] || 'casos_pos';
    const isDirectTable = tableName !== 'casos_pos';

    let query = supabase
        .from(tableName)
        .select('*', { count: 'exact' });

    // Filtros en servidor
    if (isDirectTable) {
        if (filterCaso) query = query.eq('estatus_del_caso', filterCaso);
        if (filterRep) query = query.eq('estatus', filterRep);
        if (filterAliado) query = query.eq('aliado', filterAliado);
    } else {
        if (filterCaso) query = query.eq('estatus_caso', filterCaso);
        if (filterRep) query = query.eq('estatus', filterRep);
        if (filterAliado) query = query.eq('aliado', filterAliado);
    }

    // Búsqueda en servidor (OR entre múltiples campos)
    if (search) {
        if (isDirectTable) {
            query = query.or(`serial.ilike.%${search}%,razn_social.ilike.%${search}%,rif.ilike.%${search}%,modelo.ilike.%${search}%`);
        } else {
            query = query.or(`serial.ilike.%${search}%,razon_social.ilike.%${search}%,rif.ilike.%${search}%,aliado.ilike.%${search}%,modelo.ilike.%${search}%`);
        }
    }

    const { data, count, error } = await query
        .order('fecha', { ascending: false })
        .range(from, to);

    if (error) throw new Error(error.message);

    if (isDirectTable) {
        return { data: data.map(mapTableToDevice), count };
    }
    return { data, count };
}

export async function getDeviceById(id) {
    if (!id) return null;

    // Primero intentamos buscar en la vista general para saber el aliado
    const { data: generalData, error: generalError } = await supabase
        .from('casos_pos')
        .select('*')
        .eq('internal_id', id)
        .single();

    if (generalError || !generalData) return null;

    const tableName = ALLY_TO_TABLE[generalData.aliado];
    if (!tableName) return generalData;

    // Si tiene tabla directa, buscamos allí para tener todos los campos específicos
    const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('internal_id', id)
        .single();

    if (error) return mapTableToDevice(generalData);
    return mapTableToDevice(data);
}

export async function getDeviceBySerial(serial) {
    // Primero en la vista general
    const { data, error } = await supabase
        .from('casos_pos')
        .select('*')
        .ilike('serial', serial)
        .order('fecha', { ascending: false });

    if (error || data.length === 0) {
        // Buscar específicamente en vatc
        const { data: vatcData } = await supabase
            .from('vatc')
            .select('*')
            .ilike('serial', serial)
            .order('fecha', { ascending: false });
        if (vatcData) return vatcData.map(mapFromVatc);
    }
    return data || [];
}


export async function addDevice(device) {
    const tableName = ALLY_TO_TABLE[device.aliado] || 'vatc';
    const payload = mapDeviceToTable(device, tableName);
    const { data, error } = await supabase.from(tableName).insert([payload]).select().single();
    if (error) throw new Error(error.message);
    return mapTableToDevice(data);
}

export async function addDevicesBulk(devices) {
    const groups = {};
    devices.forEach(d => {
        const tableName = ALLY_TO_TABLE[d.aliado] || 'vatc';
        if (!groups[tableName]) groups[tableName] = [];
        groups[tableName].push(mapDeviceToTable(d, tableName));
    });

    let results = [];
    for (const tableName in groups) {
        const { data, error } = await supabase.from(tableName).insert(groups[tableName]).select();
        if (error) throw new Error(error.message);
        results = [...results, ...data.map(mapTableToDevice)];
    }
    return results;
}

export async function updateDevice(id, updates) {
    const device = await getDeviceById(id);
    if (!device) throw new Error("Equipo no encontrado");

    const tableName = ALLY_TO_TABLE[updates.aliado] || ALLY_TO_TABLE[device.aliado] || 'vatc';
    const payload = mapDeviceToTable({ ...device, ...updates }, tableName);

    const { data, error } = await supabase
        .from(tableName)
        .update(payload)
        .eq('internal_id', id)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return mapTableToDevice(data);
}

export async function deleteDevice(id) {
    const device = await getDeviceById(id);
    if (!device) return;

    const tableName = ALLY_TO_TABLE[device.aliado];
    if (!tableName) return;

    const { error } = await supabase.from(tableName).delete().eq('internal_id', id);
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

export async function getAtcCases() {
    const { data, error } = await supabase
        .from('data')
        .select('*')
        .order('fecha', { ascending: false });
    if (error) throw new Error(error.message);
    return data;
}

export async function getAtcCasesPaged({ page = 1, pageSize = 10, search = '', startDate = '', endDate = '' }) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
        .from('data')
        .select('*', { count: 'exact' });

    if (search) {
        query = query.or(`serial.ilike.%${search}%,nombre_comercio.ilike.%${search}%,rif.ilike.%${search}%`);
    }

    if (startDate) {
        // Supabase dates handle ISO strings well
        query = query.gte('fecha', startDate);
    }
    if (endDate) {
        query = query.lte('fecha', endDate);
    }

    const { data, error, count } = await query
        .order('fecha', { ascending: false })
        .range(from, to);

    if (error) throw new Error(error.message);
    return { data, count };
}

export async function deleteAtcCase(id) {
    const { error } = await supabase.from('data').delete().eq('internal_id', id);
    if (error) throw new Error(error.message);
}

