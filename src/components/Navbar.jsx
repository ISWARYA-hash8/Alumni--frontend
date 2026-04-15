import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {

  const { auth, logout } = useAuth();
  const location = useLocation();

  const role = auth?.role;

  const adminMenu = [
    { name: "Dashboard", path: "/admin/dashboard" },
    { name: "Create Alumni", path: "/admin/create-alumni" },
    { name: "Manage Alumni", path: "/admin/manage-alumni" },
    { name: "Events", path: "/admin/events-manager" },
    { name: "Announcement", path: "/admin/announcement" }
  ];

  const alumniMenu = [
    { name: "Home", path: "/alumni/dashboard" },
    { name: "Directory", path: "/alumni/directory" },
    { name: "Events", path: "/alumni/events" },
    { name: "Forum", path: "/alumni/posts" },
    {name: "Mentorship", path: "/alumni/mentorship"},
    {name: "Announcements", path: "/alumni/announcement"},
    { name: "Profile", path: "/alumni/profile" }
  ];

  const menu = role === "ADMIN" ? adminMenu : alumniMenu;

  const handleLogout = () => {
    logout();
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (

<header className="bg-white shadow-md">

<div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

{/* Logo */}
<Link
to="/"
className="text-2xl font-bold text-indigo-600"
>
              BIT Alumni Connect
</Link>

{/* Menu */}
<nav className="flex gap-6 items-center">

{menu.map(item => (

<Link
key={item.path}
to={item.path}
className={`font-medium transition
${
location.pathname === item.path
? "text-indigo-600"
: "text-gray-600 hover:text-indigo-600"
}`}
>
{item.name}
</Link>

))}

</nav>

{/* Logout */}
<button
onClick={handleLogout}
className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
>
Logout
</button>

</div>

</header>

  );

}

export default Navbar;
