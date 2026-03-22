import type {
  InventoryChecklist,
  Invoice,
  Property,
  SiteVisit,
} from "../backend";

function injectPrintStyles() {
  if (document.getElementById("pdf-print-styles")) return;
  const style = document.createElement("style");
  style.id = "pdf-print-styles";
  style.textContent = `
    #print-area { display: none; }
    @media print {
      body > * { display: none !important; }
      #print-area { display: block !important; }
    }
  `;
  document.head.appendChild(style);
}

function setPrintArea(html: string) {
  injectPrintStyles();
  let area = document.getElementById("print-area");
  if (!area) {
    area = document.createElement("div");
    area.id = "print-area";
    document.body.appendChild(area);
  }
  area.innerHTML = html;
}

const headerFooter = `
  <div style="margin-bottom:24px;">
    <img src="/assets/uploads/header-2.jpg" style="width:100%;display:block;" />
  </div>
  <div style="height:1px;background:linear-gradient(to right,#C9A84C,transparent);margin-bottom:24px;"></div>
`;

const footerHTML = `
  <div style="margin-top:40px;">
    <div style="height:1px;background:linear-gradient(to right,#C9A84C,transparent);margin-bottom:12px;"></div>
    <img src="/assets/uploads/footer-1.jpg" style="width:100%;display:block;" />
  </div>
`;

function sectionTitle(title: string) {
  return `<div style="font-size:13px;font-weight:700;color:#C9A84C;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #e5e7eb;padding-bottom:6px;margin:20px 0 12px;">${title}</div>`;
}

function row(label: string, value: string) {
  return `<div style="display:flex;gap:8px;margin-bottom:6px;"><span style="font-size:13px;color:#6b7280;width:160px;flex-shrink:0;">${label}</span><span style="font-size:13px;font-weight:500;color:#111;">${value}</span></div>`;
}

export function printPropertyPDF(p: Property) {
  const fmt = (n: bigint) =>
    n > 0n ? `\u20b9${Number(n).toLocaleString("en-IN")}` : "-";
  const html = `
    <div style="font-family:sans-serif;padding:24px 32px;max-width:800px;margin:0 auto;">
      ${headerFooter}
      <h2 style="font-size:20px;font-weight:700;color:#111;margin-bottom:4px;">Property Listing</h2>
      <p style="font-size:13px;color:#6b7280;">Divine Properties - Where Value Meets Vision</p>
      ${sectionTitle("Owner Details")}
      ${row("Name", p.ownerName)}
      ${row("Contact", p.contact)}
      ${row("Email", p.email || "-")}
      ${sectionTitle("Property Details")}
      ${row("Title", p.title)}
      ${row("Type", p.propertyType)}
      ${row("Deal", p.dealType)}
      ${row("Address", p.address)}
      ${row("City", p.city || "-")}
      ${row("Expected Price", fmt(p.expectedPrice))}
      ${row("Expected Rent", fmt(p.expectedRent))}
      ${row("Deposit", fmt(p.deposit))}
      ${sectionTitle("Agreement")}
      ${row("Sale Commission", p.saleCommission > 0n ? `${p.saleCommission}%` : "-")}
      ${row("Rent Commission", p.rentCommission > 0n ? `${p.rentCommission} months` : "-")}
      <div style="margin-top:48px;display:flex;gap:80px;">
        <div style="border-top:1px solid #111;padding-top:6px;width:160px;font-size:12px;color:#6b7280;">Owner Signature</div>
        <div style="border-top:1px solid #111;padding-top:6px;width:160px;font-size:12px;color:#6b7280;">Agent Signature</div>
      </div>
      ${footerHTML}
    </div>
  `;
  setPrintArea(html);
  setTimeout(() => window.print(), 100);
}

export function printVisitPDF(v: SiteVisit, propertyName: string) {
  const html = `
    <div style="font-family:sans-serif;padding:24px 32px;max-width:800px;margin:0 auto;">
      ${headerFooter}
      <h2 style="font-size:20px;font-weight:700;color:#111;margin-bottom:4px;">Site Visit Report</h2>
      ${sectionTitle("Client Details")}
      ${row("Client Name", v.clientName)}
      ${row("Contact", v.contact)}
      ${sectionTitle("Requirement")}
      ${row("Requirement Type", v.requirementType)}
      ${row("Budget", v.budget > 0n ? `\u20b9${Number(v.budget).toLocaleString("en-IN")}` : "-")}
      ${sectionTitle("Visit Info")}
      ${row("Property", propertyName)}
      ${row("Visit Date", v.visitDate)}
      ${row("Remarks", v.remarks || "-")}
      ${footerHTML}
    </div>
  `;
  setPrintArea(html);
  setTimeout(() => window.print(), 100);
}

