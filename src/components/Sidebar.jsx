import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { exportDevicesExcel } from '../store';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const navItems = [
    { to: '/devices', icon: '☰', label: 'Equipos' },
];

export default function Sidebar({ theme, onToggleTheme }) {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [isAliadosOpen, setIsAliadosOpen] = useState(false);
    const [isDataCenterOpen, setIsDataCenterOpen] = useState(false);
    const [isEquiposOpen, setIsEquiposOpen] = useState(true);
    const [isPartesOpen, setIsPartesOpen] = useState(false);
    const { user, logout } = useAuth();

    const toggle = () => setIsOpen(!isOpen);
    const close = () => setIsOpen(false);

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
                                    to="/"
                                    end
                                    onClick={close}
                                    className={({ isActive }) =>
                                        `sidebar__link sidebar__link--sub${isActive ? ' sidebar__link--sub-active' : ''}`
                                    }
                                >
                                    <span className="sidebar__link-icon">🏠</span>
                                    <span>Inicio</span>
                                </NavLink>
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
                                    onClick={() => { exportDevicesExcel(); close(); }}
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
                            className={`sidebar__link sidebar__link--collapsible-header ${isPartesOpen ? 'sidebar__link--active' : ''}`}
                            onClick={() => setIsPartesOpen(!isPartesOpen)}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span className="sidebar__link-icon">⚙️</span>
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
                                    <span className="sidebar__link-icon">📦</span>
                                    <span>Inventario</span>
                                </NavLink>
                            </div>
                        )}
                    </div>
                </nav>

                <div className="sidebar__footer">
                    {user && (
                        <div style={{ marginBottom: '12px', padding: '8px', background: 'var(--bg-card)', borderRadius: '8px' }}>
                            <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-primary)' }}>👤 {user.name}</div>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{user.email} • MODO: {user.role.toUpperCase()}</div>
                        </div>
                    )}
                    <NavLink
                        to="/settings"
                        onClick={close}
                        className="theme-toggle"
                        style={{ textDecoration: 'none' }}
                        title="Ajustes"
                    >
                        ⚙️ Ajustes
                    </NavLink>
                    <button
                        className="theme-toggle"
                        onClick={() => { logout(); close(); }}
                        style={{ background: 'var(--bg-card)', color: '#ef4444', borderColor: '#ef4444', marginTop: '8px' }}
                    >
                        🚪 Cerrar Sesión
                    </button>
                    <span style={{ marginTop: '8px', display: 'block' }}>v1.0.0</span>
                </div>
            </aside>
        </>
    );
}
