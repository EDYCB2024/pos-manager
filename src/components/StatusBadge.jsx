import './StatusBadge.css';

const CONFIG = {
    'Ingresado': { color: 'ingresado', dot: true },
    'En revisión': { color: 'revision', dot: true },
    'Listo': { color: 'listo', dot: true },
    'Entregado': { color: 'entregado', dot: false },
    'Sin reparación': { color: 'sin-reparacion', dot: false },
};

export default function StatusBadge({ status }) {
    const cfg = CONFIG[status] || { color: 'ingresado', dot: false };
    return (
        <span className={`status-badge status-badge--${cfg.color}`}>
            {cfg.dot && <span className="status-badge__dot" />}
            {status}
        </span>
    );
}
