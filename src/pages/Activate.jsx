import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './Login.css'; // Reusing login styles for consistency

export default function Activate() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');

        if (password !== confirmPassword) {
            setErrorMsg('Las contraseñas no coinciden');
            return;
        }

        setIsSubmitting(true);

        try {
            const res = await fetch('/api/auth/activate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password })
            });

            const data = await res.json();

            if (res.ok) {
                setSuccessMsg('¡Cuenta activada con éxito! Redirigiendo al login...');
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                setErrorMsg(data.error || 'Error al activar la cuenta');
            }
        } catch (error) {
            setErrorMsg('Error de conexión. Intente luego.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!token) {
        return (
            <div className="login-wrapper">
                <div className="login-card">
                    <div className="login-header">
                        <h1 className="login-title">Token Inválido</h1>
                        <p className="login-sub">No se encontró un token de activación válido.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="login-wrapper">
            <div className="login-card">
                <div className="login-header">
                    <span className="login-icon">🔒</span>
                    <h1 className="login-title">Activar Cuenta</h1>
                    <p className="login-sub">Configura tu contraseña para comenzar</p>
                </div>

                {successMsg ? (
                    <div className="login-success" style={{ color: '#10b981', textAlign: 'center', padding: '20px' }}>
                        {successMsg}
                    </div>
                ) : (
                    <form className="login-form" onSubmit={handleSubmit}>
                        {errorMsg && <div className="login-error">{errorMsg}</div>}

                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '15px' }}>
                            La contraseña debe tener al menos 10 caracteres, una mayúscula, un número y un símbolo.
                        </p>

                        <div className="login-field">
                            <label htmlFor="password">Nueva Contraseña</label>
                            <input
                                type="password"
                                id="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="login-field">
                            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" className="login-btn" disabled={isSubmitting}>
                            {isSubmitting ? 'Activando...' : 'Activar mi Cuenta'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
