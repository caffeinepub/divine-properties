import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Property {
    id: bigint;
    title: string;
    contact: string;
    ownerName: string;
    propertyType: string;
    rentCommission: bigint;
    city: string;
    deposit: bigint;
    email: string;
    address: string;
    saleCommission: bigint;
    expectedPrice: bigint;
    expectedRent: bigint;
    dealType: string;
}
export interface InventoryChecklist {
    id: bigint;
    ownerName: string;
    date: string;
    propertyId: bigint;
    tenantName: string;
    items: Array<Item>;
}
export interface Item {
    qty: bigint;
    itemName: string;
    remarks: string;
    condition: string;
}
export interface Invoice {
    id: bigint;
    status: string;
    clientName: string;
    date: string;
    description: string;
    propertyId: bigint;
    invoiceNumber: string;
    paymentMode: string;
    amount: bigint;
}
export interface SiteVisit {
    id: bigint;
    contact: string;
    clientName: string;
    visitDate: string;
    propertyId: bigint;
    requirementType: string;
    budget: bigint;
    remarks: string;
}
export interface backendInterface {
    addInventoryChecklist(checklist: InventoryChecklist): Promise<bigint>;
    addInvoice(invoice: Invoice): Promise<string>;
    addProperty(property: Property): Promise<bigint>;
    addSiteVisit(siteVisit: SiteVisit): Promise<bigint>;
    getAllInventoryChecklists(): Promise<Array<InventoryChecklist>>;
    getAllInvoices(): Promise<Array<Invoice>>;
    getAllProperties(): Promise<Array<Property>>;
    getAllSiteVisits(): Promise<Array<SiteVisit>>;
    getDefaultChecklistItems(): Promise<Array<Item>>;
    getInventoryChecklist(id: bigint): Promise<InventoryChecklist>;
    getInvoice(id: bigint): Promise<Invoice>;
    getProperty(id: bigint): Promise<Property>;
    getSiteVisit(id: bigint): Promise<SiteVisit>;
}
