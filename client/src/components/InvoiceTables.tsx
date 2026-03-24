// FILE: client/src/components/InvoiceTables.tsx

import { useState, useEffect } from "react";
import { invoicesAPI } from "@/services/api/dashboard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import {
  Download,
  Trash,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  // ScanLine,
  Filter,
  DownloadCloud,
  X,
  Search,
  Calendar,
  DollarSign,
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";

// import Cookies from "js-cookie";
import { getInvoices, type Invoice } from "@/services/api/invoice";
import api from "@/lib/api";
import { useLocation, useNavigate } from "react-router-dom"; // <-- ADDED
import { useProfile } from "@/contexts/ProfileContext";

interface InvoiceTableProps {
  selectedDate: Date;
  refreshFlag?: number;
  // optional setter so parent can receive the selected invoice object directly
  setEditingInvoice?: (inv: any) => void;
}

interface FilterState {
  searchTerm: string;
  dateFrom: string;
  dateTo: string;
  amountMin: string;
  amountMax: string;
  customerName: string;
  invoiceNumber: string;
}

export function InvoiceTable({ selectedDate, refreshFlag = 0, setEditingInvoice }: InvoiceTableProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeStatusFilter, setActiveStatusFilter] = useState<"all" | "pending" | "paid" | "overdue">("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: "",
    dateFrom: "",
    dateTo: "",
    amountMin: "",
    amountMax: "",
    customerName: "",
    invoiceNumber: "",
  });

  // Camera scanner states
  // const [isCameraScannerOpen, setIsCameraScannerOpen] = useState(false);
  // const [isProcessingScannedImage, setIsProcessingScannedImage] = useState(false);

  const itemsPerPage = 10;

  const location = useLocation(); // <-- ADDED
  const navigate = useNavigate(); // <-- ADDED
  const { profile } = useProfile();

  const fetchInvoices = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use the proper invoices API instead of sales API
      const response = await getInvoices(currentPage, itemsPerPage);
      console.log("=== FETCH INVOICES RESPONSE ===");
      console.log("Full response:", response);
      console.log("Response data:", response.data);
      console.log("First invoice:", response.data?.[0]);
      console.log("=============================");
      setInvoices(response.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch invoices");
      setInvoices([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // const handleScanInvoice = () => {
  //   setIsCameraScannerOpen(true);
  // };

  // const handleImageCapture = async (imageFile: File) => {
  //   console.log("Image captured:", imageFile.name, imageFile.size);
  //   setIsProcessingScannedImage(true);
  //   setIsCameraScannerOpen(false); // Close the scanner

  //   try {
  //     const formData = new FormData();
  //     formData.append('file', imageFile);

  //     const authToken = Cookies.get('authToken');

  //     if (!authToken) {
  //       throw new Error('Authentication token not found. Please login again.');
  //     }

  //     const response = await fetch('https://invoice-backend-604217703209.asia-south1.run.app/api/scan-invoice', {
  //       method: 'POST',
  //       headers: {
  //         'Authorization': `Bearer ${authToken}`,
  //       },
  //       body: formData
  //     });

  //     if (!response.ok) {
  //       const errorData = await response.json();
  //       throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
  //     }

  //     const result = await response.json();

  //     if (result.success) {
  //       alert(`${result.message}\nInvoice ID: ${result.invoiceId}\nType: ${result.invoiceType}`);
  //       fetchInvoices();
  //     } else {
  //       throw new Error('Failed to process invoice');
  //     }

  //   } catch (err: any) {
  //     console.error('Error processing scanned invoice:', err);
  //     alert(err.message || 'Failed to process the scanned invoice. Please try again.');
  //   } finally {
  //     setIsProcessingScannedImage(false);
  //   }
  // };

  // Initial fetch (mount) and re-fetch when selectedDate, currentPage, or external refreshFlag change
  useEffect(() => {
    fetchInvoices();
  }, [selectedDate, refreshFlag, currentPage]);

  // If navigated here with state.openSalesForm -> open the invoice form (Step 1) and clear history state.
  useEffect(() => {
    try {
      const stateAny = (location && (location.state as any)) || {};
      if (stateAny && stateAny.openSalesForm) {
        // Clear any editing invoice (we're creating a new one)
        if (setEditingInvoice) {
          try {
            // pass null so parent knows it's a new invoice
            setEditingInvoice(null as any);
          } catch (e) {
            // ignore if parent doesn't like null
          }
        }
        // Remove the flag from history so it doesn't retrigger on refresh/back
        navigate(location.pathname, { replace: true, state: {} });
      }
    } catch (err) {
      // ignore silently
    }
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen to global invoice events so updates/creates reflect immediately in table.
  useEffect(() => {
    const handleInvoiceEvent = (_e: Event) => {
      // Re-fetch fresh data from server so table stays consistent with backend
      fetchInvoices();
      // ensure user sees newest items: go to first page
      setCurrentPage(1);
    };

    window.addEventListener("invoice:created", handleInvoiceEvent);
    window.addEventListener("invoice:updated", handleInvoiceEvent);
    window.addEventListener("invoice:deleted", handleInvoiceEvent);

    return () => {
      window.removeEventListener("invoice:created", handleInvoiceEvent);
      window.removeEventListener("invoice:updated", handleInvoiceEvent);
      window.removeEventListener("invoice:deleted", handleInvoiceEvent);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, activeStatusFilter, refreshFlag, currentPage]);

  // Map backend payment statuses to filter categories
  const mapStatusToFilter = (paymentStatus: string): string => {
    if (!paymentStatus) return "pending";

    const statusLower = paymentStatus.toLowerCase();

    switch (statusLower) {
      case "paid":
      case "completed":
      case "success":
        return "paid";
      case "sent":
      case "pending":
      case "processing":
        return "pending";
      case "draft":
      case "created":
      case "new":
        return "pending";
      case "overdue":
      case "expired":
      case "late":
        return "overdue";
      case "cancelled":
      case "canceled":
      case "failed":
        return "overdue";
      default:
        return "pending"; // Default fallback
    }
  };

  // Apply all filters to invoices
  const getFilteredInvoices = () => {
    if (!Array.isArray(invoices)) return [];

    let filtered = invoices.slice(); // copy

    // Status filter
    if (activeStatusFilter !== "all") {
      filtered = filtered.filter(invoice =>
        mapStatusToFilter(invoice.status || "") === activeStatusFilter
      );
    }

    // Search term (searches across multiple fields)
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(invoice =>
        (invoice.invoiceNumber || "").toString().toLowerCase().includes(searchLower) ||
        (invoice.billTo?.name || "").toLowerCase().includes(searchLower) ||
        (invoice.items?.[0]?.description || "").toLowerCase().includes(searchLower)
      );
    }

    // Customer name filter
    if (filters.customerName) {
      const customerLower = filters.customerName.toLowerCase();
      filtered = filtered.filter(invoice =>
        (invoice.billTo?.name || "").toLowerCase().includes(customerLower)
      );
    }

    // Invoice number filter
    if (filters.invoiceNumber) {
      const invoiceNumberLower = filters.invoiceNumber.toLowerCase();
      filtered = filtered.filter(invoice =>
        (invoice.invoiceNumber || "").toLowerCase().includes(invoiceNumberLower)
      );
    }

    // Date range filter
    if (filters.dateFrom || filters.dateTo) {
      filtered = filtered.filter(invoice => {
        const invoiceDate = new Date((invoice as any).dateOfSale || (invoice as any).date || "");
        const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
        const toDate = filters.dateTo ? new Date(filters.dateTo) : null;

        if (fromDate && invoiceDate < fromDate) return false;
        if (toDate && invoiceDate > toDate) return false;
        return true;
      });
    }

    // Amount range filter
    if (filters.amountMin || filters.amountMax) {
      filtered = filtered.filter(invoice => {
        const amount = Number(invoice.total || 0);
        const minAmount = filters.amountMin ? parseFloat(filters.amountMin) : null;
        const maxAmount = filters.amountMax ? parseFloat(filters.amountMax) : null;

        if (minAmount !== null && amount < minAmount) return false;
        if (maxAmount !== null && amount > maxAmount) return false;
        return true;
      });
    }

    return filtered;
  };

  const filteredInvoices = getFilteredInvoices();
  const totalPages = Math.max(1, Math.ceil(filteredInvoices.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentInvoices = Array.isArray(filteredInvoices) ? filteredInvoices.slice(startIndex, endIndex) : [];

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeStatusFilter, filters]);

  const goToPage = (page: number) => setCurrentPage(Math.max(1, Math.min(page, totalPages)));

  const getStatusBadge = (status?: string) => {
    if (!status) return <Badge variant="secondary">Unknown</Badge>;

    const filterCategory = mapStatusToFilter(status);

    switch (filterCategory) {
      case "paid":
        return <Badge className="bg-green-50 text-green-600 border-green-200">Paid</Badge>;
      case "pending":
        return <Badge className="bg-yellow-50 text-yellow-600 border-yellow-200">Pending</Badge>;
      case "overdue":
        return <Badge className="bg-red-50 text-red-600 border-red-200">Overdue</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Fallback helpers for resilient display
  const getInvoiceNumber = (
    inv: Partial<Invoice> & { number?: string; invoiceNo?: string; invoice_id?: string }
  ) => inv?.invoiceNumber || inv?.number || inv?.invoiceNo || inv?.invoice_id || "";

  const getCustomerName = (
    inv: Partial<Invoice> & { customerName?: string; clientName?: string; companyName?: string }
  ) => inv?.billTo?.name || inv?.customerName || inv?.clientName || inv?.companyName || "N/A";

  // const formatDatePretty = (value?: string) => {
  //   if (!value) return "";
  //   try {
  //     const d = new Date(value);
  //     if (isNaN(d.getTime())) return String(value);
  //     return format(d, "MMMM d, yyyy");
  //   } catch {
  //     return String(value);
  //   }
  // };

  const formatDueDate = (value?: string) => {
    if (!value) return "N/A";
    try {
      const d = new Date(value);
      if (isNaN(d.getTime())) return String(value);
      return format(d, "MMMM d, yyyy");
    } catch {
      return String(value);
    }
  };

  const downloadCSV = (data: Invoice[], filename: string) => {
    // Professional headers with consistent spacing
    const headers = [
      "INVOICE NUMBER",
      "CUSTOMER NAME",
      "TOTAL AMOUNT",
      "DUE DATE",
      "STATUS",
    ];

    const rows = (Array.isArray(data) ? data : []).map((inv: Invoice) => {
      const invoiceNumber = getInvoiceNumber(inv);
      const customerName = getCustomerName(inv);
      const totalAmount = inv?.total ??
        (inv as any).totalAmount ??
        (inv as any).amount ??
        (inv as any).grandTotal ??
        (inv as any).grand_total ?? 0;

      // Format due date as DD/MM/YY
      const formatDueDateForCSV = (value?: string) => {
        if (!value) return "N/A";
        try {
          const d = new Date(value);
          if (isNaN(d.getTime())) return String(value);
          const day = d.getDate().toString().padStart(2, '0');
          const month = (d.getMonth() + 1).toString().padStart(2, '0');
          const year = d.getFullYear().toString().slice(-2);
          return `${day}/${month}/${year}`;
        } catch {
          return String(value);
        }
      };

      const dueDateFormatted = formatDueDateForCSV(
        (inv as any).dueDate ||
        (inv as any).due_date ||
        (inv as any).paymentDueDate ||
        (inv as any).payment_due_date
      );

      // Use the same status mapping logic as the rendered table
      const rawStatus = inv?.status || "pending";
      const mappedStatus = mapStatusToFilter(rawStatus);
      const displayStatus = mappedStatus === "paid" ? "Paid" :
        mappedStatus === "pending" ? "Pending" :
          mappedStatus === "overdue" ? "Overdue" : "Pending";

      return [
        invoiceNumber,
        customerName,
        `₹${typeof totalAmount === 'number' ? totalAmount.toLocaleString() : String(totalAmount)}`,
        dueDateFormatted,
        displayStatus,
      ];
    });

    // Create professional CSV with proper spacing and structure
    const csvRows = [headers, ...rows];

    // Calculate column widths for better alignment
    // const columnWidths = headers.map((_, colIndex) => {
    //   const allValues = csvRows.map(row => String(row[colIndex] || ""));
    //   return Math.max(...allValues.map(val => val.length));
    // });

    const csvContent = csvRows
      .map((row, rowIndex) => {
        const formattedRow = row.map((cell) => {
          const str = cell == null ? "" : String(cell);
          const cleanStr = str.replace(/"/g, '""');

          // Add padding for better alignment (only for data rows, not headers)
          if (rowIndex === 0) {
            // Headers - keep them clean
            return `"${cleanStr}"`;
          } else {
            // Data rows - add consistent spacing
            return `"${cleanStr}"`;
          }
        });

        // Use consistent separator with proper spacing
        return formattedRow.join(" , ");
      })
      .join("\n");

    // Add professional header and metadata
    const currentDate = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    const professionalHeader = [
      "INVOICE REPORT",
      `Generated on: ${currentDate}`,
      `Total Records: ${rows.length}`,
      "", // Empty line for separation
      csvContent
    ].join("\n");

    // Add BOM for proper UTF-8 encoding in Excel
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + professionalHeader], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (invoiceId: string) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return;
    try {
      await invoicesAPI.delete(invoiceId);
      // remove by id or _id to be safe
      setInvoices(prev => Array.isArray(prev) ? prev.filter(inv => (inv as any).id !== invoiceId && (inv as any)._id !== invoiceId) : []);
      // re-fetch to make sure UI matches server
      fetchInvoices();
    } catch (err: any) {
      alert(err.message || "Failed to delete invoice");
    }
  };

  // Helper functions for HTML generation (copied from Receipts.tsx)
  const safe = (str: any) => {
    if (str === null || str === undefined) return "";
    return String(str).replace(/[<>&"']/g, (m) => {
      const map: Record<string, string> = { "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&#39;" };
      return map[m];
    });
  };

  const fmtDate = (dateStr: any) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    } catch {
      return String(dateStr);
    }
  };

  const numberToWords = (num: number): string => {
    // Simple number to words conversion for Indian format
    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];

    if (num === 0) return "Zero";
    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? " " + ones[num % 10] : "");
    if (num < 1000) return ones[Math.floor(num / 100)] + " Hundred" + (num % 100 ? " " + numberToWords(num % 100) : "");
    if (num < 100000) return numberToWords(Math.floor(num / 1000)) + " Thousand" + (num % 1000 ? " " + numberToWords(num % 1000) : "");
    if (num < 10000000) return numberToWords(Math.floor(num / 100000)) + " Lakh" + (num % 100000 ? " " + numberToWords(num % 100000) : "");
    return numberToWords(Math.floor(num / 10000000)) + " Crore" + (num % 10000000 ? " " + numberToWords(num % 10000000) : "");
  };

  const calcRow = (it: any) => {
    // If backend provides pre-calculated values, use them
    if (it.taxableAmount && it.total) {
      console.log("🔢 Using backend item values:", it);
      return {
        qty: Number(it.quantity || 0),
        rate: Number(it.unitPrice || it.rate || 0),
        gst: Number(it.gst || 0),
        discountAmount: Number(it.discount || 0),
        taxable: Number(it.taxableAmount || 0),
        gstAmount: Number(it.cgst || 0) + Number(it.sgst || 0) + Number(it.igst || 0),
        net: Number(it.total || 0),
      };
    }

    // Fallback to calculation if backend values not available
    const qty = Number(it.quantity || 0);
    const rate = Number(it.unitPrice ?? it.rate ?? 0);
    const gst = Number(it.gst ?? 0);
    const disc = Number(it.discount ?? 0);

    const base = +(qty * rate); // raw base
    const discountAmount = disc > 0 && disc <= 100 ? +(base * disc) / 100 : +disc; // percent or absolute
    const taxable = +(base - (discountAmount || 0));
    const gstAmount = +(taxable * gst) / 100;
    const net = +(taxable + gstAmount);

    return {
      qty,
      rate: +rate,
      gst: +gst,
      discountAmount: +discountAmount,
      taxable: +taxable,
      gstAmount: +gstAmount,
      net: +net,
    };
  };

  const computeTotals = (inv: any) => {
    // If backend provides pre-calculated values, use them
    if ((inv.subtotal !== undefined) && (inv.amount !== undefined)) {
      console.log("🔢 Using backend pre-calculated values:", {
        subtotal: inv.subtotal,
        cgst: inv.cgst,
        sgst: inv.sgst,
        igst: inv.igst,
        amount: inv.amount,
        roundOff: inv.roundOff
      });

      return {
        taxableTotal: Number(inv.subtotal) - (Number(inv.cgst || 0) + Number(inv.sgst || 0) + Number(inv.igst || 0)),
        totalGst: Number(inv.cgst || 0) + Number(inv.sgst || 0) + Number(inv.igst || 0),
        cgst: Number(inv.cgst || 0),
        sgst: Number(inv.sgst || 0),
        igst: Number(inv.igst || 0),
        discount: Number(inv.discount || 0),
        subtotal: Number(inv.subtotal),
        shipping: Number(inv.shipping || 0),
        roundOff: Number(inv.roundOff || 0),
        total: Number(inv.amount),
      };
    }

    // Fallback to calculation if backend values not available
    const items = Array.isArray(inv.invoice_items || inv.items) ? (inv.invoice_items || inv.items) : [];
    let taxableTotal = 0;
    let totalGst = 0;
    let totalIgst = 0;
    let totalDiscount = 0;
    let subtotal = 0; // sum of nets (taxable + gst)

    items.forEach((it: any) => {
      const r = calcRow(it);
      taxableTotal += r.taxable;
      totalGst += r.gstAmount;
      totalIgst += Number(it.igst || 0);
      totalDiscount += Number(r.discountAmount || 0);
      subtotal += r.net;
    });

    // If item IGST was present, derive CGST/SGST from remaining GST; else split equally
    const remainingGst = Math.max(0, totalGst - totalIgst);
    const cgst = +((remainingGst / 2)).toFixed(2);
    const sgst = +((remainingGst / 2)).toFixed(2);

    const shipping = Number(inv.shipping || 0);

    // Subtotal for roundoff calculation should include shipping (if any)
    const rawTotalBeforeRound = +(subtotal + shipping);

    // Round off to nearest rupee (businessy behavior).
    const roundedTotal = Math.round(rawTotalBeforeRound);
    const roundOff = +(roundedTotal - rawTotalBeforeRound).toFixed(2);

    const total = +(rawTotalBeforeRound + roundOff).toFixed(2);

    return {
      taxableTotal: +taxableTotal.toFixed(2),
      totalGst: +totalGst.toFixed(2),
      cgst,
      sgst,
      igst: +totalIgst.toFixed(2),
      discount: +totalDiscount.toFixed(2),
      subtotal: +subtotal.toFixed(2),
      shipping: +shipping.toFixed(2),
      roundOff,
      total,
    };
  };

  const generatePrintableHTML = (inv: any, docType: string) => {
    // Handle backend response structure - data might be nested under 'data' property
    const invoiceData = inv.data || inv;
    console.log("🔍 Processing invoice data:", invoiceData);

    const t = computeTotals(invoiceData);
    const itemsHtml = (Array.isArray(invoiceData.invoice_items || invoiceData.items) ? (invoiceData.invoice_items || invoiceData.items) : []).map((it: any, idx: number) => {
      const r = calcRow(it);
      return `<tr style="page-break-inside:avoid">
        <td style="padding:8px;border:1px solid #ddd;text-align:center">${idx + 1}</td>
        <td style="padding:8px;border:1px solid #ddd">${safe(it.description) || "-"}</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:center">${safe(it.hsn || it.hsn_sac || "-")}</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:right">${r.qty}</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:right">₹${r.rate}</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:right">${r.gst}%</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:right">${(() => { const d = Number(it.discount ?? r.discountAmount ?? 0); return isFinite(d) ? (d <= 100 ? d + '%' : '₹' + d) : safe(String(it.discount ?? '')); })()}</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:right">₹${r.taxable}</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:right">₹${r.net}</td>
      </tr>`;
    }).join("\n");

    const style = `
      html,body{margin:0;padding:0;background:#f7fafc;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial;color:#111827}
      .sheet{max-width:900px;margin:18px auto;background:#fff;padding:20px;border-radius:6px;border:1px solid #e6eef5}
      .header{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap}
      .seller{font-weight:700;color:#0b5cf3}
      .muted{color:#6b7280;font-size:13px}
      table{width:100%;border-collapse:collapse;margin-top:10px}
      th{background:#f3f4f6;padding:8px;border:1px solid #e6e6e6;text-align:left;font-weight:700}
      td{padding:8px;border:1px solid #e6e6e6;font-size:13px}
      .right{text-align:right}
      .no-print{display:block}
      @media print {
        .no-print{display:none}
        .sheet{box-shadow:none;border-radius:0;margin:0;padding:12px}
      }
      tr{page-break-inside:avoid}
      @media (max-width:640px){
        .header{flex-direction:column}
      }
    `;

    const docTitle = docType === "invoices" ? "INVOICE" : "DOCUMENT";

    const docNumber = invoiceData.number || invoiceData.invoiceNumber || invoiceData.billNo;

    const partyName = invoiceData.clientName || invoiceData.partyName || invoiceData.customerName || invoiceData.billTo?.name;

    const sellerName = (profile as any)?.businessName || (profile as any)?.company || (profile as any)?.name || invoiceData.billFrom?.businessName || invoiceData.billFrom?.name || "Seller Name";
    const sellerPhone = (profile as any)?.phone || invoiceData.billFrom?.phone || "";
    const sellerEmail = (profile as any)?.email || invoiceData.billFrom?.email || "";
    const sellerGstin = (profile as any)?.gst || (profile as any)?.gstNumber || invoiceData.billFrom?.gst || invoiceData.billFrom?.gstin || invoiceData.gstin || "";
    const sellerAddress = (profile as any)?.address || invoiceData.billFrom?.address || "";

    const html = `<!doctype html>
      <html>
      <head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${docTitle} ${safe(docNumber)}</title><style>${style}</style></head>
      <body>
        <div class="sheet">
          <div class="header">
            <div style="flex:1">
              <div class="seller">${safe(sellerName)}</div>
              <div class="muted">${safe(sellerAddress)}</div>
              <div class="muted">Phone: ${safe(sellerPhone)} • Email: ${safe(sellerEmail)}</div>
              <div class="muted">GSTIN: ${safe(sellerGstin)}</div>
            </div>
            <div style="width:340px;text-align:right">
              <div style="font-size:18px;font-weight:800">${docTitle}</div>
              <div style="margin-top:8px" class="muted">${docTitle} No: <strong>${safe(docNumber)}</strong></div>
              <div class="muted">Date: ${fmtDate(invoiceData.issueDate || invoiceData.date || invoiceData.dateOfSale || invoiceData.dateIssued)}</div>
              ${invoiceData.dueDate ? `<div class="muted">Due Date: ${fmtDate(invoiceData.dueDate)}</div>` : ""}
            </div>
          </div>

          <div style="display:flex;gap:12px;margin-top:12px;flex-wrap:wrap">
            <div style="flex:1;border:1px solid #eef2f6;padding:10px">
              <div style="font-weight:700">Customer Name & Billing Address</div>
              <div style="margin-top:6px">${safe(partyName)}</div>
              <div class="muted">${safe(invoiceData.clientAddress || invoiceData.billTo?.address || invoiceData.address || "")}</div>
              <div class="muted">GSTIN: ${safe(invoiceData.clientGst || invoiceData.billTo?.gst || invoiceData.billTo?.gstin || invoiceData.gstin || "")}</div>
              <div class="muted">Phone: ${safe(invoiceData.clientPhone || invoiceData.billTo?.phone || invoiceData.phone || "")}</div>
              <div class="muted">Email: ${safe(invoiceData.clientEmail || invoiceData.billTo?.email || invoiceData.email || "")}</div>
            </div>

            <div style="width:320px;border:1px solid #eef2f6;padding:10px">
              <div style="font-weight:700">Shipping Address</div>
              <div style="margin-top:6px">${safe(invoiceData.shipTo?.name || "")}</div>
              <div class="muted">${safe(invoiceData.shipTo?.address || invoiceData.shippingAddress || invoiceData.clientAddress || "")}</div>
            </div>
          </div>

          <div style="margin-top:12px">
            <table>
              <thead>
                <tr>
                  <th style="width:40px;text-align:center">S No</th>
                  <th>Description</th>
                  <th style="width:100px;text-align:center">HSN / SAC</th>
                  <th style="width:60px;text-align:right">Qty</th>
                  <th style="width:100px;text-align:right">Item Rate</th>
                  <th style="width:70px;text-align:right">Tax %</th>
                  <th style="width:90px;text-align:right">Discount</th>
                  <th style="width:110px;text-align:right">Taxable Value</th>
                  <th style="width:120px;text-align:right">Net Amount</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>

          <div style="display:flex;gap:12px;margin-top:12px;align-items:flex-start;flex-wrap:wrap">
            <div style="flex:1">
              <div style="font-weight:700;margin-bottom:6px">Declaration</div>
              <div class="muted" style="white-space:pre-wrap;margin-top:6px">We declare that this ${docTitle.toLowerCase()} shows the actual price of the goods / services described and that all particulars are true and correct.</div>
              ${invoiceData.description || invoiceData.remark || invoiceData.reason || invoiceData.notes ? `<div style="margin-top:12px;font-weight:700;margin-bottom:6px">Remarks</div><div class="muted">${safe(invoiceData.description || invoiceData.remark || invoiceData.reason || invoiceData.notes)}</div>` : ""}
            </div>

            <div style="width:340px">
              <div style="border:1px solid #eef2f6;padding:10px;background:#fcfeff">
                <div style="display:flex;justify-content:space-between;margin-bottom:6px"><div class="muted">Taxable Amount</div><div class="right">₹${t.taxableTotal}</div></div>
                <div style="display:flex;justify-content:space-between;margin-bottom:6px"><div class="muted">CGST</div><div class="right">₹${t.cgst}</div></div>
                <div style="display:flex;justify-content:space-between;margin-bottom:6px"><div class="muted">SGST</div><div class="right">₹${t.sgst}</div></div>
                <div style="display:flex;justify-content:space-between;margin-bottom:6px"><div class="muted">IGST</div><div class="right">₹${t.igst || 0}</div></div>
                <div style="display:flex;justify-content:space-between;margin-bottom:6px"><div class="muted">Discount</div><div class="right">₹${t.discount || 0}</div></div>
                <div style="display:flex;justify-content:space-between;margin-bottom:6px"><div class="muted">Sub Total</div><div class="right">₹${t.subtotal}</div></div>
                <div style="display:flex;justify-content:space-between;margin-bottom:6px"><div class="muted">Round Off</div><div class="right">₹${t.roundOff}</div></div>
                <div style="border-top:1px dashed #e6e6e6;padding-top:8px;margin-top:8px;font-weight:800;display:flex;justify-content:space-between">
                  <div>Total</div><div class="right">₹${t.total}</div>
                </div>
                <div style="margin-top:8px;font-size:12px;color:#6b7280"><strong>In Words:</strong> ${numberToWords(t.total)}</div>
              </div>
            </div>
          </div>

          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-top:14px;gap:12px;flex-wrap:wrap">
            <div style="flex:1"></div>
            <div style="width:260px;text-align:center">
              <div style="height:48px"></div>
              <div style="margin-top:6px;font-weight:700">For ${safe(invoiceData.billFrom?.businessName || invoiceData.billFrom?.name || "Seller")}</div>
              <div style="height:56px"></div>
              <div style="border-top:1px solid #e6e6e6;margin-top:6px;padding-top:6px" class="muted">Authorised Signatory</div>
            </div>
          </div>

          <div style="margin-top:12px;text-align:center;font-size:12px;color:#6b7280">Original For Recipient</div>
        </div>
      </body>
      </html>`;

    return html;
  };

  const handleDownload = async (invoice: Invoice) => {
    try {
      console.log("🔄 Starting download for invoice:", invoice);

      // Fetch complete invoice data by ID
      const invoiceId = (invoice as any).id || (invoice as any)._id;
      console.log("📥 Fetching complete invoice data for ID:", invoiceId);
      const response = await api.get(`/api/invoices/${invoiceId}`);
      const completeInvoiceData = response.data;
      console.log("✅ Complete invoice data received:", completeInvoiceData);

      // Console log the complete backend response data
      console.log("📤 Complete backend response data for download:", completeInvoiceData);

      const html = generatePrintableHTML(completeInvoiceData, "invoices");
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      const docNumber = completeInvoiceData.invoiceNumber || completeInvoiceData.billNo || completeInvoiceData.number;
      const safeName = (docNumber || "invoice").replace(/[^\w-]/g, "_");
      a.download = `${safeName}.html`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);

      console.log("✅ Download completed successfully");
    } catch (err: any) {
      console.error("❌ Download error:", err);
      alert(`Could not download invoice. Error: ${err.message || "Unknown error"}`);
    }
  };

  // Static filter buttons with counts
  const getFilterButtonsWithCounts = () => {
    const filterButtons: { label: string; value: "all" | "pending" | "paid" | "overdue" }[] = [
      { label: "All", value: "all" },
      { label: "Pending", value: "pending" },
      { label: "Paid", value: "paid" },
      { label: "Overdue", value: "overdue" },
    ];

    // Ensure invoices is always an array
    const safeInvoices = Array.isArray(invoices) ? invoices : [];

    return filterButtons.map(btn => ({
      ...btn,
      count: btn.value === "all"
        ? safeInvoices.length
        : safeInvoices.filter(inv => mapStatusToFilter(inv.status || "") === btn.value).length
    }));
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      searchTerm: "",
      dateFrom: "",
      dateTo: "",
      amountMin: "",
      amountMax: "",
      customerName: "",
      invoiceNumber: "",
    });
    setActiveStatusFilter("all");
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return Object.values(filters).some(value => value !== "") || activeStatusFilter !== "all";
  };

  if (loading) return <Card className="p-6">Loading invoices...</Card>;
  if (error) return <Card className="p-6 text-red-500">Error: {error}</Card>;

  return (
    <>
      <Card className="p-6 bg-white">
        <div className="space-y-8">
          {/* Header with Filters and Actions */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h3 className="text-lg font-semibold text-foreground">
              All Invoices - {format(selectedDate, "MMM yyyy")}
            </h3>

            <div className="flex items-center flex-wrap gap-2">
              {getFilterButtonsWithCounts().map(btn => (
                <Button
                  key={btn.value}
                  variant={activeStatusFilter === btn.value ? "default" : "ghost"}
                  size="sm"
                  onClick={() => {
                    setActiveStatusFilter(btn.value);
                    setCurrentPage(1);
                  }}
                >
                  {btn.label}
                  <span className="ml-1 text-xs opacity-70">
                    ({btn.count})
                  </span>
                </Button>
              ))}


              {/* <Button
                size="sm"
                variant="ghost"
                onClick={handleScanInvoice}
                disabled={isProcessingScannedImage}
              >
                <ScanLine className="h-4 w-4 mr-2" />
                {isProcessingScannedImage ? "Processing..." : "Scan Invoice"}
              </Button> */}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  const filename = `invoices-${activeStatusFilter}-${format(selectedDate, "MMM-yyyy")}.csv`;
                  downloadCSV(filteredInvoices, filename);
                }}
              >
                <DownloadCloud className="h-4 w-4 mr-2" /> Export CSV
              </Button>

              {/* Enhanced Filter Button */}
              <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <PopoverTrigger asChild>
                  <Button
                    size="sm"
                    variant={hasActiveFilters() ? "default" : "ghost"}
                    className={hasActiveFilters() ? "bg-blue-600 hover:bg-blue-700" : ""}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                    {hasActiveFilters() && (
                      <span className="ml-1 bg-white text-blue-600 rounded-full px-2 py-0.5 text-xs font-medium">
                        Active
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-96 p-4" align="end">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-sm">Filter Invoices</div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsFilterOpen(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* General Search */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Search className="h-4 w-4" />
                        General Search
                      </Label>
                      <Input
                        placeholder="Search invoices, customers, products..."
                        value={filters.searchTerm}
                        onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                      />
                    </div>

                    {/* Customer Name */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Customer Name</Label>
                      <Input
                        placeholder="Filter by customer name"
                        value={filters.customerName}
                        onChange={(e) => setFilters(prev => ({ ...prev, customerName: e.target.value }))}
                      />
                    </div>

                    {/* Invoice Number */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Invoice Number</Label>
                      <Input
                        placeholder="Filter by invoice number"
                        value={filters.invoiceNumber}
                        onChange={(e) => setFilters(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                      />
                    </div>

                    {/* Date Range */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Date Range
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs text-muted-foreground">From</Label>
                          <Input
                            type="date"
                            value={filters.dateFrom}
                            onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">To</Label>
                          <Input
                            type="date"
                            value={filters.dateTo}
                            onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Amount Range */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Amount Range (₹)
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs text-muted-foreground">Min Amount</Label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={filters.amountMin}
                            onChange={(e) => setFilters(prev => ({ ...prev, amountMin: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Max Amount</Label>
                          <Input
                            type="number"
                            placeholder="No limit"
                            value={filters.amountMax}
                            onChange={(e) => setFilters(prev => ({ ...prev, amountMax: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Filter Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearAllFilters}
                        className="flex-1"
                      >
                        Clear All
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setIsFilterOpen(false)}
                        className="flex-1"
                      >
                        Apply Filters
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters() && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-blue-800">Active Filters:</span>
                  {activeStatusFilter !== "all" && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Status: {activeStatusFilter}
                    </Badge>
                  )}
                  {filters.searchTerm && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Search: {filters.searchTerm}
                    </Badge>
                  )}
                  {filters.customerName && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Customer: {filters.customerName}
                    </Badge>
                  )}
                  {filters.invoiceNumber && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Invoice: {filters.invoiceNumber}
                    </Badge>
                  )}
                  {(filters.dateFrom || filters.dateTo) && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Date: {filters.dateFrom || "Start"} - {filters.dateTo || "End"}
                    </Badge>
                  )}
                  {(filters.amountMin || filters.amountMax) && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Amount: ₹{filters.amountMin || "0"} - ₹{filters.amountMax || "∞"}
                    </Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Clear All
                </Button>
              </div>
            </div>
          )}

          {/* Processing Banner */}
          {/* {isProcessingScannedImage && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                <p className="text-blue-800">Processing scanned invoice...</p>
              </div>
            </div>
          )} */}

          {/* Table */}
          <div className="w-full overflow-x-auto rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 w-1/6">Invoice Number</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 w-1/6">Customer Name</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 w-1/6">Total Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 w-1/6">Due Date</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 w-1/6">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 w-1/6">Actions</th>
                </tr>
              </thead>

              <tbody>
                {currentInvoices && currentInvoices.map((invoice) => (
                  <tr key={(invoice as any)._id || (invoice as any).id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 w-1/6 min-w-[100px]">
                      <div className="truncate" title={getInvoiceNumber(invoice)}>
                        {getInvoiceNumber(invoice)}
                      </div>
                    </td>
                    <td className="px-6 py-4 w-1/6 min-w-[120px]">
                      <div className="truncate" title={getCustomerName(invoice)}>
                        {getCustomerName(invoice)}
                      </div>
                    </td>
                    <td className="px-6 py-4 w-1/6 min-w-[120px]">
                      <div className="text-sm font-medium text-gray-900">
                        ₹{(() => {
                          const total = invoice.total ||
                            (invoice as any).totalAmount ||
                            (invoice as any).amount ||
                            (invoice as any).grandTotal ||
                            (invoice as any).grand_total || 0;
                          return typeof total === 'number' ? total.toLocaleString() : String(total);
                        })()}
                      </div>
                    </td>
                    <td className="px-6 py-4 w-1/6">{formatDueDate(
                      (invoice as any).dueDate ||
                      (invoice as any).due_date ||
                      (invoice as any).paymentDueDate ||
                      (invoice as any).payment_due_date
                    )}</td>
                    <td className="px-6 py-4 w-1/6">{getStatusBadge(invoice.status || 'pending')}</td>
                    <td className="px-6 py-4 w-1/6">
                      <div className="flex items-center gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-gray-900 text-white" align="end">
                            <DropdownMenuItem onClick={() => handleDownload(invoice)}>
                              <Download className="mr-2 h-4 w-4" /> Download
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-500" onClick={() => handleDelete((invoice as any)._id || (invoice as any).id)}>
                              <Trash className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
                {currentInvoices && currentInvoices.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No invoices found for selected filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredInvoices.length > 0 && (
            <div className="border-t border-gray-200 px-4 py-4 sm:px-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
                <div className="text-center text-sm text-gray-700 sm:text-left">
                  Showing {filteredInvoices.length === 0 ? 0 : startIndex + 1}-{Math.min(endIndex, filteredInvoices.length)} of {filteredInvoices.length} results
                  {(hasActiveFilters() && filteredInvoices.length !== (Array.isArray(invoices) ? invoices.length : 0)) &&
                    ` (filtered from ${Array.isArray(invoices) ? invoices.length : 0} total)`
                  }
                </div>

                <div className="flex items-center justify-center gap-2">
                  <Button
                    className="hover:bg-white bg-white text-slate-500 hover:text-[#654BCD] cursor-pointer"
                    size="sm"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToPage(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  <Button
                    className="hover:bg-white bg-white text-slate-500 hover:text-[#654BCD] cursor-pointer"
                    size="sm"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Camera Scanner Modal */}
      {/* <CameraScanner
        isOpen={isCameraScannerOpen}
        onClose={() => setIsCameraScannerOpen(false)}
        onImageCapture={handleImageCapture}
      /> */}
    </>
  );
}
