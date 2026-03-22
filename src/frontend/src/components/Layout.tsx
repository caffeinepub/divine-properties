import {
  Building2,
  CalendarCheck,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Search,
  User,
} from "lucide-react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/properties", icon: Building2, label: "Properties" },
  { to: "/visits", icon: CalendarCheck, label: "Site Visits" },
  { to: "/inventory", icon: ClipboardList, label: "Inventory" },
  { to: "/invoices", icon: FileText, label: "Invoices" },
];

export default function Layout() {
  const location = useLocation();

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

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "oklch(0.97 0 0)" }}
    >
      {/* Sidebar */}
      <aside
        className="w-60 flex-shrink-0 flex flex-col"
        style={{ background: "oklch(0.1 0 0)" }}
      >
        {/* Logo */}
        <div
          className="flex items-center justify-center py-6 px-4 border-b"
          style={{ borderColor: "oklch(0.2 0 0)" }}
        >
          <img
            src="/assets/uploads/2D-3.png"
            alt="Divine Properties"
            className="h-20 object-contain"
          />
        </div>
        {/* Nav */}
        <nav className="flex-1 py-6 px-3 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
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
          <p className="text-xs" style={{ color: "oklch(0.4 0 0)" }}>
            Where Value Meets Vision
          </p>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 flex-shrink-0">
          <h1 className="text-xl font-semibold text-foreground font-display">
            {pageTitle()}
          </h1>
          <div className="flex items-center gap-4">
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
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: "oklch(0.72 0.13 75)" }}
            >
              <User size={18} style={{ color: "oklch(0.1 0 0)" }} />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-[1200px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
