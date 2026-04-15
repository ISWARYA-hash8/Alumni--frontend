import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Loader from "../../components/Loader";
import { useAuth } from "../../context/AuthContext";

function OAuthSuccess() {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    const role = searchParams.get("role");
    const userId = searchParams.get("userId");
    const email = searchParams.get("email");
    const profileCompleted = searchParams.get("profileCompleted") === "true";
    const firstTimeLogin = searchParams.get("firstTimeLogin") === "true";

    if (!token || !role || !userId || !email) {
      navigate("/login", { replace: true });
      return;
    }

    login({
      token,
      role,
      user: {
        id: Number(userId),
        email,
        profileCompleted
      }
    });

    if (role === "ADMIN") {
      navigate("/admin/dashboard", { replace: true });
      return;
    }

    navigate(firstTimeLogin || !profileCompleted ? "/alumni/profile" : "/alumni/dashboard", {
      replace: true
    });
  }, [login, navigate, searchParams]);

  return <Loader label="Completing Google sign-in..." />;
}

export default OAuthSuccess;
