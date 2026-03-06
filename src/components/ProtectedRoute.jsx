import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ allowedRoles }) {
    const { user, loading } = useAuth();

    if (loading) {
        // Pantalla de carga mientras se verifica el JWT
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-primary)' }}>
                <p style={{ color: 'var(--text-color, white)', fontSize: '1.2rem' }}>Verificando sesión...</p>
            </div>
        );
    }

    if (!user) {
        // Redirigir al inicio de sesión si no hay usuario autenticado
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Fallback o denegación si no tiene el rol
        return (
            <div style={{ padding: '24px', textAlign: 'center', color: '#ef4444' }}>
                <h2>Acceso Denegado</h2>
                <p>Tu rol <b>{user.role}</b> no tiene permisos para ver esta página.</p>
                <Navigate to="/" replace />
            </div>
        );
    }

    // Si tiene acceso, renderiza la ruta o hijos
    return <Outlet />;
}
