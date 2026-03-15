import { useState, useRef, useEffect } from 'react';
import './VirtualAssistant.css';

const sendMessage = async (input, history) => {
    try {
        const response = await fetch('/api/ai-agent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ prompt: input, history }),
        });
        if (!response.ok) throw new Error(`Status ${response.status}`);
        const data = await response.json();
        return data.message;
    } catch (error) {
        console.error('Fetch Error:', error);
        throw error;
    }
};

function BotIcon({ size = 28 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <rect x="2" y="6" width="20" height="12" rx="2" stroke="white" strokeWidth="2" />
            <path d="M7 12H7.01M17 12H17.01" stroke="white" strokeWidth="3" strokeLinecap="round" />
            <path d="M10 15H14" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <path d="M12 2V6" stroke="white" strokeWidth="2" />
            <circle cx="12" cy="2" r="1" fill="white" />
        </svg>
    );
}

export default function VirtualAssistant() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Asistente Operativo listo. ¿En qué puedo ayudarte con la gestión de casos hoy?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const endRef = useRef(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const handleSend = async () => {
        const text = input.trim();
        if (!text || loading) return;

        const newMessages = [...messages, { role: 'user', content: text }];
        setMessages(newMessages);
        setInput('');
        setLoading(true);

        try {
            const history = newMessages.slice(-5);
            const reply = await sendMessage(text, history);
            setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Servicio no disponible. Verifica la configuración.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="va-widget">
            {open && (
                <div className="va-window">
                    <div className="va-header">
                        <div className="va-header-info">
                            <div className="va-icon-bg"><BotIcon size={20} /></div>
                            <div>
                                <p className="va-name">Asistente Ops</p>
                                <p className="va-status">RAG Conectado</p>
                            </div>
                        </div>
                        <button className="va-close" onClick={() => setOpen(false)}>×</button>
                    </div>

                    <div className="va-messages">
                        {messages.map((m, i) => (
                            <div key={i} className={`va-message va-message--${m.role}`}>
                                <div className="va-bubble">{m.content}</div>
                            </div>
                        ))}
                        {loading && <div className="va-loading">Analizando registros...</div>}
                        <div ref={endRef} />
                    </div>

                    <div className="va-input-row">
                        <input
                            className="va-input"
                            placeholder="Escribe una tarea o búsqueda..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            disabled={loading}
                        />
                        <button className="va-send" onClick={handleSend} disabled={loading}>
                            →
                        </button>
                    </div>
                </div>
            )}
            <button className={`${open ? 'va-trigger va-trigger--active' : 'va-trigger'}`} onClick={() => setOpen(!open)}>
                <BotIcon size={24} />
            </button>
        </div>
    );
}
