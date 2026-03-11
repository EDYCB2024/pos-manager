import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { exportDevicesExcel, getUniqueAliados, MODELOS } from '../store';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import './Sidebar.css';

const navItems = [
    { to: '/devices', icon: '☰', label: 'Equipos' },
];

export default function Sidebar({ theme, onToggleTheme, isCollapsed, toggleCollapse }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [isAliadosOpen, setIsAliadosOpen] = useState(false);
    const [isDataCenterOpen, setIsDataCenterOpen] = useState(false);
    const [isAccionesOpen, setIsAccionesOpen] = useState(true);
    const [isPartesOpen, setIsPartesOpen] = useState(false);
    const [isAtcOpen, setIsAtcOpen] = useState(false);
    const [isDespachoOpen, setIsDespachoOpen] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportFilters, setExportFilters] = useState({ year: '', aliado: 'Todos', modelo: 'Todos' });
    const [uniqueAliados, setUniqueAliados] = useState([]);
    const { user, logout } = useAuth();

    useEffect(() => {
        if (showExportModal) {
            getUniqueAliados().then(setUniqueAliados).catch(console.error);
        }
    }, [showExportModal]);

    const toggle = () => setIsOpen(!isOpen);
    const close = () => setIsOpen(false);

    const handleExport = async () => {
        try {
            await exportDevicesExcel(exportFilters);
            setShowExportModal(false);
        } catch (err) {
            alert("Error al exportar: " + err.message);
        }
    };

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

    return (
        <>
            <button className="sidebar-toggle" onClick={toggle}>
                {isOpen ? '✕' : '☰'}
            </button>

            {isOpen && <div className="sidebar-overlay" onClick={close}></div>}

            <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''} ${isCollapsed ? 'sidebar--collapsed' : ''}`}>
                <div className="sidebar__brand" onClick={() => { navigate('/'); close(); }}>
                    <div className="sidebar__brand-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" fill="var(--accent-dim)"></rect>
                            <line x1="2" y1="10" x2="22" y2="10"></line>
                            <path d="M7 21h10"></path>
                            <path d="M12 17v4"></path>
                        </svg>
                    </div>
                    <div>
                        <span className="sidebar__brand-title">POS Manager</span>
                        <span className="sidebar__brand-sub">Control de Equipos</span>
                    </div>
                </div>

                <nav className="sidebar__nav">
                    <NavLink
                        to="/devices"
                        onClick={close}
                        className={({ isActive }) =>
                            `sidebar__link${isActive ? ' sidebar__link--active' : ''}`
                        }
                    >
                        <span className="sidebar__link-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
                        </span>
                        <span>Lista de Equipos</span>
                    </NavLink>

                    <NavLink
                        to="/tracking"
                        onClick={close}
                        className={({ isActive }) =>
                            `sidebar__link${isActive ? ' sidebar__link--active' : ''}`
                        }
                    >
                        <span className="sidebar__link-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><path d="M11 8v3l2 2"></path></svg>
                        </span>
                        <span>Tracking de Equipos</span>
                    </NavLink>

                    <div className="sidebar__section">
                        <div
                            className={`sidebar__link sidebar__link--collapsible-header ${isAccionesOpen ? 'sidebar__link--active' : ''}`}
                            onClick={() => setIsAccionesOpen(!isAccionesOpen)}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span className="sidebar__link-icon">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                </span>
                                <span>Acciones</span>
                            </div>
                            <span className={`sidebar__chevron ${isAccionesOpen ? 'sidebar__chevron--open' : ''}`}>▼</span>
                        </div>
                        {isAccionesOpen && (
                            <div className="sidebar__sub-nav">
                                <NavLink
                                    to="/devices/new"
                                    onClick={close}
                                    className={({ isActive }) =>
                                        `sidebar__link sidebar__link--sub${isActive ? ' sidebar__link--sub-active' : ''}`
                                    }
                                >
                                    <span className="sidebar__link-icon">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                    </span>
                                    <span>Nuevo Caso</span>
                                </NavLink>
                                <NavLink
                                    to="/report/new"
                                    onClick={close}
                                    className={({ isActive }) =>
                                        `sidebar__link sidebar__link--sub${isActive ? ' sidebar__link--sub-active' : ''}`
                                    }
                                >
                                    <span className="sidebar__link-icon">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                    </span>
                                    <span>Crear Informe</span>
                                </NavLink>
                                <NavLink
                                    to="/quotation/new"
                                    onClick={close}
                                    className={({ isActive }) =>
                                        `sidebar__link sidebar__link--sub${isActive ? ' sidebar__link--sub-active' : ''}`
                                    }
                                >
                                    <span className="sidebar__link-icon">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1Z" /><path d="M12 11h4" /><path d="M12 16h4" /><path d="M8 11h.01" /><path d="M8 16h.01" /></svg>
                                    </span>
                                    <span>Generar Cotización</span>
                                </NavLink>
                            </div>
                        )}
                    </div>
                    <div className="sidebar__section">
                        <div
                            className={`sidebar__link sidebar__link--collapsible-header ${isAliadosOpen ? 'sidebar__link--active' : ''}`}
                            onClick={() => setIsAliadosOpen(!isAliadosOpen)}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span className="sidebar__link-icon">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                                </span>
                                <span>Aliados</span>
                            </div>
                            <span className={`sidebar__chevron ${isAliadosOpen ? 'sidebar__chevron--open' : ''}`}>▼</span>
                        </div>
                        {isAliadosOpen && (
                            <div className="sidebar__sub-nav">
                                {[
                                    'VAT&C', 'CREDICARD', 'PLATCO', 'PLATCO POS', 'BANCARIBE',
                                    'BANPLUS', 'POSCOMERCIAL', 'TOKEN PAGOS', 'INSTAPAGO',
                                    'PAYTECH', 'BANCRECER', 'BANCO ACTIVO', 'DEL SUR'
                                ].map(aliado => (
                                    <NavLink
                                        key={aliado}
                                        to={`/devices?aliado=${encodeURIComponent(aliado)}`}
                                        onClick={close}
                                        className={({ isActive }) =>
                                            `sidebar__link sidebar__link--sub${isActive ? ' sidebar__link--sub-active' : ''}`
                                        }
                                    >
                                        <span className="sidebar__link-icon">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                        </span>
                                        <span>{aliado}</span>
                                    </NavLink>
                                ))}
                            </div>
                        )}
                    </div>


                    {user?.role !== 'visor' && (
                        <>
                            <div className="sidebar__section">
                                <div
                                    className={`sidebar__link sidebar__link--collapsible-header ${isPartesOpen ? 'sidebar__link--active' : ''}`}
                                    onClick={() => setIsPartesOpen(!isPartesOpen)}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span className="sidebar__link-icon">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                                        </span>
                                        <span>Partes y Piezas</span>
                                    </div>
                                    <span className={`sidebar__chevron ${isPartesOpen ? 'sidebar__chevron--open' : ''}`}>▼</span>
                                </div>
                                {isPartesOpen && (
                                    <div className="sidebar__sub-nav">
                                        <NavLink
                                            to="/partes"
                                            onClick={close}
                                            className={({ isActive }) =>
                                                `sidebar__link sidebar__link--sub${isActive ? ' sidebar__link--sub-active' : ''}`
                                            }
                                        >
                                            <span className="sidebar__link-icon">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                                            </span>
                                            <span>Inventario</span>
                                        </NavLink>
                                    </div>
                                )}
                            </div>



                            <div className="sidebar__section">
                                <div
                                    className={`sidebar__link sidebar__link--collapsible-header ${isAtcOpen ? 'sidebar__link--active' : ''}`}
                                    onClick={() => setIsAtcOpen(!isAtcOpen)}
                                >

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span className="sidebar__link-icon">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                                        </span>
                                        <span>Gestión ATC</span>
                                    </div>
                                    <span className={`sidebar__chevron ${isAtcOpen ? 'sidebar__chevron--open' : ''}`}>▼</span>
                                </div>
                                {isAtcOpen && (
                                    <div className="sidebar__sub-nav">
                                        <NavLink
                                            to="/atc/inbox"
                                            onClick={close}
                                            className={({ isActive }) =>
                                                `sidebar__link sidebar__link--sub${isActive ? ' sidebar__link--sub-active' : ''}`
                                            }
                                        >
                                            <span className="sidebar__link-icon">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg>
                                            </span>
                                            <span>Bandeja ATC</span>
                                        </NavLink>
                                        <NavLink
                                            to="/atc/history"
                                            onClick={close}
                                            className={({ isActive }) =>
                                                `sidebar__link sidebar__link--sub${isActive ? ' sidebar__link--sub-active' : ''}`
                                            }
                                        >
                                            <span className="sidebar__link-icon">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"></path></svg>
                                            </span>
                                            <span>Histórico ATC</span>
                                        </NavLink>
                                    </div>
                                )}
                            </div>

                            <div className="sidebar__section">
                                <div
                                    className={`sidebar__link sidebar__link--collapsible-header ${isDespachoOpen ? 'sidebar__link--active' : ''}`}
                                    onClick={() => setIsDespachoOpen(!isDespachoOpen)}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span className="sidebar__link-icon">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 16h6"></path><path d="M12 22a2 2 0 0 1-2-2v-4l-6-6V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6l-6 6v4a2 2 0 0 1-2 2z"></path></svg>
                                        </span>
                                        <span>Despacho</span>
                                    </div>
                                    <span style={{ fontSize: '10px', background: 'var(--accent-dim)', color: 'var(--accent)', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>OBRA</span>
                                </div>
                                {isDespachoOpen && (
                                    <div className="sidebar__sub-nav">
                                        <div className="sidebar__link sidebar__link--sub" style={{ opacity: 0.5, cursor: 'default' }}>
                                            <span className="sidebar__link-icon">•</span>
                                            <span>En construction...</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="sidebar__section">
                                <div
                                    className={`sidebar__link sidebar__link--collapsible-header ${isDataCenterOpen ? 'sidebar__link--active' : ''}`}
                                    onClick={() => setIsDataCenterOpen(!isDataCenterOpen)}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span className="sidebar__link-icon">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                                        </span>
                                        <span>Data Center</span>
                                    </div>
                                    <span className={`sidebar__chevron ${isDataCenterOpen ? 'sidebar__chevron--open' : ''}`}>▼</span>
                                </div>
                                {isDataCenterOpen && (
                                    <div className="sidebar__sub-nav">
                                        <NavLink
                                            to="/dashboard"
                                            onClick={close}
                                            className={({ isActive }) =>
                                                `sidebar__link sidebar__link--sub${isActive ? ' sidebar__link--sub-active' : ''}`
                                            }
                                        >
                                            <span className="sidebar__link-icon">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"></path><path d="m19 9-5 5-4-4-3 3"></path></svg>
                                            </span>
                                            <span>Dashboard</span>
                                        </NavLink>
                                        <NavLink
                                            to="/recursos-pos"
                                            onClick={close}
                                            className={({ isActive }) =>
                                                `sidebar__link sidebar__link--sub${isActive ? ' sidebar__link--sub-active' : ''}`
                                            }
                                        >
                                            <span className="sidebar__link-icon">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
                                            </span>
                                            <span>Recursos Pos</span>
                                        </NavLink>
                                        <div
                                            className="sidebar__link sidebar__link--sub"
                                            onClick={() => { setShowExportModal(true); close(); }}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <span className="sidebar__link-icon">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                                            </span>
                                            <span>Exportar Excel</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                </nav>
                <div className="sidebar__footer">
                    <button className="theme-toggle" onClick={toggleCollapse} title={isCollapsed ? "Expandir" : "Ocultar"}>
                        {isCollapsed ? '▶' : '◀ Ocultar menú'}
                    </button>
                    {/* Logout button was here? We can place it below if needed, but it seems there was none. */}
                </div>
            </aside>

            {showExportModal && (
                <div className="modal-overlay">
                    <div className="modal glass anim-fadeUp">
                        <header style={{ marginBottom: '20px' }}>
                            <h2 className="modal__title">Exportar a Excel</h2>
                            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Filtra los datos que deseas incluir en el reporte.</p>
                        </header>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>Año</label>
                                <select
                                    className="filter-select"
                                    style={{ width: '100%' }}
                                    value={exportFilters.year}
                                    onChange={e => setExportFilters({ ...exportFilters, year: e.target.value })}
                                >
                                    <option value="">Todos los años</option>
                                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>

                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>Aliado</label>
                                <select
                                    className="filter-select"
                                    style={{ width: '100%' }}
                                    value={exportFilters.aliado}
                                    onChange={e => setExportFilters({ ...exportFilters, aliado: e.target.value })}
                                >
                                    <option value="Todos">Todos los aliados</option>
                                    {uniqueAliados.map(a => <option key={a} value={a}>{a}</option>)}
                                </select>
                            </div>

                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>Modelo</label>
                                <select
                                    className="filter-select"
                                    style={{ width: '100%' }}
                                    value={exportFilters.modelo}
                                    onChange={e => setExportFilters({ ...exportFilters, modelo: e.target.value })}
                                >
                                    <option value="Todos">Todos los modelos</option>
                                    {MODELOS.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="modal__actions" style={{ marginTop: '24px' }}>
                            <button className="btn btn--ghost" onClick={() => setShowExportModal(false)}>Cancelar</button>
                            <button className="btn btn--primary" onClick={handleExport}>Descargar Excel</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
