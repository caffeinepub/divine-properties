import { FileText, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { Property, SiteVisit } from "../backend";
import { useActor } from "../hooks/useActor";
import { printVisitPDF } from "../utils/pdf";

const PAGE_SIZE = 10;

export default function SiteVisitList() {
  const navigate = useNavigate();
  const { actor } = useActor();
  const [visits, setVisits] = useState<SiteVisit[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!actor) return;
    Promise.all([actor.getAllSiteVisits(), actor.getAllProperties()]).then(
      ([v, p]) => {
        setVisits(v);
        setProperties(p);
        setLoading(false);
      },
    );
  }, [actor]);

  const getPropertyName = (id: bigint) =>
    properties.find((p) => p.id === id)?.title ?? "-";

  const handleDelete = async (id: bigint) => {
    if (!actor) return;
    if (!confirm("Delete this visit?")) return;
    try {
      await actor.deleteSiteVisit(id);
      setVisits((prev) => prev.filter((v) => v.id !== id));
      toast.success("Visit deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const totalPages = Math.ceil(visits.length / PAGE_SIZE);
  const pageData = visits.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const startRow = visits.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endRow = Math.min(page * PAGE_SIZE, visits.length);

  if (loading || !actor)
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Loading...
      </div>
    );

  const Pagination = () =>
    visits.length > PAGE_SIZE ? (
      <div className="flex items-center justify-between px-4 py-3 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Showing {startRow}\u2013{endRow} of {visits.length}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-xs border border-border rounded-md hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span
            className="text-xs font-medium px-2"
            style={{ color: "oklch(0.55 0.13 75)" }}
          >
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-xs border border-border rounded-md hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    ) : null;

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center gap-3">
        <p className="text-sm text-muted-foreground">{visits.length} visits</p>
        <button
          type="button"
          onClick={() => navigate("/visits/add")}
          className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold hover:opacity-90 transition-all whitespace-nowrap"
          style={{ background: "oklch(0.72 0.13 75)", color: "oklch(0.1 0 0)" }}
          data-ocid="visit.primary_button"
        >
          <Plus size={16} /> Add Visit
        </button>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3" data-ocid="visit.list">
        {pageData.length === 0 ? (
          <div
            className="bg-card rounded-lg border border-border px-4 py-10 text-center text-muted-foreground"
            data-ocid="visit.empty_state"
          >
            No site visits yet
          </div>
        ) : (
          pageData.map((v, idx) => (
            <div
              key={String(v.id)}
              className="bg-card rounded-lg border border-border p-4 space-y-2"
              data-ocid={`visit.item.${idx + 1}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-foreground">
                    {v.clientName}
                  </p>
                  <p className="text-sm text-muted-foreground">{v.contact}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {v.visitDate}
                </span>
              </div>
              <p className="text-sm">
                <span className="text-muted-foreground">Property: </span>
                <span className="font-medium">
                  {getPropertyName(v.propertyId)}
                </span>
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">Budget: </span>
                <span className="font-medium">
                  {v.budget > 0n
                    ? `\u20b9${Number(v.budget).toLocaleString("en-IN")}`
                    : "-"}
                </span>
              </p>
              <div className="flex items-center gap-1 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => navigate(`/visits/${v.id}/edit`)}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors text-xs"
                  data-ocid={`visit.edit_button.${idx + 1}`}
                >
                  <Pencil size={14} /> Edit
                </button>
                <button
                  type="button"
                  onClick={() =>
                    printVisitPDF(v, getPropertyName(v.propertyId))
                  }
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors text-xs"
                >
                  <FileText size={14} /> PDF
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(v.id)}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors text-xs"
                  data-ocid={`visit.delete_button.${idx + 1}`}
                >
                  <Trash2 size={14} /> Del
                </button>
              </div>
            </div>
          ))
        )}
        {visits.length > PAGE_SIZE && (
          <div className="bg-card rounded-lg border border-border">
            <Pagination />
          </div>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr
                style={{ background: "oklch(0.95 0 0)" }}
                className="border-b border-border"
              >
                {[
                  "Client",
                  "Contact",
                  "Property",
                  "Budget",
                  "Visit Date",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageData.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-muted-foreground"
                    data-ocid="visit.empty_state"
                  >
                    No site visits yet
                  </td>
                </tr>
              ) : (
                pageData.map((v, idx) => (
                  <tr
                    key={String(v.id)}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                    data-ocid={`visit.row.${idx + 1}`}
                  >
                    <td className="px-4 py-3 font-medium">{v.clientName}</td>
                    <td className="px-4 py-3">{v.contact}</td>
                    <td className="px-4 py-3">
                      {getPropertyName(v.propertyId)}
                    </td>
                    <td className="px-4 py-3">
                      {v.budget > 0n
                        ? `\u20b9${Number(v.budget).toLocaleString("en-IN")}`
                        : "-"}
                    </td>
                    <td className="px-4 py-3">{v.visitDate}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => navigate(`/visits/${v.id}/edit`)}
                          className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title="Edit"
                          data-ocid={`visit.edit_button.${idx + 1}`}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            printVisitPDF(v, getPropertyName(v.propertyId))
                          }
                          className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title="PDF"
                        >
                          <FileText size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(v.id)}
                          className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                          title="Delete"
                          data-ocid={`visit.delete_button.${idx + 1}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination />
      </div>
    </div>
  );
}
