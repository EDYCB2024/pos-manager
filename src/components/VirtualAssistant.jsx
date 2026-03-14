import { useState, useRef, useEffect } from 'react';
import './VirtualAssistant.css';

// URL siempre relativa — Vite proxy reenvía /api → localhost:3001 en dev
// En producción Vercel también maneja /api directamente
const API_URL = '/api/ai-agent';


// Icono del asistente (SVG inline para evitar dependencia de imagen)
function AuraIcon({ size = 32 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="20" fill="url(#aura-gradient)" />
            <path d="M13 20.5C13 16.36 16.36 13 20.5 13C24.64 13 28 16.36 28 20.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <circle cx="20.5" cy="20.5" r="4" fill="white" fillOpacity="0.9" />
            <path d="M20.5 16.5V13" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M24.5 17.5L27 15" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            <defs>
                <linearGradient id="aura-gradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#6366F1" />
                    <stop offset="1" stopColor="#0EA5E9" />
                </linearGradient>
            </defs>
        </svg>
    );
}

// Burbuja de carga animada
function TypingIndicator() {
    return (
        <div className="va-message va-message--assistant">
            <div className="va-avatar"><AuraIcon size={24} /></div>
            <div className="va-bubble va-bubble--typing">
                <span /><span /><span />
            </div>
        </div>
    );
}

// Formatea el texto del asistente: soporta **bold** y saltos de línea
function FormattedMessage({ text }) {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return (
        <span>
            {parts.map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={i}>{part.slice(2, -2)}</strong>;
                }
                return part.split('\n').map((line, j) => (
                    <span key={`${i}-${j}`}>{line}{j < part.split('\n').length - 1 && <br />}</span>
                ));
            })}
        </span>
    );
}

export default function VirtualAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: '¡Hola! Soy **Aura**, tu asistente de POS Manager.\n\nPuedo ayudarte a buscar equipos, crear casos, actualizar estatus y consultar estadísticas.\n\n¿En qué te puedo ayudar hoy?'
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [hasUnread, setHasUnread] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Auto-scroll al último mensaje
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    // Marcar como no leído cuando llega un mensaje y el chat está cerrado
    useEffect(() => {
        const lastMsg = messages[messages.length - 1];
        if (lastMsg?.role === 'assistant' && messages.length > 1 && !isOpen) {
            setHasUnread(true);
        }
    }, [messages, isOpen]);

    // Limpiar unread al abrir
    const handleOpen = () => {
        setIsOpen(true);
        setHasUnread(false);
        setTimeout(() => inputRef.current?.focus(), 150);
    };

    // ── ENVIAR MENSAJE AL AGENTE ──────────────────────────────────────────────
    const sendMessage = async () => {
        const userMessage = input.trim();
        if (!userMessage || isLoading) return;

        // Agregar mensaje del usuario a la UI
        const updatedMessages = [...messages, { role: 'user', content: userMessage }];
        setMessages(updatedMessages);
        setInput('');
        setIsLoading(true);

        try {
            // Construir historial (excluyendo el mensaje actual que acaba de agregar)
            const history = messages.map(m => ({
                role: m.role,
                content: m.content
            }));

            // ── LLAMADA AL BACKEND (/api/ai-agent) ──
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // Incluir cookie de auth
                body: JSON.stringify({
                    message: userMessage,
                    history              // Historial para que Aura tenga contexto
                })
            });

            if (response.status === 401) {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: '🔒 Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.'
                }]);
                return;
            }

            if (response.status === 429) {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: '⏳ Recibí muchas consultas. Espera un momento antes de continuar.'
                }]);
                return;
            }

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();

            // Agregar respuesta del agente
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: data.content || 'No pude obtener una respuesta. Intenta de nuevo.'
            }]);

        } catch (error) {
            console.error('[Chat Error]', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '❌ Error de conexión con Aura. Verifica tu red y vuelve a intentarlo.'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const clearHistory = () => {
        setMessages([{
            role: 'assistant',
            content: '¡Conversación reiniciada! ¿En qué te puedo ayudar?'
        }]);
    };

    return (
        <div className={`va-widget ${isOpen ? 'va-widget--open' : ''}`}>
            {/* Ventana del chat */}
            {isOpen && (
                <div className="va-window glass">
                    {/* Header */}
                    <div className="va-header">
                        <div className="va-header__info">
                            <AuraIcon size={32} />
                            <div>
                                <span className="va-header__name">Aura</span>
                                <span className="va-header__status">
                                    <span className="va-status-dot" />
                                    Asistente IA
                                </span>
                            </div>
                        </div>
                        <div className="va-header__actions">
                            <button
                                className="va-icon-btn"
                                onClick={clearHistory}
                                title="Borrar conversación"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="1 4 1 10 7 10" /><polyline points="23 20 23 14 17 14" />
                                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
                                </svg>
                            </button>
                            <button
                                className="va-icon-btn va-icon-btn--close"
                                onClick={() => setIsOpen(false)}
                                title="Cerrar"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Mensajes */}
                    <div className="va-messages">
                        {messages.map((msg, i) => (
                            <div key={i} className={`va-message va-message--${msg.role}`}>
                                {msg.role === 'assistant' && (
                                    <div className="va-avatar"><AuraIcon size={24} /></div>
                                )}
                                <div className={`va-bubble va-bubble--${msg.role}`}>
                                    <FormattedMessage text={msg.content} />
                                </div>
                            </div>
                        ))}

                        {isLoading && <TypingIndicator />}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Sugerencias rápidas */}
                    {messages.length === 1 && (
                        <div className="va-suggestions">
                            {[
                                '¿Cuántos equipos hay en total?',
                                'Busca el equipo VX520',
                                'Muestra estadísticas'
                            ].map(s => (
                                <button
                                    key={s}
                                    className="va-suggestion-chip"
                                    onClick={() => { setInput(s); inputRef.current?.focus(); }}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <div className="va-input-area">
                        <textarea
                            ref={inputRef}
                            className="va-input"
                            placeholder="Escribe tu consulta... (Enter para enviar)"
                            value={input}
                            rows={1}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isLoading}
                        />
                        <button
                            className="va-send-btn"
                            onClick={sendMessage}
                            disabled={isLoading || !input.trim()}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Botón flotante */}
            <button
                className="va-trigger"
                onClick={isOpen ? () => setIsOpen(false) : handleOpen}
                title="Abrir Aura"
            >
                {isOpen ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                ) : (
                    <AuraIcon size={24} />
                )}
                {hasUnread && !isOpen && <span className="va-unread-dot" />}
            </button>
        </div>
    );
}
