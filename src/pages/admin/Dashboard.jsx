import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  AlertTriangle,
  CalendarDays,
  GraduationCap,
  Heart,
  MessageCircle,
  ShieldCheck,
  Trash2,
  Users
} from "lucide-react";
import {
  deletePost,
  getAllFeedback,
  getAllUsers,
  getEvents,
  getMentors,
  getPosts
} from "../../services/apiService";
import Loader from "../../components/Loader";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import { useToast } from "../../context/ToastContext";
import { getErrorMessage } from "../../utils/errors";

function StatCard({ icon: Icon, label, value, tone = "text-slate-900" }) {
  return (
    <div className="glass-card p-6 card-hover">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</p>
        <div className="rounded-2xl bg-slate-100 p-3 text-slate-500">
          <Icon size={18} />
        </div>
      </div>
      <h2 className={`mt-4 text-4xl font-bold ${tone}`}>{value}</h2>
    </div>
  );
}

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [posts, setPosts] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingPostId, setRemovingPostId] = useState(null);
  const { addToast } = useToast();

  const loadDashboard = async () => {
    setLoading(true);

    try {
      const [usersResponse, eventsResponse, mentorsResponse, postsResponse, feedbackResponse] =
        await Promise.all([
          getAllUsers(),
          getEvents(),
          getMentors(),
          getPosts(),
          getAllFeedback()
        ]);

      setUsers(usersResponse.data || []);
      setEvents(eventsResponse.data || []);
      setMentors(mentorsResponse.data || []);
      setPosts(postsResponse.data || []);
      setFeedback(feedbackResponse.data || []);
    } catch (error) {
      addToast(getErrorMessage(error, "Unable to load admin dashboard."), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const alumniCount = users.filter((user) => user.role === "ALUMNI").length;
  const adminCount = users.filter((user) => user.role === "ADMIN").length;
  const approvedUsers = users.filter(
    (user) => user.role === "ALUMNI" && user.verificationStatus === "APPROVED"
  ).length;

  const upcomingEvents = useMemo(
    () =>
      [...events]
        .sort((left, right) => new Date(left.eventDate) - new Date(right.eventDate))
        .slice(0, 4),
    [events]
  );

  const highlightedPosts = useMemo(
    () =>
      [...posts]
        .sort((left, right) => {
          const rightScore = (right.likesCount || 0) + (right.comments?.length || 0) * 2;
          const leftScore = (left.likesCount || 0) + (left.comments?.length || 0) * 2;
          return rightScore - leftScore;
        })
        .slice(0, 4),
    [posts]
  );

  const topMentors = useMemo(
    () =>
      [...mentors]
        .sort(
          (left, right) =>
            (right.sessionsCompleted || 0) - (left.sessionsCompleted || 0) ||
            (right.ratingAverage || 0) - (left.ratingAverage || 0)
        )
        .slice(0, 4),
    [mentors]
  );

  const latestFeedback = useMemo(() => feedback.slice(0, 4), [feedback]);

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Remove this post from the forum?")) {
      return;
    }

    try {
      setRemovingPostId(postId);
      await deletePost(postId);
      addToast("Post removed successfully.", "success");
      await loadDashboard();
    } catch (error) {
      addToast(getErrorMessage(error, "Unable to remove post."), "error");
    } finally {
      setRemovingPostId(null);
    }
  };

  if (loading) {
    return <Loader label="Loading dashboard..." />;
  }

  return (
    <div className="space-y-8 p-6 md:p-8">
      <PageHeader
        title="Admin Dashboard"
        subtitle="Track mentors, events, feedback, and forum activity so admin can step in quickly when something needs attention."
      />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
        <StatCard icon={Users} label="Alumni Count" value={alumniCount} />
        <StatCard icon={BadgeCheck} label="Admin Count" value={adminCount} tone="text-slate-700" />
        <StatCard icon={ShieldCheck} label="Approved" value={approvedUsers} tone="text-emerald-500" />
        <StatCard icon={GraduationCap} label="Mentors" value={mentors.length} tone="text-indigo-600" />
        <StatCard
          icon={AlertTriangle}
          label="Feedback Inbox"
          value={feedback.length}
          tone="text-amber-500"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
        <section className="glass-card p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Forum Oversight</h2>
              <p className="mt-1 text-sm text-slate-500">
                Review active conversations and remove content if it looks inappropriate.
              </p>
            </div>
            <div className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600">
              {posts.length} posts
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {highlightedPosts.length === 0 ? (
              <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                No community posts yet.
              </p>
            ) : (
              highlightedPosts.map((post) => {
                const needsAttention = (post.comments?.length || 0) >= 3 || (post.likesCount || 0) >= 5;

                return (
                  <article key={post.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold text-slate-900">{post.title}</h3>
                          {needsAttention ? (
                            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                              Review active
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
                          {post.content}
                        </p>
                        <p className="mt-3 text-xs text-slate-400">
                          {post.authorName} | {post.category}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-2">
                            <Heart size={16} className="text-rose-500" />
                            {post.likesCount || 0}
                          </span>
                          <span className="flex items-center gap-2">
                            <MessageCircle size={16} className="text-sky-500" />
                            {post.comments?.length || 0}
                          </span>
                        </div>
                      </div>

                      <Button
                        variant="danger"
                        className="inline-flex items-center gap-2"
                        disabled={removingPostId === post.id}
                        onClick={() => handleDeletePost(post.id)}
                      >
                        <Trash2 size={16} />
                        {removingPostId === post.id ? "Removing..." : "Remove"}
                      </Button>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>

        <section className="space-y-6">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Mentor Network</h2>
                <p className="mt-1 text-sm text-slate-500">
                  See who is mentoring and how active the mentorship program is.
                </p>
              </div>
              <div className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                {mentors.length} mentors
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {topMentors.length === 0 ? (
                <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                  No mentors have signed up yet.
                </p>
              ) : (
                topMentors.map((mentor) => (
                  <article key={mentor.mentorProfileId} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{mentor.name}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {mentor.designation} at {mentor.company}
                        </p>
                        <p className="mt-2 text-sm text-slate-500">
                          {mentor.domain || "General mentorship"} | {mentor.location || "Location not added"}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-white px-3 py-2 text-right shadow-sm">
                        <p className="text-sm font-semibold text-amber-500">
                          {mentor.ratingAverage?.toFixed(1) || "New"}
                        </p>
                        <p className="text-xs text-slate-400">rating</p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
                      <span className="rounded-full bg-white px-3 py-1">
                        {mentor.sessionsCompleted || 0} sessions
                      </span>
                      <span className="rounded-full bg-white px-3 py-1">
                        {mentor.totalReviews || 0} reviews
                      </span>
                      {mentor.badges?.slice(0, 2).map((badge) => (
                        <span key={badge} className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                          {badge}
                        </span>
                      ))}
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-xl font-bold text-slate-900">Activity Snapshot</h2>
            <div className="mt-5 space-y-5">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Upcoming Events
                </p>
                <div className="mt-3 space-y-3">
                  {upcomingEvents.length === 0 ? (
                    <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                      No events planned yet.
                    </p>
                  ) : (
                    upcomingEvents.map((event) => (
                      <div key={event.id} className="rounded-2xl bg-slate-50 p-4">
                        <p className="font-semibold text-slate-900">{event.title}</p>
                        <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                          <CalendarDays size={15} />
                          {new Date(event.eventDate).toLocaleString()}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {event.audienceType === "SPECIFIC_BATCH"
                            ? `Targeted to batch ${event.targetBatchYear}`
                            : "Visible to all alumni"}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Recent Feedback
                </p>
                <div className="mt-3 space-y-3">
                  {latestFeedback.length === 0 ? (
                    <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                      No feedback submitted yet.
                    </p>
                  ) : (
                    latestFeedback.map((item) => (
                      <div key={item.id} className="rounded-2xl bg-slate-50 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-slate-900">{item.userName}</p>
                            <p className="mt-1 text-sm text-slate-500">
                              {item.department || "Department not updated"} | Batch {item.batchYear || "NA"}
                            </p>
                          </div>
                          <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                            {item.rating}/5
                          </div>
                        </div>
                        <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                          {item.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AdminDashboard;
