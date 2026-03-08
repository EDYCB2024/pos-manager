import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import '../pages/Users.css';
import '../pages/shared.css';


export default function UserManagement() {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', role: 'visor' });
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/users');
            if (!res.ok) throw new Error('No se pudieron cargar los usuarios');
            const data = await res.json();
            setUsers(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Error al crear usuario');
            }
            setShowModal(false);
            setFormData({ name: '', email: '', role: 'visor' });
            fetchUsers();
        } catch (err) {
            setError(err.message);
        }
    };

    const toggleUserStatus = async (id, currentStatus) => {
        try {
            const res = await fetch(`/api/users/update?id=${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ active: !currentStatus })
            });
            if (res.ok) fetchUsers();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteUser = async (id, name) => {
        const confirmed = window.confirm(`¿Seguro que deseas eliminar al usuario "${name}"? Esta acción no se puede deshacer.`);
        if (!confirmed) return;
        try {
            const res = await fetch(`/api/users/delete?id=${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Error al eliminar usuario');
            fetchUsers();
        } catch (err) {
            alert(err.message);
        }
    };

    if (user?.role !== 'admin' && user?.role !== 'supervisor') return null;

    return (
        <div className="users-container anim-fadeUp" style={{ padding: 0 }}>
            <header className="page-header" style={{ marginBottom: '20px' }}>
                <div>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '4px', textTransform: 'none' }}>Gestión de Usuarios</h2>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Administra los accesos y roles del sistema.</p>
                </div>
                <button className="btn btn--primary" onClick={() => setShowModal(true)}>
                    <span>➕ Nuevo Usuario</span>
                </button>
            </header>

            <div className="glass table-container">
                {loading ? (
                    <div className="loading-spinner">Cargando...</div>
                ) : users.length === 0 ? (
                    <div className="empty-state">
                        <span className="empty-state__icon">👥</span>
                        <p>No hay usuarios registrados.</p>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Email</th>
                                <th>Rol</th>
                                <th>Estado</th>
                                <th style={{ textAlign: 'right' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id} className="data-table__row">
                                    <td><strong>{u.name}</strong></td>
                                    <td>{u.email}</td>
                                    <td>
                                        <span className={`role-badge role-${u.role}`}>{u.role}</span>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${u.active ? 'status-listo' : 'status-sin-reparacion'}`}>
                                            {u.active ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                                            <button
                                                className={`btn-icon ${u.active ? '' : 'btn-icon--warning'}`}
                                                onClick={() => toggleUserStatus(u.id, u.active)}
                                                title={u.active ? "Desactivar Usuario" : "Activar Usuario"}
                                                disabled={user.id === u.id}
                                                style={{
                                                    opacity: user.id === u.id ? 0.5 : 1,
                                                    cursor: user.id === u.id ? 'not-allowed' : 'pointer',
                                                    color: u.active ? 'var(--text-secondary)' : '#fbbf24'
                                                }}
                                            >
                                                {u.active ? (
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                                    </svg>
                                                ) : (
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                                        <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
                                                    </svg>
                                                )}
                                            </button>
                                            <button
                                                className="btn-icon btn-icon--danger"
                                                onClick={() => handleDeleteUser(u.id, u.name)}
                                                title="Eliminar Usuario"
                                                disabled={user.id === u.id}
                                                style={{
                                                    opacity: user.id === u.id ? 0.5 : 1,
                                                    cursor: user.id === u.id ? 'not-allowed' : 'pointer'
                                                }}
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="3 6 5 6 21 6"></polyline>
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                    <line x1="10" y1="11" x2="10" y2="17"></line>
                                                    <line x1="14" y1="11" x2="14" y2="17"></line>
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal glass anim-fadeUp">
                        <h2 className="modal__title">Invitar Nuevo Usuario</h2>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                            Se enviará un correo de invitación para que el usuario configure su contraseña.
                        </p>
                        <form onSubmit={handleCreateUser} className="user-form">
                            <div className="form-group">
                                <label>Nombre Completo</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Correo Electrónico</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Rol</label>
                                <select
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                    className="filter-select"
                                    style={{ width: '100%' }}
                                >
                                    <option value="admin">Administrador</option>
                                    <option value="supervisor">Supervisor</option>
                                    <option value="tecnico">Técnico</option>
                                    <option value="visor">Visor</option>
                                </select>
                            </div>

                            {error && <p className="error-msg">{error}</p>}

                            <div className="modal__actions">
                                <button type="button" className="btn btn--ghost" onClick={() => setShowModal(false)}>Cancelar</button>
                                <button type="submit" className="btn btn--primary">Enviar Invitación</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
