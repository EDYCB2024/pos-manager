import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import cr7Avatar from '../assets/cr7-avatar.png';
import './CR7Bot.css';

export default function CR7Bot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'bot', content: '¡SIUUU! Soy el Comandante CR7. Dime qué necesitas ejecutar.' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef();
    const navigate = useNavigate();

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const executeCommand = (text) => {
        const navMatch = text.match(/\[COMMAND:NAVIGATE:(.+)\]/);
        if (navMatch) {
            const path = navMatch[1].trim();
            navigate(path);
            return '¡Comando ejecutado! Vamos para allá.';
        }

        const addSerialsMatch = text.match(/\[COMMAND:ADD_SERIALS:(.*?)(?::(.*?))?\]/);
        if (addSerialsMatch) {
            const ally = addSerialsMatch[1].trim();
            const serial = addSerialsMatch[2] ? addSerialsMatch[2].trim() : '';
            let url = `/devices/new?aliado=${encodeURIComponent(ally)}`;
            if (serial) url += `&serial=${encodeURIComponent(serial)}`;
            navigate(url);
            return serial
                ? `¡SIUUU! Registrando el serial ${serial} en ${ally}.`
                : `¡SIUUU! Vamos a añadir seriales para ${ally}.`;
        }

        if (text.includes('[COMMAND:MODIFY_STATUS]')) {
            navigate('/search');
            return '¡Entendido! Busca el equipo para modificar su estatus.';
        }

        return null;
    };

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
                body: JSON.stringify({
                    message: input,
                    history: messages.map(m => ({ role: m.role === 'bot' ? 'assistant' : 'user', content: m.content })),
                    persona: 'CR7'
                })
            });

            const data = await response.json();

            if (response.status === 429) {
                setMessages(prev => [...prev, { role: 'bot', content: '¡Calma! Estamos en tiempo de descuento. Espera un poco.' }]);
            } else if (data.content) {
                const cmdFeedback = executeCommand(data.content);
                // Regex no codicioso para limpiar los tags sin barrer el texto intermedio
                const cleanContent = data.content.replace(/\[COMMAND:.*?\]/g, '').trim();

                if (cleanContent) {
                    setMessages(prev => [
                        ...prev,
                        { role: 'bot', content: cleanContent }
                    ]);
                }

                if (cmdFeedback) {
                    setMessages(prev => [...prev, { role: 'bot', content: cmdFeedback }]);
                }
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: 'bot', content: 'Fallo en la táctica. Error de conexión.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`cr7-assistant ${isOpen ? 'is-open' : ''}`}>
            <button className="cr7-trigger" onClick={() => setIsOpen(!isOpen)}>
                <div className="cr7-avatar-wrapper">
                    <img src={cr7Avatar} alt="CR7" className="cr7-avatar-img" />
                </div>
                <span className="cr7-badge">CR7</span>
            </button>

            <div className="cr7-window">
                <div className="cr7-header">
                    <h3>EL COMANDANTE</h3>
                    <button onClick={() => setIsOpen(false)}>×</button>
                </div>

                <div className="cr7-messages" ref={scrollRef}>
                    {messages.map((m, i) => (
                        <div key={i} className={`cr7-msg ${m.role}`}>
                            {m.content}
                        </div>
                    ))}
                </div>

                <div className="cr7-input-area">
                    <input
                        placeholder={isLoading ? "CR7 está calentando..." : "Orden directa..."}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleSend()}
                        disabled={isLoading}
                    />
                    <button onClick={handleSend} disabled={isLoading}>SIUUU</button>
                </div>
            </div>
        </div>
    );
}
