import { Suspense, lazy } from "react";
import {
  BookOpen,
  Calendar,
  LayoutDashboard,
  Megaphone,
  MessageCircle,
  MessageSquare,
  User,
  Users
} from "lucide-react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "../components/AppShell";
import Loader from "../components/Loader";
import ProtectedRoute from "../components/ProtectedRoute";

const Dashboard = lazy(() => import("../pages/alumni/Dashboard"));
const Directory = lazy(() => import("../pages/alumni/AlumniDirectory"));
const Events = lazy(() => import("../pages/alumni/Events"));
const Posts = lazy(() => import("../pages/alumni/Posts"));
const Profile = lazy(() => import("../pages/alumni/Profile"));
const Announcement = lazy(() => import("../pages/alumni/Announcement"));
const Mentor = lazy(() => import("../pages/alumni/Mentorship"));
const Feedback = lazy(() => import("../pages/alumni/Feedback"));

const alumniMenu = [
  { label: "Dashboard", to: "/alumni/dashboard", icon: LayoutDashboard },
  { label: "Directory", to: "/alumni/directory", icon: Users },
  { label: "Events", to: "/alumni/events", icon: Calendar },
  { label: "Forum", to: "/alumni/posts", icon: MessageSquare },
  { label: "Mentorship", to: "/alumni/mentorship", icon: BookOpen },
  { label: "Announcements", to: "/alumni/announcement", icon: Megaphone },
  { label: "Feedback", to: "/alumni/feedback", icon: MessageCircle },
  { label: "Profile", to: "/alumni/profile", icon: User }
];

function PageFallback() {
  return <Loader label="Loading page..." />;
}

function AlumniRoutes() {
  return (
    <ProtectedRoute role="ALUMNI">
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route element={<AppShell menu={alumniMenu} roleLabel="Alumni Workspace" />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="directory" element={<Directory />} />
            <Route path="events" element={<Events />} />
            <Route path="posts" element={<Posts />} />
            <Route path="mentorship" element={<Mentor />} />
            <Route path="announcement" element={<Announcement />} />
            <Route path="feedback" element={<Feedback />} />
            <Route path="profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </ProtectedRoute>
  );
}

export default AlumniRoutes;
