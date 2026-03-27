import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageSquare, X, Bot, Loader2, Sparkles, Package, Search } from 'lucide-react';
import './ChatWindow.css';

export default function ChatWindow() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch('/api/assistant/history', {
          credentials: 'include'
        });
        const data = await res.json();

        if (data.history && data.history.length > 0) {
          setMessages(data.history.map(msg => ({
            role: msg.role,
            id: msg.id,
            content: msg.content
          })));
        } else {
          setMessages([
            {
              role: "assistant",
              id: "initial",
              content: "¡Hola! Soy Nexus AI, tu asistente avanzado para POS Manager. 🚀\n\nAhora tengo acceso directo al sistema y puedo:\n• **Rastrear envíos de Zoom** por número de guía.\n• **Consultar estatus** de cualquier equipo por su serial.\n• **Registrar nuevos casos** en el Histórico ATC y Laboratorio.\n• **Generar reportes** de días específicos (ej: 'dame el reporte de hoy').\n• **Actualizar el estatus** de reparación o del caso.\n\n¿En qué puedo ayudarte hoy?",
            }
          ]);
        }
      } catch (error) {
        console.error("Error loading chat history:", error);
        setMessages([
          {
            role: "assistant",
            id: "initial",
            content: "¡Hola! Soy Nexus AI, tu asistente avanzado para POS Manager. 🚀\n\nHubo un problema cargando tu historial, pero estoy listo para ayudarte. ¿Qué necesitas hoy?",
          }
        ]);
      }
    };

    fetchHistory();
  }, []);

  const renderContent = (content) => {
    if (!content) return null;

    // Split by lines and process each line
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      let processedLine = line;

      // Handle Bold (**text**)
      const parts = processedLine.split(/(\*\*.*?\*\*)/g);
      const elements = parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      // Handle Bullets (• or *)
      if (line.trim().startsWith('•') || line.trim().startsWith('*')) {
        const bulletText = line.trim().substring(1).trim();
        return (
          <div key={idx} className="chat-list-item">
            <span className="bullet-dot">•</span>
            <span>
              {bulletText.split(/(\*\*.*?\*\*)/g).map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return <strong key={i}>{part.slice(2, -2)}</strong>;
                }
                return part;
              })}
            </span>
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
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      const data = await response.json().catch(() => ({ error: "Respuesta no válida" }));

      if (!response.ok || data.error) {
        throw new Error(data.error || `Error ${response.status}`);
      }

      setMessages((prev) => [...prev, {
        role: "assistant",
        id: (Date.now() + 1).toString(),
        content: data.content
      }]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          id: (Date.now() + 1).toString(),
          content: `Lo siento, hubo un problema: ${error.message}. Por favor intenta de nuevo.`
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 260, damping: 20 }
    }
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
                  <span className="subtitle">Asistente Inteligente</span>
                </div>
              </div>
              <button className="close-btn" onClick={() => setIsOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="chat-messages">
              {messages.map((m, i) => (
                <motion.div
                  key={m.id}
                  variants={messageVariants}
                  initial="hidden"
                  animate="visible"
                  className={`message-row ${m.role}`}
                >
                  <div className="message-bubble">
                    {renderContent(m.content)}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="message-row assistant"
                >
                  <div className="message-bubble loading-bubble">
                    <Loader2 className="animate-spin" size={18} />
                    <span>Nexus está pensando...</span>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-container">
              {messages.length < 5 && !isLoading && (
                <div className="chat-suggestions">
                  {[
                    { icon: <Package size={14} />, text: "Rastrear guía Zoom" },
                    { icon: <Search size={14} />, text: "Estatus del serial: " },
                    { icon: <Sparkles size={14} />, text: "Reporte de hoy" },
                    { icon: <Bot size={14} />, text: "Registrar caso ATC" }
                  ].map((s, i) => (
                    <button
                      key={i}
                      className="suggestion-pill"
                      onClick={() => setInput(s.text)}
                    >
                      {s.icon}
                      <span>{s.text}</span>
                    </button>
                  ))}
                </div>
              )}
              <form onSubmit={handleSubmit} className="input-form">
                <textarea
                  placeholder="Escribe tu mensaje aquí..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
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
