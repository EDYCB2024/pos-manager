import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStats, getDevicesPaged } from '../store';
import { 
    LayoutDashboard, TrendingUp, AlertCircle, CheckCircle2, 
    ArrowRight, Clock, Box, ShieldCheck, Zap, Monitor, 
    Search, Plus, FileText, ChevronRight, Activity, Calendar
} from 'lucide-react';
import './Dashboard.css';

export default function Dashboard() {
    const [stats, setStats] = useState({ total: 0, byCaso: {}, byReparacion: {} });
    const [recentDevices, setRecentDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const navigate = useNavigate();

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const s = await getStats();
                setStats(s);
                const { data } = await getDevicesPaged({ page: 1, pageSize: 6 });
                setRecentDevices(data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };

        loadDashboard();
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    if (loading) {
        return (
            <div className="dashboard-loading anim-fadeUp">
                <div className="loader-ring"></div>
                <p>Cargando panel operacional...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-pro anim-fadeUp">
            
            {/* Header / Hero Section */}
            <div className="dashboard-hero section-card">
                <div className="hero-gradient-overlay"></div>
                <div className="hero-content">
                    <div className="hero-top">
                        <span className="hero-tag">DEMO OPERATIONAL • ONLINE</span>
                        <div className="hero-date">
                           <Calendar size={14} /> {currentTime.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </div>
                    </div>
                    <h1 className="hero-title">Resumen Operativo</h1>
                    <p className="hero-subtitle">Métricas clave y estado general del sistema en tiempo real.</p>
                </div>
            </div>

            {/* KPI Container */}
            <div className="stats-container-pro">
                <div className="stat-card-pro-max">
                   <div className="stat-header">
                       <div className="stat-icon-wrap accent"><Activity size={20} /></div>
                       <TrendingUp className="trend-icon" size={16} />
                   </div>
                   <div className="stat-body">
                       <p className="stat-label">Total de Dispositivos</p>
                       <h2 className="stat-value">{stats.total}</h2>
                   </div>
                   <div className="stat-footer">
                       <span className="footer-tag">+12% vs mes anterior</span>
                   </div>
                </div>

                <div className="stat-card-pro-max">
                   <div className="stat-header">
                       <div className="stat-icon-wrap blue"><AlertCircle size={20} /></div>
                   </div>
                   <div className="stat-body">
                       <p className="stat-label">Casos Abiertos</p>
                       <h2 className="stat-value">{stats.byCaso['CASO ABIERTO'] || 0}</h2>
                   </div>
                   <div className="stat-progress">
                       <div className="prog-bar-bg"><div className="prog-bar-fill blue" style={{ width: `${(stats.byCaso['CASO ABIERTO'] / stats.total) * 100}%` }}></div></div>
                       <span>{Math.round((stats.byCaso['CASO ABIERTO'] / stats.total) * 100)}% del total</span>
                   </div>
                </div>

                <div className="stat-card-pro-max">
                   <div className="stat-header">
                       <div className="stat-icon-wrap success"><CheckCircle2 size={20} /></div>
                   </div>
                   <div className="stat-body">
                       <p className="stat-label">Casos Finalizados</p>
                       <h2 className="stat-value">{stats.byCaso['CASO CERRADO'] || 0}</h2>
                   </div>
                   <div className="stat-progress">
                       <div className="prog-bar-bg"><div className="prog-bar-fill success" style={{ width: `${(stats.byCaso['CASO CERRADO'] / stats.total) * 100}%` }}></div></div>
                       <span>{Math.round((stats.byCaso['CASO CERRADO'] / stats.total) * 100)}% tasa de éxito</span>
                   </div>
                </div>
            </div>

            {/* Content Mid-Section */}
            <div className="dashboard-grid-pro">
                
                {/* Status Distribution */}
                <div className="section-card chart-card">
                    <div className="section-header-pro">
                        <h3 className="section-title-pro">Estado de Reparación</h3>
                        <p className="section-sub-pro">Distribución según el diagnóstico actual</p>
                    </div>
                    <div className="status-bars-pro">
                        {Object.entries(stats.byReparacion).map(([status, count]) => (
                            <div key={status} className="status-row-pro">
                                <div className="status-info">
                                    <span className="status-name">{status}</span>
                                    <span className="status-count">{count}</span>
                                </div>
                                <div className="status-bar-bg">
                                    <div 
                                        className={`status-bar-fill ${status === 'Entregado' ? 'success' : (status === 'Irreparable' ? 'danger' : 'accent')}`} 
                                        style={{ width: `${(count / stats.total) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="quick-actions-pro">
                   <div className="action-card-pro" onClick={() => navigate('/devices/new')}>
                       <div className="action-icon"><Plus size={24} /></div>
                       <div className="action-text">
                           <h4>Ingresar Equipo</h4>
                           <p>Registrar una nueva recepción en taller</p>
                       </div>
                       <ChevronRight size={18} className="chevron" />
                   </div>
                   <div className="action-card-pro" onClick={() => navigate('/aliados/zoom')}>
                       <div className="action-icon"><Zap size={24} /></div>
                       <div className="action-text">
                           <h4>Consultar Zoom</h4>
                           <p>Rastreo de envíos en tiempo real</p>
                       </div>
                       <ChevronRight size={18} className="chevron" />
                   </div>
                   <div className="action-card-pro" onClick={() => navigate('/search')}>
                       <div className="action-icon"><Search size={24} /></div>
                       <div className="action-text">
                           <h4>Búsqueda Serial</h4>
                           <p>Localizar dispositivo por SN o RIF</p>
                       </div>
                       <ChevronRight size={18} className="chevron" />
                   </div>
                </div>

                {/* Recent Items Activity */}
                <div className="section-card activity-card">
                    <div className="section-header-pro">
                        <h3 className="section-title-pro">Actividad Reciente</h3>
                        <div className="view-all-btn" onClick={() => navigate('/devices')}>Ver todo</div>
                    </div>
                    <div className="activity-list-pro">
                        {recentDevices.map((device, i) => (
                            <div key={device.id} className="activity-item-pro anim-fadeUp" style={{ animationDelay: `${i * 0.1}s` }}>
                                <div className={`activity-bullet ${device.estatus_caso === 'CASO ABIERTO' ? 'open' : 'closed'}`}></div>
                                <div className="activity-info">
                                    <div className="info-main">
                                        <span className="comercio-name">{device.razon_social}</span>
                                        <span className="device-sn">{device.modelo} • {device.serial}</span>
                                    </div>
                                    <div className="info-meta">
                                        <span className={`status-badge-tiny ${device.estatus_caso === 'CASO ABIERTO' ? 'blue' : 'green'}`}>{device.estatus}</span>
                                        <span className="time-ago">{new Date(device.fecha).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="item-action" onClick={() => navigate(`/devices/${device.id}`)}>
                                    <FileText size={16} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
