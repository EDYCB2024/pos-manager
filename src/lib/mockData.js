// Mock Data for POS Manager Demo
import { ESTATUSES_CASO, ESTATUSES_REPARACION, MODELOS, TECNICOS } from '../constants';

const ALIADOS = [
    'VAT&C', 'CREDICARD', 'PLATCO', 'BANCARIBE', 'BANPLUS', 
    'POSCOMERCIAL', 'BANCO EXTERIOR', 'TOKEN PAGOS', 'INSTAPAGO'
];

const FALLAS = [
    'No enciende', 'Error de lectura', 'Pantalla rota', 
    'Problema de carga', 'Teclado no responde', 'Error de software'
];

export const generateMockDevices = (count = 100) => {
    return Array.from({ length: count }, (_, i) => ({
        id: i + 1,
        internal_id: i + 1,
        fecha: new Date(Date.now() - Math.random() * 10000000000).toISOString().split('T')[0],
        aliado: ALIADOS[Math.floor(Math.random() * ALIADOS.length)],
        modelo: MODELOS[Math.floor(Math.random() * MODELOS.length)],
        razon_social: `Comercio Demo ${i + 1}`,
        serial: `SN-${100000 + i}`,
        rif: `J-${30000000 + i}-1`,
        ingreso: 'Taller',
        falla_notificada: FALLAS[Math.floor(Math.random() * FALLAS.length)],
        categoria: 'Hardware',
        estatus_caso: i % 5 === 0 ? ESTATUSES_CASO[1] : ESTATUSES_CASO[0], // Mix of open/closed
        estatus: ESTATUSES_REPARACION[Math.floor(Math.random() * ESTATUSES_REPARACION.length)],
        tecnico: TECNICOS[Math.floor(Math.random() * TECNICOS.length)],
        nro_guia: i % 3 === 0 ? `ZM-${71090000 + i}` : null,
        observaciones: 'Simulación de datos para demostración.',
        created_at: new Date().toISOString()
    }));
};

export const generateMockAtc = (count = 50) => {
    return Array.from({ length: count }, (_, i) => ({
        id: i + 1,
        internal_id: i + 1,
        fecha: new Date(Date.now() - Math.random() * 5000000000).toISOString().split('T')[0],
        nombre_comercio: `Tienda Aliada ${i + 1}`,
        rif: `V-${20000000 + i}-0`,
        serial: `POS-${900000 + i}`,
        falla: FALLAS[Math.floor(Math.random() * FALLAS.length)],
        estatus: i % 4 === 0 ? 'Resuelto' : 'Pendiente',
        created_at: new Date().toISOString()
    }));
};

export const mockStats = {
    total: 156,
    byCaso: {
        'CASO ABIERTO': 84,
        'CASO CERRADO': 72
    },
    byReparacion: {
        'Pendiente por pago': 24,
        'En diagnóstico': 32,
        'En reparación': 45,
        'Irreparable': 12,
        'Entregado': 43
    }
};
