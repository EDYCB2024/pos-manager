import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { exportDevicesExcel, getUniqueAliados, MODELOS } from '../store';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import './Sidebar.css';

const navItems = [
    { to: '/devices', icon: '☰', label: 'Equipos' },
];

export default function Sidebar({ theme, onToggleTheme }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [isAliadosOpen, setIsAliadosOpen] = useState(false);
    const [isDataCenterOpen, setIsDataCenterOpen] = useState(false);
    const [isEquiposOpen, setIsEquiposOpen] = useState(true);
    const [isPartesOpen, setIsPartesOpen] = useState(false);
    const [isAtcOpen, setIsAtcOpen] = useState(false);
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

            <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
                <div className="sidebar__brand" onClick={() => { navigate('/'); close(); }}>
                    <span className="sidebar__brand-icon">◈</span>
                    <div>
                        <span className="sidebar__brand-title">POS Manager</span>
                        <span className="sidebar__brand-sub">Control de Equipos</span>
                    </div>
                </div>

                <nav className="sidebar__nav">
                    <div className="sidebar__section">
                        <div
                            className={`sidebar__link sidebar__link--collapsible-header ${isEquiposOpen ? 'sidebar__link--active' : ''}`}
                            onClick={() => setIsEquiposOpen(!isEquiposOpen)}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span className="sidebar__link-icon">☰</span>
                                <span>Equipos</span>
                            </div>
                            <span className={`sidebar__chevron ${isEquiposOpen ? 'sidebar__chevron--open' : ''}`}>▼</span>
                        </div>
                        {isEquiposOpen && (
                            <div className="sidebar__sub-nav">
                                <NavLink
                                    to="/devices/new"
                                    onClick={close}
                                    className={({ isActive }) =>
                                        `sidebar__link sidebar__link--sub${isActive ? ' sidebar__link--sub-active' : ''}`
                                    }
                                >
                                    <span className="sidebar__link-icon">➕</span>
                                    <span>Nuevo Caso</span>
                                </NavLink>
                                <NavLink
                                    to="/devices"
                                    onClick={close}
                                    className={({ isActive }) =>
                                        `sidebar__link sidebar__link--sub${isActive ? ' sidebar__link--sub-active' : ''}`
                                    }
                                >
                                    <span className="sidebar__link-icon">📱</span>
                                    <span>Lista de Equipos</span>
                                </NavLink>
                                <NavLink
                                    to="/report/new"
                                    onClick={close}
                                    className={({ isActive }) =>
                                        `sidebar__link sidebar__link--sub${isActive ? ' sidebar__link--sub-active' : ''}`
                                    }
                                >
                                    <span className="sidebar__link-icon">📄</span>
                                    <span>Crear Informe</span>
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
                                <span className="sidebar__link-icon">🤝</span>
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
                                        <span className="sidebar__link-icon">↳</span>
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
                                        <span className="sidebar__link-icon">🧩</span>
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
                                            <span className="sidebar__link-icon">Box</span>
                                            <span>Inventario</span>
                                        </NavLink>
                                    </div>
                                )}
                            </div>

                            <div className="sidebar__section">
                                <div
                                    className={`sidebar__link sidebar__link--collapsible-header ${isDataCenterOpen ? 'sidebar__link--active' : ''}`}
                                    onClick={() => setIsDataCenterOpen(!isDataCenterOpen)}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span className="sidebar__link-icon">📊</span>
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
                                            <span className="sidebar__link-icon">📈</span>
                                            <span>Dashboard</span>
                                        </NavLink>
                                        <NavLink
                                            to="/recursos-pos"
                                            onClick={close}
                                            className={({ isActive }) =>
                                                `sidebar__link sidebar__link--sub${isActive ? ' sidebar__link--sub-active' : ''}`
                                            }
                                        >
                                            <span className="sidebar__link-icon">🛠️</span>
                                            <span>Recursos Pos</span>
                                        </NavLink>
                                        <div
                                            className="sidebar__link sidebar__link--sub"
                                            onClick={() => { setShowExportModal(true); close(); }}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <span className="sidebar__link-icon">📊</span>
                                            <span>Exportar Excel</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="sidebar__section">
                                <div
                                    className={`sidebar__link sidebar__link--collapsible-header ${isAtcOpen ? 'sidebar__link--active' : ''}`}
                                    onClick={() => setIsAtcOpen(!isAtcOpen)}
                                >

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span className="sidebar__link-icon">🎧</span>
                                        <span>Gestión de casos ATC</span>
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
                                            <span className="sidebar__link-icon">📥</span>
                                            <span>Bandeja ATC</span>
                                        </NavLink>
                                        <NavLink
                                            to="/atc/history"
                                            onClick={close}
                                            className={({ isActive }) =>
                                                `sidebar__link sidebar__link--sub${isActive ? ' sidebar__link--sub-active' : ''}`
                                            }
                                        >
                                            <span className="sidebar__link-icon">📜</span>
                                            <span>Histórico ATC</span>
                                        </NavLink>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    <div className="sidebar__section">
                        <div
                            className={`sidebar__link ${location.pathname === '/settings' ? 'sidebar__link--active' : ''}`}
                            onClick={() => { navigate('/settings'); close(); }}
                            style={{ cursor: 'pointer' }}
                        >
                            <span className="sidebar__link-icon">⚙️</span>
                            <span>Ajustes</span>
                        </div>
                    </div>
                </nav>


                <div className="sidebar__footer">
                    <button
                        className="theme-toggle"
                        onClick={() => { logout(); close(); }}
                        style={{ background: 'var(--bg-card)', color: '#ef4444', borderColor: '#ef4444' }}
                    >
                        🚪 Cerrar Sesión
                    </button>
                    <span style={{ marginTop: '8px', display: 'block' }}>v1.0.0</span>
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
