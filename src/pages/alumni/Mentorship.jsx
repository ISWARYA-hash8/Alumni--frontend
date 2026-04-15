import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ExternalLink, Search, Users } from "lucide-react";
import {
  addMentorAvailability,
  becomeMentor,
  completeMentorshipSession,
  discoverMentors,
  getMentorAvailability,
  getMentorshipDashboard,
  getMyMentorshipRequests,
  getMyMentorships,
  getReceivedRequests,
  updateMentorshipSessionDetails,
  sendMentorshipRequest,
  submitMentorshipFeedback,
  updateMentorshipStatus
} from "../../services/apiService";
import { useToast } from "../../context/ToastContext";
import { getErrorMessage } from "../../utils/errors";
import { useAuth } from "../../context/AuthContext";
import Loader from "../../components/Loader";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import MentorshipStatCard from "../../components/mentorship/MentorshipStatCard";
import MentorProfileCard from "../../components/mentorship/MentorProfileCard";
import RequestMentorshipModal from "../../components/mentorship/RequestMentorshipModal";
import FeedbackModal from "../../components/mentorship/FeedbackModal";
import MentorshipStatusBadge from "../../components/mentorship/MentorshipStatusBadge";
import SessionDetailsModal from "../../components/mentorship/SessionDetailsModal";

const initialMentorForm = {
  company: "",
  designation: "",
  location: "",
  domain: "",
  yearsExperience: "",
  photoUrl: "",
  expertiseAreas: "",
  bio: ""
};

const initialAvailabilityForm = {
  dayOfWeek: "MONDAY",
  startTime: "09:00",
  endTime: "10:00"
};

const initialRequestForm = {
  areaOfInterest: "",
  message: "",
  requestedDate: "",
  durationMinutes: 30,
  sessionMode: "Virtual",
  availabilitySlotId: ""
};

const initialFeedbackForm = {
  rating: 5,
  comment: ""
};

const dayOrder = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

const initialSessionDetailsForm = {
  meetingPlatform: "",
  meetingLink: "",
  meetingNotes: ""
};

function EmptyState({ text }) {
  return <div className="glass-card p-8 text-center text-slate-500">{text}</div>;
}

