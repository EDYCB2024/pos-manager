import React from 'react';
import { useAuth } from '../context/AuthContext';
import './Welcome.css';

export default function Welcome() {
    const { user } = useAuth();

    return (
        <div className="welcome-container">
            <div className="welcome-card">
                <div className="welcome-header">
                    <span className="welcome-icon">👋</span>
                    <h1 className="welcome-title">¡Bienvenido, {user?.name || 'Usuario'}!</h1>
                    <p className="welcome-subtitle">Has ingresado con éxito al sistema POS Manager.</p>
                </div>

                <div className="welcome-content">
                    <p>Usa la barra lateral izquierda para navegar por las diferentes secciones:</p>
                    <ul className="welcome-list">
                        <li><strong>📱 Equipos:</strong> Gestiona casos y lista de dispositivos.</li>
                        <li><strong>📊 Data Center:</strong> Consulta estadísticas y recursos.</li>
                        <li><strong>📦 Inventario:</strong> Control de partes y piezas.</li>
                        <li><strong>⚙️ Ajustes:</strong> Configura tu perfil y preferencias.</li>
                    </ul>
                </div>

                <div className="welcome-footer">
                    <p>Sesión activa como: <strong>{user?.role?.toUpperCase()}</strong></p>
                </div>
            </div>
        </div>
    );
}
