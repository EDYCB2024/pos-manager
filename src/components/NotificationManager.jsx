import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getNotifications, addNotification, deleteNotification } from '../store';
import './NotificationManager.css';

const DAYS = [
    { id: 1, label: 'L' },
    { id: 2, label: 'M' },
    { id: 3, label: 'M' },
    { id: 4, label: 'J' },
    { id: 5, label: 'V' },
    { id: 6, label: 'S' },
    { id: 0, label: 'D' },
];

const PRIORITIES = [
    { id: 'baja', label: 'Baja', color: '#22C55E' },
    { id: 'media', label: 'Media', color: '#6366F1' },
    { id: 'alta', label: 'Alta', color: '#EF4444' },
];

export default function NotificationManager({ isOpen, onClose }) {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('list'); // 'list' or 'form'
    
    // Form state
    const [description, setDescription] = useState('');
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('10:00');
    const [selectedDays, setSelectedDays] = useState([1, 2, 3, 4, 5]); // Mon-Fri by default
    const [priority, setPriority] = useState('media');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen && user) {
            loadNotifications();
        }
    }, [isOpen, user]);

    async function loadNotifications() {
        setLoading(true);
        try {
            const data = await getNotifications(user.id);
            setNotifications(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const toggleDay = (dayId) => {
        setSelectedDays(prev => 
            prev.includes(dayId) ? prev.filter(d => d !== dayId) : [...prev, dayId]
        );
    };

    async function handleSubmit(e) {
        e.preventDefault();
        if (!description || selectedDays.length === 0) return;

        setSubmitting(true);
        try {
            await addNotification({
                user_id: user.id,
                description,
                days: selectedDays,
                start_time: startTime,
                end_time: endTime || null,
                priority
            });
            resetForm();
            setView('list');
            loadNotifications();
        } catch (error) {
            alert('Error al crear notificación: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDelete(id) {
        if (!window.confirm('¿Eliminar este recordatorio?')) return;
        try {
            await deleteNotification(id);
            loadNotifications();
        } catch (error) {
            console.error(error);
        }
    }

    const resetForm = () => {
        setDescription('');
        setStartTime('09:00');
        setEndTime('10:00');
        setSelectedDays([1, 2, 3, 4, 5]);
        setPriority('media');
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal modal--wide notification-manager glass anim-fadeUp" onClick={e => e.stopPropagation()}>
                <div className="modal__header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="notif-icon-circle">🔔</div>
                        <h3 className="modal__title">Gestor de Recordatorios</h3>
                    </div>
                    <button className="modal__close" onClick={onClose}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                    </button>
                </div>

                <div className="modal__body notif-manager-body">
                    {view === 'list' ? (
                        <div className="notif-list-view">
                            <div className="notif-actions-top">
                                <p className="notif-count">{notifications.length} recordatorios activos</p>
                                <button className="btn btn--primary btn--sm" onClick={() => setView('form')}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                                    Nuevo Recordatorio
                                </button>
                            </div>

                            {loading ? (
                                <div className="notif-loading">
                                    <div className="loader-ring"></div>
                                    <p>Cargando tus recordatorios...</p>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="notif-empty">
                                    <div className="notif-empty-icon">📅</div>
                                    <p>No tienes recordatorios fijos creados.</p>
                                    <button className="btn btn--ghost btn--sm" onClick={() => setView('form')}>Empezar a crear</button>
                                </div>
                            ) : (
                                <div className="notif-grid">
                                    {notifications.map(n => (
                                        <div key={n.id} className={`notif-card priority-${n.priority}`}>
                                            <div className="notif-card__priority-bar"></div>
                                            <div className="notif-card__content">
                                                <div className="notif-card__header">
                                                    <span className="notif-priority-tag">{n.priority}</span>
                                                    <button className="notif-delete-btn" onClick={() => handleDelete(n.id)}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                                    </button>
                                                </div>
                                                <p className="notif-desc">{n.description}</p>
                                                <div className="notif-footer">
                                                    <div className="notif-time">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                                        {n.start_time.slice(0,5)} {n.end_time ? `- ${n.end_time.slice(0,5)}` : ''}
                                                    </div>
                                                    <div className="notif-days">
                                                        {DAYS.map(d => (
                                                            <span key={d.id} className={`notif-day-dot ${n.days.includes(d.id) ? 'active' : ''}`} title={d.label}></span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <form className="notif-form" onSubmit={handleSubmit}>
                            <div className="form-section">
                                <label className="form-label">Descripción del Recordatorio</label>
                                <textarea 
                                    className="form-input" 
                                    rows="3" 
                                    placeholder="Ej: Revisar casos ATC pendientes..."
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-grid">
                                <div className="form-section">
                                    <label className="form-label">Hora Inicio</label>
                                    <input 
                                        type="time" 
                                        className="form-input" 
                                        value={startTime}
                                        onChange={e => setStartTime(e.target.value)}
                                        required 
                                    />
                                </div>
                                <div className="form-section">
                                    <label className="form-label">Hora Fin (Opcional)</label>
                                    <input 
                                        type="time" 
                                        className="form-input" 
                                        value={endTime}
                                        onChange={e => setEndTime(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="form-section">
                                <label className="form-label">Días de la Semana</label>
                                <div className="days-picker">
                                    {DAYS.map(d => (
                                        <button 
                                            key={d.id}
                                            type="button"
                                            className={`day-btn ${selectedDays.includes(d.id) ? 'active' : ''}`}
                                            onClick={() => toggleDay(d.id)}
                                        >
                                            {d.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="form-section">
                                <label className="form-label">Prioridad</label>
                                <div className="priority-picker">
                                    {PRIORITIES.map(p => (
                                        <button
                                            key={p.id}
                                            type="button"
                                            className={`priority-btn ${priority === p.id ? 'active' : ''}`}
                                            style={{ '--p-color': p.color }}
                                            onClick={() => setPriority(p.id)}
                                        >
                                            <span className="p-dot"></span>
                                            {p.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="form-footer">
                                <button type="button" className="btn btn--ghost" onClick={() => setView('list')}>Cancelar</button>
                                <button type="submit" className="btn btn--primary" disabled={submitting}>
                                    {submitting ? 'Creando...' : 'Crear Recordatorio'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
