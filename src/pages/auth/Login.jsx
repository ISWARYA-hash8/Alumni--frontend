import { useEffect, useMemo, useState } from "react";
import { Info, Mail } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/Button";
import { getErrorMessage } from "../../utils/errors";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [forgotInfo, setForgotInfo] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const backendBaseUrl = useMemo(() => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081/api";
    return apiBaseUrl.replace(/\/api\/?$/, "");
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const oauthError = params.get("oauthError");
    if (oauthError) {
      setError(oauthError);
    }
  }, [location.search]);

  const redirectAfterLogin = (role, profileCompleted) => {
    if (role === "ADMIN") {
      navigate("/admin/dashboard");
      return;
    }

    navigate(profileCompleted ? "/alumni/dashboard" : "/alumni/profile");
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await API.post("/auth/login", { email, password });
      const {
        token,
        role,
        userId,
        email: userEmail,
        profileCompleted
      } = response.data;

      login({
        token,
        role,
        user: {
          id: userId,
          email: userEmail,
          profileCompleted
        }
      });

      redirectAfterLogin(role, profileCompleted);
    } catch (apiError) {
      setError(getErrorMessage(apiError, "Invalid email or password"));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${backendBaseUrl}/oauth2/authorization/google`;
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#dbeafe,_#f8fafc_55%,_#e2e8f0)]">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center gap-10 px-6 py-10 lg:flex-row lg:items-center">
        <section className="max-w-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-500">
            BIT Alumni Connect
          </p>
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Bring alumni, mentors, events, and conversations into one shared campus network.
          </h1>
          <p className="mt-5 text-base leading-7 text-slate-600">
            Sign in with your preloaded alumni Google account or use the admin login to manage the platform.
          </p>
        </section>

        <div className="w-full max-w-md rounded-[1.75rem] bg-white p-7 shadow-soft md:p-8">
          <div className="mb-7">
            <h2 className="text-xl font-bold text-slate-900">Login</h2>
            <p className="mt-2 text-sm text-slate-500">Use Google for alumni login or email/password for admin access.</p>
          </div>

          <div className="space-y-4">
            <Button type="button" variant="outline" className="w-full py-3 text-base" onClick={handleGoogleLogin}>
              Login with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-[0.18em]">
                <span className="bg-white px-3 text-slate-400">Admin login</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            {error ? (
              <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            ) : null}

            {forgotInfo ? (
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
                <div className="flex items-start gap-2">
                  <Info size={16} className="mt-0.5 shrink-0" />
                  <span>
                    Contact admin with the college grievance mail id:
                    <span className="ml-1 font-semibold">alumnigrievence.bitsathy.ac.in</span>
                  </span>
                </div>
              </div>
            ) : null}

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-20 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-3 top-3 rounded-full px-3 py-1 text-sm font-medium text-slate-500 transition hover:bg-slate-100"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setForgotInfo((current) => !current)}
              className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              <Mail size={15} />
              Forgot password?
            </button>

            <Button type="submit" variant="primary" className="w-full py-2.5 text-base" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
