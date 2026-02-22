// ─── localStorage CRUD helpers ───────────────────────────────
const KEY = 'pos_devices';

export const ESTATUSES = [
    'Ingresado',
    'En revisión',
    'Listo',
    'Entregado',
    'Sin reparación',
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

function load() {
    try {
        const raw = localStorage.getItem(KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function save(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
}

export function getAllDevices() {
    return load();
}

export function getDeviceBySerial(serial) {
    return load().find(d => d.serial.toLowerCase() === serial.toLowerCase()) || null;
}

export function addDevice(device) {
    const devices = load();
    if (devices.find(d => d.serial.toLowerCase() === device.serial.toLowerCase())) {
        throw new Error('Ya existe un equipo con ese serial.');
    }
    const newDevice = { ...device, id: Date.now().toString(), createdAt: new Date().toISOString() };
    save([...devices, newDevice]);
    return newDevice;
}

export function updateDevice(serial, updates) {
    const devices = load();
    const idx = devices.findIndex(d => d.serial.toLowerCase() === serial.toLowerCase());
    if (idx === -1) throw new Error('Equipo no encontrado.');
    devices[idx] = { ...devices[idx], ...updates, updatedAt: new Date().toISOString() };
    save(devices);
    return devices[idx];
}

export function deleteDevice(serial) {
    const devices = load().filter(d => d.serial.toLowerCase() !== serial.toLowerCase());
    save(devices);
}

export function getStats() {
    const devices = load();
    const total = devices.length;
    const byStatus = {};
    ESTATUSES.forEach(s => { byStatus[s] = 0; });
    devices.forEach(d => { if (byStatus[d.estatus] !== undefined) byStatus[d.estatus]++; });
    return { total, byStatus };
}

// ─── Seed demo data ──────────────────────────────────────────
export function seedDemo() {
    if (load().length > 0) return;
    const demo = [
        {
            serial: 'VX520-001234',
            rif: 'J-12345678-9',
            razonSocial: 'Comercial El Éxito C.A.',
            modelo: 'Verifone VX520',
            estatus: 'Listo',
            garantia: 'Sí',
            fechaIngreso: '2026-02-10',
            fechaFinal: '2026-02-18',
            informe: 'Cambio de lector de tarjetas y actualización de firmware.',
            observaciones: 'El cliente fue notificado por WhatsApp.',
            cotizacion: 85,
        },
        {
            serial: 'ICT220-005678',
            rif: 'J-98765432-1',
            razonSocial: 'Farmacia La Salud S.R.L.',
            modelo: 'Ingenico iCT220',
            estatus: 'En revisión',
            garantia: 'No',
            fechaIngreso: '2026-02-20',
            fechaFinal: '',
            informe: '',
            observaciones: 'No enciende. Se sospecha problema de batería.',
            cotizacion: 0,
        },
        {
            serial: 'A920-009999',
            rif: 'J-55566677-0',
            razonSocial: 'Distribuidora López e Hijos',
            modelo: 'PAX A920',
            estatus: 'Ingresado',
            garantia: 'Sí',
            fechaIngreso: '2026-02-22',
            fechaFinal: '',
            informe: '',
            observaciones: 'Pantalla fisurada.',
            cotizacion: 0,
        },
    ];
    demo.forEach((d, i) => {
        save([...load(), { ...d, id: String(i + 1), createdAt: new Date().toISOString() }]);
    });
}
