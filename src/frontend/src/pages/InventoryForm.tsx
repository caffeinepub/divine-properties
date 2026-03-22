import { useEffect, useId, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import type { InventoryChecklist, Item, Property } from "../backend";
import FormSection from "../components/FormSection";
import { useActor } from "../hooks/useActor";

const DEFAULT_ITEMS = ["Fans", "AC", "Lights", "Geyser", "Keys", "Cabinets"];

export default function InventoryForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { actor } = useActor();
  const isEdit = !!id;
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertyIdStr, setPropertyIdStr] = useState<string>("0");
  const [ownerName, setOwnerName] = useState("");
  const [tenantName, setTenantName] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [items, setItems] = useState<Item[]>(
    DEFAULT_ITEMS.map((name) => ({
      itemName: name,
      qty: 1n,
      condition: "",
      remarks: "",
    })),
  );
  const [saving, setSaving] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const propDropdownId = useId();
  const dateInputId = useId();
  const ownerNameId = useId();
  const tenantNameId = useId();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (!actor) return;
    actor.getAllProperties().then(setProperties);
    if (isEdit) {
      actor.getInventoryChecklist(BigInt(id!)).then((c) => {
        setPropertyIdStr(String(Number(c.propertyId)));
        setOwnerName(c.ownerName);
        setTenantName(c.tenantName);
        setDate(c.date);
        setItems(c.items as Item[]);
      });
    }
  }, [actor, id, isEdit]);

  const selectedProperty = properties.find(
    (p) => String(Number(p.id)) === propertyIdStr,
  );

  const updateItem = (i: number, field: keyof Item, value: string | bigint) => {
    setItems((prev) =>
      prev.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor) return;
    if (!propertyIdStr || propertyIdStr === "0") {
      toast.error("Select a property");
      return;
    }
    setSaving(true);
    try {
      const checklist: InventoryChecklist = {
        id: isEdit ? BigInt(id!) : 0n,
        propertyId: BigInt(propertyIdStr),
        ownerName,
        tenantName,
        date,
        items,
      };
      if (isEdit) {
        await actor.updateInventoryChecklist(checklist);
        toast.success("Checklist updated");
      } else {
        await actor.addInventoryChecklist(checklist);
        toast.success("Checklist saved");
      }
      navigate("/inventory");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-[700px] space-y-8">
      <FormSection title="Property">
        <div className="flex flex-col gap-1">
          <label htmlFor={propDropdownId} className="text-sm font-medium">
            Property <span className="text-destructive">*</span>
          </label>
          <div ref={dropdownRef} className="relative">
            <button
              id={propDropdownId}
              type="button"
              onClick={() => setDropdownOpen((o) => !o)}
              className="w-full h-10 px-3 text-sm border border-border rounded-md bg-background outline-none focus:border-gold flex items-center justify-between gap-2 text-left"
            >
              <span
                className={
                  selectedProperty ? "text-foreground" : "text-muted-foreground"
                }
              >
                {selectedProperty
                  ? selectedProperty.title
                  : "Select property..."}
              </span>
              <svg
                aria-hidden="true"
                className={`w-4 h-4 shrink-0 transition-transform text-muted-foreground ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {dropdownOpen && (
              <ul
                className="absolute z-50 mt-1 w-full rounded-md border border-border bg-background shadow-lg overflow-y-auto list-none p-0 m-0"
                style={{ maxHeight: 220 }}
              >
                {properties.length === 0 ? (
                  <li className="px-3 py-2 text-sm text-muted-foreground">
                    No properties found
                  </li>
                ) : (
                  properties.map((p) => {
                    const val = String(Number(p.id));
                    const isSelected = val === propertyIdStr;
                    return (
                      <li key={val}>
                        <button
                          type="button"
                          onClick={() => {
                            setPropertyIdStr(val);
                            setDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors ${
                            isSelected ? "font-semibold" : "text-foreground"
                          }`}
                          style={
                            isSelected ? { color: "oklch(0.72 0.13 75)" } : {}
                          }
                        >
                          {p.title}
                        </button>
                      </li>
                    );
                  })
                )}
              </ul>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor={dateInputId} className="text-sm font-medium">
            Date
          </label>
          <input
            id={dateInputId}
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-10 px-3 text-sm border border-border rounded-md bg-background outline-none focus:border-gold"
          />
        </div>
      </FormSection>
      <FormSection title="Inventory Items">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr
                style={{ background: "oklch(0.95 0 0)" }}
                className="border-b border-border"
              >
                {["Item", "Qty", "Condition", "Remarks"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr
                  key={item.itemName}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-3 py-2 font-medium text-foreground">
                    {item.itemName}
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min="0"
                      value={String(item.qty)}
                      onChange={(e) =>
                        updateItem(
                          i,
                          "qty",
                          e.target.value ? BigInt(e.target.value) : 0n,
                        )
                      }
                      className="h-8 w-16 px-2 text-sm border border-border rounded bg-background outline-none focus:border-gold"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={item.condition}
                      onChange={(e) =>
                        updateItem(i, "condition", e.target.value)
                      }
                      className="h-8 px-2 text-sm border border-border rounded bg-background outline-none focus:border-gold w-full"
                      placeholder="Good/Fair/Poor"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={item.remarks}
                      onChange={(e) => updateItem(i, "remarks", e.target.value)}
                      className="h-8 px-2 text-sm border border-border rounded bg-background outline-none focus:border-gold w-full"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </FormSection>
      <FormSection title="Parties">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor={ownerNameId} className="text-sm font-medium">
              Owner Name
            </label>
            <input
              id={ownerNameId}
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className="h-10 px-3 text-sm border border-border rounded-md bg-background outline-none focus:border-gold"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor={tenantNameId} className="text-sm font-medium">
              Tenant Name
            </label>
            <input
              id={tenantNameId}
              value={tenantName}
              onChange={(e) => setTenantName(e.target.value)}
              className="h-10 px-3 text-sm border border-border rounded-md bg-background outline-none focus:border-gold"
            />
          </div>
        </div>
      </FormSection>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => navigate("/inventory")}
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
          {saving
            ? "Saving..."
            : isEdit
              ? "Update Checklist"
              : "Save Checklist"}
        </button>
      </div>
    </form>
  );
}
