import { useState, useRef, useEffect } from 'react';
import './VirtualAssistant.css';

export default function VirtualAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hola, soy Aura. ¿En qué puedo ayudarte hoy con POS Manager?' }
    ]);
    const [input, setInput] = useState('');
    const scrollRef = useRef();

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');

        // Simulación de respuesta basada en las reglas
        setTimeout(() => {
            let response = '';
            const query = input.toLowerCase();

            if (query.includes('delete') || query.includes('drop') || query.includes('truncate')) {
                response = 'Lo siento, sigo una política NO DESTRUCTIVA. No puedo ejecutar comandos DELETE, DROP o TRUNCATE. Los borrados deben ser lógicos (soft delete).';
            } else if (query.includes('secret') || query.includes('api key') || query.includes('.env')) {
                response = 'Tengo prohibido acceder a secretos, archivos .env o llaves de API por seguridad.';
            } else if (query.includes('sql') || query.includes('base de datos')) {
                response = 'No ejecuto SQL directamente. Aquí tienes una sugerencia de migración:\n\n```sql\nALTER TABLE products ADD COLUMN last_check timestamptz;\n```';
            } else {
                response = 'Entendido. Estoy analizando tu petición para mejorar el sistema POS Manager de forma segura.';
            }

            setMessages(prev => [...prev, { role: 'assistant', content: response }]);
        }, 800);
    };

    return (
        <div className={`virtual-assistant ${isOpen ? 'is-open' : ''}`}>
            {/* Trigger Button */}
            <button className="assistant-trigger glass" onClick={() => setIsOpen(!isOpen)}>
                <span className="assistant-icon">🤖</span>
                <span className="assistant-badge">Aura</span>
            </button>

            {/* Chat Window */}
            <div className="assistant-window glass">
                <div className="assistant-header">
                    <div className="assistant-header-info">
                        <h3>Aura</h3>
                        <span className="status-dot"></span>
                        <small>Asistente de Ingeniería</small>
                    </div>
                    <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
                </div>

                <div className="assistant-messages" ref={scrollRef}>
                    {messages.map((m, i) => (
                        <div key={i} className={`message-wrapper ${m.role}`}>
                            <div className="message-bubble">
                                {m.content}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="assistant-input-area">
                    <input
                        type="text"
                        placeholder="Escribe una orden..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <button className="send-btn" onClick={handleSend}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
