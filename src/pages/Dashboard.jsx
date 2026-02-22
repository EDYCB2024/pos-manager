import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStats, getAllDevices } from '../store';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import './Dashboard.css';

const STATUS_COLORS = {
    'Ingresado': 'amber',
    'En revisión': 'blue',
    'Listo': 'green',
    'Entregado': 'purple',
    'Sin reparación': 'red',
};
const STATUS_ICONS = {
    'Ingresado': '📥',
    'En revisión': '🔧',
    'Listo': '✅',
    'Entregado': '📦',
    'Sin reparación': '❌',
};

export default function Dashboard() {
    const [stats, setStats] = useState({ total: 0, byStatus: {} });
    const [recent, setRecent] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        setStats(getStats());
        const all = getAllDevices().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRecent(all.slice(0, 5));
    }, []);

    return (
        <div className="dashboard anim-fadeUp">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Dashboard</h1>
                    <p className="page-sub">Resumen general de equipos registrados</p>
                </div>
                <button className="btn btn--primary" onClick={() => navigate('/devices/new')}>
                    + Nuevo Equipo
                </button>
            </div>

            {/* KPI Cards */}
            <div className="dashboard__cards">
                <StatCard label="Total Equipos" value={stats.total} color="accent" icon="◈" />
                {Object.entries(stats.byStatus).map(([status, count]) => (
                    <StatCard
                        key={status}
                        label={status}
                        value={count}
                        color={STATUS_COLORS[status]}
                        icon={STATUS_ICONS[status]}
                    />
                ))}
            </div>

            {/* Recent Activity */}
            <div className="dashboard__recent">
                <h2 className="section-title">Últimos Ingresos</h2>
                {recent.length === 0 ? (
                    <div className="empty-state">
                        <span className="empty-state__icon">📭</span>
                        <p>No hay equipos registrados aún.</p>
                        <button className="btn btn--primary" onClick={() => navigate('/devices/new')}>
                            Agregar primero
                        </button>
                    </div>
                ) : (
                    <div className="recent-table-wrap glass">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Serial</th>
                                    <th>Razón Social</th>
                                    <th>Modelo</th>
                                    <th>Estatus</th>
                                    <th>Ingreso</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recent.map(d => (
                                    <tr
                                        key={d.id}
                                        className="data-table__row"
                                        onClick={() => navigate(`/devices/${d.serial}`)}
                                    >
                                        <td><code className="serial-code">{d.serial}</code></td>
                                        <td>{d.razonSocial}</td>
                                        <td>{d.modelo}</td>
                                        <td><StatusBadge status={d.estatus} /></td>
                                        <td>{d.fechaIngreso || '—'}</td>
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
