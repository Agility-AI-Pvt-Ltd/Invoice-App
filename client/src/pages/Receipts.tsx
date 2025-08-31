import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Download,
  Upload,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  ChevronDown,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { SingleDatePicker } from "@/components/ui/SingleDatePicker";
import Cookies from "js-cookie";
import { useLocation, useNavigate } from "react-router-dom";
import { format } from "date-fns";

import InvoiceForm from "@/components/invoice-form/InvoiceForm";
import CreditNoteForm from "@/components/credit-note-form/CreditNoteForm";
import DebitNoteForm from "@/components/debit-note-form/DebitNoteForm";


const API_BASE = "https://invoice-backend-604217703209.asia-south1.run.app";

type Tab = "invoices" | "credit-notes" | "debit-notes";

interface InvoiceData {
  id: string;
  invoiceNumber: string;
  customerName: string;
  status: string;
  date: string;
  dueDate: string;
  amount: number;
}

interface CreditNoteData {
  id: string;
  noteNo: string;
  invoiceNo: string;
  customerName: string;
  reason: string;
  dateIssued: string;
  amount: number;
  status: string;
}

interface DebitNoteData {
  id: string;
  noteNo: string;
  invoiceNo: string;
  vendorName: string;
  reason: string;
  dateIssued: string;
  amount: number;
  status: string;
}

