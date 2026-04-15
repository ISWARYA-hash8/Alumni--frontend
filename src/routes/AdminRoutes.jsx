import { Suspense, lazy } from "react";
import { Calendar, LayoutDashboard, Megaphone, MessageCircle, UserPlus, Users } from "lucide-react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "../components/AppShell";
import Loader from "../components/Loader";
import ProtectedRoute from "../components/ProtectedRoute";

const Dashboard = lazy(() => import("../pages/admin/Dashboard"));
const CreateAlumni = lazy(() => import("../pages/admin/CreateAlumni"));
const ManageAlumni = lazy(() => import("../pages/admin/ManageAlumni"));
const EventsManager = lazy(() => import("../pages/admin/EventsManager"));
const Announcement = lazy(() => import("../pages/admin/Announcement"));
const Feedback = lazy(() => import("../pages/admin/Feedback"));

const adminMenu = [
  { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Upload Alumni", to: "/admin/create-alumni", icon: UserPlus },
  { label: "Manage Alumni", to: "/admin/manage-alumni", icon: Users },
  { label: "Events", to: "/admin/events-manager", icon: Calendar },
  { label: "Announcements", to: "/admin/announcement", icon: Megaphone },
  { label: "Feedback", to: "/admin/feedback", icon: MessageCircle }
];

function PageFallback() {
  return <Loader label="Loading page..." />;
}

function AdminRoutes() {
  return (
    <ProtectedRoute role="ADMIN">
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route element={<AppShell menu={adminMenu} roleLabel="Admin Workspace" />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="create-alumni" element={<CreateAlumni />} />
            <Route path="manage-alumni" element={<ManageAlumni />} />
            <Route path="events-manager" element={<EventsManager />} />
            <Route path="announcement" element={<Announcement />} />
            <Route path="feedback" element={<Feedback />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </ProtectedRoute>
  );
}

export default AdminRoutes;
