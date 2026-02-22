import { NavLink, useNavigate } from 'react-router-dom';
import './Sidebar.css';

const navItems = [
    { to: '/', icon: '⊞', label: 'Dashboard' },
    { to: '/devices', icon: '☰', label: 'Equipos' },
    { to: '/search', icon: '⊕', label: 'Buscar Serial' },
    { to: '/devices/new', icon: '+', label: 'Nuevo Equipo' },
];

export default function Sidebar() {
    const navigate = useNavigate();

    return (
        <aside className="sidebar">
            <div className="sidebar__brand" onClick={() => navigate('/')}>
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
                        className={({ isActive }) =>
                            `sidebar__link${isActive ? ' sidebar__link--active' : ''}`
                        }
                    >
                        <span className="sidebar__link-icon">{item.icon}</span>
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar__footer">
                <span>v1.0.0 · Frontend</span>
            </div>
        </aside>
    );
}
