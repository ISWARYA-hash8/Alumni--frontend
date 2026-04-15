import Button from "../Button";

function SessionDetailsModal({ session, form, onChange, onClose, onSubmit, loading }) {
  if (!session) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-3 sm:px-4">
      <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-4 shadow-soft sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Session Details</h2>
            <p className="mt-1 text-sm text-slate-500">
              Add how this mentorship session will happen so the mentee can join on time.
            </p>
          </div>
          <button
            type="button"
            className="rounded-full px-3 py-1 text-sm font-semibold text-slate-500 hover:bg-slate-100"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-semibold text-slate-900">{session.menteeName}</p>
            <p className="mt-1">
              {new Date(session.scheduledAt).toLocaleString()} | {session.sessionMode} | {session.durationMinutes} mins
            </p>
          </div>

          <input
            className="glass-input"
            placeholder="Meeting platform (Google Meet / Zoom / Phone / Campus)"
            value={form.meetingPlatform}
            onChange={(event) => onChange("meetingPlatform", event.target.value)}
          />

          <input
            className="glass-input"
            placeholder={session.sessionMode === "Virtual" ? "Meeting link" : "Optional link or contact detail"}
            value={form.meetingLink}
            onChange={(event) => onChange("meetingLink", event.target.value)}
          />

          <textarea
            className="glass-input min-h-28"
            placeholder="Add meeting notes, venue, preparation points, or contact instructions"
            value={form.meetingNotes}
            onChange={(event) => onChange("meetingNotes", event.target.value)}
          />
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={loading} className="sm:w-auto">
            {loading ? "Saving..." : "Save Details"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default SessionDetailsModal;
