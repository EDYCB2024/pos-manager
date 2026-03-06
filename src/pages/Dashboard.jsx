import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStats, getAllDevices } from '../store';
import StatCard from '../components/StatCard';
import { utils, writeFile } from 'xlsx';
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
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        getStats().then(s => {
            setStats(s);
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

        </div>
    );
}
