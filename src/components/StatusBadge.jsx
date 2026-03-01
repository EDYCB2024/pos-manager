import './StatusBadge.css';

const CASO_CONFIG = {
    'CASO ABIERTO': { color: 'ingresado', dot: true },
    'CASO CERRADO': { color: 'listo', dot: false },
};

const REP_CONFIG = {
    'Pendiente': { color: 'ingresado', dot: true },
    'En diagnóstico': { color: 'revision', dot: true },
    'En reparación': { color: 'revision', dot: true },
    'Reparado': { color: 'listo', dot: false },
    'Sin reparación': { color: 'sin-reparacion', dot: false },
    'Entregado': { color: 'entregado', dot: false },
};

export default function StatusBadge({ status, type = 'caso' }) {
    const map = type === 'reparacion' ? REP_CONFIG : CASO_CONFIG;
    const cfg = map[status] || { color: 'ingresado', dot: false };
    return (
        <span className={`status-badge status-badge--${cfg.color}`}>
            {cfg.dot && <span className="status-badge__dot" />}
            {status || '—'}
        </span>
    );
}
