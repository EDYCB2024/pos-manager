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

const ICONS = {
    TOTAL: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="2" y1="10" x2="22" y2="10"></line>
            <path d="M7 21h10"></path>
            <path d="M12 17v4"></path>
        </svg>
    ),
    ABIERTO: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
    ),
    CERRADO: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
    )
};

export default function Dashboard() {
    const [stats, setStats] = useState({ total: 0, byCaso: {}, byReparacion: {} });
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const navigate = useNavigate();

    useEffect(() => {
        getStats().then(s => {
            setStats(s);
            setLoading(false);
        }).catch(() => setLoading(false));

        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const getGreetingInfo = () => {
        const hour = currentTime.getHours();
        if (hour < 12) return { text: 'Buenos días', icon: '☀️' };
        if (hour < 18) return { text: 'Buenas tardes', icon: '⛅' };
        return { text: 'Buenas noches', icon: '🌙' };
    };

    const greeting = getGreetingInfo();

    return (
        <div className="dashboard anim-fadeUp">
            <div className="dynamic-bg"></div>
            
            <div className="dashboard-welcome glass">
                <div className="welcome-content">
                    <span className="welcome-tag">Panel de Control</span>
                    <h1 className="welcome-title">
                        {greeting.icon} {greeting.text}, Administrador
                    </h1>
                    <p className="welcome-text">Aquí tienes el resumen de operaciones para hoy.</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="dashboard__cards grid grid--cols-3">
                <StatCard
                    label="Total Casos"
                    value={stats.total}
                    color="accent"
                    svgIcon={ICONS.TOTAL}
                />

                <StatCard
                    label="Casos Abiertos"
                    value={stats.byCaso['CASO ABIERTO'] || 0}
                    color="blue"
                    svgIcon={ICONS.ABIERTO}
                />

                <StatCard
                    label="Casos Cerrados"
                    value={stats.byCaso['CASO CERRADO'] || 0}
                    color="green"
                    svgIcon={ICONS.CERRADO}
                />
            </div>
        </div>
    );
}
