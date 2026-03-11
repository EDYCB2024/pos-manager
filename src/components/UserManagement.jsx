import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import '../pages/Users.css';
import '../pages/shared.css';

export default function UserManagement() {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isDeleteMode, setIsDeleteMode] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]); // Array of IDs
    const [editingValues, setEditingValues] = useState({}); // { userId: { name: '...' } }
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

    const handleUpdateRole = async (id, newRole, newName) => {
        try {
            const res = await fetch(`/api/users/update?id=${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    role: newRole,
                    name: newName || users.find(u => u.id === id)?.name
                })
            });
            if (res.ok) fetchUsers();
            else {
                const data = await res.json();
                alert(data.error || 'Error al actualizar el usuario');
            }
        } catch (err) {
            console.error(err);
            alert('Error de conexión');
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

    const handleBulkDelete = async () => {
        if (selectedUsers.length === 0) {
            alert('Selecciona al menos un usuario para eliminar.');
            return;
        }

        const confirmed = window.confirm(`¿Seguro que deseas eliminar a los ${selectedUsers.length} usuarios seleccionados? Esta acción es permanente.`);
        if (!confirmed) return;

        setLoading(true);
        try {
            for (const id of selectedUsers) {
                await fetch(`/api/users/delete?id=${id}`, { method: 'DELETE' });
            }
            setSelectedUsers([]);
            setIsDeleteMode(false);
            fetchUsers();
        } catch (err) {
            alert('Error durante la eliminación masiva.');
        } finally {
            setLoading(false);
        }
    };

    const toggleSelection = (id) => {
        if (id === user.id) return; // Prevent selecting self
        setSelectedUsers(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    if (user?.role !== 'admin' && user?.role !== 'supervisor') return null;

    return (
        <div className="users-container anim-fadeUp">
            <header className="page-header" style={{ alignItems: 'center' }}>
                <div>
                    <h2 className="page-title">Gestión de Usuarios</h2>
                    <p className="page-sub">Administra los accesos y roles del sistema.</p>
                </div>
                <div className="page-header__actions">
                    <button
                        className={`btn ${isEditMode ? 'btn--primary' : 'btn--secondary'}`}
                        onClick={() => {
                            setIsEditMode(!isEditMode);
                            setIsDeleteMode(false);
                        }}
                    >
                        <span>{isEditMode ? '✅ Guardar' : '📝 Editar'}</span>
                    </button>
                    <button
                        className={`btn ${isDeleteMode ? 'btn--danger' : 'btn--secondary'}`}
                        onClick={() => {
                            if (isDeleteMode && selectedUsers.length > 0) {
                                handleBulkDelete();
                            } else {
                                setIsDeleteMode(!isDeleteMode);
                                setIsEditMode(false);
                                if (!isDeleteMode) setSelectedUsers([]);
                            }
                        }}
                    >
                        <span>
                            {isDeleteMode
                                ? (selectedUsers.length > 0 ? `🔥 Confirmar (${selectedUsers.length})` : '🚫 Cancelar')
                                : '🗑️ Eliminar'}
                        </span>
                    </button>
                    <button
                        className="btn btn--primary"
                        onClick={() => setShowModal(true)}
                    >
                        <span>➕ Nuevo</span>
                    </button>
                </div>
            </header>

            <div className="table-container">
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
                                {isDeleteMode && <th style={{ width: '40px', minWidth: '40px' }}>Select</th>}
                                <th>Nombre</th>
                                <th>Email</th>
                                <th>Rol</th>
                                <th>Estado</th>
                                <th style={{ textAlign: 'right' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id} className={`data-table__row ${selectedUsers.includes(u.id) ? 'row-selected' : ''}`}>
                                    {isDeleteMode && (
                                        <td style={{ textAlign: 'center' }}>
                                            <input
                                                type="checkbox"
                                                checked={selectedUsers.includes(u.id)}
                                                onChange={() => toggleSelection(u.id)}
                                                disabled={u.id === user.id}
                                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                            />
                                        </td>
                                    )}
                                    <td>
                                        {isEditMode ? (
                                            <input
                                                type="text"
                                                className="search-box__input"
                                                style={{ padding: '6px 10px', width: '100%', minWidth: '150px' }}
                                                value={editingValues[u.id]?.name ?? u.name}
                                                onChange={(e) => setEditingValues({
                                                    ...editingValues,
                                                    [u.id]: { ...editingValues[u.id], name: e.target.value }
                                                })}
                                                onBlur={() => {
                                                    const newName = editingValues[u.id]?.name;
                                                    if (newName && newName !== u.name) {
                                                        handleUpdateRole(u.id, u.role, newName);
                                                    }
                                                }}
                                            />
                                        ) : (
                                            <strong>{u.name}</strong>
                                        )}
                                    </td>
                                    <td>{u.email}</td>
                                    <td>
                                        <select
                                            value={u.role}
                                            onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                                            className={`role-badge role-${u.role}`}
                                            disabled={user.id === u.id}
                                            style={{ cursor: user.id === u.id ? 'not-allowed' : 'pointer' }}
                                        >
                                            <option value="admin">Admin</option>
                                            <option value="supervisor">Supervisor</option>
                                            <option value="tecnico">Técnico</option>
                                            <option value="visor">Visor</option>
                                        </select>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${u.active ? 'status-listo' : 'status-sin-reparacion'}`}>
                                            {u.active ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div className="action-btns" style={{ justifyContent: 'flex-end' }}>
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
                                                className={`btn-icon btn-icon--danger ${isDeleteMode ? 'shimmer' : ''}`}
                                                onClick={() => handleDeleteUser(u.id, u.name)}
                                                title="Eliminar Usuario"
                                                disabled={user.id === u.id}
                                                style={{
                                                    opacity: user.id === u.id ? 0.5 : 1,
                                                    cursor: user.id === u.id ? 'not-allowed' : 'pointer',
                                                    transform: isDeleteMode ? 'scale(1.1)' : 'scale(1)',
                                                    boxShadow: isDeleteMode ? '0 0 10px rgba(239, 68, 68, 0.3)' : 'none',
                                                    borderColor: isDeleteMode ? '#f87171' : 'rgba(239, 68, 68, 0.1)'
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
                        <header style={{ marginBottom: '20px' }}>
                            <h2 className="modal__title">Invitar Nuevo Usuario</h2>
                            <p className="page-sub">Se enviará un correo de invitación para que el usuario configure su contraseña.</p>
                        </header>

                        <form onSubmit={handleCreateUser} className="user-form">
                            <div className="form-group">
                                <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Nombre Completo</label>
                                <input
                                    type="text"
                                    className="search-box__input"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Correo Electrónico</label>
                                <input
                                    type="email"
                                    className="search-box__input"
                                    required
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Rol</label>
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

