import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import List "mo:core/List";
import Array "mo:core/Array";

actor {
  // Module for Item
  module Item {
    public type Item = {
      itemName : Text;
      qty : Nat;
      condition : Text;
      remarks : Text;
    };

    public func create(itemName : Text, qty : Nat, condition : Text, remarks : Text) : Item {
      {
        itemName;
        qty;
        condition;
        remarks;
      };
    };
  };

  // Module for Property
  module Property {
    public type Property = {
      id : Nat;
      ownerName : Text;
      contact : Text;
      email : Text;
      title : Text;
      propertyType : Text;
      dealType : Text;
      address : Text;
      city : Text;
      expectedPrice : Nat;
      expectedRent : Nat;
      deposit : Nat;
      saleCommission : Nat;
      rentCommission : Nat;
    };

    public func create(
      id : Nat,
      ownerName : Text,
      contact : Text,
      email : Text,
      title : Text,
      propertyType : Text,
      dealType : Text,
      address : Text,
      city : Text,
      expectedPrice : Nat,
      expectedRent : Nat,
      deposit : Nat,
      saleCommission : Nat,
      rentCommission : Nat,
    ) : Property {
      {
        id;
        ownerName;
        contact;
        email;
        title;
        propertyType;
        dealType;
        address;
        city;
        expectedPrice;
        expectedRent;
        deposit;
        saleCommission;
        rentCommission;
      };
    };
  };

  // Module for SiteVisit
  module SiteVisit {
    public type SiteVisit = {
      id : Nat;
      clientName : Text;
      contact : Text;
      requirementType : Text;
      budget : Nat;
      propertyId : Nat;
      visitDate : Text;
      remarks : Text;
    };

    public func create(
      id : Nat,
      clientName : Text,
      contact : Text,
      requirementType : Text,
      budget : Nat,
      propertyId : Nat,
      visitDate : Text,
      remarks : Text,
    ) : SiteVisit {
      {
        id;
        clientName;
        contact;
        requirementType;
        budget;
        propertyId;
        visitDate;
        remarks;
      };
    };
  };

  // Module for InventoryChecklist
  module InventoryChecklist {
    public type InventoryChecklist = {
      id : Nat;
      propertyId : Nat;
      ownerName : Text;
      tenantName : Text;
      date : Text;
      items : [Item.Item];
    };

    public func create(
      id : Nat,
      propertyId : Nat,
      ownerName : Text,
      tenantName : Text,
      date : Text,
      items : [Item.Item],
    ) : InventoryChecklist {
      {
        id;
        propertyId;
        ownerName;
        tenantName;
        date;
        items;
      };
    };
  };

  // Module for Invoice
  module Invoice {
    public type Invoice = {
      id : Nat;
      invoiceNumber : Text;
      date : Text;
      propertyId : Nat;
      clientName : Text;
      description : Text;
      amount : Nat;
      paymentMode : Text;
      status : Text;
    };

    public func create(
      id : Nat,
      invoiceNumber : Text,
      date : Text,
      propertyId : Nat,
      clientName : Text,
      description : Text,
      amount : Nat,
      paymentMode : Text,
      status : Text,
    ) : Invoice {
      {
        id;
        invoiceNumber;
        date;
        propertyId;
        clientName;
        description;
        amount;
        paymentMode;
        status;
      };
    };
  };

  type Action = {
    date : Text;
    moduleName : Text;
    personName : Text;
    action : Text;
  };

  module Action {
    public func compare(a1 : Action, a2 : Action) : Order.Order {
      Text.compare(a1.date, a2.date);
    };
  };

  let properties = Map.empty<Nat, Property.Property>();
  let siteVisits = Map.empty<Nat, SiteVisit.SiteVisit>();
  let inventoryChecklists = Map.empty<Nat, InventoryChecklist.InventoryChecklist>();
  let invoices = Map.empty<Nat, Invoice.Invoice>();

  var propertyId = 0;
  var siteVisitId = 0;
  var checklistId = 0;
  var invoiceId = 0;
  var invoiceNumberId = 1;

  // Property CRUD
  public shared ({ caller }) func addProperty(property : Property.Property) : async Nat {
    let id = propertyId;
    let newProperty = Property.create(
      id,
      property.ownerName,
      property.contact,
      property.email,
      property.title,
      property.propertyType,
      property.dealType,
      property.address,
      property.city,
      property.expectedPrice,
      property.expectedRent,
      property.deposit,
      property.saleCommission,
      property.rentCommission,
    );
    properties.add(id, newProperty);
    propertyId += 1;
    id;
  };

  public shared ({ caller }) func updateProperty(property : Property.Property) : async () {
    let updated = Property.create(
      property.id,
      property.ownerName,
      property.contact,
      property.email,
      property.title,
      property.propertyType,
      property.dealType,
      property.address,
      property.city,
      property.expectedPrice,
      property.expectedRent,
      property.deposit,
      property.saleCommission,
      property.rentCommission,
    );
    properties.add(property.id, updated);
  };

  public shared ({ caller }) func deleteProperty(id : Nat) : async () {
    ignore properties.remove(id);
  };

  public query ({ caller }) func getProperty(id : Nat) : async Property.Property {
    switch (properties.get(id)) {
      case (null) { Runtime.trap("Property does not exist") };
      case (?property) { property };
    };
  };

  public query ({ caller }) func getAllProperties() : async [Property.Property] {
    properties.values().toArray();
  };

  // SiteVisit CRUD
  public shared ({ caller }) func addSiteVisit(siteVisit : SiteVisit.SiteVisit) : async Nat {
    let id = siteVisitId;
    let newSiteVisit = SiteVisit.create(
      id,
      siteVisit.clientName,
      siteVisit.contact,
      siteVisit.requirementType,
      siteVisit.budget,
      siteVisit.propertyId,
      siteVisit.visitDate,
      siteVisit.remarks,
    );
    siteVisits.add(id, newSiteVisit);
    siteVisitId += 1;
    id;
  };

  public shared ({ caller }) func updateSiteVisit(siteVisit : SiteVisit.SiteVisit) : async () {
    let updated = SiteVisit.create(
      siteVisit.id,
      siteVisit.clientName,
      siteVisit.contact,
      siteVisit.requirementType,
      siteVisit.budget,
      siteVisit.propertyId,
      siteVisit.visitDate,
      siteVisit.remarks,
    );
    siteVisits.add(siteVisit.id, updated);
  };

  public shared ({ caller }) func deleteSiteVisit(id : Nat) : async () {
    ignore siteVisits.remove(id);
  };

  public query ({ caller }) func getSiteVisit(id : Nat) : async SiteVisit.SiteVisit {
    switch (siteVisits.get(id)) {
      case (null) { Runtime.trap("SiteVisit does not exist") };
      case (?siteVisit) { siteVisit };
    };
  };

  public query ({ caller }) func getAllSiteVisits() : async [SiteVisit.SiteVisit] {
    siteVisits.values().toArray();
  };

  // InventoryChecklist CRUD
  public shared ({ caller }) func addInventoryChecklist(checklist : InventoryChecklist.InventoryChecklist) : async Nat {
    let id = checklistId;
    let newChecklist = InventoryChecklist.create(
      id,
      checklist.propertyId,
      checklist.ownerName,
      checklist.tenantName,
      checklist.date,
      checklist.items,
    );
    inventoryChecklists.add(id, newChecklist);
    checklistId += 1;
    id;
  };

  public shared ({ caller }) func updateInventoryChecklist(checklist : InventoryChecklist.InventoryChecklist) : async () {
    let updated = InventoryChecklist.create(
      checklist.id,
      checklist.propertyId,
      checklist.ownerName,
      checklist.tenantName,
      checklist.date,
      checklist.items,
    );
    inventoryChecklists.add(checklist.id, updated);
  };

  public shared ({ caller }) func deleteInventoryChecklist(id : Nat) : async () {
    ignore inventoryChecklists.remove(id);
  };

  public query ({ caller }) func getInventoryChecklist(id : Nat) : async InventoryChecklist.InventoryChecklist {
    switch (inventoryChecklists.get(id)) {
      case (null) { Runtime.trap("InventoryChecklist does not exist") };
      case (?checklist) { checklist };
    };
  };

  public query ({ caller }) func getAllInventoryChecklists() : async [InventoryChecklist.InventoryChecklist] {
    inventoryChecklists.values().toArray();
  };

  // Invoice CRUD
  public shared ({ caller }) func addInvoice(invoice : Invoice.Invoice) : async Text {
    let id = invoiceId;
    let invoiceNumber = "DP" # invoiceNumberId.toText();
    let newInvoice = Invoice.create(
      id,
      invoiceNumber,
      invoice.date,
      invoice.propertyId,
      invoice.clientName,
      invoice.description,
      invoice.amount,
      invoice.paymentMode,
      invoice.status,
    );
    invoices.add(id, newInvoice);
    invoiceId += 1;
    invoiceNumberId += 1;
    invoiceNumber;
  };

  public shared ({ caller }) func updateInvoice(invoice : Invoice.Invoice) : async () {
    let updated = Invoice.create(
      invoice.id,
      invoice.invoiceNumber,
      invoice.date,
      invoice.propertyId,
      invoice.clientName,
      invoice.description,
      invoice.amount,
      invoice.paymentMode,
      invoice.status,
    );
    invoices.add(invoice.id, updated);
  };

  public shared ({ caller }) func deleteInvoice(id : Nat) : async () {
    ignore invoices.remove(id);
  };

  public query ({ caller }) func getInvoice(id : Nat) : async Invoice.Invoice {
    switch (invoices.get(id)) {
      case (null) { Runtime.trap("Invoice does not exist") };
      case (?invoice) { invoice };
    };
  };

  public query ({ caller }) func getAllInvoices() : async [Invoice.Invoice] {
    invoices.values().toArray();
  };

  // Initial items for checklists
  public query ({ caller }) func getDefaultChecklistItems() : async [Item.Item] {
    [
      Item.create("Fans", 0, "Good", ""),
      Item.create("AC", 0, "Good", ""),
      Item.create("Lights", 0, "Good", ""),
      Item.create("Geyser", 0, "Good", ""),
      Item.create("Keys", 0, "Good", ""),
      Item.create("Cabinets", 0, "Good", ""),
    ];
  };
};
