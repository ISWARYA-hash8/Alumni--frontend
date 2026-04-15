import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function AlumniLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1">
        <Sidebar collapsed={!sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 bg-gray-100 p-6">{children}</main>
      </div>
      <Footer />
    </div>
  );
}

export default AlumniLayout;