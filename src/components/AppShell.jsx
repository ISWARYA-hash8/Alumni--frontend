import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { LogOut, Menu, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function AppShell({ menu, roleLabel }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const { auth, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <aside
          className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-slate-200 bg-white shadow-soft transition-all duration-300 md:translate-x-0 ${
            desktopCollapsed ? "md:w-20" : "md:w-64"
          } ${mobileOpen ? "translate-x-0 w-64" : "-translate-x-full w-64"}`}
        >
          <div
            className={`flex items-center border-b border-slate-200 px-4 py-4 ${
              desktopCollapsed ? "justify-center md:px-3" : "justify-between"
            }`}
          >
            {!desktopCollapsed ? (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-indigo-500">
                  BIT Alumni Connect
                </p>
                <h2 className="mt-1.5 text-lg font-semibold text-slate-900">{roleLabel}</h2>
              </div>
            ) : (
              <div className="hidden rounded-2xl bg-indigo-600 px-3 py-2 text-sm font-bold text-white md:block">
                BAC
              </div>
            )}

            <button
              type="button"
              className="rounded-full p-2 text-slate-500 hover:bg-slate-100 md:hidden"
              onClick={() => setMobileOpen(false)}
            >
              <X size={18} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-5">
            <div className="flex flex-col gap-1.5">
            {menu.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  title={desktopCollapsed ? item.label : undefined}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center rounded-2xl text-sm font-medium transition ${
                      desktopCollapsed
                        ? "justify-center px-3 py-3"
                        : "gap-3 px-3.5 py-2.5"
                    } ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-lg"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`
                  }
                >
                  {Icon ? <Icon size={18} /> : null}
                  {!desktopCollapsed ? <span>{item.label}</span> : null}
                </NavLink>
              );
            })}
            </div>
          </nav>

          <div className="mt-auto border-t border-slate-200 px-4 py-4">
            <div className={`rounded-2xl bg-slate-50 ${desktopCollapsed ? "p-3 text-center" : "p-3.5"}`}>
              {!desktopCollapsed ? (
                <>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Signed in as</p>
                  <p className="mt-1.5 truncate text-sm font-semibold text-slate-700">
                    {auth?.user?.email || "User"}
                  </p>
                </>
              ) : (
                <p className="text-xs font-semibold text-slate-600">{auth?.user?.email?.charAt(0)?.toUpperCase() || "U"}</p>
              )}
            </div>
          </div>
        </aside>

        {mobileOpen ? (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-slate-950/30 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        ) : null}

        <div
          className={`flex min-h-screen flex-1 flex-col transition-all duration-300 ${
            desktopCollapsed ? "md:pl-20" : "md:pl-64"
          }`}
        >
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
            <div className="flex items-center justify-between gap-3 px-4 py-3.5 md:px-7">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="rounded-full border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 md:hidden"
                  onClick={() => setMobileOpen(true)}
                >
                  <Menu size={18} />
                </button>

                <button
                  type="button"
                  className="hidden rounded-full border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 md:inline-flex"
                  onClick={() => setDesktopCollapsed((current) => !current)}
                >
                  {desktopCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
                </button>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 md:px-4"
              >
                <LogOut size={15} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-x-hidden">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export default AppShell;