export function printInventoryPDF(c: InventoryChecklist, propertyName: string) {
  const itemsRows = c.items
    .map(
      (item) => `
    <tr style="border-bottom:1px solid #f3f4f6;">
      <td style="padding:6px 8px;font-size:13px;">${item.itemName}</td>
      <td style="padding:6px 8px;font-size:13px;">${item.qty}</td>
      <td style="padding:6px 8px;font-size:13px;">${item.condition || "-"}</td>
      <td style="padding:6px 8px;font-size:13px;">${item.remarks || "-"}</td>
    </tr>
  `,
    )
    .join("");

  const html = `
    <div style="font-family:sans-serif;padding:24px 32px;max-width:800px;margin:0 auto;">
      ${headerFooter}
      <h2 style="font-size:20px;font-weight:700;color:#111;margin-bottom:4px;">Inventory Checklist</h2>
      ${row("Property", propertyName)}
      ${row("Date", c.date)}
      ${sectionTitle("Items")}
      <table style="width:100%;border-collapse:collapse;">
        <thead><tr style="background:#f9fafb;">
          <th style="text-align:left;padding:8px;font-size:12px;color:#6b7280;text-transform:uppercase;">Item</th>
          <th style="text-align:left;padding:8px;font-size:12px;color:#6b7280;text-transform:uppercase;">Qty</th>
          <th style="text-align:left;padding:8px;font-size:12px;color:#6b7280;text-transform:uppercase;">Condition</th>
          <th style="text-align:left;padding:8px;font-size:12px;color:#6b7280;text-transform:uppercase;">Remarks</th>
        </tr></thead>
        <tbody>${itemsRows}</tbody>
      </table>
      ${sectionTitle("Parties")}
      ${row("Owner", c.ownerName || "-")}
      ${row("Tenant", c.tenantName || "-")}
      <div style="margin-top:48px;display:flex;gap:80px;">
        <div style="border-top:1px solid #111;padding-top:6px;width:160px;font-size:12px;color:#6b7280;">Owner Signature</div>
        <div style="border-top:1px solid #111;padding-top:6px;width:160px;font-size:12px;color:#6b7280;">Tenant Signature</div>
      </div>
      ${footerHTML}
    </div>
  `;
  setPrintArea(html);
  setTimeout(() => window.print(), 100);
}

export function printInvoicePDF(inv: Invoice, propertyName: string) {
  const html = `
    <div style="font-family:sans-serif;padding:24px 32px;max-width:800px;margin:0 auto;">
      ${headerFooter}
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;">
        <div>
          <h2 style="font-size:20px;font-weight:700;color:#111;margin:0 0 4px;">INVOICE</h2>
          <p style="font-size:13px;color:#6b7280;margin:0;">${inv.invoiceNumber}</p>
        </div>
        <div style="text-align:right;">
          <p style="font-size:13px;color:#6b7280;margin:0;">Date: ${inv.date}</p>
          <span style="display:inline-block;margin-top:4px;padding:2px 10px;border-radius:999px;font-size:12px;font-weight:600;background:${inv.status === "Paid" ? "#d1fae5" : inv.status === "Cancelled" ? "#fee2e2" : "#fef3c7"};color:${inv.status === "Paid" ? "#065f46" : inv.status === "Cancelled" ? "#991b1b" : "#92400e"};">${inv.status}</span>
        </div>
      </div>
      ${sectionTitle("Details")}
      ${row("Client", inv.clientName)}
      ${row("Property", propertyName)}
      ${row("Description", inv.description || "-")}
      ${sectionTitle("Payment")}
      ${row("Amount", `\u20b9${Number(inv.amount).toLocaleString("en-IN")}`)}
      ${row("Payment Mode", inv.paymentMode)}
      ${footerHTML}
    </div>
  `;
  setPrintArea(html);
  setTimeout(() => window.print(), 100);
}
