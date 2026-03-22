import { AlertCircle, Building2, CalendarCheck, Users } from "lucide-react";
import { useEffect, useState } from "react";
import type { Invoice, Property, SiteVisit } from "../backend";
import { useActor } from "../hooks/useActor";

interface Activity {
  date: string;
  module: string;
  name: string;
  action: string;
  key: string;
}

const PAGE_SIZE = 10;

export default function Dashboard() {
  const { actor } = useActor();
  const [properties, setProperties] = useState<Property[]>([]);
  const [visits, setVisits] = useState<SiteVisit[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [activityPage, setActivityPage] = useState(1);

  useEffect(() => {
    if (!actor) return;
    Promise.all([
      actor.getAllProperties(),
      actor.getAllSiteVisits(),
      actor.getAllInvoices(),
    ]).then(([p, v, i]) => {
      setProperties(p);
      setVisits(v);
      setInvoices(i);
      setLoading(false);
    });
  }, [actor]);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const totalProperties = properties.length;
  const totalClients = new Set(visits.map((v) => v.clientName)).size;
  const visitsThisMonth = visits.filter((v) => {
    if (!v.visitDate) return false;
    const parts = v.visitDate.split("-");
    if (parts.length < 2) return false;
    return (
      Number(parts[0]) === currentYear && Number(parts[1]) === currentMonth
    );
  }).length;
  const pendingPayments = invoices.filter((i) => i.status === "Pending").length;

  const recentActivity: Activity[] = [
    ...properties.slice(-5).map((p, i) => ({
      date: "Recent",
      module: "Property",
      name: p.ownerName,
      action: "Created",
      key: `p-${i}`,
    })),
    ...visits.slice(-5).map((v, i) => ({
      date: v.visitDate || "Recent",
      module: "Visit",
      name: v.clientName,
      action: "Submitted",
      key: `v-${i}`,
    })),
  ]
    .slice(-20)
    .reverse();

  const totalActivityPages = Math.ceil(recentActivity.length / PAGE_SIZE);
  const activityPageData = recentActivity.slice(
    (activityPage - 1) * PAGE_SIZE,
    activityPage * PAGE_SIZE,
  );
  const activityStart =
    recentActivity.length === 0 ? 0 : (activityPage - 1) * PAGE_SIZE + 1;
  const activityEnd = Math.min(activityPage * PAGE_SIZE, recentActivity.length);

  const stats = [
    {
      label: "Total Properties",
      value: totalProperties,
      icon: Building2,
      color: "oklch(0.72 0.13 75)",
    },
    {
      label: "Total Clients",
      value: totalClients,
      icon: Users,
      color: "oklch(0.65 0.15 200)",
    },
    {
      label: "Visits This Month",
      value: visitsThisMonth,
      icon: CalendarCheck,
      color: "oklch(0.65 0.15 145)",
    },
    {
      label: "Pending Payments",
      value: pendingPayments,
      icon: AlertCircle,
      color: "oklch(0.65 0.2 30)",
    },
  ];

  if (loading || !actor)
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Loading...
      </div>
    );

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-card rounded-lg border border-border p-5 flex items-center gap-4 shadow-xs"
            style={{ borderLeftWidth: 4, borderLeftColor: color }}
          >
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `${color}22` }}
            >
              <Icon size={22} style={{ color }} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-card rounded-lg border border-border">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Recent Activity</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr
                className="border-b border-border"
                style={{ background: "oklch(0.95 0 0)" }}
              >
                {["Date", "Module", "Name", "Action"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activityPageData.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-8 text-center text-muted-foreground"
                  >
                    No activity yet
                  </td>
                </tr>
              ) : (
                activityPageData.map((a) => (
                  <tr
                    key={a.key}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-5 py-3 text-muted-foreground">
                      {a.date}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className="px-2 py-0.5 rounded text-xs font-medium"
                        style={{
                          background: "oklch(0.72 0.13 75 / 0.15)",
                          color: "oklch(0.55 0.13 75)",
                        }}
                      >
                        {a.module}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-medium">{a.name}</td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {a.action}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {recentActivity.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Showing {activityStart}–{activityEnd} of {recentActivity.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActivityPage((p) => Math.max(1, p - 1))}
                disabled={activityPage === 1}
                className="px-3 py-1.5 text-xs border border-border rounded-md hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span
                className="text-xs font-medium px-2"
                style={{ color: "oklch(0.55 0.13 75)" }}
              >
                Page {activityPage} of {totalActivityPages}
              </span>
              <button
                type="button"
                onClick={() =>
                  setActivityPage((p) => Math.min(totalActivityPages, p + 1))
                }
                disabled={activityPage === totalActivityPages}
                className="px-3 py-1.5 text-xs border border-border rounded-md hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
