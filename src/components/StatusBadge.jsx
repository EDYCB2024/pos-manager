import './StatusBadge.css';

const CASO_CONFIG = {
    'CASO ABIERTO': { color: 'ingresado', dot: true },
    'CASO CERRADO': { color: 'listo', dot: false },
    'ABIERTO': { color: 'ingresado', dot: true },
    'CERRADO': { color: 'listo', dot: false },
    'PENDIENTE POR PAGO': { color: 'sin-reparacion', dot: true },
};

const REP_CONFIG = {
    'PENDIENTE': { color: 'ingresado', dot: true },
    'PENDIENTE POR PAGO': { color: 'sin-reparacion', dot: true },
    'EN DIAGNÓSTICO': { color: 'revision', dot: true },
    'EN REPARACIÓN': { color: 'revision', dot: true },
    'REPARADO': { color: 'listo', dot: false },
    'SIN REPARACIÓN': { color: 'sin-reparacion', dot: false },
    'ENTREGADO': { color: 'listo', dot: false },
};

export default function StatusBadge({ status, type = 'caso' }) {
    const map = type === 'reparacion' ? REP_CONFIG : CASO_CONFIG;
    const normalizedStatus = status ? status.trim().toUpperCase() : '';
    const cfg = map[normalizedStatus] || { color: 'ingresado', dot: false };

    return (
        <span className={`status-badge status-badge--${cfg.color}`}>
            {cfg.dot && <span className="status-badge__dot" />}
            {status || '—'}
        </span>
    );
}
