import { useEffect, useMemo, useState } from "react";
import Loader from "../../components/Loader";
import Pagination from "../../components/Pagination";
import PageHeader from "../../components/PageHeader";
import { getAllFeedback } from "../../services/apiService";
import { useToast } from "../../context/ToastContext";
import { getErrorMessage } from "../../utils/errors";

function AdminFeedback() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const { addToast } = useToast();
  const pageSize = 6;

  useEffect(() => {
    const loadFeedback = async () => {
      try {
        const response = await getAllFeedback();
        setFeedback(response.data || []);
      } catch (error) {
        addToast(getErrorMessage(error, "Unable to load feedback."), "error");
      } finally {
        setLoading(false);
      }
    };

    loadFeedback();
  }, [addToast]);

  const totalPages = Math.max(1, Math.ceil(feedback.length / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedFeedback = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return feedback.slice(start, start + pageSize);
  }, [currentPage, feedback]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-8 p-6 md:p-8">
      <PageHeader
        title="Feedback Inbox"
        subtitle="Review alumni sentiment and recent product feedback."
      />

      <div className="grid gap-5">
        {feedback.length === 0 ? (
          <div className="rounded-3xl bg-white p-8 text-center text-slate-500 shadow-soft">
            No feedback has been submitted yet.
          </div>
        ) : (
          paginatedFeedback.map((item) => (
            <article key={item.id} className="rounded-3xl bg-white p-6 shadow-soft">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-500">
                    {item.userName}
                  </p>
                  <div className="mt-2 grid gap-2 text-sm text-slate-500 sm:grid-cols-2">
                    <p>Email: {item.userEmail}</p>
                    <p>Batch: {item.batchYear || "Not updated"}</p>
                    <p>Department: {item.department || "Not updated"}</p>
                    <p>Alumni ID: #{item.userId}</p>
                  </div>
                  <p className="mt-3 text-base leading-7 text-slate-700">{item.message}</p>
                </div>

                <div className="shrink-0 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">
                  {item.rating}/5
                </div>
              </div>

              <p className="mt-4 text-sm text-slate-400">
                {new Date(item.createdAt).toLocaleString()}
              </p>
            </article>
          ))
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={feedback.length}
        pageSize={pageSize}
        itemLabel="feedback entries"
        onPageChange={setCurrentPage}
      />
    </div>
  );
}

export default AdminFeedback;
