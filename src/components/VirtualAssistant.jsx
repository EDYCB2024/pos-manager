import { useState, useRef, useEffect } from 'react';
import auraAvatar from '../assets/aura-avatar.png';
import './VirtualAssistant.css';

export default function VirtualAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hola, soy Aura. ¿En qué puedo ayudarte hoy con POS Manager?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef();

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('http://127.0.0.1:3001/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: input, history: messages })
            });

            const data = await response.json();

            if (response.status === 429) {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: '⚠️ Límite de mensajes alcanzado. Por favor, espera unos 30 segundos antes de intentar de nuevo.'
                }]);
            } else if (data.content) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: 'Lo siento, tuve un problema al procesar tu solicitud.' }]);
            }
        } catch (error) {
            console.error('Chat Error:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Error de conexión con mis sistemas centrales.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`virtual-assistant ${isOpen ? 'is-open' : ''}`}>
            {/* Trigger Button */}
            <button className="assistant-trigger glass" onClick={() => setIsOpen(!isOpen)}>
                <div className="assistant-avatar-wrapper">
                    <img src={auraAvatar} alt="Aura" className="assistant-avatar-img" />
                </div>
                <span className="assistant-badge">Aura</span>
            </button>

            {/* Chat Window */}
            <div className="assistant-window glass">
                <div className="assistant-header">
                    <div className="assistant-header-info">
                        <div className="header-avatar-wrapper">
                            <img src={auraAvatar} alt="Aura" className="assistant-avatar-img" />
                            <span className="status-dot"></span>
                        </div>
                        <div>
                            <h3>Aura</h3>
                            <small>Asistente de Ingeniería</small>
                        </div>
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
                        placeholder={isLoading ? "Aura está pensando..." : "Escribe una orden..."}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        disabled={isLoading}
                    />
                    <button className="send-btn" onClick={handleSend} disabled={isLoading || !input.trim()}>
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
