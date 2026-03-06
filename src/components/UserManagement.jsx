import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import '../pages/Users.css';
import '../pages/shared.css';

export default function UserManagement() {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', role: 'visor', password: '' });
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
            setFormData({ name: '', email: '', role: 'visor', password: '' });
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

    if (user?.role !== 'admin' && user?.role !== 'supervisor') {
        return null;
    }

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
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Email</th>
                                <th>Rol</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id} className="data-table__row">
                                    <td><strong>{u.name}</strong></td>
                                    <td>{u.email}</td>
                                    <td>
                                        <span className={`role-badge role-${u.role}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${u.active ? 'status-listo' : 'status-sin-reparacion'}`}>
                                            {u.active ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-btns">
                                            <button
                                                className={`action-btn ${u.active ? 'action-btn--delete' : 'action-btn--edit'}`}
                                                onClick={() => toggleUserStatus(u.id, u.active)}
                                                title={u.active ? 'Desactivar' : 'Activar'}
                                            >
                                                {u.active ? '🚫' : '✅'}
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
                        <h2 className="modal__title">Crear Nuevo Usuario</h2>
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
                                <label>Contraseña Temporal</label>
                                <input
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Rol</label>
                                <select
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                    className="filter-select"
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
                                <button type="submit" className="btn btn--primary">Crear Usuario</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
