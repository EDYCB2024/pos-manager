import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import UserManagement from '../components/UserManagement';
import './Settings.css';

export default function Settings({ theme, onToggleTheme }) {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('general');
    const [userName, setUserName] = useState(user?.name || localStorage.getItem('userName') || '');
    const [email, setEmail] = useState(user?.email || localStorage.getItem('userEmail') || '');
    const [notifications, setNotifications] = useState(localStorage.getItem('notifications') === 'true');

    const handleSaveProfile = (e) => {
        e.preventDefault();
        localStorage.setItem('userName', userName);
        localStorage.setItem('userEmail', email);
        alert('Perfil guardado localmente exitosamente. (Conexión a base de datos en desarrollo)');
    };

    const handleToggleNotifications = () => {
        const newVal = !notifications;
        setNotifications(newVal);
        localStorage.setItem('notifications', newVal);
    };

    return (
        <div className="settings-container">
            <header className="settings-header">
                <h1 className="settings-title">Ajustes</h1>
                <p className="settings-subtitle">Gestiona tu cuenta y preferencias de la aplicación.</p>
            </header>

            <nav className="settings-tabs">
                <button
                    className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
                    onClick={() => setActiveTab('general')}
                >
                    ⚙️ General
                </button>
                <button
                    className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profile')}
                >
                    👤 Perfil
                </button>
                <button
                    className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
                    onClick={() => setActiveTab('security')}
                >
                    🔒 Seguridad
                </button>
                {(user?.role === 'admin' || user?.role === 'supervisor') && (
                    <button
                        className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        👥 Usuarios
                    </button>
                )}
            </nav>

            <div className="settings-content">
                {activeTab === 'general' && (
                    <div className="settings-tab-pane">
                        <section className="settings-section">
                            <h2>Interfaz</h2>
                            <div className="settings-card">
                                <div className="setting-item">
                                    <div className="setting-info">
                                        <h3>Tema Visual</h3>
                                        <p>Personaliza la apariencia de tu panel de control.</p>
                                    </div>
                                    <button className="theme-toggle-btn" onClick={onToggleTheme}>
                                        {theme === 'dark' ? '☀️ Modo Claro' : '🌙 Modo Oscuro'}
                                    </button>
                                </div>
                            </div>
                        </section>

                        <section className="settings-section">
                            <h2>Notificaciones</h2>
                            <div className="settings-card">
                                <div className="setting-item">
                                    <div className="setting-info">
                                        <h3>Alertas del Sistema</h3>
                                        <p>Recibe avisos sobre nuevos casos y actualizaciones.</p>
                                    </div>
                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            checked={notifications}
                                            onChange={handleToggleNotifications}
                                        />
                                        <span className="slider round"></span>
                                    </label>
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {activeTab === 'profile' && (
                    <div className="settings-tab-pane animate-fade-in">
                        <section className="settings-section">
                            <h2>Información Personal</h2>
                            <div className="settings-card">
                                <form onSubmit={handleSaveProfile} className="settings-form">
                                    <div className="form-group">
                                        <label htmlFor="userName">Nombre Completo</label>
                                        <input
                                            type="text"
                                            id="userName"
                                            value={userName}
                                            onChange={(e) => setUserName(e.target.value)}
                                            placeholder="Tu nombre"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="userEmail">Correo Electrónico</label>
                                        <input
                                            type="email"
                                            id="userEmail"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="correo@ejemplo.com"
                                            disabled
                                        />
                                        <small style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
                                            El correo es gestionado por el administrador.
                                        </small>
                                    </div>
                                    <div className="form-group">
                                        <label>Rol de Usuario</label>
                                        <input
                                            type="text"
                                            value={user?.role?.toUpperCase() || ''}
                                            disabled
                                            style={{ opacity: 0.7 }}
                                        />
                                    </div>
                                    <button type="submit" className="save-btn">Actualizar Perfil</button>
                                </form>
                            </div>
                        </section>
                    </div>
                )}

                {activeTab === 'security' && (
                    <div className="settings-tab-pane animate-fade-in">
                        <section className="settings-section">
                            <h2>Seguridad de la Cuenta</h2>
                            <div className="settings-card">
                                <form onSubmit={async (e) => {
                                    e.preventDefault();
                                    const oldPassword = e.target.oldPassword.value;
                                    const newPassword = e.target.newPassword.value;
                                    const confirmPassword = e.target.confirmPassword.value;

                                    if (newPassword !== confirmPassword) {
                                        alert('Las contraseñas no coinciden');
                                        return;
                                    }

                                    try {
                                        const res = await fetch('/api/auth/change-password', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ oldPassword, newPassword })
                                        });
                                        const data = await res.json();
                                        if (res.ok) {
                                            alert('Contraseña actualizada con éxito');
                                            e.target.reset();
                                        } else {
                                            alert(data.error || 'Error al cambiar la contraseña');
                                        }
                                    } catch (err) {
                                        alert('Error de conexión');
                                    }
                                }} className="settings-form">
                                    <div className="form-group">
                                        <label htmlFor="oldPassword">Contraseña Actual</label>
                                        <input type="password" id="oldPassword" required />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="newPassword">Nueva Contraseña</label>
                                        <input type="password" id="newPassword" required />
                                        <small style={{ color: 'var(--text-muted)' }}>Mínimo 10 caracteres, una mayúscula, un número y un símbolo.</small>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="confirmPassword">Confirmar Nueva Contraseña</label>
                                        <input type="password" id="confirmPassword" required />
                                    </div>
                                    <button type="submit" className="save-btn">Actualizar Contraseña</button>
                                </form>
                                <div className="setting-item" style={{ marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                                    <div className="setting-info">
                                        <h3>Sesiones Activas</h3>
                                        <p>Cierra sesión en todos los dispositivos.</p>
                                    </div>
                                    <button className="danger-btn-text" onClick={() => alert('Próximamente')}>Cerrar otras sesiones</button>
                                </div>
                            </div>
                        </section>
                    </div>
                )}


                {activeTab === 'users' && (user?.role === 'admin' || user?.role === 'supervisor') && (
                    <div className="settings-tab-pane animate-fade-in">
                        <UserManagement />
                    </div>
                )}
            </div>
        </div>
    );
}
