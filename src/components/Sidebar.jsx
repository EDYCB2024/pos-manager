import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Sidebar.css';

const navItems = [
    { to: '/', icon: '⊞', label: 'Dashboard' },
    { to: '/devices', icon: '☰', label: 'Equipos' },
    { to: '/search', icon: '⊕', label: 'Buscar Serial' },
];

export default function Sidebar() {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [isAliadosOpen, setIsAliadosOpen] = useState(false);

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
                    {navItems.map(item => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === '/'}
                            onClick={close}
                            className={({ isActive }) =>
                                `sidebar__link${isActive ? ' sidebar__link--active' : ''}`
                            }
                        >
                            <span className="sidebar__link-icon">{item.icon}</span>
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar__section">
                    <h3
                        className="sidebar__section-title sidebar__section-title--collapsible"
                        onClick={() => setIsAliadosOpen(!isAliadosOpen)}
                    >
                        <span>Aliados</span>
                        <span className={`sidebar__chevron ${isAliadosOpen ? 'sidebar__chevron--open' : ''}`}>▼</span>
                    </h3>
                    {isAliadosOpen && (
                        <nav className="sidebar__sub-nav">
                            {[
                                'VATC', 'CREDICARD', 'PLATCO', 'PLATCO POS', 'BANCARIBE',
                                'BANPLUS', 'POS COMERCIAL', 'TOKEN PAGOS', 'INSTAPAGO',
                                'PAYTECH', 'BANCRECER', 'BANCO ACTIVO', 'DEL SUR'
                            ].map(aliado => (
                                <NavLink
                                    key={aliado}
                                    to={`/devices?aliado=${encodeURIComponent(aliado)}`}
                                    onClick={close}
                                    className={({ isActive }) =>
                                        `sidebar__link sidebar__link--sub${isActive ? ' sidebar__link--active' : ''}`
                                    }
                                >
                                    <span className="sidebar__link-icon">↳</span>
                                    <span>{aliado}</span>
                                </NavLink>
                            ))}
                        </nav>
                    )}
                </div>

                <div className="sidebar__footer">
                    <span>v1.0.0 · Frontend</span>
                </div>
            </aside>
        </>
    );
}
