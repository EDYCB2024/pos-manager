import './StatCard.css';

export default function StatCard({ label, value, color, icon }) {
    return (
        <div className={`stat-card stat-card--${color}`}>
            <div className="stat-card__icon">{icon}</div>
            <div className="stat-card__body">
                <span className="stat-card__value">{value}</span>
                <span className="stat-card__label">{label}</span>
            </div>
        </div>
    );
}
