import { useEffect, useMemo, useState } from "react";
import { CalendarDays, GraduationCap, MapPin, Users } from "lucide-react";
import {
  getEvents,
  getMyRegistrations,
  registerEvent
} from "../../services/apiService";
import Loader from "../../components/Loader";
import Button from "../../components/Button";
import Pagination from "../../components/Pagination";
import PageHeader from "../../components/PageHeader";
import { useToast } from "../../context/ToastContext";
import { getErrorMessage } from "../../utils/errors";

function Events() {
  const [events, setEvents] = useState([]);
  const [registered, setRegistered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const { addToast } = useToast();
  const pageSize = 6;

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const [eventsResponse, registrationsResponse] = await Promise.all([
          getEvents(),
          getMyRegistrations()
        ]);

        setEvents(eventsResponse.data || []);
        setRegistered((registrationsResponse.data || []).map((registration) => registration.event.id));
      } catch (error) {
        addToast(getErrorMessage(error, "Unable to load events."), "error");
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [addToast]);

  const register = async (id) => {
    try {
      await registerEvent(id);
      addToast("Registered successfully.", "success");
      setRegistered((current) => [...current, id]);
    } catch (error) {
      addToast(getErrorMessage(error, "Registration failed."), "error");
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

  if (loading) {
    return <Loader label="Loading events..." />;
  }

  return (
    <div className="space-y-8 p-6 md:p-8">
      <PageHeader
        title="Events"
        subtitle="Discover upcoming alumni activities and reserve your place early."
      />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {paginatedEvents.map((event) => {
          const isRegistered = registered.includes(event.id);
          const isFull = event.maxSeats && event.registeredCount >= event.maxSeats;

          return (
            <article key={event.id} className="glass-card p-6 card-hover">
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-xl font-bold text-slate-900">{event.title}</h3>
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                  {event.audienceType === "SPECIFIC_BATCH"
                    ? `Batch ${event.targetBatchYear}`
                    : "All Alumni"}
                </span>
              </div>

              <p className="mt-3 leading-7 text-slate-700">{event.description}</p>

              <div className="mt-5 space-y-2 text-sm text-slate-500">
                <p className="flex items-center gap-2">
                  <MapPin size={16} />
                  {event.location}
                </p>
                <p className="flex items-center gap-2">
                  <CalendarDays size={16} />
                  {new Date(event.eventDate || event.date).toLocaleString()}
                </p>
                <p className="flex items-center gap-2">
                  {event.audienceType === "SPECIFIC_BATCH" ? (
                    <GraduationCap size={16} />
                  ) : (
                    <Users size={16} />
                  )}
                  {event.audienceType === "SPECIFIC_BATCH"
                    ? `Only for batch ${event.targetBatchYear}`
                    : "Open to all alumni"}
                </p>
                <p>
                  Registered: {event.registeredCount || 0}
                  {event.maxSeats ? ` / ${event.maxSeats}` : ""}
                </p>
              </div>

              {isRegistered ? (
                <Button disabled className="mt-6 w-full bg-emerald-500">
                  Registered
                </Button>
              ) : isFull ? (
                <Button disabled className="mt-6 w-full bg-slate-500">
                  Event Full
                </Button>
              ) : (
                <Button onClick={() => register(event.id)} className="mt-6 w-full">
                  Register
                </Button>
              )}
            </article>
          );
        })}
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

export default Events;
