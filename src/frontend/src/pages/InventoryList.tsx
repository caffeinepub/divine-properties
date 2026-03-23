import { FileText, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { InventoryChecklist, Property } from "../backend";
import { useActor } from "../hooks/useActor";
import { printInventoryPDF } from "../utils/pdf";

const PAGE_SIZE = 10;

export default function InventoryList() {
  const navigate = useNavigate();
  const { actor } = useActor();
  const [checklists, setChecklists] = useState<InventoryChecklist[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!actor) return;
    Promise.all([
      actor.getAllInventoryChecklists(),
      actor.getAllProperties(),
    ]).then(([c, p]) => {
      setChecklists(c);
      setProperties(p);
      setLoading(false);
    });
  }, [actor]);

  const getPropertyName = (id: bigint) =>
    properties.find((p) => p.id === id)?.title ?? "-";

  const handleDelete = async (id: bigint) => {
    if (!actor) return;
    if (!confirm("Delete this checklist?")) return;
    try {
      await actor.deleteInventoryChecklist(id);
      setChecklists((prev) => prev.filter((c) => c.id !== id));
      toast.success("Checklist deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const totalPages = Math.ceil(checklists.length / PAGE_SIZE);
  const pageData = checklists.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const startRow = checklists.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endRow = Math.min(page * PAGE_SIZE, checklists.length);

  if (loading || !actor)
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Loading...
      </div>
    );

  const Pagination = () =>
    checklists.length > PAGE_SIZE ? (
      <div className="flex items-center justify-between px-4 py-3 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Showing {startRow}\u2013{endRow} of {checklists.length}
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
        <p className="text-sm text-muted-foreground">
          {checklists.length} checklists
        </p>
        <button
          type="button"
          onClick={() => navigate("/inventory/add")}
          className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold hover:opacity-90 transition-all whitespace-nowrap"
          style={{ background: "oklch(0.72 0.13 75)", color: "oklch(0.1 0 0)" }}
          data-ocid="inventory.primary_button"
        >
          <Plus size={16} /> Add Checklist
        </button>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3" data-ocid="inventory.list">
        {pageData.length === 0 ? (
          <div
            className="bg-card rounded-lg border border-border px-4 py-10 text-center text-muted-foreground"
            data-ocid="inventory.empty_state"
          >
            No checklists yet
          </div>
        ) : (
          pageData.map((c, idx) => (
            <div
              key={String(c.id)}
              className="bg-card rounded-lg border border-border p-4 space-y-2"
              data-ocid={`inventory.item.${idx + 1}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-foreground">
                    {getPropertyName(c.propertyId)}
                  </p>
                  <p className="text-sm text-muted-foreground">{c.date}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1 text-sm">
                <div>
                  <span className="text-muted-foreground">Owner: </span>
                  <span>{c.ownerName || "-"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Tenant: </span>
                  <span>{c.tenantName || "-"}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => navigate(`/inventory/${c.id}/edit`)}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors text-xs"
                  data-ocid={`inventory.edit_button.${idx + 1}`}
                >
                  <Pencil size={14} /> Edit
                </button>
                <button
                  type="button"
                  onClick={() =>
                    printInventoryPDF(c, getPropertyName(c.propertyId))
                  }
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors text-xs"
                >
                  <FileText size={14} /> PDF
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(c.id)}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors text-xs"
                  data-ocid={`inventory.delete_button.${idx + 1}`}
                >
                  <Trash2 size={14} /> Del
                </button>
              </div>
            </div>
          ))
        )}
        {checklists.length > PAGE_SIZE && (
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
                {["Property", "Owner", "Tenant", "Date", "Actions"].map((h) => (
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
                    colSpan={5}
                    className="px-4 py-10 text-center text-muted-foreground"
                    data-ocid="inventory.empty_state"
                  >
                    No checklists yet
                  </td>
                </tr>
              ) : (
                pageData.map((c, idx) => (
                  <tr
                    key={String(c.id)}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                    data-ocid={`inventory.row.${idx + 1}`}
                  >
                    <td className="px-4 py-3 font-medium">
                      {getPropertyName(c.propertyId)}
                    </td>
                    <td className="px-4 py-3">{c.ownerName}</td>
                    <td className="px-4 py-3">{c.tenantName}</td>
                    <td className="px-4 py-3">{c.date}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => navigate(`/inventory/${c.id}/edit`)}
                          className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title="Edit"
                          data-ocid={`inventory.edit_button.${idx + 1}`}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            printInventoryPDF(c, getPropertyName(c.propertyId))
                          }
                          className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title="PDF"
                        >
                          <FileText size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(c.id)}
                          className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                          title="Delete"
                          data-ocid={`inventory.delete_button.${idx + 1}`}
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