export default function Receipts() {
  const [activeTab, setActiveTab] = useState<Tab>("invoices");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [creditNotes, setCreditNotes] = useState<CreditNoteData[]>([]);
  const [debitNotes, setDebitNotes] = useState<DebitNoteData[]>([]);
  const [pagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    perPage: 10,
  });
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [activeCreditForm, setActiveCreditForm] = useState(false);
  const [activeDebitForm, setActiveDebitForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<any>(null);

  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();



  // Helper function to check if user is authenticated
  const isAuthenticated = () => {
    const token = Cookies.get("authToken");
    return !!token;
  };

  // Date filtering function
  const handleDateFilter = (date: Date | undefined) => {
    setSelectedDate(date);
    let filtered = [...invoices];

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.customerName.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (date) {
      const filterDate = format(date, "dd MMMM yyyy");
      filtered = filtered.filter((item) => item.date === filterDate);
    }

    setInvoices(filtered);
  };

  // Handle invoice form
  const handleInvoiceForm = (invoiceData?: any) => {
    setEditingInvoice(invoiceData || null);
    setShowInvoiceForm(true);
  };

  const handleCloseInvoiceForm = () => {
    setShowInvoiceForm(false);
    setEditingInvoice(null);
    fetchInvoices(); // Refresh data after form close
  };

  // Handle credit note form
  const handleCreditNoteForm = () => {
    setActiveCreditForm(true);
  };

  const handleCloseCreditNoteForm = () => {
    setActiveCreditForm(false);
    fetchCreditNotes(); // Refresh data after form close
  };

  // Handle debit note form
  const handleDebitNoteForm = () => {
    setActiveDebitForm(true);
  };

  const handleCloseDebitNoteForm = () => {
    setActiveDebitForm(false);
    fetchDebitNotes(); // Refresh data after form close
  };



  // Fetch invoices data
  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      const token = Cookies.get("authToken") || undefined;
      const params = new URLSearchParams({
        page: String(currentPage),
        perPage: String(pagination.perPage),
      });
      const res = await fetch(`${API_BASE}/api/invoices?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error(`Failed to fetch invoices (${res.status})`);
      const data = await res.json();
      const arr = Array.isArray(data) ? data : data.data || data.invoices || [];
      const mapped = arr.map((invoice: any) => ({
        id: invoice._id || invoice.id || String(Math.random()),
        invoiceNumber:
          invoice.invoiceNumber || invoice.number || "INV-2024/001",
        customerName:
          invoice.customerName || invoice.clientName || "Customer Name",
        status: invoice.paymentStatus || invoice.status || "Pending",
        date: formatDate(
          invoice.dateOfSale || invoice.date || invoice.createdAt || "",
        ),
        dueDate: formatDate(invoice.dueDate || ""),
        amount: invoice.totalAmount || invoice.amount || 2000,
      }));
      setInvoices(mapped);
    } catch (err) {
      console.error("Error fetching invoices:", err);
      // Use mock data if API fails
      setInvoices([
        {
          id: "1",
          invoiceNumber: "INV-2024/001",
          customerName: "Customer Name",
          status: "Paid",
          date: "23 July 2024",
          dueDate: "29 July 2024",
          amount: 2000,
        },
        {
          id: "2",
          invoiceNumber: "INV-2024/002",
          customerName: "Another Customer",
          status: "Pending",
          date: "24 July 2024",
          dueDate: "30 July 2024",
          amount: 3500,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pagination.perPage, toast]);

  // Fetch credit notes
  const fetchCreditNotes = useCallback(async () => {
    try {
      setLoading(true);
      const token = Cookies.get("authToken") || undefined;
      const params = new URLSearchParams({
        page: String(currentPage),
        perPage: String(pagination.perPage),
      });
      const res = await fetch(
        `${API_BASE}/api/credit-notes?${params.toString()}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        },
      );
      if (!res.ok)
        throw new Error(`Failed to fetch credit notes (${res.status})`);
      const data = await res.json();
      const arr = Array.isArray(data) ? data : data.data || data.notes || [];
      const mapped = arr.map((n: any) => ({
        id: n._id || n.id || n.creditNoteId || String(n._id || n.id || ""),
        noteNo: n.creditNoteNumber || n.noteNo || n.number || "200",
        invoiceNo: n.againstInvoiceNumber || n.invoiceNo || "IN112030",
        customerName:
          n.customerName || n.bussinessName || n.clientName || "Kevin Motors",
        reason: n.reason || n.noteReason || "Returned Goods",
        dateIssued: formatDate(
          n.creditNoteDate || n.dateIssued || n.date || n.createdAt || "",
        ),
        amount: n.total ?? n.amount ?? 25000,
        status: n.refund === true ? "Refunded" : n.status || "Open",
      }));
      setCreditNotes(mapped);
    } catch (e) {
      console.error(e);
      // Use mock data if API fails
      setCreditNotes([
        {
          id: "1",
          noteNo: "200",
          invoiceNo: "IN112030",
          customerName: "Kevin Motors",
          reason: "Returned Goods",
          dateIssued: "29 July 2024",
          amount: 25000,
          status: "Open",
        },
        {
          id: "2",
          noteNo: "200",
          invoiceNo: "IN112030",
          customerName: "Kevin Motors",
          reason: "Returned Goods",
          dateIssued: "29 July 2024",
          amount: 25000,
          status: "Refunded",
        },
        {
          id: "3",
          noteNo: "200",
          invoiceNo: "IN112030",
          customerName: "Kevin Motors",
          reason: "Returned Goods",
          dateIssued: "29 July 2024",
          amount: 25000,
          status: "Adjusted",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pagination.perPage]);

  // Fetch debit notes
  const fetchDebitNotes = useCallback(async () => {
    try {
      setLoading(true);
      const token = Cookies.get("authToken") || undefined;
      const params = new URLSearchParams({
        page: String(currentPage),
        perPage: String(pagination.perPage),
      });
      const res = await fetch(
        `${API_BASE}/api/debit-notes?${params.toString()}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        },
      );
      if (!res.ok)
        throw new Error(`Failed to fetch debit notes (${res.status})`);
      const data = await res.json();
      const arr = Array.isArray(data) ? data : data.data || data.notes || [];
      const mapped = arr.map((n: any) => ({
        id: n._id || n.id || n.debitNoteId || String(n._id || n.id || ""),
        noteNo: n.debitNoteNumber || n.noteNo || n.number || "200",
        invoiceNo: n.againstInvoiceNumber || n.invoiceNo || "IN112030",
        vendorName:
          n.vendorName || n.vendor || n.supplierName || "Kevin Motors",
        reason: n.reason || n.noteReason || "Damaged Goods",
        dateIssued: formatDate(
          n.debitNoteDate || n.dateIssued || n.date || n.createdAt || "",
        ),
        amount: n.total ?? n.amount ?? 25000,
        status: n.status || "Open",
      }));
      setDebitNotes(mapped);
    } catch (e) {
      console.error(e);
      // Use mock data if API fails
      setDebitNotes([
        {
          id: "1",
          noteNo: "200",
          invoiceNo: "IN112030",
          vendorName: "Kevin Motors",
          reason: "Damaged Goods",
          dateIssued: "29 July 2024",
          amount: 25000,
          status: "Open",
        },
        {
          id: "2",
          noteNo: "200",
          invoiceNo: "IN112030",
          vendorName: "Kevin Motors",
          reason: "Overcharged",
          dateIssued: "29 July 2024",
          amount: 25000,
          status: "Accepted",
        },
        {
          id: "3",
          noteNo: "200",
          invoiceNo: "IN112030",
          vendorName: "Kevin Motors",
          reason: "Quantity Mismatch",
          dateIssued: "29 July 2024",
          amount: 25000,
          status: "Settled",
        },
        {
          id: "4",
          noteNo: "200",
          invoiceNo: "IN112030",
          vendorName: "Kevin Motors",
          reason: "Other",
          dateIssued: "29 July 2024",
          amount: 25000,
          status: "Rejected",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pagination.perPage]);

  // Format date helper
  const formatDate = (d: any) => {
    if (!d) return "";
    try {
      const date = typeof d === "string" ? new Date(d) : d;
      return date.toLocaleDateString(undefined, {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    } catch {
      return String(d);
    }
  };

  // Get status badge
  const getStatusBadge = (
    status: string,
    type: "invoice" | "credit" | "debit",
  ) => {
    const statusLower = status.toLowerCase();

    if (type === "invoice") {
      if (statusLower === "paid") {
        return (
          <Badge className="border-green-200 bg-green-50 text-green-600">
            Paid
          </Badge>
        );
      } else if (statusLower === "pending" || statusLower === "draft") {
        return (
          <Badge className="border-yellow-200 bg-yellow-50 text-yellow-600">
            {status}
          </Badge>
        );
      } else if (statusLower === "overdue") {
        return (
          <Badge className="border-red-200 bg-red-50 text-red-600">
            Overdue
          </Badge>
        );
      } else if (statusLower === "due") {
        return (
          <Badge className="border-orange-200 bg-orange-50 text-orange-600">
            Due
          </Badge>
        );
      }
    } else if (type === "credit") {
      if (statusLower === "refunded") {
        return (
          <Badge className="border-green-200 bg-green-50 text-green-600">
            Refunded
          </Badge>
        );
      } else if (statusLower === "adjusted") {
        return (
          <Badge className="border-orange-200 bg-orange-50 text-orange-600">
            Adjusted
          </Badge>
        );
      } else {
        return (
          <Badge className="border-blue-200 bg-blue-50 text-blue-600">
            Open
          </Badge>
        );
      }
    } else if (type === "debit") {
      if (statusLower === "settled") {
        return (
          <Badge className="border-green-200 bg-green-50 text-green-600">
            Settled
          </Badge>
        );
      } else if (statusLower === "accepted") {
        return (
          <Badge className="border-yellow-200 bg-yellow-50 text-yellow-600">
            Accepted
          </Badge>
        );
      } else if (statusLower === "rejected") {
        return (
          <Badge className="border-red-200 bg-red-50 text-red-600">
            Rejected
          </Badge>
        );
      } else {
        return (
          <Badge className="border-blue-200 bg-blue-50 text-blue-600">
            Open
          </Badge>
        );
      }
    }

    return <Badge variant="secondary">{status}</Badge>;
  };

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Get filtered data based on active tab
  const getFilteredData = () => {
    let data: any[] = [];

    if (activeTab === "invoices") {
      data = invoices;
    } else if (activeTab === "credit-notes") {
      data = creditNotes;
    } else if (activeTab === "debit-notes") {
      data = debitNotes;
    }

    return data.filter((item) => {
      const term = (searchTerm || "").toLowerCase();
      const matchesTerm =
        !term ||
        [
          item.invoiceNumber || item.noteNo,
          item.customerName || item.vendorName,
          item.reason,
          item.invoiceNo,
        ]
          .filter(Boolean)
          .some((v: any) => String(v).toLowerCase().includes(term));

      const matchesDate = selectedDate
        ? (item.date || item.dateIssued) &&
          String(item.date || item.dateIssued).slice(0, 10) ===
            selectedDate.toISOString().slice(0, 10)
        : true;

      return matchesTerm && matchesDate;
    });
  };

  const filteredData = getFilteredData();

  const apiImportReceipts = async (
    token: string | undefined,
    file: File,
    type: "invoices" | "credit-notes" | "debit-notes",
  ) => {
    const formData = new FormData();
    formData.append("file", file);

    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    let endpoint = "";
    switch (type) {
      case "invoices":
        endpoint = `${API_BASE}/api/invoices/import`;
        break;
      case "credit-notes":
        endpoint = `${API_BASE}/api/credit-notes/import`;
        break;
      case "debit-notes":
        endpoint = `${API_BASE}/api/debit-notes/import`;
        break;
      default:
        throw new Error("Invalid type for import");
    }

    const res = await fetch(endpoint, {
      method: "POST",
      headers: headers,
      body: formData,
    });

    if (!res.ok) {
      let errText = `Failed to import ${type} (status ${res.status})`;
      try {
        const body = await res.json();
        errText = body.detail || body.message || JSON.stringify(body);
      } catch (err) {
        console.log(err);
      }
      throw new Error(errText);
    }

    return await res.json();
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const apiExportReceipts = async (
    token: string | undefined,
    format: "csv" | "excel" | "pdf",
    type: "invoices" | "credit-notes" | "debit-notes",
  ) => {
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    let endpoint = "";
    switch (type) {
      case "invoices":
        // For invoices, we might need to use a different endpoint or handle differently
        endpoint = `${API_BASE}/api/invoices/export?format=${format}`;
        break;
      case "credit-notes":
        endpoint = `${API_BASE}/api/credit-notes/export?format=${format}`;
        break;
      case "debit-notes":
        endpoint = `${API_BASE}/api/debit-notes/export?format=${format}`;
        break;
      default:
        throw new Error("Invalid type for export");
    }

    console.log(`Attempting to export ${type} from endpoint: ${endpoint}`);

    const res = await fetch(endpoint, { method: "GET", headers });

    console.log(`Export response status: ${res.status}`);

    if (!res.ok) {
      if (res.status === 204) {
        throw new Error(`No ${type} found to export`);
      }

      let errText = `Failed to export ${type} (status ${res.status})`;
      try {
        const body = await res.json();
        errText = body.detail || body.message || JSON.stringify(body);
      } catch (err) {
        console.log(err);
      }
      throw new Error(errText);
    }

    return res;
  };

  const getExportFilename = (
    format: "csv" | "excel" | "pdf",
    type: "invoices" | "credit-notes" | "debit-notes",
  ) => {
    const timestamp = new Date().toISOString().split("T")[0];
    const typeName = type.replace("-", "_");
    switch (format) {
      case "csv":
        return `${typeName}_${timestamp}.csv`;
      case "excel":
        return `${typeName}_${timestamp}.xlsx`;
      case "pdf":
        return `${typeName}_${timestamp}.pdf`;
      default:
        return `${typeName}_${timestamp}.${format}`;
    }
  };

  // Client-side CSV export for invoices (fallback)
  const exportInvoicesToCSV = () => {
    const csvContent = [
      // CSV header
      [
        "Invoice Number",
        "Customer Name",
        "Status",
        "Date",
        "Due Date",
        "Amount",
      ].join(","),
      // CSV data
      ...invoices.map((invoice) =>
        [
          invoice.invoiceNumber,
          invoice.customerName,
          invoice.status,
          invoice.date,
          invoice.dueDate,
          invoice.amount,
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const filename = getExportFilename("csv", "invoices");
    downloadBlob(blob, filename);
  };

  // Client-side Excel export for invoices (fallback)
  const exportInvoicesToExcel = () => {
    // For Excel, we'll create a CSV-like format that Excel can open
    const excelContent = [
      // Header
      [
        "Invoice Number",
        "Customer Name",
        "Status",
        "Date",
        "Due Date",
        "Amount",
      ],
      // Data
      ...invoices.map((invoice) => [
        invoice.invoiceNumber,
        invoice.customerName,
        invoice.status,
        invoice.date,
        invoice.dueDate,
        invoice.amount,
      ]),
    ];

    // Convert to CSV format (Excel can open CSV files)
    const csvContent = excelContent.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const filename = getExportFilename("excel", "invoices").replace(
      ".xlsx",
      ".csv",
    );
    downloadBlob(blob, filename);
  };

  // Handle export
  const handleExport = async (format: "csv" | "excel" | "pdf") => {
    try {
      setLoading(true);
      const token = Cookies.get("authToken") || undefined;

      toast({
        title: "Exporting...",
        description: `Preparing ${format.toUpperCase()} export...`,
      });

      // For invoices, try server export first, fallback to client-side export
      if (activeTab === "invoices") {
        try {
          const response = await apiExportReceipts(token, format, activeTab);
          const blob = await response.blob();
          const contentDisposition =
            response.headers.get("content-disposition") || "";
          let filename = getExportFilename(format, activeTab);

          if (contentDisposition) {
            const filenameMatch = contentDisposition.match(
              /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/,
            );
            if (filenameMatch && filenameMatch[1]) {
              filename = filenameMatch[1].replace(/['"]/g, "");
            }
          }

          downloadBlob(blob, filename);
          toast({
            title: "Export Successful",
            description: `Exported as ${format.toUpperCase()} successfully!`,
          });
          return;
        } catch (error) {
          console.log(
            "Server export failed, falling back to client-side export:",
            error,
          );
          // Fallback to client-side export
          if (format === "csv") {
            exportInvoicesToCSV();
            toast({
              title: "Export Successful",
              description: "Exported as CSV successfully! (Client-side)",
            });
          } else if (format === "excel") {
            exportInvoicesToExcel();
            toast({
              title: "Export Successful",
              description: "Exported as Excel successfully! (Client-side)",
            });
          } else {
            // For PDF, we can't do client-side, so show error
            throw error;
          }
          return;
        }
      }

      // For other types or formats, use server export
      const response = await apiExportReceipts(token, format, activeTab);
      const blob = await response.blob();
      const contentDisposition =
        response.headers.get("content-disposition") || "";
      let filename = getExportFilename(format, activeTab);

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(
          /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/,
        );
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, "");
        }
      }

      downloadBlob(blob, filename);

      toast({
        title: "Export Successful",
        description: `Exported as ${format.toUpperCase()} successfully!`,
      });
    } catch (error) {
      console.error("Error exporting receipts:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

      let userMessage = errorMessage;
      if (errorMessage.includes("No") && errorMessage.includes("found")) {
        userMessage = `No ${activeTab} available to export.`;
      }

      // For invoices, offer client-side export as fallback
      if (activeTab === "invoices") {
        if (format === "csv") {
          toast({
            title: "Server Export Failed",
            description: "Falling back to client-side CSV export...",
          });
          exportInvoicesToCSV();
          toast({
            title: "Export Successful",
            description: "Exported as CSV successfully! (Client-side)",
          });
          return;
        } else if (format === "excel") {
          toast({
            title: "Server Export Failed",
            description: "Falling back to client-side Excel export...",
          });
          exportInvoicesToExcel();
          toast({
            title: "Export Successful",
            description: "Exported as Excel successfully! (Client-side)",
          });
          return;
        }
        // For PDF, we can't do client-side, so show the original error
      }

      toast({
        title: "Export Failed",
        description: userMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle import
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = [".csv", ".xlsx", ".xls"];
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();

    if (!validTypes.includes(fileExtension)) {
      toast({
        title: "Error",
        description:
          "Only CSV and Excel files (.csv, .xlsx, .xls) are supported",
        variant: "destructive",
      });
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "Error",
        description: "File size must be less than 10MB",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const token = Cookies.get("authToken") || undefined;

      toast({
        title: "Importing...",
        description: `Uploading ${activeTab} file`,
      });

      const response = await apiImportReceipts(token, file, activeTab);

      toast({
        title: "Success",
        description: response.message || `${activeTab} imported successfully!`,
      });

      // Refresh data based on active tab
      if (activeTab === "invoices") {
        await fetchInvoices();
      } else if (activeTab === "credit-notes") {
        await fetchCreditNotes();
      } else if (activeTab === "debit-notes") {
        await fetchDebitNotes();
      }

      event.target.value = "";
    } catch (error) {
      console.error("Error importing receipts:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

      toast({
        title: "Import Failed",
        description: errorMessage,
        variant: "destructive",
      });

      event.target.value = "";
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      toast({ title: "Deleting...", description: "Removing item..." });

      // Mock delete functionality
      setTimeout(() => {
        if (activeTab === "invoices") {
          setInvoices((prev) => prev.filter((item) => item.id !== id));
        } else if (activeTab === "credit-notes") {
          setCreditNotes((prev) => prev.filter((item) => item.id !== id));
        } else if (activeTab === "debit-notes") {
          setDebitNotes((prev) => prev.filter((item) => item.id !== id));
        }
        toast({ title: "Success", description: "Item deleted successfully!" });
      }, 500);
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Failed to delete item",
        variant: "destructive",
      });
      console.log(error);
    }
  };

  // Handle edit
  const handleEdit = (item: any) => {
    // Navigate to invoice form with edit data
    navigate("/invoice-form", { state: { editData: item } });
  };

  // Fetch data based on active tab
  useEffect(() => {
    if (isAuthenticated()) {
      if (activeTab === "invoices") {
        fetchInvoices();
      } else if (activeTab === "credit-notes") {
        fetchCreditNotes();
      } else if (activeTab === "debit-notes") {
        fetchDebitNotes();
      }
    }
  }, [activeTab, fetchInvoices, fetchCreditNotes, fetchDebitNotes]);

  // If navigated here with state.openInvoiceForm -> open the invoice form
  useEffect(() => {
    try {
      const stateAny = (location && (location.state as any)) || {};
      if (stateAny && stateAny.openInvoiceForm) {
        navigate("/invoice-form", { replace: true, state: {} });
      }
    } catch (err) {
      console.log(err);
    }
  }, [location, navigate]);

  if (showInvoiceForm) {
    return (
      <div className="bg-background min-h-screen p-2 sm:p-4 lg:p-8">
        <div className="max-w-8xl mx-auto">
          <Card className="max-w-full bg-white p-4 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">
                {editingInvoice ? "Edit Invoice" : "Create New Invoice"}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseInvoiceForm}
                className="h-8 w-8 p-0"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <InvoiceForm
              onCancel={handleCloseInvoiceForm}
              initialData={editingInvoice}
            />
          </Card>
        </div>
      </div>
    );
  }

  if (activeCreditForm) {
    return (
      <div className="bg-background min-h-screen p-2 sm:p-4 lg:p-8">
        <div className="max-w-8xl mx-auto">
          <Card className="max-w-full bg-white p-4 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">
                Create Credit Note
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseCreditNoteForm}
                className="h-8 w-8 p-0"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <CreditNoteForm
              onClose={handleCloseCreditNoteForm}
              onSuccess={handleCloseCreditNoteForm}
            />
          </Card>
        </div>
      </div>
    );
  }

  if (activeDebitForm) {
    return (
      <div className="bg-background min-h-screen p-2 sm:p-4 lg:p-8">
        <div className="max-w-8xl mx-auto">
          <Card className="max-w-full bg-white p-4 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">
                Create Debit Note
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseDebitNoteForm}
                className="h-8 w-8 p-0"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <DebitNoteForm
              onClose={handleCloseDebitNoteForm}
              onSuccess={handleCloseDebitNoteForm}
            />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen p-2 sm:p-4 lg:p-8">
      <div className="max-w-8xl mx-auto space-y-4 sm:space-y-6">
        {/* Summary Cards */}
        {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="p-4 sm:p-6 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Invoices</p>
                <p className="text-2xl font-bold text-gray-900">₹ {summaryData.totalInvoices.toLocaleString()}</p>
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  <span className="hidden sm:inline">3.46% Since last month</span>
                  <span className="sm:hidden">+3.46%</span>
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-6 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Paid Invoices</p>
                <p className="text-2xl font-bold text-gray-900">₹ {summaryData.paidInvoices.toLocaleString()}</p>
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  <span className="hidden sm:inline">3.46% Since last month</span>
                  <span className="sm:hidden">+3.46%</span>
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-6 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Invoices</p>
                <p className="text-2xl font-bold text-gray-900">₹ {summaryData.pendingInvoices.toLocaleString()}</p>
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  <span className="hidden sm:inline">3.46% Since last month</span>
                  <span className="sm:hidden">+3.46%</span>
                </p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Receipt className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-6 bg-white">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Unpaid Invoices</p>
              <p className="text-2xl font-bold text-gray-900">₹ {summaryData.totalReceivables.toLocaleString()}</p>
              
              <div className="mt-3 bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:justify-between mt-2 text-sm gap-1 sm:gap-0">
                <span className="text-gray-600">Current: ₹ {summaryData.totalReceivables.toLocaleString()}</span>
                <span className="text-gray-600">Overdue: ₹ {summaryData.overdueAmount.toLocaleString()}</span>
              </div>
            </div>
          </Card>
        </div> */}

        {/* Main Content */}
        <Card className="bg-white">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex space-x-4 px-4 sm:space-x-8 sm:px-6">
              <button
                className={`border-b-2 px-1 py-4 font-medium ${
                  activeTab === "invoices"
                    ? "border-[#b5a3ff]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("invoices")}
              >
                <span className="hidden sm:inline">Invoices</span>
                <span className="sm:hidden">Inv</span>
              </button>
              <button
                className={`border-b-2 px-1 py-4 font-medium ${
                  activeTab === "credit-notes"
                    ? "border-[#b5a3ff]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("credit-notes")}
              >
                <span className="hidden sm:inline">Credit Note</span>
                <span className="sm:hidden">CN</span>
              </button>
              <button
                className={`border-b-2 px-1 py-4 font-medium ${
                  activeTab === "debit-notes"
                    ? "border-[#b5a3ff]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("debit-notes")}
              >
                <span className="hidden sm:inline">Debit Note</span>
                <span className="sm:hidden">DN</span>
              </button>
            </div>
          </div>

          {/* Table Controls */}
          <div className="border-b border-gray-200 p-4 sm:p-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row">
              <div className="flex flex-col gap-4 sm:flex-row">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search Client, Invoice ID & more..."
                    className="w-48 pl-10 sm:w-64"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>

                {/* Enhanced Date Filter */}
                <SingleDatePicker
                  selectedDate={selectedDate}
                  onDateChange={handleDateFilter}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {/* Import Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="flex items-center gap-2 border-1 border-gray-200 bg-white text-black hover:bg-gray-100">
                      <Download className="h-4 w-4" />
                      <span className="hidden sm:inline">Import</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-white text-black">
                    <DropdownMenuItem
                      onClick={() =>
                        document.getElementById("import-csv")?.click()
                      }
                    >
                      CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        document.getElementById("import-excel")?.click()
                      }
                    >
                      Excel
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Export Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="flex items-center gap-2 border-1 border-gray-200 bg-white text-black hover:bg-gray-100">
                      <Upload className="h-4 w-4" />
                      <span className="hidden sm:inline">Export</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-white text-black">
                    <DropdownMenuItem onClick={() => handleExport("csv")}>
                      CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport("excel")}>
                      Excel
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport("pdf")}>
                      PDF
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>



                {/* New Invoice Button */}
                {activeTab === "invoices" ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className="flex items-center gap-2 bg-gradient-to-b from-[#B5A3FF] via-[#785FDA] to-[#9F91D8]">
                        <Plus className="h-4 w-4" />
                        <span className="hidden sm:inline">New Invoice</span>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-white text-black">
                      <>
                        <DropdownMenuItem onClick={() => handleInvoiceForm()}>
                          Sales Invoice
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleInvoiceForm()}>
                          Purchase Invoice
                        </DropdownMenuItem>
                      </>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button 
                    className="flex items-center gap-2 bg-gradient-to-b from-[#B5A3FF] via-[#785FDA] to-[#9F91D8]"
                    onClick={activeTab === "credit-notes" ? handleCreditNoteForm : handleDebitNoteForm}
                  >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      {activeTab === "credit-notes" && "Add Credit Note"}
                      {activeTab === "debit-notes" && "Add Debit Note"}
                    </span>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Hidden file inputs */}
          <input
            id="import-csv"
            type="file"
            accept=".csv"
            onChange={handleImport}
            className="hidden"
          />
          <input
            id="import-excel"
            type="file"
            accept=".xlsx,.xls"
            onChange={handleImport}
            className="hidden"
          />

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm sm:text-base">
              <thead>
                <tr className="border-b border-gray-200">
                  {activeTab === "invoices" && (
                    <>
                      <th className="px-3 py-3 text-left text-sm font-medium text-gray-500 sm:px-6">
                        Invoice Number
                      </th>
                      <th className="px-3 py-3 text-left text-sm font-medium text-gray-500 sm:px-6">
                        Customer Name
                      </th>
                      <th className="px-3 py-3 text-left text-sm font-medium text-gray-500 sm:px-6">
                        Status
                      </th>
                      <th className="px-3 py-3 text-left text-sm font-medium text-gray-500 sm:px-6">
                        Date
                      </th>
                      <th className="px-3 py-3 text-left text-sm font-medium text-gray-500 sm:px-6">
                        Due Date
                      </th>
                      <th className="px-3 py-3 text-left text-sm font-medium text-gray-500 sm:px-6">
                        Amount
                      </th>
                      <th className="px-3 py-3 text-left text-sm font-medium text-gray-500 sm:px-6">
                        Action
                      </th>
                    </>
                  )}
                  {activeTab === "credit-notes" && (
                    <>
                      <th className="px-3 py-3 text-left text-sm font-medium text-gray-500 sm:px-6">
                        Credit Note No.
                      </th>
                      <th className="px-3 py-3 text-left text-sm font-medium text-gray-500 sm:px-6">
                        Invoice No.
                      </th>
                      <th className="px-3 py-3 text-left text-sm font-medium text-gray-500 sm:px-6">
                        Customer Name
                      </th>
                      <th className="px-3 py-3 text-left text-sm font-medium text-gray-500 sm:px-6">
                        Reason
                      </th>
                      <th className="px-3 py-3 text-left text-sm font-medium text-gray-500 sm:px-6">
                        Date Issued
                      </th>
                      <th className="px-3 py-3 text-left text-sm font-medium text-gray-500 sm:px-6">
                        Amount
                      </th>
                      <th className="px-3 py-3 text-left text-sm font-medium text-gray-500 sm:px-6">
                        Status
                      </th>
                      <th className="px-3 py-3 text-left text-sm font-medium text-gray-500 sm:px-6">
                        Action
                      </th>
                    </>
                  )}
                  {activeTab === "debit-notes" && (
                    <>
                      <th className="px-3 py-3 text-left text-sm font-medium text-gray-500 sm:px-6">
                        Debit Note No.
                      </th>
                      <th className="px-3 py-3 text-left text-sm font-medium text-gray-500 sm:px-6">
                        Invoice No.
                      </th>
                      <th className="px-3 py-3 text-left text-sm font-medium text-gray-500 sm:px-6">
                        Vendor Name
                      </th>
                      <th className="px-3 py-3 text-left text-sm font-medium text-gray-500 sm:px-6">
                        Reason
                      </th>
                      <th className="px-3 py-3 text-left text-sm font-medium text-gray-500 sm:px-6">
                        Date Issued
                      </th>
                      <th className="px-3 py-3 text-left text-sm font-medium text-gray-500 sm:px-6">
                        Amount
                      </th>
                      <th className="px-3 py-3 text-left text-sm font-medium text-gray-500 sm:px-4">
                        Status
                      </th>
                      <th className="px-3 py-3 text-left text-sm font-medium text-gray-500 sm:px-6">
                        Action
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-purple-600 border-t-transparent"></div>
                        <span>Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-500">
                      No{" "}
                      {activeTab === "invoices"
                        ? "invoices"
                        : activeTab === "credit-notes"
                          ? "credit notes"
                          : "debit notes"}{" "}
                      found
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      {activeTab === "invoices" && (
                        <>
                          <td className="px-3 py-4 text-sm font-medium text-gray-900 sm:px-6">
                            {(item as InvoiceData).invoiceNumber}
                          </td>
                          <td className="px-3 py-4 sm:px-6">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-gray-300"></div>
                              <span className="text-sm text-gray-900">
                                {(item as InvoiceData).customerName}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-4 sm:px-6">
                            {getStatusBadge(
                              (item as InvoiceData).status,
                              "invoice",
                            )}
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-900 sm:px-6">
                            {(item as InvoiceData).date}
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-900 sm:px-6">
                            {(item as InvoiceData).dueDate}
                          </td>
                          <td className="px-3 py-4 text-sm font-medium text-gray-900 sm:px-6">
                            ₹{(item as InvoiceData).amount.toLocaleString()}
                          </td>
                          <td className="px-3 py-4 sm:px-6">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(item)}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="bg-white text-black">
                                  <DropdownMenuItem
                                    onClick={() => handleEdit(item)}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDelete(item.id)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        </>
                      )}

                      {activeTab === "credit-notes" && (
                        <>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {(item as CreditNoteData).noteNo}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {(item as CreditNoteData).invoiceNo}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {(item as CreditNoteData).customerName}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {(item as CreditNoteData).reason}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {(item as CreditNoteData).dateIssued}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {(item as CreditNoteData).amount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            {getStatusBadge(
                              (item as CreditNoteData).status,
                              "credit",
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(item)}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="bg-white text-black">
                                  <DropdownMenuItem
                                    onClick={() => handleEdit(item)}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDelete(item.id)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        </>
                      )}

                      {activeTab === "debit-notes" && (
                        <>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {(item as DebitNoteData).noteNo}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {(item as DebitNoteData).invoiceNo}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {(item as DebitNoteData).vendorName}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {(item as DebitNoteData).reason}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {(item as DebitNoteData).dateIssued}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {(item as DebitNoteData).amount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            {getStatusBadge(
                              (item as DebitNoteData).status,
                              "debit",
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(item)}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="bg-white text-black">
                                  <DropdownMenuItem
                                    onClick={() => handleEdit(item)}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDelete(item.id)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredData.length > 0 && (
            <div className="border-t border-gray-200 px-4 py-4 sm:px-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
                <div className="text-center text-sm text-gray-700 sm:text-left">
                  Showing {filteredData.length} of {filteredData.length} results
                </div>

                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    className="text-xs sm:text-sm"
                  >
                    <span className="hidden sm:inline">← Previous</span>
                    <span className="sm:hidden">←</span>
                  </Button>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="default"
                      size="sm"
                      className="h-6 w-6 p-0 text-xs sm:h-8 sm:w-8 sm:text-sm"
                    >
                      1
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 w-6 p-0 text-xs sm:h-8 sm:w-8 sm:text-sm"
                    >
                      2
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 w-6 p-0 text-xs sm:h-8 sm:w-8 sm:text-sm"
                    >
                      3
                    </Button>
                    <span className="px-1 text-xs text-gray-500 sm:px-2 sm:text-sm">
                      ...
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 w-6 p-0 text-xs sm:h-8 sm:w-8 sm:text-sm"
                    >
                      67
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 w-6 p-0 text-xs sm:h-8 sm:w-8 sm:text-sm"
                    >
                      68
                    </Button>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs sm:text-sm"
                  >
                    <span className="hidden sm:inline">Next →</span>
                    <span className="sm:hidden">→</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>




    </div>
  );
}
