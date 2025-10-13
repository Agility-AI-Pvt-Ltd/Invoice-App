// FILE : client/src/components/invoice-form/Step1Form.tsx

import { useContext, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/Input";
import { ChevronDown, RefreshCw } from "lucide-react";
import { InvoiceContext } from "@/contexts/InvoiceContext";
import { useNextInvoiceNumber } from "@/hooks/useNextInvoiceNumber";
import Cookies from "js-cookie";

export default function Step1Form() {
  const ctx = useContext(InvoiceContext) as any | undefined;
  const { 
    nextNumber, 
    loading, 
    error, 
    refetch,
    userSettings,
    currentCount 
  } = useNextInvoiceNumber();

  // helper to safely set invoice fields when context is available
  const setField = (key: string, value: any) => {
    if (!ctx) return;
    ctx.setInvoice((prev: any) => ({ ...prev, [key]: value }));

    // clear inline error for this field if present
    // For nested fields, callers should pass keys like "billTo.name"
    const fieldPath = key;
    if (typeof ctx.clearFieldError === "function") {
      ctx.clearFieldError(fieldPath);
    }
  };

  const invoice = ctx?.invoice ?? {};
  const fieldErrors = ctx?.fieldErrors ?? {};

  // Auto-populate invoice number when nextNumber is available
  useEffect(() => {
    if (nextNumber) {
      // Only auto-populate if the field is truly empty
      const currentNumber = invoice.invoiceNumber || "";
      
      if (!currentNumber) {
        setField("invoiceNumber", nextNumber);
      }
    }
  }, [nextNumber, invoice.invoiceNumber]);

  // Listen for refresh events after invoice creation
  useEffect(() => {
    const handleRefreshEvent = () => {
      refetch();
    };

    window.addEventListener('refresh-next-invoice-number', handleRefreshEvent);
    return () => {
      window.removeEventListener('refresh-next-invoice-number', handleRefreshEvent);
    };
  }, [refetch]);

  // Function to refresh next invoice number
  const handleRefreshInvoiceNumber = async () => {
    console.log('🔄 Manual refresh triggered');
    await refetch();
  };

  // Test function to debug API call
  const testApiCall = async () => {
    try {
      console.log('🧪 Testing API call directly...');
      console.log('🧪 All cookies:', document.cookie);
      
      // Test different ways to get the token
      const tokenFromCookies = Cookies.get("authToken");
      const tokenFromDocument = document.cookie.split('authToken=')[1]?.split(';')[0] || '';
      
      console.log('🧪 Token from Cookies.get():', tokenFromCookies ? `${tokenFromCookies.substring(0, 20)}...` : 'none');
      console.log('🧪 Token from document.cookie:', tokenFromDocument ? `${tokenFromDocument.substring(0, 20)}...` : 'none');
      
      const token = tokenFromCookies || tokenFromDocument;
      
      if (!token) {
        console.error('🧪 No token found! User might need to login again.');
        return;
      }
      
      // Test the exact URL that the backend team confirmed is working
      const testUrl = 'http://localhost:4000/api/invoices/next-number';
      console.log('🧪 Testing URL:', testUrl);
      
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('🧪 Response status:', response.status);
      console.log('🧪 Response headers:', response.headers);
      
      if (!response.ok) {
        console.error('🧪 Response not OK:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('🧪 Error response body:', errorText);
        return;
      }
      
      const data = await response.json();
      console.log('🧪 Direct API test result:', data);
    } catch (error) {
      console.error('🧪 Direct API test failed:', error);
    }
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Invoice Number */}
        <div className="space-y-2">
          <Label htmlFor="invoiceNumber" className="text-sm font-medium text-foreground">
            Invoice Number
          </Label>
          <div className="relative">
            <Input
              id="invoiceNumber"
              placeholder="INXXXX"
              className="h-11 px-3 pr-12 text-sm border border-input bg-background placeholder:text-slate-400"
              value={invoice.invoiceNumber ?? ""}
              onChange={(e) => setField("invoiceNumber", e.target.value)}
            />
            <button
              type="button"
              onClick={handleRefreshInvoiceNumber}
              disabled={loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
              title="Refresh next invoice number"
            >
              <RefreshCw 
                size={16} 
                className={`text-muted-foreground ${loading ? 'animate-spin' : ''}`} 
              />
            </button>
          </div>
          {nextNumber && !loading && (
            <div className="text-xs text-muted-foreground">
              <p>💡 Next available number: <span className="font-medium text-blue-600">{nextNumber}</span></p>
              <p>📊 Current count: {currentCount} | Prefix: {userSettings.prefix} | Start: {userSettings.startNumber}</p>
            </div>
          )}
          {error && (
            <div className="text-xs text-red-600">
              <p>❌ Backend API Error: {error}</p>
              <p>💡 Please enter a custom invoice number manually. Backend endpoint needs to be fixed.</p>
            </div>
          )}
          {fieldErrors["invoiceNumber"] && (
            <p className="text-sm text-red-600 mt-1">{fieldErrors["invoiceNumber"]}</p>
          )}
        </div>


        {/* Invoice Date (MANDATORY) */}
        <div className="space-y-2">
          <Label htmlFor="invoiceDate" className="text-sm font-medium text-foreground">
            Invoice Date
            <span className="text-red-600 ml-1 text-sm" aria-hidden>
              *
            </span>
          </Label>
          <Input
            id="invoiceDate"
            type="date"
            placeholder="Pick the Date"
            className="h-11 px-3 text-sm border border-input bg-background placeholder:text-slate-400"
            value={invoice.date ?? ""}
            onChange={(e) => setField("date", e.target.value)}
          />
          {fieldErrors["date"] && (
            <p className="text-sm text-red-600 mt-1">{fieldErrors["date"]}</p>
          )}
        </div>

        {/* Due Date */}
        <div className="space-y-2">
          <Label htmlFor="dueDate" className="text-sm font-medium text-foreground">
            Due Date
          </Label>
          <Input
            id="dueDate"
            type="date"
            placeholder="Pick the Date"
            className="h-11 px-3 text-sm border border-input bg-background placeholder:text-slate-400"
            value={invoice.dueDate ?? ""}
            min={invoice.date || ""} // ✅ Prevent selecting before invoiceDate
            onChange={(e) => setField("dueDate", e.target.value)}
          />
          {fieldErrors["dueDate"] && (
            <p className="text-sm text-red-600 mt-1">{fieldErrors["dueDate"]}</p>
          )}
        </div>

        {/* Status */}
        <div className="space-y-2 relative">
          <Label htmlFor="status" className="text-sm font-medium text-foreground">
            Status
          </Label>
          <div className="relative">
            <select
              id="status"
              className="h-11 px-3 pr-10 text-sm border border-input bg-background placeholder:text-slate-400 appearance-none w-full rounded-md"
              value={invoice.status ?? ""}
              onChange={(e) => setField("status", e.target.value)}
              aria-label="Invoice status"
            >
              <option value="" disabled className="text-slate-400">
                Select
              </option>
              <option value="paid">Paid</option>
              {/* <option value="unpaid">Unpaid</option> */}
              <option value="pending">Pending</option>
            </select>
            <ChevronDown
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              size={18}
            />
          </div>
          {fieldErrors["status"] && (
            <p className="text-sm text-red-600 mt-1">{fieldErrors["status"]}</p>
          )}
        </div>

        {/* Currency */}
        <div className="space-y-2">
          <Label htmlFor="currency" className="text-sm font-medium text-foreground">
            Currency
          </Label>
          <Input
            id="currency"
            placeholder="INR"
            className="h-11 px-3 text-sm border border-input bg-background placeholder:text-slate-400"
            value={invoice.currency ?? ""}
            onChange={(e) => setField("currency", e.target.value)}
          />
          {fieldErrors["currency"] && (
            <p className="text-sm text-red-600 mt-1">{fieldErrors["currency"]}</p>
          )}
        </div>
      </div>
    </div>
  );
}
