import { Download, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Property } from "../backend";
import { useActor } from "../hooks/useActor";
import { printPropertyPDF } from "../utils/pdf";

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { actor } = useActor();
  const [property, setProperty] = useState<Property | null>(null);

  useEffect(() => {
    if (id && actor) actor.getProperty(BigInt(id)).then(setProperty);
  }, [id, actor]);

  if (!property || !actor)
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Loading...
      </div>
    );

  const fmt = (n: bigint) =>
    n > 0n ? `\u20b9${Number(n).toLocaleString("en-IN")}` : "-";

  return (
    <div className="max-w-[700px] space-y-6">
      <div className="flex gap-3 flex-wrap">
        <button
          type="button"
          onClick={() => navigate(`/properties/${id}/edit`)}
          className="flex items-center gap-2 px-4 py-2 rounded-md border border-border text-sm font-medium hover:bg-muted transition-colors"
          data-ocid="property_detail.edit_button"
        >
          <Pencil size={15} /> Edit
        </button>
        <button
          type="button"
          onClick={() => printPropertyPDF(property)}
          className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all hover:opacity-90"
          style={{ background: "oklch(0.72 0.13 75)", color: "oklch(0.1 0 0)" }}
          data-ocid="property_detail.primary_button"
        >
          <Download size={15} /> Download PDF
        </button>
      </div>
      <Section title="Owner Info">
        <Row label="Owner Name" value={property.ownerName} />
        <Row label="Contact" value={property.contact} />
        <Row label="Email" value={property.email || "-"} />
      </Section>
      <Section title="Property Info">
        <Row label="Title" value={property.title} />
        <Row label="Type" value={property.propertyType} />
        <Row label="Deal Type" value={property.dealType} />
        <Row label="Address" value={property.address} />
        <Row label="City" value={property.city || "-"} />
        <Row label="Expected Price" value={fmt(property.expectedPrice)} />
        <Row label="Expected Rent" value={fmt(property.expectedRent)} />
        <Row label="Deposit" value={fmt(property.deposit)} />
      </Section>
      <Section title="Agreement">
        <Row
          label="Sale Commission"
          value={
            property.saleCommission > 0n ? `${property.saleCommission}%` : "-"
          }
        />
        <Row
          label="Rent Commission"
          value={
            property.rentCommission > 0n
              ? `${property.rentCommission} months`
              : "-"
          }
        />
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
}: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div
        className="px-5 py-3 border-b border-border"
        style={{ background: "oklch(0.95 0 0)" }}
      >
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <div className="p-4 sm:p-5 space-y-3">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
      <span className="text-sm text-muted-foreground sm:w-40 sm:flex-shrink-0">
        {label}
      </span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}
