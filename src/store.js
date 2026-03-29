import { supabase } from './lib/supabase';
import { utils, writeFile } from 'xlsx';
import { 
    ESTATUSES_CASO, ESTATUSES_REPARACION, CATEGORIAS, MODELOS, 
    PROCESADORAS, TECNICOS, OPERADORAS, OPCIONES_SI_NO, ALLY_TO_TABLE 
} from './constants';
import { generateMockDevices, generateMockAtc, mockStats } from './lib/mockData';

// Re-export for compatibility
export { 
    ESTATUSES_CASO, ESTATUSES_REPARACION, CATEGORIAS, MODELOS, 
    PROCESADORAS, TECNICOS, OPERADORAS, OPCIONES_SI_NO, ALLY_TO_TABLE 
};

// --- MOCK DATABASE FOR DEMO MODE ---
let _mockDevices = generateMockDevices(120);
let _mockAtc = generateMockAtc(80);

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

// Constants moved to constants.js

export function getReportUrl(code) {
    if (!code) return null;
    const url = import.meta.env.VITE_SUPABASE_URL;
    return `${url}/storage/v1/object/public/reports/${code}.pdf`;
}

// ─── CRUD usando Supabase ─────────────────────────────────────────

export async function getAllDevices() {
    return _mockDevices;
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
    let filtered = [..._mockDevices];

    if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(d => 
            d.serial.toLowerCase().includes(s) || 
            d.razon_social.toLowerCase().includes(s) || 
            d.rif.toLowerCase().includes(s)
        );
    }

    if (filterCaso) filtered = filtered.filter(d => d.estatus_caso === filterCaso);
    if (filterRep) filtered = filtered.filter(d => d.estatus === filterRep);
    if (filterAliado) filtered = filtered.filter(d => d.aliado === filterAliado);

    const count = filtered.length;
    const start = (page - 1) * pageSize;
    const data = filtered.slice(start, start + pageSize);

    return { data, count };
}

export async function getDeviceById(id) {
    return _mockDevices.find(d => d.internal_id === Number(id) || d.id === Number(id)) || null;
}

export async function getDeviceBySerial(serial) {
    return _mockDevices.filter(d => d.serial.toLowerCase() === serial.toLowerCase());
}


export async function addDevice(device) {
    const newDevice = { ...device, id: Date.now(), internal_id: Date.now(), created_at: new Date().toISOString() };
    _mockDevices = [newDevice, ..._mockDevices];
    return newDevice;
}

export async function addDevicesBulk(devices) {
    const newItems = devices.map(d => ({
        ...d,
        id: Date.now() + Math.random(),
        internal_id: Date.now() + Math.random(),
        created_at: new Date().toISOString()
    }));
    _mockDevices = [...newItems, ..._mockDevices];
    return newItems;
}

export async function updateDevice(id, updates) {
    const index = _mockDevices.findIndex(d => d.internal_id === Number(id));
    if (index === -1) throw new Error("Equipo no encontrado");
    _mockDevices[index] = { ..._mockDevices[index], ...updates };
    return _mockDevices[index];
}

export async function deleteDevice(id) {
    _mockDevices = _mockDevices.filter(d => d.internal_id !== Number(id));
}

export async function getStats() {
    // Dynamic stats from mock data
    const byCaso = {
        'CASO ABIERTO': _mockDevices.filter(d => d.estatus_caso === 'CASO ABIERTO').length,
        'CASO CERRADO': _mockDevices.filter(d => d.estatus_caso === 'CASO CERRADO').length
    };
    const byReparacion = {};
    ESTATUSES_REPARACION.forEach(s => {
        byReparacion[s] = _mockDevices.filter(d => d.estatus === s).length;
    });
    return { total: _mockDevices.length, byCaso, byReparacion };
}

export async function getUniqueAliados() {
    return [...new Set(_mockDevices.map(d => d.aliado))].sort();
}

export async function getAtcCases() {
    return _mockAtc;
}

export async function getAtcCasesPaged({ page = 1, pageSize = 10, search = '', startDate = '', endDate = '' }) {
    let filtered = [..._mockAtc];

    if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(a => 
            a.serial.toLowerCase().includes(s) || 
            a.nombre_comercio.toLowerCase().includes(s) || 
            a.rif.toLowerCase().includes(s)
        );
    }

    if (startDate) filtered = filtered.filter(a => a.fecha >= startDate);
    if (endDate) filtered = filtered.filter(a => a.fecha <= endDate);

    const count = filtered.length;
    const start = (page - 1) * pageSize;
    const data = filtered.slice(start, start + pageSize);

    return { data, count };
}

export async function deleteAtcCase(id) {
    _mockAtc = _mockAtc.filter(a => a.internal_id !== Number(id));
}

