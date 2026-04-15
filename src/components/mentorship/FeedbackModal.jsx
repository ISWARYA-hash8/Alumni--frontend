import RatingInput from "../RatingInput";
import Button from "../Button";

function FeedbackModal({ session, form, onChange, onSubmit, onClose, loading }) {
  if (!session) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-3 sm:px-4">
      <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-4 shadow-soft sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Rate Your Mentor</h2>
            <p className="mt-1 text-sm text-slate-500">
              Share feedback for your session with {session.mentorName}.
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

        <div className="mt-6 space-y-5">
          <div>
            <label className="text-sm font-semibold text-slate-700">Rating</label>
            <div className="mt-3">
              <RatingInput value={form.rating} onChange={(value) => onChange("rating", value)} />
            </div>
          </div>

          <textarea
            className="glass-input min-h-32"
            placeholder="What was helpful in this mentorship session?"
            value={form.comment}
            onChange={(event) => onChange("comment", event.target.value)}
          />
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={loading} className="sm:w-auto">
            {loading ? "Submitting..." : "Submit Feedback"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default FeedbackModal;
