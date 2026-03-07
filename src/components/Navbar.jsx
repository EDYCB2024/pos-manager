import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
    const { user } = useAuth();
    const location = useLocation();

    // Generate page title based on route
    const getPageTitle = () => {
        const path = location.pathname;
        if (path === '/') return 'Inicio';
        if (path === '/dashboard') return 'Dashboard';
        if (path === '/devices') return 'Lista de Equipos';
        if (path.includes('/devices/new')) return 'Nuevo Caso';
        if (path.match(/\/devices\/[^/]+$/)) return 'Consulta de Caso';
        if (path.includes('/devices/') && path.includes('/edit')) return 'Editar Caso';
        if (path === '/report/new') return 'Crear Informe';
        if (path === '/recursos-pos') return 'Recursos POS';
        if (path === '/partes') return 'Inventario de Partes';
        if (path === '/settings') return 'Ajustes del Sistema';
        if (path.includes('/atc')) return 'Gestión ATC';
        return 'POS Manager';
    };

    return (
        <header className="navbar glass">
            <div className="navbar__left">
                <div className="navbar__breadcrumb">
                    <span className="navbar__title">{getPageTitle()}</span>
                </div>
            </div>

            <div className="navbar__right">
                <Link to="/settings" className="navbar__user">
                    <div className="navbar__user-info">
                        <span className="navbar__user-name">{user?.name || 'Usuario'}</span>
                        <span className="navbar__user-role">{user?.role?.toUpperCase() || 'MODO'}</span>
                    </div>
                    <div className="navbar__avatar">
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                </Link>
            </div>
        </header>
    );
}
