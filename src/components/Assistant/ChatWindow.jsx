import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageSquare, X, Bot, Loader2, Sparkles, Package, Search } from 'lucide-react';
import './ChatWindow.css';

export default function ChatWindow() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      id: "initial",
      content: "¡Hola! Soy Nexus AI, tu asistente avanzado para POS Manager. 🚀\n\n**Nota de Demostración:**\nActualmente te encuentras en la versión **Demo Offline**. Las capacidades completas de procesamiento de lenguaje natural y automatización están reservadas para la **Versión Pro**.\n\nEn esta demo, puedo mostrarte cómo interactuaría el sistema si estuviera conectado.",
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = {
      role: "user",
      id: Date.now().toString(),
      content: input
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simular retraso de pensamiento
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          id: (Date.now() + 1).toString(),
          content: "⚠️ **Función de Pro-Versión**\n\nEsta es una respuesta simulada. En la versión completa, Nexus AI puede procesar tu solicitud: *'"+userMessage.content+"'*, ejecutar acciones en la base de datos y generar reportes inteligentes.\n\nPara esta demostración, la conexión con la API de IA ha sido deshabilitada."
        },
      ]);
      setIsLoading(false);
    }, 1200);
  };

  const renderContent = (content) => {
    if (!content) return null;
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const elements = parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      if (line.trim().startsWith('•') || line.trim().startsWith('*')) {
        return (
          <div key={idx} className="chat-list-item">
            <span className="bullet-dot">•</span>
            <span>{elements}</span>
          </div>
        );
      }

      return (
        <div key={idx} className="chat-line">
          {elements}
          {idx < lines.length - 1 && lines[idx + 1] === '' && <br />}
        </div>
      );
    });
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 260, damping: 20 } }
  };

  return (
    <div className="chat-window">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 40, rotate: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 40, rotate: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="chat-panel"
          >
            <div className="chat-header">
              <div className="header-info">
                <div className="bot-icon">
                  <MessageSquare size={22} fill="currentColor" />
                  <div className="online-indicator"></div>
                </div>
                <div>
                  <h3>Nexus AI</h3>
                  <span className="subtitle">Modo Demo Offline</span>
                </div>
              </div>
              <button className="close-btn" onClick={() => setIsOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="chat-messages">
              {messages.map((m) => (
                <motion.div key={m.id} variants={messageVariants} initial="hidden" animate="visible" className={`message-row ${m.role}`}>
                  <div className="message-bubble">{renderContent(m.content)}</div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="message-row assistant">
                  <div className="message-bubble loading-bubble">
                    <Loader2 className="animate-spin" size={18} />
                    <span>Nexus simulando respuesta...</span>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-container">
              <form onSubmit={handleSubmit} className="input-form">
                <textarea
                  placeholder="Escribe tu mensaje aquí..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }}
                  disabled={isLoading}
                  rows="1"
                />
                <button type="submit" className="send-button" disabled={isLoading || !input.trim()}>
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05, y: -4 }}
        whileTap={{ scale: 0.95 }}
        className={`chat-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={32} /> : <MessageSquare size={32} />}
      </motion.button>
    </div>
  );
}
