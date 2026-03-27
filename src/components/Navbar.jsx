import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationCreator from './NotificationCreator';
import './Navbar.css';

export default function Navbar() {
    const { user, logout } = useAuth();
    const [isNotifMenuOpen, setIsNotifMenuOpen] = useState(false);
    const [isCreatorOpen, setIsCreatorOpen] = useState(false);
    const notifRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setIsNotifMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Generate page title based on route with icons
    const getPageTitle = () => {
        const path = location.pathname;
        const iconStyle = { marginRight: '10px', opacity: 0.8 };

        if (path === '/') return <><span style={iconStyle}>🏠</span>Inicio</>;
        if (path === '/dashboard') return <><svg style={iconStyle} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></svg>Dashboard</>;
        if (path === '/devices') return <><svg style={iconStyle} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>Lista de Equipos</>;
        if (path.includes('/devices/new')) return <><svg style={iconStyle} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>Nuevo Caso</>;
        if (path.match(/\/devices\/[^/]+$/)) return <><svg style={iconStyle} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>Consulta de Caso</>;
        if (path.includes('/devices/') && path.includes('/edit')) return <><svg style={iconStyle} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg>Editar Caso</>;
        if (path === '/report/new') return <><svg style={iconStyle} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>Crear Informe</>;
        if (path === '/recursos-pos') return <><svg style={iconStyle} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>Recursos POS</>;
        if (path === '/quotation/new') return <><svg style={iconStyle} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1Z" /><path d="M12 11h4" /><path d="M12 16h4" /><path d="M8 11h.01" /><path d="M8 16h.01" /></svg>Generar Cotización</>;
        if (path === '/tracking') return <><svg style={iconStyle} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><path d="M11 8v3l2 2"></path></svg>Tracking de Equipos</>;
        if (path === '/partes') return <><svg style={iconStyle} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>Inventario de Partes</>;
        if (path === '/settings') return null;
        if (path.includes('/atc')) return <><svg style={iconStyle} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>Gestión ATC</>;
        return 'POS Manager';
    };

    return (
        <header className="navbar glass">
            <div className="navbar__left">
                <div className="navbar__breadcrumb">
                    <span className="navbar__title">{getPageTitle()}</span>
                </div>
            </div>

            <div className="navbar__right flex items-center gap-4">
                <div className="relative" ref={notifRef}>
                    <button 
                        className={`navbar__icon-btn transition-transform hover:scale-110 active:scale-90 ${isNotifMenuOpen ? 'text-blue-500' : ''}`} 
                        title="Notificaciones"
                        onClick={() => setIsNotifMenuOpen(!isNotifMenuOpen)}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                        </svg>
                        <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-[#0b0d12]"></span>
                    </button>

                    <AnimatePresence>
                        {isNotifMenuOpen && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute right-0 mt-3 w-80 bg-[#111318]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                            >
                                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">Notificaciones</h4>
                                    <span className="px-2 py-1 bg-blue-600/20 text-blue-400 text-[10px] font-black rounded-lg">CENTRAL</span>
                                </div>
                                <div className="max-h-64 overflow-y-auto p-2">
                                    <div className="p-8 text-center">
                                        <div className="text-4xl mb-3 opacity-20">🔔</div>
                                        <p className="text-slate-500 text-xs font-medium">No hay notificaciones nuevas</p>
                                    </div>
                                </div>
                                <div className="p-3 bg-white/[0.02] border-t border-white/5">
                                    <button 
                                        onClick={() => {
                                            setIsNotifMenuOpen(false);
                                            setIsCreatorOpen(true);
                                        }}
                                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 group"
                                    >
                                        <span className="text-lg group-hover:rotate-12 transition-transform">➕</span>
                                        Añadir Recordatorio
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="navbar__user-container" ref={dropdownRef}>
                    <div
                        className={`navbar__user ${isDropdownOpen ? 'navbar__user--active' : ''}`}
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                        <div className="navbar__user-info">
                            <span className="navbar__user-name">{user?.name || 'Usuario'}</span>
                            <span className="navbar__user-role">{user?.role?.toUpperCase() || 'MODO'}</span>
                        </div>
                        <div className="navbar__avatar">
                            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                    </div>

                    {isDropdownOpen && (
                        <div className="navbar__dropdown glass anim-fadeUp">
                            <button
                                className="navbar__dropdown-item"
                                onClick={() => {
                                    navigate('/settings');
                                    setIsDropdownOpen(false);
                                }}
                            >
                                <span className="navbar__dropdown-icon">⚙️</span>
                                <span>Ajustes</span>
                            </button>
                            <div className="navbar__dropdown-divider"></div>
                            <button
                                className="navbar__dropdown-item navbar__dropdown-item--danger"
                                onClick={() => {
                                    logout();
                                    setIsDropdownOpen(false);
                                }}
                            >
                                <span className="navbar__dropdown-icon">🚪</span>
                                <span>Cerrar Sesión</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
            
            {/* The Modal */}
            <NotificationCreator isOpen={isCreatorOpen} onClose={() => setIsCreatorOpen(false)} />
        </header>
    );
}

