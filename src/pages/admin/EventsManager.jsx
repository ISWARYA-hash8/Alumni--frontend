import { useEffect, useMemo, useState } from "react";
import { CalendarDays, GraduationCap, MapPin, Users } from "lucide-react";
import {
  getEvents,
  createEvent,
  deleteEvent,
  updateEvent
} from "../../services/apiService";
import Button from "../../components/Button";
import Loader from "../../components/Loader";
import Pagination from "../../components/Pagination";
import PageHeader from "../../components/PageHeader";
import { useToast } from "../../context/ToastContext";
import { getErrorMessage } from "../../utils/errors";

function EventsManager() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { addToast } = useToast();
  const pageSize = 6;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    eventDate: "",
    maxSeats: "",
    audienceType: "ALL",
    targetBatchYear: ""
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const res = await getEvents();
      setEvents(res.data || []);
    } catch (error) {
      addToast(getErrorMessage(error, "Unable to load events."), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
      ...(name === "audienceType" && value === "ALL" ? { targetBatchYear: "" } : {})
    }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      location: "",
      eventDate: "",
      maxSeats: "",
      audienceType: "ALL",
      targetBatchYear: ""
    });
    setEditingId(null);
  };

  const handleCreateOrUpdate = async () => {
    if (!formData.title.trim() || !formData.location.trim() || !formData.eventDate) {
      addToast("Title, location, and event date are required.", "error");
      return;
    }

    if (formData.audienceType === "SPECIFIC_BATCH" && !formData.targetBatchYear.trim()) {
      addToast("Enter the target batch year for this event.", "error");
      return;
    }

    const payload = {
      ...formData,
      maxSeats: formData.maxSeats ? Number(formData.maxSeats) : null,
      targetBatchYear:
        formData.audienceType === "SPECIFIC_BATCH" ? formData.targetBatchYear.trim() : null
    };

    try {
      if (editingId) {
        await updateEvent(editingId, payload);
        addToast("Event updated successfully.", "success");
      } else {
        await createEvent(payload);
        addToast("Event created successfully.", "success");
      }
      resetForm();
      await loadEvents();
    } catch (error) {
      addToast(getErrorMessage(error, "Unable to save event."), "error");
    }
  };

  const handleEdit = (event) => {
    setEditingId(event.id);
    setFormData({
      title: event.title || "",
      description: event.description || "",
      location: event.location || "",
      eventDate: event.eventDate ? event.eventDate.slice(0, 16) : "",
      maxSeats: event.maxSeats || "",
      audienceType: event.audienceType || "ALL",
      targetBatchYear: event.targetBatchYear || ""
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this event?")) return;

    try {
      await deleteEvent(id);
      addToast("Event deleted.", "success");
      await loadEvents();
    } catch (error) {
      addToast(getErrorMessage(error, "Unable to delete event."), "error");
    }
  };

  const totalPages = Math.max(1, Math.ceil(events.length / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedEvents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return events.slice(start, start + pageSize);
  }, [currentPage, events]);

  return (
    <div className="space-y-8 p-6 md:p-8">
      <PageHeader
        title="Events Manager"
        subtitle="Create campus-wide events or send announcements to a specific alumni batch."
      />

      <div className="glass-card p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <input
            name="title"
            placeholder="Event title"
            value={formData.title}
            onChange={handleChange}
            className="glass-input"
          />

          <input
            name="location"
            placeholder="Location"
            value={formData.location}
            onChange={handleChange}
            className="glass-input"
          />

          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            className="glass-input min-h-28 md:col-span-2"
          />

          <input
            type="datetime-local"
            name="eventDate"
            value={formData.eventDate}
            onChange={handleChange}
            className="glass-input"
          />

          <input
            type="number"
            name="maxSeats"
            placeholder="Max seats"
            value={formData.maxSeats}
            onChange={handleChange}
            className="glass-input"
          />

          <select
            name="audienceType"
            value={formData.audienceType}
            onChange={handleChange}
            className="glass-input"
          >
            <option value="ALL">All alumni</option>
            <option value="SPECIFIC_BATCH">Specific batch</option>
          </select>

          <input
            name="targetBatchYear"
            placeholder="Target batch year"
            value={formData.targetBatchYear}
            onChange={handleChange}
            className="glass-input"
            disabled={formData.audienceType !== "SPECIFIC_BATCH"}
          />
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Button onClick={handleCreateOrUpdate}>
            {editingId ? "Update Event" : "Create Event"}
          </Button>

          {editingId ? (
            <Button onClick={resetForm} variant="secondary">
              Cancel
            </Button>
          ) : null}
        </div>
      </div>

      {loading ? <Loader label="Loading events..." /> : null}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {paginatedEvents.map((event) => (
          <article key={event.id} className="glass-card p-6 card-hover">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{event.title}</h3>
                <p className="mt-3 leading-7 text-slate-700">{event.description}</p>
              </div>

              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                {event.audienceType === "SPECIFIC_BATCH"
                  ? `Batch ${event.targetBatchYear}`
                  : "All Alumni"}
              </span>
            </div>

            <div className="mt-5 space-y-2 text-sm text-slate-500">
              <p className="flex items-center gap-2">
                <MapPin size={16} />
                {event.location}
              </p>
              <p className="flex items-center gap-2">
                <CalendarDays size={16} />
                {new Date(event.eventDate).toLocaleString()}
              </p>
              <p className="flex items-center gap-2">
                {event.audienceType === "SPECIFIC_BATCH" ? (
                  <GraduationCap size={16} />
                ) : (
                  <Users size={16} />
                )}
                {event.audienceType === "SPECIFIC_BATCH"
                  ? `Visible to batch ${event.targetBatchYear}`
                  : "Visible to all alumni"}
              </p>
              {event.maxSeats ? <p>Seats: {event.maxSeats}</p> : null}
              <p>Registered: {event.registeredCount || 0}</p>
            </div>

            <div className="mt-5 flex gap-2">
              <Button variant="warning" onClick={() => handleEdit(event)}>
                Edit
              </Button>
              <Button variant="danger" onClick={() => handleDelete(event.id)}>
                Delete
              </Button>
            </div>
          </article>
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={events.length}
        pageSize={pageSize}
        itemLabel="events"
        onPageChange={setCurrentPage}
      />
    </div>
  );
}

export default EventsManager;
