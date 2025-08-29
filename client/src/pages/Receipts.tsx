import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import InvoiceForm from "@/components/invoice-form/InvoiceForm";
import type { InvoiceModel } from "@/contexts/InvoiceContext";

const Receipts = () => {
  const [editingInvoice, setEditingInvoice] = useState<InvoiceModel | null>(null);

  // Listen for invoice events to refresh data
  useEffect(() => {
    const handleInvoiceSaved = () => {
      setEditingInvoice(null);
    };

    const handleInvoiceDeleted = () => {
      // Refresh logic can be added here if needed
    };

    window.addEventListener("invoice:created", handleInvoiceSaved);
    window.addEventListener("invoice:updated", handleInvoiceSaved);
    window.addEventListener("invoice:deleted", handleInvoiceDeleted);

    return () => {
      window.removeEventListener("invoice:created", handleInvoiceSaved);
      window.removeEventListener("invoice:updated", handleInvoiceSaved);
      window.removeEventListener("invoice:deleted", handleInvoiceDeleted);
    };
  }, []);

  // Listen for table's edit event (fallback) — set editing invoice
  useEffect(() => {
    const handleInvoiceEditEvent = (e: Event) => {
      const custom = e as CustomEvent;
      const detail = custom?.detail;
      if (!detail) return;
      setEditingInvoice(detail as InvoiceModel);
    };
    window.addEventListener("invoice:edit", handleInvoiceEditEvent as EventListener);
    return () => {
      window.removeEventListener("invoice:edit", handleInvoiceEditEvent as EventListener);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-8xl mx-auto space-y-6">

        <Card className="w-full p-4 sm:p-6 bg-white">
          <p className="font-semibold text-2xl mb-4">
            {editingInvoice ? "Edit Receipt" : "Create New Receipt"}
          </p>
          <CardContent className="mt-2">
            <InvoiceForm
              onCancel={() => {
                setEditingInvoice(null);
              }}
              initialData={editingInvoice || undefined}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Receipts;