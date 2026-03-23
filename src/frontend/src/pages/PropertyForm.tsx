import { useEffect, useId, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import type { Property } from "../backend";
import FormSection from "../components/FormSection";
import { useActor } from "../hooks/useActor";

const EMPTY: Omit<Property, "id"> = {
  ownerName: "",
  contact: "",
  email: "",
  title: "",
  propertyType: "Residential",
  dealType: "Rent",
  address: "",
  city: "",
  expectedPrice: 0n,
  expectedRent: 0n,
  deposit: 0n,
  saleCommission: 0n,
  rentCommission: 0n,
};

export default function PropertyForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { actor } = useActor();
  const isEdit = !!id;
  const [form, setForm] = useState<Omit<Property, "id">>(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit && actor) {
      actor.getProperty(BigInt(id!)).then((p) => {
        const { id: _id, ...rest } = p;
        setForm(rest);
      });
    }
  }, [id, isEdit, actor]);

  const set = (field: string, value: string | bigint) =>
    setForm((prev) => ({ ...prev, [field]: value }));
  const num = (v: string) =>
    v ? BigInt(Math.round(Number.parseFloat(v))) : 0n;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor) return;
    if (!form.ownerName || !form.contact || !form.title || !form.address) {
      toast.error("Please fill required fields");
      return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        await actor.updateProperty({ id: BigInt(id!), ...form });
        toast.success("Property updated");
      } else {
        await actor.addProperty({ id: 0n, ...form });
        toast.success("Property added");
      }
      navigate("/properties");
    } catch {
      toast.error("Failed to save property");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-[700px] space-y-8 px-0">
      <FormSection title="Owner Details">
        <Field
          label="Owner Name"
          id="ownerName"
          required
          value={form.ownerName}
          onChange={(v) => set("ownerName", v)}
        />
        <Field
          label="Contact"
          id="contact"
          required
          value={form.contact}
          onChange={(v) => set("contact", v)}
        />
        <Field
          label="Email"
          id="email"
          type="email"
          value={form.email}
          onChange={(v) => set("email", v)}
        />
      </FormSection>
      <FormSection title="Property Details">
        <Field
          label="Property Title"
          id="title"
          required
          value={form.title}
          onChange={(v) => set("title", v)}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField
            label="Property Type"
            id="propertyType"
            required
            value={form.propertyType}
            onChange={(v) => set("propertyType", v)}
            options={["Residential", "Commercial", "Industrial", "Open Land"]}
          />
          <SelectField
            label="Deal Type"
            id="dealType"
            required
            value={form.dealType}
            onChange={(v) => set("dealType", v)}
            options={["Rent", "Sale", "Lease"]}
          />
        </div>
        <Field
          label="Address"
          id="address"
          required
          value={form.address}
          onChange={(v) => set("address", v)}
        />
        <Field
          label="City"
          id="city"
          value={form.city}
          onChange={(v) => set("city", v)}
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field
            label="Expected Price"
            id="expectedPrice"
            type="number"
            value={form.expectedPrice === 0n ? "" : String(form.expectedPrice)}
            onChange={(v) => set("expectedPrice", num(v))}
          />
          <Field
            label="Expected Rent"
            id="expectedRent"
            type="number"
            value={form.expectedRent === 0n ? "" : String(form.expectedRent)}
            onChange={(v) => set("expectedRent", num(v))}
          />
          <Field
            label="Deposit"
            id="deposit"
            type="number"
            value={form.deposit === 0n ? "" : String(form.deposit)}
            onChange={(v) => set("deposit", num(v))}
          />
        </div>
      </FormSection>
      <FormSection title="Agreement">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            label="Sale Commission %"
            id="saleCommission"
            type="number"
            value={
              form.saleCommission === 0n ? "" : String(form.saleCommission)
            }
            onChange={(v) => set("saleCommission", num(v))}
          />
          <Field
            label="Rent Commission (months)"
            id="rentCommission"
            type="number"
            value={
              form.rentCommission === 0n ? "" : String(form.rentCommission)
            }
            onChange={(v) => set("rentCommission", num(v))}
          />
        </div>
      </FormSection>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => navigate("/properties")}
          className="px-6 py-2 rounded-md border border-border text-sm font-medium hover:bg-muted transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 rounded-md text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50"
          style={{ background: "oklch(0.72 0.13 75)", color: "oklch(0.1 0 0)" }}
        >
          {saving ? "Saving..." : isEdit ? "Update Property" : "Save Property"}
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
      <label htmlFor={fieldId} className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      <input
        id={fieldId}
        required={required}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 px-3 text-sm border border-border rounded-md bg-background outline-none focus:border-gold transition-colors"
      />
    </div>
  );
}

function SelectField({
  label,
  id,
  required,
  value,
  onChange,
  options,
}: {
  label: string;
  id: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  const uid = useId();
  const fieldId = `${id}-${uid}`;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={fieldId} className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      <select
        id={fieldId}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 px-3 text-sm border border-border rounded-md bg-background outline-none focus:border-gold transition-colors"
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}
