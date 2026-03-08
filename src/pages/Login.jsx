import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export default function Login() {
    const { login, user } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Redirige si el usuario ya está con sesión
    useEffect(() => {
        if (user) {
            navigate('/', { replace: true });
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setIsSubmitting(true);

        try {
            const { success, error } = await login(email, password);
            if (success) {
                navigate('/');
            } else {
                setErrorMsg(error || 'Error al iniciar sesión');
            }
        } catch (error) {
            setErrorMsg('Hubo un problema de conexión. Intente luego.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-glow-1"></div>
            <div className="login-glow-2"></div>

            <div className="login-card">
                <div className="login-header">
                    <div className="login-icon-wrap">
                        <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" stroke="currentColor" fill="rgba(0, 212, 255, 0.1)" y="3" width="20" height="14" rx="2" ry="2"></rect>
                            <line x1="2" y1="10" x2="22" y2="10"></line>
                            <path d="M7 21h10"></path>
                            <path d="M12 17v4"></path>
                            <path d="M20 21h2"></path>
                            <path d="M2 21h2"></path>
                        </svg>
                    </div>
                    <h1 className="login-title">POS Manager</h1>
                    <p className="login-sub">Acceso administrativo al sistema</p>
                </div>

                <form className="login-form" onSubmit={handleSubmit}>
                    {errorMsg && (
                        <div className="login-error">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                            {errorMsg}
                        </div>
                    )}

                    <div className="login-field">
                        <label htmlFor="email">Correo Electrónico</label>
                        <input
                            type="email"
                            id="email"
                            autoComplete="email"
                            placeholder="usuario@ejemplo.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="login-field">
                        <label htmlFor="password">Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="login-btn" disabled={isSubmitting}>
                        {isSubmitting ? 'Autenticando...' : 'Iniciar Sesión'}
                    </button>
                </form>
            </div>
        </div>
    );
}
