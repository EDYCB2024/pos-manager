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
        alert('Perfil guardado exitosamente.');
    };

    const handleToggleNotifications = () => {
        const newVal = !notifications;
        setNotifications(newVal);
        localStorage.setItem('notifications', newVal);
    };

    return (
        <div className="settings-container">
            <header className="settings-header">
                <h1 className="settings-title">Ajustes del Sistema</h1>
                <p className="settings-subtitle">Personaliza tu experiencia, gestiona tu seguridad y controla los accesos del sistema.</p>
            </header>

            <nav className="settings-tabs">
                <button
                    className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
                    onClick={() => setActiveTab('general')}
                >
                    <svg className="tab-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                    <span>General</span>
                </button>
                <button
                    className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profile')}
                >
                    <svg className="tab-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    <span>Perfil</span>
                </button>
                <button
                    className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
                    onClick={() => setActiveTab('security')}
                >
                    <svg className="tab-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    <span>Seguridad</span>
                </button>
                {(user?.role === 'admin' || user?.role === 'supervisor') && (
                    <button
                        className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        <svg className="tab-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        <span>Usuarios</span>
                    </button>
                )}
            </nav>

            <div className="settings-content">
                {activeTab === 'general' && (
                    <div className="settings-tab-pane animate-fade-in">
                        <div className="settings-grid">
                            <section className="settings-section">
                                <h2>Interfaz y Apariencia</h2>
                                <div className="settings-card">
                                    <div className="setting-item">
                                        <div className="setting-info">
                                            <h3>Tema Visual</h3>
                                            <p>Alterna entre modo claro y oscuro según tu preferencia laboral.</p>
                                        </div>
                                        <button className="theme-toggle-btn" onClick={onToggleTheme}>
                                            {theme === 'dark' ? (
                                                <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg> Modo Claro</>
                                            ) : (
                                                <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg> Modo Oscuro</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </section>

                            <section className="settings-section">
                                <h2>Comunicación</h2>
                                <div className="settings-card">
                                    <div className="setting-item">
                                        <div className="setting-info">
                                            <h3>Notificaciones push</h3>
                                            <p>Recibe alertas en tiempo real sobre nuevos casos y asignaciones.</p>
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
                    </div>
                )}

                {activeTab === 'profile' && (
                    <div className="settings-tab-pane animate-fade-in">
                        <section className="settings-section">
                            <h2>Información del Usuario</h2>
                            <div className="settings-card">
                                <form onSubmit={handleSaveProfile} className="settings-form">
                                    <div className="form-group">
                                        <label htmlFor="userName">Nombre Completo</label>
                                        <input
                                            type="text"
                                            id="userName"
                                            value={userName}
                                            onChange={(e) => setUserName(e.target.value)}
                                            placeholder="Tu nombre completo"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="userEmail">Correo Electrónico</label>
                                        <input
                                            type="email"
                                            id="userEmail"
                                            value={email}
                                            disabled
                                        />
                                        <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                            Gestionado por administración
                                        </small>
                                    </div>
                                    <div className="form-group form-group--full">
                                        <label>Nivel de Acceso</label>
                                        <input
                                            type="text"
                                            value={user?.role?.toUpperCase() || ''}
                                            disabled
                                            style={{ opacity: 0.8, letterSpacing: '0.05em', fontWeight: 'bold' }}
                                        />
                                    </div>
                                    <button type="submit" className="save-btn">Guardar Cambios</button>
                                </form>
                            </div>
                        </section>
                    </div>
                )}

                {activeTab === 'security' && (
                    <div className="settings-tab-pane animate-fade-in">
                        <section className="settings-section">
                            <h2>Seguridad y Credenciales</h2>
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
                                    <div className="form-group form-group--full">
                                        <label htmlFor="oldPassword">Contraseña Actual</label>
                                        <input type="password" id="oldPassword" required />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="newPassword">Nueva Contraseña</label>
                                        <input type="password" id="newPassword" required />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                                        <input type="password" id="confirmPassword" required />
                                    </div>
                                    <div className="form-group form-group--full">
                                        <small style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                            Asegúrate de incluir números y caracteres especiales.
                                        </small>
                                    </div>
                                    <button type="submit" className="save-btn">Actualizar Acceso</button>
                                </form>
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
