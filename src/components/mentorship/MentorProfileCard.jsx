import { Briefcase, MapPin, Sparkles, Star } from "lucide-react";
import Button from "../Button";

function MentorProfileCard({ mentor, onRequest }) {
  const initials = mentor.name
    ?.split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <article className="glass-card p-6 card-hover">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          {mentor.photoUrl ? (
            <img
              src={mentor.photoUrl}
              alt={mentor.name}
              className="h-14 w-14 rounded-2xl object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-lg font-bold text-white">
              {initials || "M"}
            </div>
          )}

          <div>
            <h3 className="text-lg font-bold text-slate-900">{mentor.name}</h3>
            <p className="text-sm text-slate-500">{mentor.designation}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-600">
          <Star size={14} className="fill-current" />
          {Number(mentor.ratingAverage || 0).toFixed(1)}
        </div>
      </div>

      <div className="mt-4 space-y-2 text-sm text-slate-600">
        <p className="inline-flex items-center gap-2">
          <Briefcase size={15} />
          {mentor.company} | {mentor.domain}
        </p>
        <p className="inline-flex items-center gap-2">
          <MapPin size={15} />
          {mentor.location} | {mentor.yearsExperience || 0}+ years
        </p>
      </div>

      <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">{mentor.bio}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {(mentor.expertiseAreas || []).map((tag) => (
          <span key={`${mentor.mentorProfileId}-${tag}`} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {(mentor.badges || []).map((badge) => (
          <span
            key={`${mentor.mentorProfileId}-${badge}`}
            className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600"
          >
            <Sparkles size={12} />
            {badge}
          </span>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between text-sm text-slate-500">
        <span>{mentor.sessionsCompleted || 0} sessions completed</span>
        <span>{mentor.totalReviews || 0} reviews</span>
      </div>

      <Button className="mt-5 w-full" onClick={() => onRequest(mentor)}>
        Request Mentorship
      </Button>
    </article>
  );
}

export default MentorProfileCard;
