import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Award, Bell, Calendar, MessageSquare, Users } from "lucide-react";
import Loader from "../../components/Loader";
import PageHeader from "../../components/PageHeader";
import { getAlumni, getAnnouncements, getEvents, getMentors, getPosts } from "../../services/apiService";

function StatCard({ icon: Icon, label, value, tone }) {
  return (
    <div className="glass-card p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-slate-100 p-3">
          <Icon className={tone} size={20} />
        </div>
        <p className="text-sm font-medium text-slate-600">{label}</p>
      </div>
      <h2 className="mt-4 text-3xl font-bold text-slate-900">{value}</h2>
    </div>
  );
}

function Dashboard() {
  const [alumni, setAlumni] = useState([]);
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [posts, setPosts] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const [alumniRes, eventRes, announceRes, postRes, mentorRes] = await Promise.all([
        getAlumni(),
        getEvents(),
        getAnnouncements(),
        getPosts(),
        getMentors()
      ]);

      setAlumni(alumniRes.data || []);
      setEvents(eventRes.data || []);
      setAnnouncements(announceRes.data || []);
      setPosts(postRes.data || []);
      setMentors(mentorRes.data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader label="Loading dashboard..." />;
  }

  return (
    <div className="space-y-8 p-4 sm:p-6 md:p-8">
      <PageHeader
        title="Welcome Back"
        subtitle="Stay connected with the alumni network and explore events, discussions, and mentorship opportunities."
      />

      <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-500 p-6 text-white shadow-soft sm:p-8">
        <h2 className="text-2xl font-bold sm:text-3xl">Your Alumni Workspace</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-indigo-50 sm:text-base">
          Track what is happening across the community and jump into the sections that matter most.
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="Total Alumni" value={alumni.length} tone="text-indigo-500" />
        <StatCard icon={Calendar} label="Events" value={events.length} tone="text-violet-500" />
        <StatCard icon={MessageSquare} label="Forum Posts" value={posts.length} tone="text-emerald-500" />
        <StatCard icon={Award} label="Mentors" value={mentors.length} tone="text-amber-500" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
        <section className="glass-card p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Upcoming Events</h2>
            <Link to="/alumni/events" className="text-sm font-semibold text-indigo-500">
              View All
            </Link>
          </div>

          <div className="mt-5 space-y-4">
            {events.length === 0 ? (
              <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">No upcoming events yet.</p>
            ) : (
              events.slice(0, 3).map((event) => (
                <div
                  key={event.id}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <h4 className="font-semibold text-slate-900">{event.title}</h4>
                    <p className="mt-1 text-sm text-slate-600">{event.location}</p>
                  </div>

                  <p className="shrink-0 text-sm font-semibold text-indigo-500">
                    {event.eventDate && !Number.isNaN(new Date(event.eventDate).getTime())
                      ? format(new Date(event.eventDate), "d MMM")
                      : "-"}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="glass-card p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 sm:text-xl">
              <Bell size={18} />
              Announcements
            </h2>
            <Link to="/alumni/announcement" className="text-sm font-semibold text-indigo-500">
              View All
            </Link>
          </div>

          <div className="mt-5 space-y-4">
            {announcements.length === 0 ? (
              <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">No announcements right now.</p>
            ) : (
              announcements.slice(0, 4).map((announcement) => (
                <div key={announcement.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">
                    {announcement.category}
                  </p>
                  <h4 className="mt-2 font-semibold text-slate-900">{announcement.title}</h4>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {(announcement.content || "").slice(0, 90)}
                    {(announcement.content || "").length > 90 ? "..." : ""}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <section className="glass-card p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Recent Discussions</h2>
          <Link to="/alumni/posts" className="text-sm font-semibold text-indigo-500">
            Open Forum
          </Link>
        </div>

        <div className="mt-5 space-y-4">
          {posts.length === 0 ? (
            <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">No discussions yet.</p>
          ) : (
            posts.slice(0, 5).map((post) => (
              <div key={post.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <h4 className="font-semibold text-slate-900">{post.title}</h4>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {(post.content || "").slice(0, 140)}
                  {(post.content || "").length > 140 ? "..." : ""}
                </p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
