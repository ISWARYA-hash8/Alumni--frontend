import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

function ProfileDropdown() {

  const { auth, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const navigate = useNavigate();

  useEffect(() => {

    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);

  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (

    <div className="relative" ref={ref}>

      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 transition"
      >

        <span className="font-medium">
          {auth.user?.name || "☰"}
        </span>

        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>

      </button>

      {open && (

        <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg py-1 z-20">

          {/* Show only for alumni */}
          {auth.role === "ALUMNI" && (
            <Link
              to="/alumni/profile"
              className="block px-4 py-2 text-sm hover:bg-gray-100"
            >
              My Profile
            </Link>
          )}

          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
          >
            Logout
          </button>

        </div>

      )}

    </div>
  );
}

export default ProfileDropdown;