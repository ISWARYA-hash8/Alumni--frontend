import { useState } from "react";
import Button from "../../components/Button";
import PageHeader from "../../components/PageHeader";
import RatingInput from "../../components/RatingInput";
import { submitFeedback } from "../../services/apiService";
import { useToast } from "../../context/ToastContext";
import { getErrorMessage } from "../../utils/errors";

const initialState = {
  message: "",
  rating: 5
};

function Feedback() {
  const [form, setForm] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const { addToast } = useToast();

  const validate = () => {
    const nextErrors = {};

    if (!form.message.trim()) {
      nextErrors.message = "Please share your feedback.";
    }

    if (!form.rating || form.rating < 1 || form.rating > 5) {
      nextErrors.rating = "Please select a rating between 1 and 5.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setSubmitting(true);

    try {
      await submitFeedback({
        message: form.message.trim(),
        rating: form.rating
      });

      addToast("Feedback submitted successfully.", "success");
      setForm(initialState);
      setErrors({});
    } catch (error) {
      addToast(getErrorMessage(error, "Unable to submit feedback."), "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 p-6 md:p-8">
      <PageHeader
        title="Feedback"
        subtitle="Share what is working well and what we should improve next."
      />

      <div className="max-w-3xl rounded-3xl bg-white p-6 shadow-soft md:p-8">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700">Rating</label>
            <RatingInput
              value={form.rating}
              onChange={(rating) => setForm((current) => ({ ...current, rating }))}
              disabled={submitting}
            />
            {errors.rating ? <p className="text-sm text-red-600">{errors.rating}</p> : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700" htmlFor="feedback-message">
              Message
            </label>
            <textarea
              id="feedback-message"
              rows={6}
              value={form.message}
              onChange={(event) =>
                setForm((current) => ({ ...current, message: event.target.value }))
              }
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              placeholder="Tell us what you liked, what was confusing, or what would help you most."
            />
            {errors.message ? <p className="text-sm text-red-600">{errors.message}</p> : null}
          </div>

          <Button type="submit" className="w-full md:w-auto" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default Feedback;
