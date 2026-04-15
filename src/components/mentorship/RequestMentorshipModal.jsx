import Button from "../Button";

function RequestMentorshipModal({
  mentor,
  availability,
  form,
  onChange,
  onClose,
  onSubmit,
  loading
}) {
  if (!mentor) {
    return null;
  }

  const selectedSlot = availability.find((slot) => String(slot.id) === String(form.availabilitySlotId));
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-3 sm:px-4">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-4 shadow-soft sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Request Mentorship</h2>
            <p className="mt-1 text-sm text-slate-500">
              Send a focused mentorship request to {mentor.name}.
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

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <input
            className="glass-input"
            placeholder="Area of interest"
            value={form.areaOfInterest}
            onChange={(event) => onChange("areaOfInterest", event.target.value)}
          />

          <select
            className="glass-input"
            value={form.sessionMode}
            onChange={(event) => onChange("sessionMode", event.target.value)}
          >
            <option value="Virtual">Virtual</option>
            <option value="In Person">In Person</option>
            <option value="Phone Call">Phone Call</option>
          </select>

          <input
            type="date"
            className="glass-input"
            value={form.requestedDate}
            min={today}
            onChange={(event) => onChange("requestedDate", event.target.value)}
          />

          <input
            type="number"
            min="15"
            max="180"
            step="15"
            className="glass-input"
            placeholder="Duration in minutes"
            value={form.durationMinutes}
            onChange={(event) => onChange("durationMinutes", event.target.value)}
          />

          <select
            className="glass-input md:col-span-2"
            value={form.availabilitySlotId}
            onChange={(event) => onChange("availabilitySlotId", event.target.value)}
          >
            <option value="">Select mentor availability</option>
            {availability.map((slot) => (
              <option key={slot.id} value={slot.id}>
                {slot.dayOfWeek} | {slot.startTime} - {slot.endTime}
              </option>
            ))}
          </select>

          {selectedSlot ? (
            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 md:col-span-2">
              Choose a <span className="font-semibold text-slate-900">{selectedSlot.dayOfWeek}</span> date.
              The selected slot runs from <span className="font-semibold text-slate-900">{selectedSlot.startTime}</span> to{" "}
              <span className="font-semibold text-slate-900">{selectedSlot.endTime}</span>, and the request must be in the future.
            </div>
          ) : null}

          <textarea
            className="glass-input min-h-32 md:col-span-2"
            placeholder="Tell the mentor what you need help with and what outcome you expect."
            value={form.message}
            onChange={(event) => onChange("message", event.target.value)}
          />
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={loading} className="sm:w-auto">
            {loading ? "Sending..." : "Send Request"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default RequestMentorshipModal;
