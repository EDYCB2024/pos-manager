export default function StatCard({ label, value, color, icon, svgIcon }) {
    return (
        <div className={`stat-card stat-card--${color} glass anim-fadeUp`}>
            <div className="stat-card__accent"></div>
            <div className="stat-card__icon">
                {svgIcon ? svgIcon : icon}
            </div>
            <div className="stat-card__body">
                <span className="stat-card__value">{value}</span>
                <span className="stat-card__label">{label}</span>
            </div>
        </div>
    );
}
