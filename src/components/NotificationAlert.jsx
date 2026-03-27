import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getNotifications } from '../store';
import './NotificationAlert.css';

export default function NotificationAlert() {
    const { user } = useAuth();
    const [activeNotif, setActiveNotif] = useState(null);
    const [allNotifs, setAllNotifs] = useState([]);

    // Poll for notifications every minute
    useEffect(() => {
        if (!user) return;

        const checkNotifs = async () => {
            try {
                const data = await getNotifications(user.id);
                setAllNotifs(data);
                
                const now = new Date();
                const dayIdx = now.getDay();
                const currentTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
                const dateStr = now.toLocaleDateString('sv-SE');

                // Find first active notification not confirmed today
                const triggered = data.find(n => {
                    const isToday = n.days.includes(dayIdx);
                    const isTimeMatched = currentTime >= n.start_time.slice(0, 5) && 
                                          (!n.end_time || currentTime <= n.end_time.slice(0, 5));
                    const confirmedKey = `notif_done_${n.id}_${dateStr}`;
                    const isConfirmed = localStorage.getItem(confirmedKey) === 'true';

                    return isToday && isTimeMatched && !isConfirmed;
                });

                if (triggered && (!activeNotif || activeNotif.id !== triggered.id)) {
                    setActiveNotif(triggered);
                }
            } catch (error) {
                console.error('Error checking notifications:', error);
            }
        };

        checkNotifs();
        const interval = setInterval(checkNotifs, 60000); // 1 minute
        return () => clearInterval(interval);
    }, [user, activeNotif]);

    const handleConfirm = () => {
        const dateStr = new Date().toLocaleDateString('sv-SE');
        localStorage.setItem(`notif_done_${activeNotif.id}_${dateStr}`, 'true');
        setActiveNotif(null);
    };

    const handleSnooze = () => {
        // Just close for now, it will reappear in 1 minute since it's not confirmed
        setActiveNotif(null);
    };

    if (!activeNotif) return null;

    return (
        <div className="modal-overlay alert-overlay">
            <div className={`modal alert-modal priority-border-${activeNotif.priority} anim-bounceIn`}>
                <div className="alert-header">
                    <div className={`alert-badge priority-${activeNotif.priority}`}>
                        <span className="alert-dot"></span>
                        RECORDATORIO {activeNotif.priority.toUpperCase()}
                    </div>
                </div>
                
                <div className="alert-body">
                    <div className="alert-icon">💡</div>
                    <p className="alert-message">{activeNotif.description}</p>
                    <p className="alert-question">¿Has completado esta tarea?</p>
                </div>

                <div className="alert-footer">
                    <button className="btn btn--ghost alert-btn-no" onClick={handleSnooze}>
                        No, aún no
                    </button>
                    <button className="btn btn--primary alert-btn-yes" onClick={handleConfirm}>
                        Sí, completado
                    </button>
                </div>
            </div>
        </div>
    );
}
