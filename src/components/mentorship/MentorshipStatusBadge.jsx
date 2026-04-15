const statusClasses = {
  PENDING: "bg-amber-50 text-amber-600",
  ACCEPTED: "bg-emerald-50 text-emerald-600",
  REJECTED: "bg-rose-50 text-rose-600",
  SCHEDULED: "bg-sky-50 text-sky-600",
  COMPLETED: "bg-indigo-50 text-indigo-600"
};

function MentorshipStatusBadge({ status }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[status] || "bg-slate-100 text-slate-600"}`}>
      {status}
    </span>
  );
}

export default MentorshipStatusBadge;
