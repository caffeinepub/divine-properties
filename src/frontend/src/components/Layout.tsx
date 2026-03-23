import {
  Building2,
  CalendarCheck,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/properties", icon: Building2, label: "Properties" },
  { to: "/visits", icon: CalendarCheck, label: "Site Visits" },
  { to: "/inventory", icon: ClipboardList, label: "Inventory" },
  { to: "/invoices", icon: FileText, label: "Invoices" },
];

export default function Layout({ onLogout }: { onLogout?: () => void }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pageTitle = () => {
    const p = location.pathname;
    if (p === "/") return "Dashboard";
    if (p.startsWith("/properties/add")) return "Add Property";
    if (p.match(/\/properties\/\d+\/edit/)) return "Edit Property";
    if (p.match(/\/properties\/\d+/)) return "Property Details";
    if (p === "/properties") return "Properties";
    if (p === "/visits/add") return "Add Site Visit";
    if (p === "/visits") return "Site Visits";
    if (p === "/inventory/add") return "Add Inventory Checklist";
    if (p === "/inventory") return "Inventory Checklist";
    if (p === "/invoices/add") return "Create Invoice";
    if (p === "/invoices") return "Invoices";
    return "Divine Properties";
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "oklch(0.97 0 0)" }}
    >
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/60 lg:hidden w-full h-full cursor-default border-0 p-0"
          onClick={closeSidebar}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-60 flex-shrink-0 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
        style={{ background: "oklch(0.1 0 0)" }}
      >
        {/* Logo + mobile close */}
        <div
          className="flex items-center justify-between py-4 px-4 border-b"
          style={{ borderColor: "oklch(0.2 0 0)" }}
        >
          <img
            src="/assets/uploads/2D-3.png"
            alt="Divine Properties"
            className="h-16 object-contain"
          />
          <button
            type="button"
            onClick={closeSidebar}
            className="lg:hidden p-1 rounded text-muted-foreground hover:text-foreground"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>
        {/* Nav */}
        <nav className="flex-1 py-6 px-3 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={closeSidebar}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all ${
                  isActive
                    ? "text-gold border-l-4 border-gold pl-2"
                    : "text-sidebar-foreground hover:text-gold hover:bg-sidebar-accent"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        {/* Footer */}
        <div
          className="px-4 py-4 border-t"
          style={{ borderColor: "oklch(0.2 0 0)" }}
        >
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-400 transition-colors mb-3 w-full"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          )}
          <p className="text-xs" style={{ color: "oklch(0.4 0 0)" }}>
            Where Value Meets Vision
          </p>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
            <h1 className="text-lg sm:text-xl font-semibold text-foreground font-display truncate">
              {pageTitle()}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden md:flex items-center">
              <Search
                size={16}
                className="absolute left-3 text-muted-foreground"
              />
              <input
                type="text"
                placeholder="Search..."
                className="pl-9 pr-4 py-2 text-sm bg-muted rounded-md border border-border outline-none focus:border-gold w-48"
              />
            </div>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "oklch(0.72 0.13 75)" }}
            >
              <User size={18} style={{ color: "oklch(0.1 0 0)" }} />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-[1200px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
