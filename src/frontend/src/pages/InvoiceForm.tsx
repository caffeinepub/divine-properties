import { useEffect, useId, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import type { Invoice, Property } from "../backend";
import FormSection from "../components/FormSection";
import { useActor } from "../hooks/useActor";

export default function InvoiceForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { actor } = useActor();
  const isEdit = !!id;
  const [properties, setProperties] = useState<Property[]>([]);
  const [invoiceCount, setInvoiceCount] = useState(0);
  const [existingInvoiceNumber, setExistingInvoiceNumber] = useState("");
  const [form, setForm] = useState<Omit<Invoice, "id" | "invoiceNumber">>({
    date: new Date().toISOString().split("T")[0],
    propertyId: 0n,
    clientName: "",
    description: "",
    amount: 0n,
    paymentMode: "UPI",
    status: "Pending",
  });
  const [saving, setSaving] = useState(false);
  const invoiceNoId = useId();
  const dateId = useId();
  const propertySelectId = useId();
  const descId = useId();

  useEffect(() => {
    if (!actor) return;
    actor.getAllProperties().then(setProperties);
    if (isEdit) {
      actor.getInvoice(BigInt(id!)).then((inv) => {
        setExistingInvoiceNumber(inv.invoiceNumber);
        const { id: _id, invoiceNumber: _num, ...rest } = inv;
        setForm(rest);
      });
    } else {
      actor.getAllInvoices().then((inv) => setInvoiceCount(inv.length));
    }
  }, [actor, id, isEdit]);

  const invoiceNo = isEdit
    ? existingInvoiceNumber
    : `DP${String(invoiceCount + 1).padStart(3, "0")}`;

  const set = (field: string, value: string | bigint) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor) return;
    if (!form.clientName || form.amount === 0n) {
      toast.error("Fill required fields");
      return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        await actor.updateInvoice({
          id: BigInt(id!),
          invoiceNumber: existingInvoiceNumber,
          ...form,
        });
        toast.success("Invoice updated");
      } else {
        await actor.addInvoice({ id: 0n, invoiceNumber: invoiceNo, ...form });
        toast.success("Invoice created");
      }
      navigate("/invoices");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-[700px] space-y-8">
      <FormSection title="Invoice Info">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor={invoiceNoId} className="text-sm font-medium">
              Invoice No
            </label>
            <input
              id={invoiceNoId}
              value={invoiceNo}
              readOnly
              className="h-10 px-3 text-sm border border-border rounded-md bg-muted cursor-not-allowed font-mono"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor={dateId} className="text-sm font-medium">
              Date
            </label>
            <input
              id={dateId}
              type="date"
              value={form.date}
              onChange={(e) => set("date", e.target.value)}
              className="h-10 px-3 text-sm border border-border rounded-md bg-background outline-none focus:border-gold"
            />
          </div>
        </div>
      </FormSection>
      <FormSection title="Details">
        <div className="flex flex-col gap-1">
          <label htmlFor={propertySelectId} className="text-sm font-medium">
            Property
          </label>
          <select
            id={propertySelectId}
            value={String(form.propertyId)}
            onChange={(e) => set("propertyId", BigInt(e.target.value))}
            className="h-10 px-3 text-sm border border-border rounded-md bg-background outline-none focus:border-gold"
            style={{
              color: "inherit",
              backgroundColor: "oklch(var(--background))",
            }}
          >
            <option value="0" disabled>
              Select property...
            </option>
            {properties.map((p) => (
              <option
                key={String(p.id)}
                value={String(p.id)}
                style={{ color: "inherit" }}
              >
                {p.title}
              </option>
            ))}
          </select>
        </div>
        <Field
          label="Client Name"
          id="clientName"
          required
          value={form.clientName}
          onChange={(v) => set("clientName", v)}
        />
        <div className="flex flex-col gap-1">
          <label htmlFor={descId} className="text-sm font-medium">
            Description
          </label>
          <textarea
            id={descId}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            className="px-3 py-2 text-sm border border-border rounded-md bg-background outline-none focus:border-gold resize-none"
            rows={3}
          />
        </div>
        <Field
          label="Amount"
          id="amount"
          required
          type="number"
          value={form.amount === 0n ? "" : String(form.amount)}
          onChange={(v) =>
            set("amount", v ? BigInt(Math.round(Number.parseFloat(v))) : 0n)
          }
        />
      </FormSection>
      <FormSection title="Payment">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField
            label="Payment Mode"
            id="paymentMode"
            value={form.paymentMode}
            onChange={(v) => set("paymentMode", v)}
            options={["UPI", "Cash", "Bank Transfer", "Cheque"]}
          />
          <SelectField
            label="Status"
            id="status"
            value={form.status}
            onChange={(v) => set("status", v)}
            options={["Pending", "Paid", "Cancelled"]}
          />
        </div>
      </FormSection>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => navigate("/invoices")}
          className="px-6 py-2 rounded-md border border-border text-sm font-medium hover:bg-muted transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 rounded-md text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all"
          style={{ background: "oklch(0.72 0.13 75)", color: "oklch(0.1 0 0)" }}
        >
          {saving ? "Saving..." : isEdit ? "Update Invoice" : "Create Invoice"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  id,
  required,
  type = "text",
  value,
  onChange,
}: {
  label: string;
  id: string;
  required?: boolean;
  type?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const uid = useId();
  const fieldId = `${id}-${uid}`;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={fieldId} className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      <input
        id={fieldId}
        required={required}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 px-3 text-sm border border-border rounded-md bg-background outline-none focus:border-gold"
      />
    </div>
  );
}

function SelectField({
  label,
  id,
  value,
  onChange,
  options,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  const uid = useId();
  const fieldId = `${id}-${uid}`;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={fieldId} className="text-sm font-medium">
        {label}
      </label>
      <select
        id={fieldId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 px-3 text-sm border border-border rounded-md bg-background outline-none focus:border-gold"
        style={{
          color: "inherit",
          backgroundColor: "oklch(var(--background))",
        }}
      >
        {options.map((o) => (
          <option key={o} style={{ color: "inherit" }}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
