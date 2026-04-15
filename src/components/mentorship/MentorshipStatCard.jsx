function MentorshipStatCard({ title, value, accent }) {
  return (
    <div className="glass-card p-5">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">{title}</p>
      <p className={`mt-4 text-3xl font-bold ${accent}`}>{value}</p>
    </div>
  );
}

export default MentorshipStatCard;
