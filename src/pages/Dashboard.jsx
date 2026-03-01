import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStats, getAllDevices } from '../store';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import './Dashboard.css';

const CASO_COLORS = {
    'CASO ABIERTO': 'blue',
    'CASO CERRADO': 'green',
};
const CASO_ICONS = {
    'CASO ABIERTO': '📥',
    'CASO CERRADO': '✅',
};

export default function Dashboard() {
    const [stats, setStats] = useState({ total: 0, byCaso: {}, byReparacion: {} });
    const [recent, setRecent] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        Promise.all([getStats(), getAllDevices()]).then(([s, all]) => {
            setStats(s);
            setRecent(all.slice(0, 5));
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    return (
        <div className="dashboard anim-fadeUp">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Dashboard</h1>
                    <p className="page-sub">Resumen general de casos POS</p>
                </div>
                <button className="btn btn--primary" onClick={() => navigate('/devices/new')}>
                    + Nuevo Caso
                </button>
            </div>

            {/* KPI Cards */}
            <div className="dashboard__cards grid grid--cols-3">
                <StatCard label="Total Casos" value={stats.total} color="accent" icon="◈" />
                {Object.entries(stats.byCaso).map(([status, count]) => (
                    <StatCard
                        key={status}
                        label={status}
                        value={count}
                        color={CASO_COLORS[status]}
                        icon={CASO_ICONS[status]}
                    />
                ))}
            </div>

            {/* Recent Activity */}
            <div className="dashboard__recent">
                <h2 className="section-title">Últimos Casos</h2>
                {loading ? (
                    <div className="empty-state"><span className="empty-state__icon">⏳</span><p>Cargando...</p></div>
                ) : recent.length === 0 ? (
                    <div className="empty-state">
                        <span className="empty-state__icon">📭</span>
                        <p>No hay casos registrados aún.</p>
                        <button className="btn btn--primary" onClick={() => navigate('/devices/new')}>
                            Agregar primero
                        </button>
                    </div>
                ) : (
                    <div className="recent-table-wrap glass">
                        <table className="data-table responsive-table">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Serial</th>
                                    <th>Razón Social</th>
                                    <th>Aliado</th>
                                    <th>Modelo</th>
                                    <th>Estatus Caso</th>
                                    <th>Estatus Rep.</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recent.map(d => (
                                    <tr
                                        key={d.id}
                                        className="data-table__row"
                                        onClick={() => navigate(`/devices/${d.id}`)}
                                    >
                                        <td data-label="Fecha">{d.fecha || '—'}</td>
                                        <td data-label="Serial"><code className="serial-code">{d.serial}</code></td>
                                        <td data-label="Razon">{d.razon_social}</td>
                                        <td data-label="Aliado">{d.aliado || '—'}</td>
                                        <td data-label="Modelo">{d.modelo || '—'}</td>
                                        <td data-label="Caso"><StatusBadge status={d.estatus_caso} type="caso" /></td>
                                        <td data-label="Reparación"><StatusBadge status={d.estatus} type="reparacion" /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
