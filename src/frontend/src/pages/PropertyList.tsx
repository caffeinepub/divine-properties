import { Eye, FileText, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { Property } from "../backend";
import { useActor } from "../hooks/useActor";
import { printPropertyPDF } from "../utils/pdf";

const PAGE_SIZE = 10;

export default function PropertyList() {
  const navigate = useNavigate();
  const { actor } = useActor();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [dealFilter, setDealFilter] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!actor) return;
    actor.getAllProperties().then((p) => {
      setProperties(p);
      setLoading(false);
    });
  }, [actor]);

  const handleSearch = (v: string) => {
    setSearch(v);
    setPage(1);
  };
  const handleTypeFilter = (v: string) => {
    setTypeFilter(v);
    setPage(1);
  };
  const handleDealFilter = (v: string) => {
    setDealFilter(v);
    setPage(1);
  };

  const filtered = properties.filter((p) => {
    const matchSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.ownerName.toLowerCase().includes(search.toLowerCase());
    const matchType = !typeFilter || p.propertyType === typeFilter;
    const matchDeal = !dealFilter || p.dealType === dealFilter;
    return matchSearch && matchType && matchDeal;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const startRow = filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endRow = Math.min(page * PAGE_SIZE, filtered.length);

  const handleDelete = async (id: bigint) => {
    if (!actor) return;
    if (!confirm("Delete this property?")) return;
    try {
      await actor.deleteProperty(id);
      setProperties((prev) => prev.filter((p) => p.id !== id));
      toast.success("Property deleted");
    } catch {
      toast.error("Failed to delete property");
    }
  };

  const formatPrice = (p: Property) => {
    if (p.dealType === "Rent" && p.expectedRent > 0n)
      return `\u20b9${Number(p.expectedRent).toLocaleString("en-IN")}/mo`;
    if (p.expectedPrice > 0n) {
      const n = Number(p.expectedPrice);
      return n >= 100000
        ? `\u20b9${(n / 100000).toFixed(1)}L`
        : `\u20b9${n.toLocaleString("en-IN")}`;
    }
    return "-";
  };

  if (loading || !actor)
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Loading...
      </div>
    );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {filtered.length} properties
        </p>
        <button
          type="button"
          onClick={() => navigate("/properties/add")}
          className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all hover:opacity-90"
          style={{ background: "oklch(0.72 0.13 75)", color: "oklch(0.1 0 0)" }}
        >
          <Plus size={16} /> Add Property
        </button>
      </div>
      <div className="bg-card rounded-lg border border-border p-4 flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search property..."
          className="flex-1 min-w-40 h-10 px-3 text-sm border border-border rounded-md bg-background outline-none focus:border-gold"
        />
        <select
          value={typeFilter}
          onChange={(e) => handleTypeFilter(e.target.value)}
          className="h-10 px-3 text-sm border border-border rounded-md bg-background outline-none focus:border-gold"
          style={{
            color: "inherit",
            backgroundColor: "oklch(var(--background))",
          }}
        >
          <option value="">All Types</option>
          <option>Residential</option>
          <option>Commercial</option>
          <option>Industrial</option>
          <option>Open Land</option>
        </select>
        <select
          value={dealFilter}
          onChange={(e) => handleDealFilter(e.target.value)}
          className="h-10 px-3 text-sm border border-border rounded-md bg-background outline-none focus:border-gold"
          style={{
            color: "inherit",
            backgroundColor: "oklch(var(--background))",
          }}
        >
          <option value="">All Deals</option>
          <option>Rent</option>
          <option>Sale</option>
          <option>Lease</option>
        </select>
      </div>
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr
                style={{ background: "oklch(0.95 0 0)" }}
                className="border-b border-border"
              >
                {["Property", "Owner", "Type", "Deal", "Price", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {pageData.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-muted-foreground"
                  >
                    No properties found
                  </td>
                </tr>
              ) : (
                pageData.map((p) => (
                  <tr
                    key={String(p.id)}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium">{p.title}</td>
                    <td className="px-4 py-3">{p.ownerName}</td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          background: "oklch(0.72 0.13 75 / 0.15)",
                          color: "oklch(0.55 0.13 75)",
                        }}
                      >
                        {p.propertyType}
                      </span>
                    </td>
                    <td className="px-4 py-3">{p.dealType}</td>
                    <td className="px-4 py-3 font-medium">{formatPrice(p)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => navigate(`/properties/${p.id}`)}
                          className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title="View"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate(`/properties/${p.id}/edit`)}
                          className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => printPropertyPDF(p)}
                          className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title="PDF"
                        >
                          <FileText size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                          title="Delete"
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
        {filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Showing {startRow}–{endRow} of {filtered.length}
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
        )}
      </div>
    </div>
  );
}
