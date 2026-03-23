import { FileText, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { Invoice, Property } from "../backend";
import { useActor } from "../hooks/useActor";
import { printInvoicePDF } from "../utils/pdf";

const PAGE_SIZE = 10;

export default function InvoiceList() {
  const navigate = useNavigate();
  const { actor } = useActor();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!actor) return;
    Promise.all([actor.getAllInvoices(), actor.getAllProperties()]).then(
      ([inv, p]) => {
        setInvoices(inv);
        setProperties(p);
        setLoading(false);
      },
    );
  }, [actor]);

  const getPropertyName = (id: bigint) =>
    properties.find((p) => p.id === id)?.title ?? "-";

  const handleDelete = async (id: bigint) => {
    if (!actor) return;
    if (!confirm("Delete this invoice?")) return;
    try {
      await actor.deleteInvoice(id);
      setInvoices((prev) => prev.filter((inv) => inv.id !== id));
      toast.success("Invoice deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const statusStyle = (s: string) => {
    if (s === "Paid")
      return {
        background: "oklch(0.65 0.15 145 / 0.15)",
        color: "oklch(0.45 0.15 145)",
      };
    if (s === "Cancelled")
      return {
        background: "oklch(0.577 0.245 27 / 0.15)",
        color: "oklch(0.5 0.2 27)",
      };
    return {
      background: "oklch(0.72 0.13 75 / 0.15)",
      color: "oklch(0.55 0.13 75)",
    };
  };

  const totalPages = Math.ceil(invoices.length / PAGE_SIZE);
  const pageData = invoices.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const startRow = invoices.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endRow = Math.min(page * PAGE_SIZE, invoices.length);

  if (loading || !actor)
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Loading...
      </div>
    );

  const Pagination = () =>
    invoices.length > PAGE_SIZE ? (
      <div className="flex items-center justify-between px-4 py-3 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Showing {startRow}\u2013{endRow} of {invoices.length}
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
          {invoices.length} invoices
        </p>
        <button
          type="button"
          onClick={() => navigate("/invoices/add")}
          className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold hover:opacity-90 transition-all whitespace-nowrap"
          style={{ background: "oklch(0.72 0.13 75)", color: "oklch(0.1 0 0)" }}
          data-ocid="invoice.primary_button"
        >
          <Plus size={16} /> Create Invoice
        </button>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3" data-ocid="invoice.list">
        {pageData.length === 0 ? (
          <div
            className="bg-card rounded-lg border border-border px-4 py-10 text-center text-muted-foreground"
            data-ocid="invoice.empty_state"
          >
            No invoices yet
          </div>
        ) : (
          pageData.map((inv, idx) => (
            <div
              key={String(inv.id)}
              className="bg-card rounded-lg border border-border p-4 space-y-2"
              data-ocid={`invoice.item.${idx + 1}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-mono font-semibold text-foreground">
                    {inv.invoiceNumber}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {inv.clientName}
                  </p>
                </div>
                <span
                  className="px-2.5 py-0.5 rounded-full text-xs font-semibold flex-shrink-0"
                  style={statusStyle(inv.status)}
                >
                  {inv.status}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground text-xs truncate">
                  {getPropertyName(inv.propertyId)}
                </span>
                <span
                  className="font-semibold"
                  style={{ color: "oklch(0.55 0.13 75)" }}
                >
                  {inv.amount > 0n
                    ? `\u20b9${Number(inv.amount).toLocaleString("en-IN")}`
                    : "-"}
                </span>
              </div>
              <div className="flex items-center gap-1 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => navigate(`/invoices/${inv.id}/edit`)}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors text-xs"
                  data-ocid={`invoice.edit_button.${idx + 1}`}
                >
                  <Pencil size={14} /> Edit
                </button>
                <button
                  type="button"
                  onClick={() =>
                    printInvoicePDF(inv, getPropertyName(inv.propertyId))
                  }
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors text-xs"
                >
                  <FileText size={14} /> PDF
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(inv.id)}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors text-xs"
                  data-ocid={`invoice.delete_button.${idx + 1}`}
                >
                  <Trash2 size={14} /> Del
                </button>
              </div>
            </div>
          ))
        )}
        {invoices.length > PAGE_SIZE && (
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
                  "Invoice No",
                  "Client",
                  "Property",
                  "Amount",
                  "Status",
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
                    data-ocid="invoice.empty_state"
                  >
                    No invoices yet
                  </td>
                </tr>
              ) : (
                pageData.map((inv, idx) => (
                  <tr
                    key={String(inv.id)}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                    data-ocid={`invoice.row.${idx + 1}`}
                  >
                    <td className="px-4 py-3 font-mono font-medium">
                      {inv.invoiceNumber}
                    </td>
                    <td className="px-4 py-3">{inv.clientName}</td>
                    <td className="px-4 py-3">
                      {getPropertyName(inv.propertyId)}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {inv.amount > 0n
                        ? `\u20b9${Number(inv.amount).toLocaleString("en-IN")}`
                        : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                        style={statusStyle(inv.status)}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => navigate(`/invoices/${inv.id}/edit`)}
                          className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title="Edit"
                          data-ocid={`invoice.edit_button.${idx + 1}`}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            printInvoicePDF(
                              inv,
                              getPropertyName(inv.propertyId),
                            )
                          }
                          className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title="PDF"
                        >
                          <FileText size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(inv.id)}
                          className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                          title="Delete"
                          data-ocid={`invoice.delete_button.${idx + 1}`}
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
