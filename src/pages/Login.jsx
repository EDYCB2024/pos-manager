import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';
import { 
    LayoutDashboard, 
    ShieldCheck, 
    Zap, 
    Monitor, 
    AtSign, 
    Lock, 
    Eye, 
    EyeOff, 
    ArrowRight,
    Search
} from 'lucide-react';

export default function Login() {
    const { login, user, loginAsDemo } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

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
                setErrorMsg(error || 'Credenciales incorrectas. Verifique su acceso.');
            }
        } catch (error) {
            setErrorMsg('Error de conexión con el servidor.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="login-page-container">
            {/* --- Lado Izquierdo: Hero --- */}
            <div className="login-hero-section">
                <div className="login-hero-header">
                    <div className="logo-wrap">
                        <div className="logo-icon">
                            <LayoutDashboard size={24} />
                        </div>
                        <span>POS Manager</span>
                    </div>
                </div>

                <div className="hero-main-content">
                    <h1>Gestión total, resultados reales.</h1>
                    <p>
                        La plataforma avanzada nacida para optimizar el ciclo de vida 
                        de tus puntos de venta y dispositivos electrónicos.
                    </p>

                    <div className="hero-features">
                        <div className="feature-item">
                            <div className="feature-icon"><Zap size={20} /></div>
                            <div className="feature-text">
                                <h4>Gestión Ágil</h4>
                                <p>Control de ingresos y salidas en tiempo real.</p>
                            </div>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon"><ShieldCheck size={20} /></div>
                            <div className="feature-text">
                                <h4>Seguridad Pro</h4>
                                <p>Acceso cifrado y logs de auditoría.</p>
                            </div>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon"><Monitor size={20} /></div>
                            <div className="feature-text">
                                <h4>Nexus AI</h4>
                                <p>Asistente avanzado con memoria inteligente.</p>
                            </div>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon"><Search size={20} /></div>
                            <div className="feature-text">
                                <h4>Rastreo de Equipos</h4>
                                <p>Consulta el estatus de tus dispositivos al instante.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="hero-footer">
                    © 2026 POS Manager • Sistema Administrativo Global
                </div>
            </div>

            {/* --- Lado Derecho: Formulario --- */}
            <div className="login-form-section">
                <div className="login-card-pro">
                    <div className="card-header">
                        <h2>Bienvenido</h2>
                        <p>Inicie sesión para acceder al panel administrativo</p>
                    </div>

                    <div className="login-entry-cta">
                        <p className="entry-tagline">
                            Experimenta el futuro de la gestión POS.
                        </p>
                        
                        {errorMsg && (
                            <div className="error-alert-pro">
                                <ShieldCheck size={18} />
                                {errorMsg}
                            </div>
                        )}

                        <button 
                            type="button" 
                            className="login-btn-pro hero-cta" 
                            onClick={async () => {
                                setIsSubmitting(true);
                                const { success, error } = await loginAsDemo();
                                if (success) {
                                    navigate('/');
                                } else {
                                    setErrorMsg(error || 'Error al iniciar demo.');
                                    setIsSubmitting(false);
                                }
                            }} 
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                'Configurando...'
                            ) : (
                                <>
                                    Comenzar ahora <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                        
                        <p className="demo-hint text-center muted mt-4">
                           Acceso libre para demostración • Sin necesidad de credenciales
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
