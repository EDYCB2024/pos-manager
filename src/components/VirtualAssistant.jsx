import { useState, useRef, useEffect } from 'react';
import './VirtualAssistant.css';

// ── Envío del mensaje al backend ──────────────────────────────────────────────
const sendMessage = async (input) => {
    try {
        const response = await fetch('/api/ai-agent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ prompt: input }),
        });

        if (!response.ok) throw new Error(`Error ${response.status}`);

        const data = await response.json();
        return data.message;
    } catch (error) {
        console.error('Error al hablar con la IA:', error);
        throw error;
    }
};

// ── Icono SVG de Aura ─────────────────────────────────────────────────────────
function AuraIcon({ size = 28 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="20" fill="url(#g)" />
            <circle cx="20" cy="20" r="7" fill="white" fillOpacity=".9" />
            <circle cx="20" cy="20" r="3.5" fill="url(#g)" />
            <defs>
                <linearGradient id="g" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#6366F1" />
                    <stop offset="1" stopColor="#0EA5E9" />
                </linearGradient>
            </defs>
        </svg>
    );
}

// ── Indicador de escritura ────────────────────────────────────────────────────
function TypingDots() {
    return (
        <div className="va-message va-message--ai">
            <div className="va-avatar"><AuraIcon size={22} /></div>
            <div className="va-bubble va-bubble--typing">
                <span /><span /><span />
            </div>
        </div>
    );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function VirtualAssistant() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'ai', text: '¡Hola! Soy tu asistente de POS Manager. ¿En qué te ayudo hoy?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const endRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const handleOpen = () => {
        setOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    const handleSend = async () => {
        const text = input.trim();
        if (!text || loading) return;

        setMessages(prev => [...prev, { role: 'user', text }]);
        setInput('');
        setLoading(true);

        try {
            const reply = await sendMessage(text);
            setMessages(prev => [...prev, { role: 'ai', text: reply }]);
        } catch {
            setMessages(prev => [...prev, { role: 'ai', text: '❌ Error de conexión. Intenta de nuevo.' }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKey = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="va-widget">
            {/* Ventana */}
            {open && (
                <div className="va-window">
                    {/* Header */}
                    <div className="va-header">
                        <div className="va-header-info">
                            <AuraIcon size={30} />
                            <div>
                                <p className="va-name">Asistente IA</p>
                                <p className="va-status"><span className="va-dot" /> En línea</p>
                            </div>
                        </div>
                        <button className="va-close" onClick={() => setOpen(false)}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>

                    {/* Mensajes */}
                    <div className="va-messages">
                        {messages.map((m, i) => (
                            <div key={i} className={`va-message va-message--${m.role}`}>
                                {m.role === 'ai' && <div className="va-avatar"><AuraIcon size={22} /></div>}
                                <div className={`va-bubble va-bubble--${m.role}`}>{m.text}</div>
                            </div>
                        ))}
                        {loading && <TypingDots />}
                        <div ref={endRef} />
                    </div>

                    {/* Input */}
                    <div className="va-input-row">
                        <textarea
                            ref={inputRef}
                            className="va-input"
                            placeholder="Escribe tu consulta..."
                            value={input}
                            rows={1}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKey}
                            disabled={loading}
                        />
                        <button className="va-send" onClick={handleSend} disabled={loading || !input.trim()}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Botón flotante */}
            <button className="va-trigger" onClick={open ? () => setOpen(false) : handleOpen}>
                {open
                    ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    : <AuraIcon size={24} />
                }
            </button>
        </div>
    );
}
