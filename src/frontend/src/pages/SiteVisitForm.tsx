import { useEffect, useId, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import type { Property, SiteVisit } from "../backend";
import FormSection from "../components/FormSection";
import { useActor } from "../hooks/useActor";

const EMPTY: Omit<SiteVisit, "id"> = {
  clientName: "",
  contact: "",
  requirementType: "Buy",
  budget: 0n,
  propertyId: 0n,
  visitDate: "",
  remarks: "",
};

export default function SiteVisitForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { actor } = useActor();
  const isEdit = !!id;
  const [form, setForm] = useState<Omit<SiteVisit, "id">>(EMPTY);
  const [properties, setProperties] = useState<Property[]>([]);
  const [saving, setSaving] = useState(false);
  const propertySelectId = useId();
  const remarksId = useId();

  useEffect(() => {
    if (!actor) return;
    actor.getAllProperties().then(setProperties);
    if (isEdit) {
      actor.getSiteVisit(BigInt(id!)).then((v) => {
        const { id: _id, ...rest } = v;
        setForm(rest);
      });
    }
  }, [actor, id, isEdit]);

  const set = (field: string, value: string | bigint) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor) return;
    if (!form.clientName || !form.contact || !form.visitDate) {
      toast.error("Fill required fields");
      return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        await actor.updateSiteVisit({ id: BigInt(id!), ...form });
        toast.success("Site visit updated");
      } else {
        await actor.addSiteVisit({ id: 0n, ...form });
        toast.success("Site visit added");
      }
      navigate("/visits");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-[700px] space-y-8">
      <FormSection title="Client Details">
        <Field
          label="Client Name"
          id="clientName"
          required
          value={form.clientName}
          onChange={(v) => set("clientName", v)}
        />
        <Field
          label="Contact"
          id="contact"
          required
          value={form.contact}
          onChange={(v) => set("contact", v)}
        />
      </FormSection>
      <FormSection title="Requirement">
        <SelectField
          label="Requirement Type"
          id="reqType"
          required
          value={form.requirementType}
          onChange={(v) => set("requirementType", v)}
          options={["Buy", "Rent", "Lease"]}
        />
        <Field
          label="Budget"
          id="budget"
          type="number"
          value={form.budget === 0n ? "" : String(form.budget)}
          onChange={(v) =>
            set("budget", v ? BigInt(Math.round(Number.parseFloat(v))) : 0n)
          }
        />
      </FormSection>
      <FormSection title="Visit Info">
        <div className="flex flex-col gap-1">
          <label htmlFor={propertySelectId} className="text-sm font-medium">
            Property <span className="text-destructive">*</span>
          </label>
          <select
            id={propertySelectId}
            required
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
          label="Visit Date"
          id="visitDate"
          required
          type="date"
          value={form.visitDate}
          onChange={(v) => set("visitDate", v)}
        />
        <div className="flex flex-col gap-1">
          <label htmlFor={remarksId} className="text-sm font-medium">
            Remarks
          </label>
          <textarea
            id={remarksId}
            value={form.remarks}
            onChange={(e) => set("remarks", e.target.value)}
            className="px-3 py-2 text-sm border border-border rounded-md bg-background outline-none focus:border-gold resize-none"
            rows={3}
          />
        </div>
      </FormSection>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => navigate("/visits")}
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
          {saving ? "Saving..." : isEdit ? "Update Visit" : "Save Visit"}
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
      <label htmlFor={fieldId} className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      <select
        id={fieldId}
        required={required}
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
