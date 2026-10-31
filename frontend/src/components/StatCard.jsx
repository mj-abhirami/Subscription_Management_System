
function StatCard({ title, value, subtitle, icon: Icon, color }) {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <span className="stat-title">{title}</span>

        <div className={`stat-icon ${color}`}>
          <Icon size={20} />
        </div>
      </div>

      <h2 className="stat-value">{value}</h2>

      <p className="stat-subtitle">{subtitle}</p>
    </div>
  );
}

export default StatCard;