function Mentorship() {
  const [tab, setTab] = useState("discover");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [mentors, setMentors] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [myMentorships, setMyMentorships] = useState([]);
  const [dashboard, setDashboard] = useState({
    activeMentorships: 0,
    pendingRequests: 0,
    requestsToReview: 0,
    completedSessions: 0
  });
  const [filters, setFilters] = useState({
    search: "",
    domain: "",
    company: "",
    location: "",
    experience: ""
  });
  const [mentorForm, setMentorForm] = useState(initialMentorForm);
  const [availabilityForm, setAvailabilityForm] = useState(initialAvailabilityForm);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [requestForm, setRequestForm] = useState(initialRequestForm);
  const [selectedSession, setSelectedSession] = useState(null);
  const [feedbackForm, setFeedbackForm] = useState(initialFeedbackForm);
  const [sessionDetailsForm, setSessionDetailsForm] = useState(initialSessionDetailsForm);
  const [editingSession, setEditingSession] = useState(null);

  const { addToast } = useToast();
  const { auth } = useAuth();

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadMentors();
  }, [filters]);

  const loadInitialData = async () => {
    try {
      setLoading(true);

      const [requestsResponse, receivedResponse, mentorshipsResponse, dashboardResponse] =
        await Promise.all([
          getMyMentorshipRequests(),
          getReceivedRequests(),
          getMyMentorships(),
          getMentorshipDashboard()
        ]);

      setMyRequests(requestsResponse.data || []);
      setReceivedRequests(receivedResponse.data || []);
      setMyMentorships(mentorshipsResponse.data || []);
      setDashboard(dashboardResponse.data || {});
    } catch (error) {
      addToast(getErrorMessage(error, "Unable to load mentorship data."), "error");
    } finally {
      setLoading(false);
    }
  };

  const loadMentors = async () => {
    try {
      const response = await discoverMentors({
        search: filters.search || undefined,
        domain: filters.domain || undefined,
        company: filters.company || undefined,
        location: filters.location || undefined,
        experience: filters.experience ? Number(filters.experience) : undefined
      });

      setMentors(response.data || []);
    } catch (error) {
      addToast(getErrorMessage(error, "Unable to load mentors."), "error");
    }
  };

  const refreshRelationshipData = async () => {
    const [requestsResponse, receivedResponse, mentorshipsResponse, dashboardResponse] =
      await Promise.all([
        getMyMentorshipRequests(),
        getReceivedRequests(),
        getMyMentorships(),
        getMentorshipDashboard()
      ]);

    setMyRequests(requestsResponse.data || []);
    setReceivedRequests(receivedResponse.data || []);
    setMyMentorships(mentorshipsResponse.data || []);
    setDashboard(dashboardResponse.data || {});
  };

  const handleMentorProfileSave = async () => {
    setActionLoading(true);

    try {
      await becomeMentor({
        ...mentorForm,
        yearsExperience: mentorForm.yearsExperience ? Number(mentorForm.yearsExperience) : 0,
        expertiseAreas: mentorForm.expertiseAreas
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      });

      addToast("Mentor profile saved successfully.", "success");
      setMentorForm(initialMentorForm);
      await Promise.all([loadMentors(), loadInitialData()]);
      setTab("discover");
    } catch (error) {
      addToast(getErrorMessage(error, "Unable to save mentor profile."), "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddAvailability = async () => {
    setActionLoading(true);

    try {
      await addMentorAvailability(availabilityForm);
      addToast("Availability slot added.", "success");
      setAvailabilityForm(initialAvailabilityForm);
    } catch (error) {
      addToast(getErrorMessage(error, "Unable to add availability."), "error");
    } finally {
      setActionLoading(false);
    }
  };

  const openRequestModal = async (mentor) => {
    try {
      setActionLoading(true);
      const response = await getMentorAvailability(mentor.mentorUserId);
      const slots = response.data || [];

      if (slots.length === 0) {
        addToast("This mentor has not added availability yet.", "error");
        return;
      }

      setAvailability(slots);
      setSelectedMentor(mentor);
      setRequestForm(initialRequestForm);
    } catch (error) {
      addToast(getErrorMessage(error, "Unable to load mentor availability."), "error");
    } finally {
      setActionLoading(false);
    }
  };

  const submitRequest = async () => {
    if (!selectedMentor) {
      return;
    }

    const selectedSlot = availability.find(
      (slot) => String(slot.id) === String(requestForm.availabilitySlotId)
    );

    if (!selectedSlot || !requestForm.requestedDate) {
      addToast("Please choose a valid date and availability slot.", "error");
      return;
    }

    const selectedDate = new Date(`${requestForm.requestedDate}T00:00:00`);
    const selectedDay = dayOrder[selectedDate.getDay()];
    if (selectedDay !== selectedSlot.dayOfWeek) {
      addToast(`Please pick a ${selectedSlot.dayOfWeek} date for this availability slot.`, "error");
      return;
    }

    const scheduledAt = new Date(`${requestForm.requestedDate}T${selectedSlot.startTime}`);
    if (Number.isNaN(scheduledAt.getTime()) || scheduledAt <= new Date()) {
      addToast("Please choose a mentorship date and time in the future.", "error");
      return;
    }

    setActionLoading(true);

    try {
      await sendMentorshipRequest(selectedMentor.mentorUserId, {
        ...requestForm,
        availabilitySlotId: Number(requestForm.availabilitySlotId),
        durationMinutes: Number(requestForm.durationMinutes)
      });

      addToast("Mentorship request sent.", "success");
      setSelectedMentor(null);
      setAvailability([]);
      setRequestForm(initialRequestForm);
      await refreshRelationshipData();
    } catch (error) {
      addToast(getErrorMessage(error, "Unable to send mentorship request."), "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestStatus = async (requestId, status) => {
    try {
      await updateMentorshipStatus(requestId, status);
      addToast(`Request ${status.toLowerCase()}.`, "success");
      await refreshRelationshipData();
    } catch (error) {
      addToast(getErrorMessage(error, "Unable to update request."), "error");
    }
  };

  const handleCompleteSession = async (sessionId) => {
    try {
      await completeMentorshipSession(sessionId);
      addToast("Session marked as completed.", "success");
      await refreshRelationshipData();
      await loadMentors();
    } catch (error) {
      addToast(getErrorMessage(error, "Unable to complete session."), "error");
    }
  };

  const submitFeedback = async () => {
    if (!selectedSession) {
      return;
    }

    try {
      await submitMentorshipFeedback({
        sessionId: selectedSession.id,
        rating: feedbackForm.rating,
        comment: feedbackForm.comment
      });

      addToast("Mentor feedback submitted.", "success");
      setSelectedSession(null);
      setFeedbackForm(initialFeedbackForm);
      await refreshRelationshipData();
      await loadMentors();
    } catch (error) {
      addToast(getErrorMessage(error, "Unable to submit feedback."), "error");
    }
  };

  const openSessionDetails = (session) => {
    setEditingSession(session);
    setSessionDetailsForm({
      meetingPlatform: session.meetingPlatform || "",
      meetingLink: session.meetingLink || "",
      meetingNotes: session.meetingNotes || ""
    });
  };

  const submitSessionDetails = async () => {
    if (!editingSession) {
      return;
    }

    try {
      setActionLoading(true);
      await updateMentorshipSessionDetails(editingSession.id, {
        meetingPlatform: sessionDetailsForm.meetingPlatform.trim(),
        meetingLink: sessionDetailsForm.meetingLink.trim(),
        meetingNotes: sessionDetailsForm.meetingNotes.trim()
      });
      addToast("Session details updated.", "success");
      setEditingSession(null);
      setSessionDetailsForm(initialSessionDetailsForm);
      await refreshRelationshipData();
    } catch (error) {
      addToast(getErrorMessage(error, "Unable to update session details."), "error");
    } finally {
      setActionLoading(false);
    }
  };

  const openMeetingLink = (link) => {
    if (!link) {
      return;
    }

    const normalizedLink = /^https?:\/\//i.test(link) ? link : `https://${link}`;
    window.open(normalizedLink, "_blank", "noopener,noreferrer");
  };

  const metrics = useMemo(
    () => [
      { title: "Active Mentorships", value: dashboard.activeMentorships || 0, accent: "text-indigo-600" },
      { title: "Pending Requests", value: dashboard.pendingRequests || 0, accent: "text-amber-500" },
      { title: "Requests To Review", value: dashboard.requestsToReview || 0, accent: "text-sky-600" },
      { title: "Completed Sessions", value: dashboard.completedSessions || 0, accent: "text-emerald-500" }
    ],
    [dashboard]
  );

  if (loading) {
    return <Loader label="Loading mentorship workspace..." />;
  }

  return (
    <div className="space-y-8 p-6 md:p-8">
      <PageHeader
        title="Mentorship Hub"
        subtitle="Search mentors, request guidance, and manage your mentorship flow without extra clutter."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MentorshipStatCard
            key={metric.title}
            title={metric.title}
            value={metric.value}
            accent={metric.accent}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        {[
          { key: "discover", label: "Find Mentors", icon: Search },
          { key: "my", label: "My Mentorships", icon: Users },
          { key: "mentor", label: "Mentor Setup", icon: CalendarDays }
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                tab === item.key
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "bg-white text-slate-600 shadow-soft hover:bg-slate-50"
              }`}
            >
              <Icon size={16} />
              {item.label}
            </button>
          );
        })}
      </div>

      {tab === "discover" ? (
        <div className="space-y-6">
          <section className="glass-card p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Find A Mentor</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Narrow the list with practical filters and send mentorship requests directly.
                </p>
              </div>

              <Button
                variant="secondary"
                onClick={() =>
                  setFilters({ search: "", domain: "", company: "", location: "", experience: "" })
                }
              >
                Reset Filters
              </Button>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <div className="relative xl:col-span-2">
                <Search size={16} className="absolute left-3 top-3.5 text-slate-400" />
                <input
                  className="glass-input pl-10"
                  placeholder="Search by name or domain"
                  value={filters.search}
                  onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
                />
              </div>
              <input
                className="glass-input"
                placeholder="Domain"
                value={filters.domain}
                onChange={(event) => setFilters((current) => ({ ...current, domain: event.target.value }))}
              />
              <input
                className="glass-input"
                placeholder="Company"
                value={filters.company}
                onChange={(event) => setFilters((current) => ({ ...current, company: event.target.value }))}
              />
              <input
                className="glass-input"
                placeholder="Location"
                value={filters.location}
                onChange={(event) => setFilters((current) => ({ ...current, location: event.target.value }))}
              />
              <input
                type="number"
                className="glass-input"
                placeholder="Min experience"
                value={filters.experience}
                onChange={(event) => setFilters((current) => ({ ...current, experience: event.target.value }))}
              />
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-bold text-slate-900">Available Mentors</h2>
            {mentors.length === 0 ? (
              <EmptyState text="No mentors match your current filters." />
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {mentors.map((mentor) => (
                  <MentorProfileCard key={mentor.mentorProfileId} mentor={mentor} onRequest={openRequestModal} />
                ))}
              </div>
            )}
          </section>
        </div>
      ) : null}

      {tab === "my" ? (
        <div className="space-y-8">
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">My Mentorships</h2>
            {myMentorships.length === 0 ? (
              <EmptyState text="You do not have any active mentorship sessions yet." />
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                {myMentorships.map((session) => {
                  const isMentor = session.mentorId === auth?.user?.id;
                  const canFeedback =
                    session.menteeId === auth?.user?.id &&
                    session.status === "COMPLETED" &&
                    !session.feedbackSubmitted;

                  return (
                    <div key={session.id} className="glass-card p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">
                            {isMentor ? session.menteeName : session.mentorName}
                          </h3>
                          <p className="mt-1 text-sm text-slate-500">
                            {new Date(session.scheduledAt).toLocaleString()} | {session.durationMinutes} mins | {session.sessionMode}
                          </p>
                        </div>
                        <MentorshipStatusBadge status={session.status} />
                      </div>

                      <div className="mt-4 space-y-2 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                        <p>
                          <span className="font-semibold text-slate-900">Session Platform:</span>{" "}
                          {session.meetingPlatform || "Mentor has not added the meeting platform yet"}
                        </p>
                        <p>
                          <span className="font-semibold text-slate-900">Join Details:</span>{" "}
                          {session.meetingLink || session.meetingNotes || "Details will be shared by the mentor before the session"}
                        </p>
                        {session.meetingNotes ? (
                          <p>
                            <span className="font-semibold text-slate-900">Notes:</span> {session.meetingNotes}
                          </p>
                        ) : null}
                      </div>

                      <div className="mt-4 flex flex-wrap gap-3">
                        {isMentor && session.status === "SCHEDULED" ? (
                          <Button variant="secondary" onClick={() => openSessionDetails(session)}>
                            {session.meetingPlatform || session.meetingLink || session.meetingNotes
                              ? "Edit Session Details"
                              : "Add Session Details"}
                          </Button>
                        ) : null}
                        {session.meetingLink ? (
                          <Button
                            variant="outline"
                            onClick={() => openMeetingLink(session.meetingLink)}
                            className="inline-flex items-center gap-2"
                          >
                            <ExternalLink size={16} />
                            Join Session
                          </Button>
                        ) : null}
                        {isMentor && session.status === "SCHEDULED" ? (
                          <Button variant="success" onClick={() => handleCompleteSession(session.id)}>
                            Mark Completed
                          </Button>
                        ) : null}
                        {canFeedback ? (
                          <Button
                            onClick={() => {
                              setSelectedSession(session);
                              setFeedbackForm(initialFeedbackForm);
                            }}
                          >
                            Rate Mentor
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <div className="grid gap-8 xl:grid-cols-2">
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900">My Requests</h2>
              {myRequests.length === 0 ? (
                <EmptyState text="No mentorship requests sent yet." />
              ) : (
                <div className="space-y-4">
                  {myRequests.map((request) => (
                    <div key={request.id} className="glass-card p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">{request.mentorName}</h3>
                          <p className="mt-1 text-sm text-slate-500">
                            {request.areaOfInterest} | {request.sessionMode} | {request.durationMinutes} mins
                          </p>
                        </div>
                        <MentorshipStatusBadge status={request.status} />
                      </div>
                      <p className="mt-3 text-sm text-slate-600">{request.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Requests For Me</h2>
              {receivedRequests.length === 0 ? (
                <EmptyState text="No incoming mentorship requests right now." />
              ) : (
                <div className="space-y-4">
                  {receivedRequests.map((request) => (
                    <div key={request.id} className="glass-card p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">{request.menteeName}</h3>
                          <p className="mt-1 text-sm text-slate-500">
                            {request.areaOfInterest} | {request.requestedDate} | {request.availabilitySlot?.dayOfWeek || "Time to coordinate"}
                          </p>
                        </div>
                        <MentorshipStatusBadge status={request.status} />
                      </div>

                      <p className="mt-3 text-sm text-slate-600">{request.message}</p>

                      {request.status === "PENDING" ? (
                        <div className="mt-4 flex gap-3">
                          <Button variant="success" onClick={() => handleRequestStatus(request.id, "ACCEPTED")}>
                            Accept
                          </Button>
                          <Button variant="danger" onClick={() => handleRequestStatus(request.id, "REJECTED")}>
                            Reject
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      ) : null}

      {tab === "mentor" ? (
        <div className="space-y-8">
          <div className="grid gap-8 xl:grid-cols-[1.2fr,0.8fr]">
            <section className="glass-card p-6">
            <h2 className="text-xl font-bold text-slate-900">Build Your Mentor Profile</h2>
            <p className="mt-2 text-sm text-slate-500">
              Share the essentials so alumni know what guidance you can offer.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <input
                className="glass-input"
                placeholder="Company"
                value={mentorForm.company}
                onChange={(event) => setMentorForm((current) => ({ ...current, company: event.target.value }))}
              />
              <input
                className="glass-input"
                placeholder="Designation"
                value={mentorForm.designation}
                onChange={(event) => setMentorForm((current) => ({ ...current, designation: event.target.value }))}
              />
              <input
                className="glass-input"
                placeholder="Location"
                value={mentorForm.location}
                onChange={(event) => setMentorForm((current) => ({ ...current, location: event.target.value }))}
              />
              <input
                className="glass-input"
                placeholder="Domain"
                value={mentorForm.domain}
                onChange={(event) => setMentorForm((current) => ({ ...current, domain: event.target.value }))}
              />
              <input
                className="glass-input"
                type="number"
                placeholder="Years of experience"
                value={mentorForm.yearsExperience}
                onChange={(event) => setMentorForm((current) => ({ ...current, yearsExperience: event.target.value }))}
              />
              <input
                className="glass-input"
                placeholder="Photo URL (optional)"
                value={mentorForm.photoUrl}
                onChange={(event) => setMentorForm((current) => ({ ...current, photoUrl: event.target.value }))}
              />
              <input
                className="glass-input md:col-span-2"
                placeholder="Expertise tags (comma separated)"
                value={mentorForm.expertiseAreas}
                onChange={(event) => setMentorForm((current) => ({ ...current, expertiseAreas: event.target.value }))}
              />
              <textarea
                className="glass-input min-h-32 md:col-span-2"
                placeholder="Bio"
                value={mentorForm.bio}
                onChange={(event) => setMentorForm((current) => ({ ...current, bio: event.target.value }))}
              />
            </div>

              <Button className="mt-6" onClick={handleMentorProfileSave} disabled={actionLoading}>
                {actionLoading ? "Saving..." : "Save Mentor Profile"}
              </Button>
            </section>

            <section className="glass-card p-6">
              <h2 className="text-xl font-bold text-slate-900">Mentor Availability</h2>
              <p className="mt-2 text-sm text-slate-500">
                Add a few weekly slots so mentees can request practical times.
              </p>

              <div className="mt-6 grid gap-4">
                <select
                  className="glass-input"
                  value={availabilityForm.dayOfWeek}
                  onChange={(event) => setAvailabilityForm((current) => ({ ...current, dayOfWeek: event.target.value }))}
                >
                  {["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"].map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
                <input
                  type="time"
                  className="glass-input"
                  value={availabilityForm.startTime}
                  onChange={(event) => setAvailabilityForm((current) => ({ ...current, startTime: event.target.value }))}
                />
                <input
                  type="time"
                  className="glass-input"
                  value={availabilityForm.endTime}
                  onChange={(event) => setAvailabilityForm((current) => ({ ...current, endTime: event.target.value }))}
                />
              </div>

              <Button className="mt-6 w-full" onClick={handleAddAvailability} disabled={actionLoading}>
                Add Availability Slot
              </Button>
            </section>
          </div>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Incoming Requests</h2>
            {receivedRequests.length === 0 ? (
              <EmptyState text="No incoming mentorship requests right now." />
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                {receivedRequests.map((request) => (
                  <div key={request.id} className="glass-card p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">{request.menteeName}</h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {request.areaOfInterest} | {request.requestedDate} | {request.availabilitySlot?.dayOfWeek || "Time to coordinate"}
                        </p>
                      </div>
                      <MentorshipStatusBadge status={request.status} />
                    </div>

                    <p className="mt-3 text-sm text-slate-600">{request.message}</p>

                    {request.status === "PENDING" ? (
                      <div className="mt-4 flex gap-3">
                        <Button variant="success" onClick={() => handleRequestStatus(request.id, "ACCEPTED")}>
                          Accept
                        </Button>
                        <Button variant="danger" onClick={() => handleRequestStatus(request.id, "REJECTED")}>
                          Reject
                        </Button>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      ) : null}

      <RequestMentorshipModal
        mentor={selectedMentor}
        availability={availability}
        form={requestForm}
        onChange={(field, value) => setRequestForm((current) => ({ ...current, [field]: value }))}
        onClose={() => {
          setSelectedMentor(null);
          setAvailability([]);
        }}
        onSubmit={submitRequest}
        loading={actionLoading}
      />

      <FeedbackModal
        session={selectedSession}
        form={feedbackForm}
        onChange={(field, value) => setFeedbackForm((current) => ({ ...current, [field]: value }))}
        onSubmit={submitFeedback}
        onClose={() => setSelectedSession(null)}
        loading={actionLoading}
      />

      <SessionDetailsModal
        session={editingSession}
        form={sessionDetailsForm}
        onChange={(field, value) => setSessionDetailsForm((current) => ({ ...current, [field]: value }))}
        onSubmit={submitSessionDetails}
        onClose={() => {
          setEditingSession(null);
          setSessionDetailsForm(initialSessionDetailsForm);
        }}
        loading={actionLoading}
      />
    </div>
  );
}

export default Mentorship;
