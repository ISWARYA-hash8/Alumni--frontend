import { Suspense, lazy } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Loader from "../components/Loader";

const Login = lazy(() => import("../pages/auth/Login"));
const OAuthSuccess = lazy(() => import("../pages/auth/OAuthSuccess"));
const AdminRoutes = lazy(() => import("./AdminRoutes"));
const AlumniRoutes = lazy(() => import("./AlumniRoutes"));

function RouteLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <Loader label="Loading workspace..." />
    </div>
  );
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteLoader />}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/oauth-success" element={<OAuthSuccess />} />
          <Route path="/admin/*" element={<AdminRoutes />} />
          <Route path="/alumni/*" element={<AlumniRoutes />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default AppRoutes;
