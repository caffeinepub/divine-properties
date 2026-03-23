import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import InventoryForm from "./pages/InventoryForm";
import InventoryList from "./pages/InventoryList";
import InvoiceForm from "./pages/InvoiceForm";
import InvoiceList from "./pages/InvoiceList";
import Login from "./pages/Login";
import PropertyDetail from "./pages/PropertyDetail";
import PropertyForm from "./pages/PropertyForm";
import PropertyList from "./pages/PropertyList";
import SiteVisitForm from "./pages/SiteVisitForm";
import SiteVisitList from "./pages/SiteVisitList";

export default function App() {
  const [authed, setAuthed] = useState(
    () => sessionStorage.getItem("dp_auth") === "1",
  );

  if (!authed) {
    return (
      <>
        <Toaster position="top-right" />
        <Login onLogin={() => setAuthed(true)} />
      </>
    );
  }

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route
          path="/"
          element={
            <Layout
              onLogout={() => {
                sessionStorage.removeItem("dp_auth");
                setAuthed(false);
              }}
            />
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="properties" element={<PropertyList />} />
          <Route path="properties/add" element={<PropertyForm />} />
          <Route path="properties/:id" element={<PropertyDetail />} />
          <Route path="properties/:id/edit" element={<PropertyForm />} />
          <Route path="visits" element={<SiteVisitList />} />
          <Route path="visits/add" element={<SiteVisitForm />} />
          <Route path="visits/:id/edit" element={<SiteVisitForm />} />
          <Route path="inventory" element={<InventoryList />} />
          <Route path="inventory/add" element={<InventoryForm />} />
          <Route path="inventory/:id/edit" element={<InventoryForm />} />
          <Route path="invoices" element={<InvoiceList />} />
          <Route path="invoices/add" element={<InvoiceForm />} />
          <Route path="invoices/:id/edit" element={<InvoiceForm />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
