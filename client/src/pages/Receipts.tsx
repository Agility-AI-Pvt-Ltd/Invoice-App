import { useState, useEffect, useCallback, useRef } from "react";
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
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
import api from "@/lib/api";
import { searchCustomers } from "@/services/api/lookup";
import { getCreditNotes, deleteCreditNote } from "@/services/api/creditNote";
import { getDebitNotes, deleteDebitNote, type DebitNote } from "@/services/api/debitNote";
// Removed sales returns imports

type Tab = "invoices" | "credit-notes" | "debit-notes";

interface InvoiceData {
  id: string;
  invoiceNumber: string;
  customerName: string;
  status: string;
  date: string;
  dueDate: string;
  amount: number;
  items?: any[];
  gstin?: string;
  partyNumber?: string;
  // Additional fields from InvoiceModel
  billFrom?: any;
  billTo?: any;
  shipTo?: any;
  subtotal?: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  total?: number;
  notes?: string;
  currency?: string;
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
  // Removed sales returns state
  const [pagination, setPagination] = useState({
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
  const [editingCreditNote, setEditingCreditNote] = useState<any>(null);
  const [editingDebitNote, setEditingDebitNote] = useState<any>(null);

  // Customer search state
  const [customerSearchResults, setCustomerSearchResults] = useState<any[]>([]);
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);
  const [customerSearchLoading, setCustomerSearchLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

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
    setEditingCreditNote(null);
    fetchCreditNotes(); // Refresh data after form close
  };

  // Handle debit note form
  const handleDebitNoteForm = () => {
    setActiveDebitForm(true);
  };

  const handleCloseDebitNoteForm = () => {
    setActiveDebitForm(false);
    setEditingDebitNote(null);
    fetchDebitNotes(); // Refresh data after form close
  };



  // Fetch invoices for specific customer
  const fetchInvoicesForCustomer = useCallback(async (customer: any) => {
    console.log("🔄 fetchInvoicesForCustomer called for:", customer);
    try {
      setLoading(true);
      const customerName = customer.name || customer.customerName || customer.businessName || "";
      const params = new URLSearchParams({
        page: String(currentPage),
        perPage: String(pagination.perPage),
        customer: customerName, // Add customer filter
        ...(selectedDate && { date: selectedDate.toISOString().split('T')[0] })
      });

      console.log("Fetching invoices for customer with params:", params.toString());
      const res = await api.get(`/api/invoices?${params.toString()}`);
      const data = res.data;
      console.log("Customer invoices API response:", data);

      const arr = Array.isArray(data) ? data : data.data || data.invoices || [];
      const mapped = arr.map((invoice: any) => ({
        id: invoice._id || invoice.id || String(Math.random()),
        invoiceNumber: invoice.invoiceNumber || invoice.number || "INV-2024/001",
        customerName: invoice.billTo?.name || invoice.customerName || invoice.clientName || "Customer Name",
        status: invoice.paymentStatus || invoice.status || "Pending",
        date: formatDate(invoice.dateOfSale || invoice.date || invoice.createdAt || ""),
        dueDate: formatDate(invoice.dueDate || ""),
        amount: invoice.totalAmount || invoice.amount || invoice.total || 2000,
        // Include items array and other fields needed for detailed export
        items: invoice.items || invoice.invoice_items || [],
        gstin: invoice.gstin || invoice.billTo?.gst || invoice.billTo?.gstin || "",
        partyNumber: invoice.partyNumber || invoice.billTo?.pan || "",
        // Include additional fields from InvoiceModel structure
        billFrom: invoice.billFrom || {},
        billTo: invoice.billTo || {},
        shipTo: invoice.shipTo || {},
        subtotal: invoice.subtotal || 0,
        cgst: invoice.cgst || 0,
        sgst: invoice.sgst || 0,
        igst: invoice.igst || 0,
        total: invoice.total || invoice.totalAmount || invoice.amount || 0,
        notes: invoice.notes || "",
        currency: invoice.currency || "INR",
      }));

      // Update pagination state
      const pg = data.pagination || {};
      const serverCurrentPage = pg.currentPage || pg.page || data.page || currentPage;
      const serverTotalPages = pg.totalPages || data.totalPages || 1;
      const serverTotalItems = pg.total || data.total || 0;
      const serverPerPage = pg.perPage || data.perPage || pagination.perPage;

      setPagination({
        currentPage: serverCurrentPage,
        totalPages: serverTotalPages,
        totalItems: serverTotalItems,
        perPage: serverPerPage,
      });

      if (serverCurrentPage !== currentPage) {
        setCurrentPage(serverCurrentPage);
      }

      setInvoices(mapped);
    } catch (err) {
      console.error("Error fetching customer invoices:", err);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pagination.perPage, selectedDate]);

  // Fetch invoices data
  const fetchInvoices = useCallback(async () => {
    console.log("🔄 fetchInvoices called with currentPage:", currentPage, "activeTab:", activeTab);
    try {
      setLoading(true);

      // First, let's fetch ALL invoices without any filters to see the complete data structure
      console.log("🔍 Fetching ALL invoices to check data structure...");
      const allInvoicesRes = await api.get('/api/invoices');
      console.log("📊 ALL invoices response:", allInvoicesRes.data);

      if (Array.isArray(allInvoicesRes.data) && allInvoicesRes.data.length > 0) {
        console.log("📋 First invoice from ALL invoices:", allInvoicesRes.data[0]);
        console.log("📋 First invoice items:", allInvoicesRes.data[0].items);
        console.log("📋 First invoice billTo:", allInvoicesRes.data[0].billTo);
        console.log("📋 First invoice billFrom:", allInvoicesRes.data[0].billFrom);
      }

      // Now fetch with filters for pagination
      const params = new URLSearchParams({
        page: String(currentPage),
        perPage: String(pagination.perPage),
        ...(searchTerm && { search: searchTerm }),
        ...(selectedDate && { date: selectedDate.toISOString().split('T')[0] })
      });
      console.log("Fetching invoices with params:", params.toString()); // Debug log
      const res = await api.get(`/api/invoices?${params.toString()}`);
      const data = res.data;
      console.log("Invoices API response:", data); // Debug log
      const arr = Array.isArray(data) ? data : data.data || data.invoices || [];
      console.log("First invoice structure:", arr[0]); // Debug log to see actual structure
      if (arr[0]) {
        console.log("First invoice items:", arr[0].items);
        console.log("First invoice billTo:", arr[0].billTo);
      }
      const mapped = arr.map((invoice: any) => ({
        id: invoice._id || invoice.id || String(Math.random()),
        invoiceNumber:
          invoice.invoiceNumber || invoice.number || "INV-2024/001",
        customerName:
          invoice.billTo?.name || invoice.customerName || invoice.clientName || "Customer Name",
        status: invoice.paymentStatus || invoice.status || "Pending",
        date: formatDate(
          invoice.dateOfSale || invoice.date || invoice.createdAt || "",
        ),
        dueDate: formatDate(invoice.dueDate || ""),
        amount: invoice.totalAmount || invoice.amount || invoice.total || 2000,
        // Include items array and other fields needed for detailed export
        items: invoice.items || invoice.invoice_items || [],
        gstin: invoice.gstin || invoice.billTo?.gst || invoice.billTo?.gstin || "",
        partyNumber: invoice.partyNumber || invoice.billTo?.pan || "",
        // Include additional fields from InvoiceModel structure
        billFrom: invoice.billFrom || {},
        billTo: invoice.billTo || {},
        shipTo: invoice.shipTo || {},
        subtotal: invoice.subtotal || 0,
        cgst: invoice.cgst || 0,
        sgst: invoice.sgst || 0,
        igst: invoice.igst || 0,
        total: invoice.total || invoice.totalAmount || invoice.amount || 0,
        notes: invoice.notes || "",
        currency: invoice.currency || "INR",
      }));
      // Update pagination state with server response
      // Handle both pagination object and root-level pagination properties
      const pg = data.pagination || {};
      const serverCurrentPage = pg.currentPage || pg.page || data.page || currentPage;
      const serverTotalPages = pg.totalPages || data.totalPages || 1;
      const serverTotalItems = pg.total || data.total || 0;
      const serverPerPage = pg.perPage || data.perPage || pagination.perPage;

      console.log("Full API response:", data);
      console.log("Pagination data:", pg);
      console.log("Server pagination:", { serverCurrentPage, serverTotalPages, serverTotalItems, serverPerPage });
      console.log("Invoice pagination state after update:", {
        currentPage: serverCurrentPage,
        totalPages: serverTotalPages,
        totalItems: serverTotalItems,
        perPage: serverPerPage,
      });

      setPagination({
        currentPage: serverCurrentPage,
        totalPages: serverTotalPages,
        totalItems: serverTotalItems,
        perPage: serverPerPage,
      });

      // Update current page if server returned different page
      if (serverCurrentPage !== currentPage) {
        setCurrentPage(serverCurrentPage);
      }

      console.log("Mapped invoice data:", mapped[0]); // Debug log to see mapped structure
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
          items: [
            {
              description: "Sample Product 1",
              quantity: 2,
              unitPrice: 500,
              gst: 18,
              hsn: "1234"
            },
            {
              description: "Sample Product 2",
              quantity: 1,
              unitPrice: 1000,
              gst: 18,
              hsn: "5678"
            }
          ],
          gstin: "22AAAAA0000A1Z5",
          partyNumber: "PN001"
        },
        {
          id: "2",
          invoiceNumber: "INV-2024/002",
          customerName: "Another Customer",
          status: "Pending",
          date: "24 July 2024",
          dueDate: "30 July 2024",
          amount: 3500,
          items: [
            {
              description: "Sample Service",
              quantity: 1,
              unitPrice: 3500,
              gst: 18,
              hsn: "9987"
            }
          ],
          gstin: "33BBBBB0000B2Z6",
          partyNumber: "PN002"
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pagination.perPage, searchTerm, selectedDate, toast]);

  // Fetch credit notes for specific customer
  const fetchCreditNotesForCustomer = useCallback(async (customer: any) => {
    console.log("🔄 fetchCreditNotesForCustomer called for:", customer);
    try {
      setLoading(true);
      const customerName = customer.name || customer.customerName || customer.businessName || "";
      const params = new URLSearchParams({
        page: String(currentPage),
        perPage: String(pagination.perPage),
        customer: customerName, // Add customer filter
        ...(selectedDate && { date: selectedDate.toISOString().split('T')[0] })
      });

      console.log("Fetching credit notes for customer with params:", params.toString());
      const res = await api.get(`/api/credit-notes?${params.toString()}`);
      const data = res.data;
      console.log("Customer credit notes API response:", data);

      const arr = Array.isArray(data) ? data : data.data || data.notes || [];
      const mapped = arr.map((n: any) => ({
        id: n._id || n.id || n.creditNoteId || String(n._id || n.id || ""),
        noteNo: n.creditNoteNumber || n.noteNo || n.number || "200",
        invoiceNo: n.againstInvoiceNumber || n.invoiceNo || "IN112030",
        customerName: n.customerName || n.bussinessName || n.clientName || "Kevin Motors",
        reason: n.reason || n.noteReason || "Returned Goods",
        dateIssued: formatDate(n.creditNoteDate || n.dateIssued || n.date || n.createdAt || ""),
        amount: n.total ?? n.amount ?? 25000,
        status: n.refund === true ? "Refunded" : n.status || "Open",
      }));

      // Update pagination state
      const pg = data.pagination || {};
      const serverCurrentPage = pg.currentPage || pg.page || data.page || currentPage;
      const serverTotalPages = pg.totalPages || data.totalPages || 1;
      const serverTotalItems = pg.total || data.total || 0;
      const serverPerPage = pg.perPage || data.perPage || pagination.perPage;

      setPagination({
        currentPage: serverCurrentPage,
        totalPages: serverTotalPages,
        totalItems: serverTotalItems,
        perPage: serverPerPage,
      });

      if (serverCurrentPage !== currentPage) {
        setCurrentPage(serverCurrentPage);
      }

      setCreditNotes(mapped);
    } catch (err) {
      console.error("Error fetching customer credit notes:", err);
      setCreditNotes([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pagination.perPage, selectedDate]);

  // Fetch credit notes
  const fetchCreditNotes = useCallback(async () => {
    try {
      setLoading(true);
      
      const filters = {
        searchTerm: searchTerm || undefined,
        dateFrom: selectedDate ? selectedDate.toISOString().split('T')[0] : undefined,
        dateTo: selectedDate ? selectedDate.toISOString().split('T')[0] : undefined,
      };

      const response = await getCreditNotes(currentPage, pagination.perPage, filters);
      
      const mapped = (response.data || []).map((n: any) => ({
        id: n.id || n._id || String(n.id || n._id || ""),
        noteNo: n.number || n.creditNoteNumber || "",
        invoiceNo: n.againstInvoiceNumber || (n.invoice?.number) || "",
        customerName: n.customerName || n.businessName || "",
        reason: n.reason || "",
        dateIssued: formatDate(n.date || n.creditNoteDate || n.createdAt || ""),
        amount: n.amount ?? n.total ?? 0,
        status: n.refund === true ? "Refunded" : (n.status || "Open"),
      }));

      setPagination({
        currentPage: response.page,
        totalPages: response.totalPages,
        totalItems: response.total,
        perPage: pagination.perPage,
      });

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
  }, [currentPage, pagination.perPage, searchTerm, selectedDate]);

  // Fetch debit notes for specific customer
  const fetchDebitNotesForCustomer = useCallback(async (customer: any) => {
    console.log("🔄 fetchDebitNotesForCustomer called for:", customer);
    try {
      setLoading(true);
      const customerName = customer.name || customer.customerName || customer.businessName || "";
      const params = new URLSearchParams({
        page: String(currentPage),
        perPage: String(pagination.perPage),
        customer: customerName, // Add customer filter
        ...(selectedDate && { date: selectedDate.toISOString().split('T')[0] })
      });

      console.log("Fetching debit notes for customer with params:", params.toString());
      const res = await api.get(`/api/debit-notes?${params.toString()}`);
      const data = res.data;
      console.log("Customer debit notes API response:", data);

      const arr = Array.isArray(data) ? data : data.data || data.notes || [];
      const mapped = arr.map((n: any) => ({
        id: n.id || n._id || n.debitNoteId || String(n.id || n._id || ""),
        noteNo: n.number || n.debitNoteNumber || n.noteNo || "",
        invoiceNo: n.againstInvoiceNumber || (n.invoice?.number) || n.invoiceNo || "",
        vendorName: n.customerName || n.vendorName || n.vendor || n.supplierName || "",
        reason: n.reason || n.noteReason || "",
        dateIssued: formatDate(n.date || n.debitNoteDate || n.dateIssued || n.createdAt || ""),
        amount: n.amount ?? n.total ?? 0,
        status: n.refund === true ? "Refunded" : (n.status || "Open"),
      }));

      // Update pagination state
      const pg = data.pagination || {};
      const serverCurrentPage = pg.currentPage || pg.page || data.page || currentPage;
      const serverTotalPages = pg.totalPages || data.totalPages || 1;
      const serverTotalItems = pg.total || data.total || 0;
      const serverPerPage = pg.perPage || data.perPage || pagination.perPage;

      setPagination({
        currentPage: serverCurrentPage,
        totalPages: serverTotalPages,
        totalItems: serverTotalItems,
        perPage: serverPerPage,
      });

      if (serverCurrentPage !== currentPage) {
        setCurrentPage(serverCurrentPage);
      }

      setDebitNotes(mapped);
    } catch (err) {
      console.error("Error fetching customer debit notes:", err);
      setDebitNotes([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pagination.perPage, selectedDate]);

  // Fetch debit notes
  const fetchDebitNotes = useCallback(async () => {
    try {
      setLoading(true);
      
      const filters = {
        searchTerm: searchTerm || undefined,
        dateFrom: selectedDate ? selectedDate.toISOString().split('T')[0] : undefined,
        dateTo: selectedDate ? selectedDate.toISOString().split('T')[0] : undefined,
      };

      const response = await getDebitNotes(currentPage, pagination.perPage, filters);
      
      const mapped = response.data.map((n: DebitNote) => ({
        id: n._id || String(n._id || ""),
        noteNo: n.debitNoteNumber || "DN-001",
        invoiceNo: n.againstInvoiceNumber || "INV-001",
        vendorName: n.vendorName || "Vendor",
        reason: n.reason || "Damaged Goods",
        dateIssued: formatDate(n.debitNoteDate || n.createdAt || ""),
        amount: n.total || 0,
        status: "Open",
      }));

      setPagination({
        currentPage: response.page,
        totalPages: response.totalPages,
        totalItems: response.total,
        perPage: pagination.perPage,
      });

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
  }, [currentPage, pagination.perPage, searchTerm, selectedDate]);

  // Removed sales returns fetch function
  // Fetch sales returns
  // const fetchSalesReturnsData = useCallback(async () => {
  //   try {
  //     setLoading(true);
  //     // const token = Cookies.get("authToken") || undefined; // Removed unused variable
  //     const filters = {
  //       ...(searchTerm && { search: searchTerm }),
  //     };

  //     const data = await fetchSalesReturns(filters);
  //     const paginationData = {
  //       currentPage: currentPage,
  //       totalPages: Math.ceil(data.length / pagination.perPage),
  //       totalItems: data.length
  //     };

  //     console.log("Sales returns API response:", data);
  //     console.log("Sales returns pagination:", paginationData);

  //     setPagination({
  //       currentPage: paginationData.currentPage || currentPage,
  //       totalPages: paginationData.totalPages || 1,
  //       totalItems: paginationData.totalItems || 0,
  //       perPage: pagination.perPage,
  //     });

  //     setSalesReturns(data || []);
  //   } catch (e) {
  //     console.error("Error fetching sales returns:", e);
  //     setSalesReturns([]);
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [currentPage, pagination.perPage, searchTerm, selectedDate]);

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

  // Customer search function using lookup.ts
  const performCustomerSearch = async (searchValue: string) => {
    console.log("🔍 performCustomerSearch called with:", searchValue);

    if (!searchValue || searchValue.length < 2) {
      console.log("❌ Search value too short, clearing results");
      setCustomerSearchResults([]);
      setShowCustomerSuggestions(false);
      return;
    }

    try {
      console.log("🔄 Starting customer search for:", searchValue);
      setCustomerSearchLoading(true);

      // Use the searchCustomers function from lookup.ts
      const customers = await searchCustomers(searchValue);
      console.log("✅ Customer search results:", customers);

      setCustomerSearchResults(customers);
      setShowCustomerSuggestions(true);
    } catch (error: any) {
      console.error("❌ Error searching customers:", error);
      setCustomerSearchResults([]);
      setShowCustomerSuggestions(false);
    } finally {
      setCustomerSearchLoading(false);
    }
  };

  // Debounced search function using useRef to store timeout
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedSearchCustomers = useCallback((value: string) => {
    console.log("⏰ Debounced search triggered with:", value);

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout
    searchTimeoutRef.current = setTimeout(() => {
      console.log("⏰ Debounce timeout executed for:", value);
      if (value.length >= 2) {
        performCustomerSearch(value);
      } else {
        setCustomerSearchResults([]);
        setShowCustomerSuggestions(false);
      }
    }, 300); // 300ms delay
  }, []);

  // Handle search with debouncing
  const handleSearch = (value: string) => {
    console.log("🔍 handleSearch called with:", value);
    setSearchTerm(value);
    setCurrentPage(1);

    // Debounced customer search
    debouncedSearchCustomers(value);
  };

  // Handle customer selection
  const handleCustomerSelect = (customer: any) => {
    const customerName = customer.name || customer.customerName || customer.businessName || "";
    console.log("🎯 Customer selected:", customer);

    setSearchTerm(customerName);
    setSelectedCustomer(customer);
    setShowCustomerSuggestions(false);
    setCustomerSearchResults([]);

    // Reset to page 1 when filtering
    setCurrentPage(1);

    // Fetch fresh data for the selected customer
    if (activeTab === "invoices") {
      fetchInvoicesForCustomer(customer);
    } else if (activeTab === "credit-notes") {
      fetchCreditNotesForCustomer(customer);
    } else if (activeTab === "debit-notes") {
      fetchDebitNotesForCustomer(customer);
    }

    toast({
      title: "Customer Selected",
      description: `Loading ${activeTab} for ${customerName}`,
    });
  };

  // Get data based on active tab (server-side filtering)
  const getFilteredData = () => {
    if (activeTab === "invoices") {
      return invoices;
    } else if (activeTab === "credit-notes") {
      return creditNotes;
    } else if (activeTab === "debit-notes") {
      return debitNotes;
    }
    return [];
  };

  const filteredData = getFilteredData();

  // Use server-side pagination data
  const currentData = filteredData;

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedDate]);

  // Debug pagination state
  useEffect(() => {
    console.log("📊 Pagination state changed:", {
      currentPage,
      totalPages: pagination.totalPages,
      totalItems: pagination.totalItems,
      activeTab,
      filteredDataLength: filteredData.length
    });
  }, [currentPage, pagination.totalPages, pagination.totalItems, activeTab, filteredData.length]);

  const goToPage = (page: number) => setCurrentPage(Math.max(1, Math.min(page, pagination.totalPages)));



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
        endpoint = `/api/invoices/import`;
        break;
      case "credit-notes":
        endpoint = `/api/credit-notes/import`;
        break;
      case "debit-notes":
        endpoint = `/api/debit-notes/import`;
        break;
      default:
        throw new Error("Invalid type for import");
    }

    try {
      const res = await api.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return res.data;
    } catch (error: any) {
      let errText = `Failed to import ${type}`;
      if (error.response?.data) {
        errText = error.response.data.detail || error.response.data.message || errText;
      }
      throw new Error(errText);
    }
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    try {
      console.log(`🔄 downloadBlob called with filename: ${filename}`);
      console.log(`📊 Blob size: ${blob.size} bytes`);
      console.log(`📊 Blob type: ${blob.type}`);

      // Create object URL
      const url = window.URL.createObjectURL(blob);
      console.log(`🔗 Created object URL: ${url}`);

      // Create download link
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.style.display = "none";

      // Add to DOM, click, and remove
      document.body.appendChild(link);
      console.log(`🔗 Link added to DOM, triggering click...`);
      link.click();

      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        console.log(`🧹 Cleaned up download link and URL`);
      }, 100);

      console.log(`✅ Download triggered for: ${filename}`);
    } catch (error) {
      console.error("❌ Error in downloadBlob:", error);
      throw new Error(`Failed to download file: ${filename}`);
    }
  };

  // Test function to verify download mechanism
  // const testDownload = () => {
  //   console.log("🧪 Testing download mechanism...");
  //   const testContent = "Test CSV Content\nInvoice Number,Customer Name,Amount\nINV-001,Test Customer,1000";
  //   const blob = new Blob([testContent], { type: "text/csv" });
  //   downloadBlob(blob, "test-export.csv");
  // };

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
        endpoint = `/api/invoices/export?format=${format}`;
        break;
      case "credit-notes":
        endpoint = `/api/credit-notes/export?format=${format}`;
        break;
      case "debit-notes":
        endpoint = `/api/debit-notes/export?format=${format}`;
        break;
      default:
        throw new Error("Invalid type for export");
    }

    console.log(`Attempting to export ${type} from endpoint: ${endpoint}`);

    try {
      const res = await api.get(endpoint, {
        responseType: 'blob',
        headers: {
          ...headers,
        }
      });
      return res;
    } catch (error: any) {
      if (error.response?.status === 204) {
        throw new Error(`No ${type} found to export`);
      }

      let errText = `Failed to export ${type}`;
      if (error.response?.data) {
        errText = error.response.data.detail || error.response.data.message || errText;
      }
      throw new Error(errText);
    }
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

  // Fetch all invoices for export (without pagination)
  const fetchAllInvoicesForExport = async () => {
    try {
      console.log("🔄 Fetching ALL invoices for export...");
      console.log("🔐 Checking authentication...");
      const token = Cookies.get("authToken");
      console.log("🔐 Auth token exists:", !!token);

      // Use the main invoices endpoint to get all invoices with complete data
      const res = await api.get('/api/invoices');
      const data = res.data;
      console.log("📊 All invoices for export response:", res);
      console.log("📊 All invoices for export data:", data);
      console.log("📊 Data type:", typeof data);
      console.log("📊 Is array:", Array.isArray(data));

      if (Array.isArray(data) && data.length > 0) {
        console.log("📋 Total invoices found:", data.length);
        console.log("📋 First invoice for export:", data[0]);
        console.log("📋 First invoice items for export:", data[0].items);
        console.log("📋 First invoice structure keys:", Object.keys(data[0]));

        // Debug the first item structure if it exists
        if (data[0].items && data[0].items.length > 0) {
          console.log("📋 First item structure:", data[0].items[0]);
          console.log("📋 First item keys:", Object.keys(data[0].items[0]));
        }
      } else if (data && data.data && Array.isArray(data.data)) {
        console.log("📋 Data wrapped in data property, total invoices:", data.data.length);
        console.log("📋 First invoice for export:", data.data[0]);
        if (data.data[0].items && data.data[0].items.length > 0) {
          console.log("📋 First item structure:", data.data[0].items[0]);
          console.log("📋 First item keys:", Object.keys(data.data[0].items[0]));
        }
        return data.data;
      } else {
        console.log("⚠️ No invoices found or unexpected data structure");
        console.log("📊 Data structure:", data);
      }

      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("❌ Error fetching all invoices for export:", error);
      // Safely extract error details, since error is of type unknown
      let status, statusText, dataDetail;
      if (typeof error === 'object' && error !== null && 'response' in error) {
        // @ts-ignore
        status = error.response?.status;
        // @ts-ignore
        statusText = error.response?.statusText;
        // @ts-ignore
        dataDetail = error.response?.data;
      }
      console.error("❌ Error details:", {
        message: error instanceof Error ? error.message : 'Unknown error',
        status,
        statusText,
        data: dataDetail
      });

      // Show error toast
      toast({
        title: "Export Failed",
        description: `Failed to fetch invoices: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });

      return [];
    }
  };

  // Professional CSV export for invoices (fallback)
  const exportInvoicesToCSV = async () => {
    console.log("🔄 CSV Export - Starting...");

    try {
      // Fetch all invoices for export
      const allInvoices = await fetchAllInvoicesForExport();
      console.log("📊 CSV Export - Received invoices:", allInvoices);

      if (!Array.isArray(allInvoices) || allInvoices.length === 0) {
        console.log("❌ No invoices found for export");
        toast({
          title: "Export Failed",
          description: "No invoices found to export",
          variant: "destructive",
        });
        return;
      }

      console.log("🔄 CSV Export - Processing", allInvoices.length, "invoices");

      // Simplified headers with only requested fields
      const headers = [
        "INVOICE NUMBER",
        "DATE",
        "STATE",
        "QUANTITY",
        "HSN",
        "RATE",
        "TAXABLE",
        "IGST",
        "CGST",
        "SGST",
        "GSTIN",
        "TOTAL"
      ];

      // Format date as DD/MM/YY
      const formatDateForCSV = (dateStr: string) => {
        if (!dateStr) return "N/A";
        try {
          const d = new Date(dateStr);
          if (isNaN(d.getTime())) return String(dateStr);
          const day = d.getDate().toString().padStart(2, '0');
          const month = (d.getMonth() + 1).toString().padStart(2, '0');
          const year = d.getFullYear().toString().slice(-2);
          return `${day}/${month}/${year}`;
        } catch {
          return String(dateStr);
        }
      };

      // Helper function to calculate row values (matching InvoiceForm logic)
      const calcRow = (item: any) => {
        console.log("🔍 calcRow - Processing item:", item);

        // Use the correct field names from the payload
        const qty = Number(item.quantity || 0);
        const rate = Number(item.unitPrice || 0);
        const gst = Number(item.gst || 0);
        const disc = Number(item.discount || 0);

        console.log("🔍 calcRow - Extracted values:", { qty, rate, gst, disc });

        const base = qty * rate;
        const discountAmount = disc > 0 && disc <= 100 ? (base * disc) / 100 : disc;
        const taxable = base - discountAmount;
        const gstAmount = (taxable * gst) / 100;
        const net = taxable + gstAmount;

        // For CGST/SGST calculation (assuming 18% GST split)
        const cgst = gstAmount / 2;
        const sgst = gstAmount / 2;
        const igst = 0; // Assuming intra-state, so IGST is 0

        const result = {
          qty: qty.toFixed(2),
          rate: rate.toFixed(2),
          gst: gst.toFixed(2),
          taxable: taxable.toFixed(2),
          cgst: cgst.toFixed(2),
          sgst: sgst.toFixed(2),
          igst: igst.toFixed(2),
          net: net.toFixed(2)
        };

        console.log("🔍 calcRow - Calculated result:", result);
        return result;
      };

      // Map the fetched data to our export format
      const mappedInvoices = allInvoices.map((invoice: any) => ({
        id: invoice._id || invoice.id || String(Math.random()),
        invoiceNumber: invoice.invoiceNumber || invoice.number || "INV-2024/001",
        customerName: invoice.billTo?.name || invoice.customerName || invoice.clientName || "Customer Name",
        status: invoice.paymentStatus || invoice.status || "Pending",
        date: formatDate(invoice.dateOfSale || invoice.date || invoice.createdAt || ""),
        dueDate: formatDate(invoice.dueDate || ""),
        amount: invoice.totalAmount || invoice.amount || invoice.total || 2000,
        items: invoice.items || invoice.invoice_items || [],
        gstin: invoice.gstin || invoice.billTo?.gst || invoice.billTo?.gstin || "",
        partyNumber: invoice.partyNumber || invoice.billTo?.pan || "",
        billFrom: invoice.billFrom || {},
        billTo: invoice.billTo || {},
        shipTo: invoice.shipTo || {},
        subtotal: invoice.subtotal || 0,
        cgst: invoice.cgst || 0,
        sgst: invoice.sgst || 0,
        igst: invoice.igst || 0,
        total: invoice.total || invoice.totalAmount || invoice.amount || 0,
        notes: invoice.notes || "",
        currency: invoice.currency || "INR",
      }));

      const rows: string[][] = [];

      mappedInvoices.forEach((invoice) => {
        const invoiceItems = Array.isArray(invoice.items) ? invoice.items : [];
        console.log(`CSV Export - Invoice ${invoice.invoiceNumber} items:`, invoiceItems);
        console.log(`CSV Export - Invoice ${invoice.invoiceNumber} full data:`, invoice);

        if (invoiceItems.length === 0) {
          // If no items, create a single row with invoice details
          rows.push([
            invoice.invoiceNumber,
            formatDateForCSV(invoice.date),
            invoice.billTo?.state || "-",
            "0",
            "-",
            "0",
            "0",
            "0",
            "0",
            "0",
            invoice.billTo?.gst || "-",
            `₹${invoice.total || invoice.amount || 0}`,
          ]);
        } else {
          // Create a row for each item
          invoiceItems.forEach((item: any) => {
            const r = calcRow(item);
            rows.push([
              invoice.invoiceNumber,
              formatDateForCSV(invoice.date),
              invoice.billTo?.state || "-",
              r.qty,
              item.hsn || "-",
              r.rate,
              r.taxable,
              r.igst,
              r.cgst,
              r.sgst,
              invoice.billTo?.gst || "-",
              `₹${invoice.total || invoice.amount || 0}`,
            ]);
          });
        }
      });

      // Create professional CSV with proper spacing and structure
      const csvRows = [headers, ...rows];

      const csvContent = csvRows
        .map((row) => {
          const formattedRow = row.map((cell) => {
            const str = cell == null ? "" : String(cell);
            const cleanStr = str.replace(/"/g, '""');
            return `"${cleanStr}"`;
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
      const filename = getExportFilename("csv", "invoices");
      downloadBlob(blob, filename);

      // Show success message
      toast({
        title: "CSV Export Successful",
        description: `CSV file "${filename}" has been downloaded successfully!`,
      });

      console.log("✅ CSV export completed successfully");
    } catch (error) {
      console.error("❌ CSV export error:", error);
      toast({
        title: "CSV Export Failed",
        description: `Failed to export CSV: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };

  // Professional Excel export for invoices (fallback)
  const exportInvoicesToExcel = async () => {
    console.log("🔄 Excel Export - Starting...");

    try {
      // Fetch all invoices for export
      const allInvoices = await fetchAllInvoicesForExport();
      console.log("📊 Excel Export - Received invoices:", allInvoices);

      if (!Array.isArray(allInvoices) || allInvoices.length === 0) {
        console.log("❌ No invoices found for export");
        toast({
          title: "Export Failed",
          description: "No invoices found to export",
          variant: "destructive",
        });
        return;
      }

      console.log("🔄 Excel Export - Processing", allInvoices.length, "invoices");

      // Create HTML table with professional styling for Excel
      const formatDateForExcel = (dateStr: string) => {
        if (!dateStr) return "N/A";
        try {
          const d = new Date(dateStr);
          if (isNaN(d.getTime())) return String(dateStr);
          const day = d.getDate().toString().padStart(2, '0');
          const month = (d.getMonth() + 1).toString().padStart(2, '0');
          const year = d.getFullYear().toString().slice(-2);
          return `${day}/${month}/${year}`;
        } catch {
          return String(dateStr);
        }
      };

      // Helper function to calculate row values (matching InvoiceForm logic)
      const calcRow = (item: any) => {
        console.log("🔍 calcRow - Processing item:", item);

        // Use the correct field names from the payload
        const qty = Number(item.quantity || 0);
        const rate = Number(item.unitPrice || 0);
        const gst = Number(item.gst || 0);
        const disc = Number(item.discount || 0);

        console.log("🔍 calcRow - Extracted values:", { qty, rate, gst, disc });

        const base = qty * rate;
        const discountAmount = disc > 0 && disc <= 100 ? (base * disc) / 100 : disc;
        const taxable = base - discountAmount;
        const gstAmount = (taxable * gst) / 100;
        const net = taxable + gstAmount;

        // For CGST/SGST calculation (assuming 18% GST split)
        const cgst = gstAmount / 2;
        const sgst = gstAmount / 2;
        const igst = 0; // Assuming intra-state, so IGST is 0

        const result = {
          qty: qty.toFixed(2),
          rate: rate.toFixed(2),
          gst: gst.toFixed(2),
          taxable: taxable.toFixed(2),
          cgst: cgst.toFixed(2),
          sgst: sgst.toFixed(2),
          igst: igst.toFixed(2),
          net: net.toFixed(2)
        };

        console.log("🔍 calcRow - Calculated result:", result);
        return result;
      };

      // Map the fetched data to our export format
      const mappedInvoices = allInvoices.map((invoice: any) => ({
        id: invoice._id || invoice.id || String(Math.random()),
        invoiceNumber: invoice.invoiceNumber || invoice.number || "INV-2024/001",
        customerName: invoice.billTo?.name || invoice.customerName || invoice.clientName || "Customer Name",
        status: invoice.paymentStatus || invoice.status || "Pending",
        date: formatDate(invoice.dateOfSale || invoice.date || invoice.createdAt || ""),
        dueDate: formatDate(invoice.dueDate || ""),
        amount: invoice.totalAmount || invoice.amount || invoice.total || 2000,
        items: invoice.items || invoice.invoice_items || [],
        gstin: invoice.gstin || invoice.billTo?.gst || invoice.billTo?.gstin || "",
        partyNumber: invoice.partyNumber || invoice.billTo?.pan || "",
        billFrom: invoice.billFrom || {},
        billTo: invoice.billTo || {},
        shipTo: invoice.shipTo || {},
        subtotal: invoice.subtotal || 0,
        cgst: invoice.cgst || 0,
        sgst: invoice.sgst || 0,
        igst: invoice.igst || 0,
        total: invoice.total || invoice.totalAmount || invoice.amount || 0,
        notes: invoice.notes || "",
        currency: invoice.currency || "INR",
      }));

      // Generate table rows for all invoice items
      const tableRows: string[] = [];
      mappedInvoices.forEach((invoice) => {
        const invoiceItems = Array.isArray(invoice.items) ? invoice.items : [];

        if (invoiceItems.length === 0) {
          // If no items, create a single row with invoice details
          tableRows.push(`
          <tr>
            <td>${invoice.invoiceNumber}</td>
            <td>${invoice.customerName}</td>
            <td class="status ${invoice.status.toLowerCase()}">${invoice.status}</td>
            <td>${formatDateForExcel(invoice.date)}</td>
            <td>${formatDateForExcel(invoice.dueDate)}</td>
            <td>1</td>
            <td>No items</td>
            <td>-</td>
            <td>0</td>
            <td>₹0</td>
            <td>0%</td>
            <td>₹0</td>
            <td>₹0</td>
            <td>₹0</td>
            <td>₹0</td>
            <td>₹0</td>
            <td>${invoice.gstin || "-"}</td>
            <td>${invoice.partyNumber || "-"}</td>
            <td class="amount">₹${invoice.amount.toLocaleString()}</td>
          </tr>
        `);
        } else {
          // Create a row for each item
          invoiceItems.forEach((item: any, index: number) => {
            const r = calcRow(item);
            tableRows.push(`
            <tr>
              <td>${invoice.invoiceNumber}</td>
              <td>${invoice.customerName}</td>
              <td class="status ${invoice.status.toLowerCase()}">${invoice.status}</td>
              <td>${formatDateForExcel(invoice.date)}</td>
              <td>${formatDateForExcel(invoice.dueDate)}</td>
              <td>${index + 1}</td>
              <td>${item.description || "-"}</td>
              <td>${item.hsn || item.hsn_sac || "-"}</td>
              <td>${r.qty}</td>
              <td>₹${r.rate}</td>
              <td>${r.gst}%</td>
              <td>₹${r.taxable}</td>
              <td>₹${r.net}</td>
              <td>₹${r.cgst}</td>
              <td>₹${r.sgst}</td>
              <td>₹${r.igst}</td>
              <td>${invoice.gstin || "-"}</td>
              <td>${invoice.partyNumber || "-"}</td>
              <td class="amount">₹${invoice.amount.toLocaleString()}</td>
            </tr>
          `);
          });
        }
      });

      // Prepare data for Excel export with simplified fields
      const excelData = mappedInvoices.map((invoice: any) => {
        const item = invoice.items[0] || {};
        const calc = calcRow(item);

        return {
          "INVOICE NUMBER": invoice.invoiceNumber,
          "DATE": invoice.date,
          "STATE": invoice.billTo?.state || "-",
          "QUANTITY": calc.qty,
          "HSN": item.hsn || "-",
          "RATE": calc.rate,
          "TAXABLE": calc.taxable,
          "IGST": calc.igst,
          "CGST": calc.cgst,
          "SGST": calc.sgst,
          "GSTIN": invoice.billTo?.gst || "-",
          "TOTAL": invoice.total || invoice.amount || 0,
        };
      });

      // Create Excel workbook using xlsx library
      const workbook = XLSX.utils.book_new();

      // Create worksheet from data
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Set column widths for better readability
      const columnWidths = [
        { wch: 15 }, // INVOICE NUMBER
        { wch: 12 }, // DATE
        { wch: 15 }, // STATE
        { wch: 10 }, // QUANTITY
        { wch: 12 }, // HSN
        { wch: 12 }, // RATE
        { wch: 15 }, // TAXABLE
        { wch: 10 }, // IGST
        { wch: 10 }, // CGST
        { wch: 10 }, // SGST
        { wch: 15 }, // GSTIN
        { wch: 15 }, // TOTAL
      ];
      worksheet['!cols'] = columnWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, "Invoice Report");

      // Generate Excel file buffer
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

      // Create blob and download
      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const filename = getExportFilename("excel", "invoices");
      downloadBlob(blob, filename);

      // Show success message
      toast({
        title: "Excel Export Successful",
        description: `Excel file "${filename}" has been downloaded successfully!`,
      });

      console.log("✅ Excel export completed successfully");
    } catch (error) {
      console.error("❌ Excel export error:", error);
      toast({
        title: "Excel Export Failed",
        description: `Failed to export Excel: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };

  // Professional PDF export for invoices
  const exportInvoicesToPDF = async () => {
    try {
      console.log("🔄 Starting PDF export...");

      // Fetch all invoices for export
      const allInvoices = await fetchAllInvoicesForExport();
      console.log("📊 PDF Export - Received invoices:", allInvoices);

      if (!Array.isArray(allInvoices) || allInvoices.length === 0) {
        console.log("❌ No invoices found for export");
        toast({
          title: "Export Failed",
          description: "No invoices found to export",
          variant: "destructive",
        });
        return;
      }

      console.log("🔄 PDF Export - Processing", allInvoices.length, "invoices");

      const doc = new jsPDF('l', 'mm', 'a4'); // Landscape orientation for better table view

      // Professional color scheme - using proper RGB arrays
      const primaryColor: [number, number, number] = [101, 75, 205]; // Purple theme
      const headerColor: [number, number, number] = [59, 130, 246]; // Blue for headers
      const lightGray: [number, number, number] = [248, 250, 252];
      const darkGray: [number, number, number] = [55, 65, 81];

      // Add header
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, 297, 30, 'F');

      // Company logo/name
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('DETAILED INVOICE REPORT', 20, 20);

      // Report details
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const currentDate = new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      doc.text(`Generated on: ${currentDate}`, 20, 35);

      // Format date as DD/MM/YY
      const formatDateForPDF = (dateStr: string) => {
        if (!dateStr) return "N/A";
        try {
          const d = new Date(dateStr);
          if (isNaN(d.getTime())) return String(dateStr);
          const day = d.getDate().toString().padStart(2, '0');
          const month = (d.getMonth() + 1).toString().padStart(2, '0');
          const year = d.getFullYear().toString().slice(-2);
          return `${day}/${month}/${year}`;
        } catch {
          return String(dateStr);
        }
      };

      // Helper function to calculate row values (matching InvoiceForm logic)
      const calcRow = (item: any) => {
        console.log("🔍 calcRow - Processing item:", item);

        // Use the correct field names from the payload
        const qty = Number(item.quantity || 0);
        const rate = Number(item.unitPrice || 0);
        const gst = Number(item.gst || 0);
        const disc = Number(item.discount || 0);

        console.log("🔍 calcRow - Extracted values:", { qty, rate, gst, disc });

        const base = qty * rate;
        const discountAmount = disc > 0 && disc <= 100 ? (base * disc) / 100 : disc;
        const taxable = base - discountAmount;
        const gstAmount = (taxable * gst) / 100;
        const net = taxable + gstAmount;

        // For CGST/SGST calculation (assuming 18% GST split)
        const cgst = gstAmount / 2;
        const sgst = gstAmount / 2;
        const igst = 0; // Assuming intra-state, so IGST is 0

        const result = {
          qty: qty.toFixed(2),
          rate: rate.toFixed(2),
          gst: gst.toFixed(2),
          taxable: taxable.toFixed(2),
          cgst: cgst.toFixed(2),
          sgst: sgst.toFixed(2),
          igst: igst.toFixed(2),
          net: net.toFixed(2)
        };

        console.log("🔍 calcRow - Calculated result:", result);
        return result;
      };

      // Prepare table data with detailed columns
      const tableHeaders = [
        'Invoice Number',
        'Customer Name',
        'Status',
        'Date',
        'Due Date',
        'S No',
        'Description',
        'HSN / SAC',
        'Quantity',
        'Item Rate',
        'Tax %',
        'Taxable Value',
        'Net Amount',
        'CGST',
        'SGST',
        'IGST',
        'GSTIN',
        'Party Number',
        'Total Amount'
      ];

      // Map the fetched data to our export format
      const mappedInvoices = allInvoices.map((invoice: any) => ({
        id: invoice._id || invoice.id || String(Math.random()),
        invoiceNumber: invoice.invoiceNumber || invoice.number || "INV-2024/001",
        customerName: invoice.billTo?.name || invoice.customerName || invoice.clientName || "Customer Name",
        status: invoice.paymentStatus || invoice.status || "Pending",
        date: formatDate(invoice.dateOfSale || invoice.date || invoice.createdAt || ""),
        dueDate: formatDate(invoice.dueDate || ""),
        amount: invoice.totalAmount || invoice.amount || invoice.total || 2000,
        items: invoice.items || invoice.invoice_items || [],
        gstin: invoice.gstin || invoice.billTo?.gst || invoice.billTo?.gstin || "",
        partyNumber: invoice.partyNumber || invoice.billTo?.pan || "",
        billFrom: invoice.billFrom || {},
        billTo: invoice.billTo || {},
        shipTo: invoice.shipTo || {},
        subtotal: invoice.subtotal || 0,
        cgst: invoice.cgst || 0,
        sgst: invoice.sgst || 0,
        igst: invoice.igst || 0,
        total: invoice.total || invoice.totalAmount || invoice.amount || 0,
        notes: invoice.notes || "",
        currency: invoice.currency || "INR",
      }));

      const tableData: string[][] = [];

      mappedInvoices.forEach((invoice) => {
        const invoiceItems = Array.isArray(invoice.items) ? invoice.items : [];

        if (invoiceItems.length === 0) {
          // If no items, create a single row with invoice details
          tableData.push([
            invoice.invoiceNumber,
            invoice.customerName,
            invoice.status,
            formatDateForPDF(invoice.date),
            formatDateForPDF(invoice.dueDate),
            "1",
            "No items",
            "-",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            invoice.gstin || "-",
            invoice.partyNumber || "-",
            invoice.amount.toLocaleString()
          ]);
        } else {
          // Create a row for each item
          invoiceItems.forEach((item: any, index: number) => {
            const r = calcRow(item);
            tableData.push([
              invoice.invoiceNumber,
              invoice.customerName,
              invoice.status,
              formatDateForPDF(invoice.date),
              formatDateForPDF(invoice.dueDate),
              (index + 1).toString(),
              item.description || item.Description || "-",
              item.hsn || item.hsn_sac || item.HSN || item.HSNSAC || "-",
              r.qty,
              r.rate,
              r.gst,
              r.taxable,
              r.net,
              r.cgst,
              r.sgst,
              r.igst,
              invoice.gstin || "-",
              invoice.partyNumber || "-",
              invoice.amount.toLocaleString()
            ]);
          });
        }
      });

      console.log("📊 Table data prepared:", { headers: tableHeaders, dataLength: tableData.length });

      // Update total records count
      doc.text(`Total Records: ${tableData.length}`, 150, 35);

      // Check if autoTable is available
      if (typeof autoTable === 'function') {
        console.log("✅ autoTable function is available");

        // Add table with professional styling using the imported autoTable
        autoTable(doc, {
          head: [tableHeaders],
          body: tableData,
          startY: 45,
          theme: 'grid',
          headStyles: {
            fillColor: headerColor,
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 10,
            halign: 'center'
          },
          bodyStyles: {
            fontSize: 9,
            textColor: darkGray,
            halign: 'left'
          },
          alternateRowStyles: {
            fillColor: lightGray
          },
          columnStyles: {
            0: { halign: 'left', cellWidth: 25 }, // Invoice Number
            1: { halign: 'left', cellWidth: 30 }, // Customer Name
            2: { halign: 'center', cellWidth: 15 }, // Status
            3: { halign: 'center', cellWidth: 15 }, // Date
            4: { halign: 'center', cellWidth: 15 }, // Due Date
            5: { halign: 'center', cellWidth: 8 }, // S No
            6: { halign: 'left', cellWidth: 25 }, // Description
            7: { halign: 'center', cellWidth: 12 }, // HSN / SAC
            8: { halign: 'right', cellWidth: 10 }, // Quantity
            9: { halign: 'right', cellWidth: 12 }, // Item Rate
            10: { halign: 'right', cellWidth: 8 }, // Tax %
            11: { halign: 'right', cellWidth: 12 }, // Taxable Value
            12: { halign: 'right', cellWidth: 12 }, // Net Amount
            13: { halign: 'right', cellWidth: 10 }, // CGST
            14: { halign: 'right', cellWidth: 10 }, // SGST
            15: { halign: 'right', cellWidth: 10 }, // IGST
            16: { halign: 'center', cellWidth: 15 }, // GSTIN
            17: { halign: 'center', cellWidth: 15 }, // Party Number
            18: { halign: 'right', cellWidth: 15 }  // Total Amount
          },
          margin: { left: 20, right: 20 },
          tableWidth: 'auto',
          showHead: 'everyPage',
          pageBreak: 'auto'
        });

        console.log("✅ Table added successfully with autoTable");
      } else {
        console.log("⚠️ autoTable not available, using fallback method");

        // Fallback: Simple table without autoTable
        let yPosition = 50;
        const rowHeight = 6;
        const colWidths = [25, 30, 15, 15, 15, 8, 25, 12, 10, 12, 8, 12, 12, 10, 10, 10, 15, 15, 15];
        const xPosition = 10;

        // Draw headers
        doc.setFillColor(headerColor[0], headerColor[1], headerColor[2]);
        doc.rect(xPosition, yPosition, colWidths.reduce((a, b) => a + b, 0), rowHeight, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');

        let currentX = xPosition;
        tableHeaders.forEach((header, index) => {
          doc.text(header, currentX + 2, yPosition + 6);
          currentX += colWidths[index];
        });

        yPosition += rowHeight;

        // Draw data rows
        doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');

        tableData.forEach((row, rowIndex) => {
          // Alternate row colors
          if (rowIndex % 2 === 0) {
            doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
            doc.rect(xPosition, yPosition, colWidths.reduce((a, b) => a + b, 0), rowHeight, 'F');
          }

          currentX = xPosition;
          row.forEach((cell, colIndex) => {
            doc.text(String(cell), currentX + 2, yPosition + 6);
            currentX += colWidths[colIndex];
          });

          yPosition += rowHeight;
        });

        console.log("✅ Fallback table added successfully");
      }

      // Add footer - using proper jsPDF methods
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(`Page ${i} of ${pageCount}`, 20, (doc as any).internal.pageSize.height - 10);
        doc.text('Generated by Invoice Management System', (doc as any).internal.pageSize.width - 80, (doc as any).internal.pageSize.height - 10);
      }

      // Save the PDF
      const filename = getExportFilename("pdf", "invoices");
      console.log("💾 Saving PDF with filename:", filename);

      // Save the PDF and trigger download
      doc.save(filename);

      // Show success message
      toast({
        title: "PDF Export Successful",
        description: `PDF file "${filename}" has been downloaded successfully!`,
      });

      console.log("✅ PDF export completed successfully");
    } catch (error) {
      console.error("❌ PDF export error:", error);
      console.error("Error details:", error);
      throw new Error(`PDF export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Client-side export functions for credit notes
  const exportCreditNotesToCSV = async () => {
    console.log("🔄 CSV Export - Starting Credit Notes...");

    if (!Array.isArray(creditNotes) || creditNotes.length === 0) {
      console.log("❌ No credit notes found for export");
      toast({
        title: "Export Failed",
        description: "No credit notes found to export",
        variant: "destructive",
      });
      return;
    }

    console.log("🔄 CSV Export - Processing", creditNotes.length, "credit notes");

    const headers = [
      "CREDIT NOTE NO",
      "INVOICE NO",
      "CUSTOMER NAME",
      "REASON",
      "DATE ISSUED",
      "AMOUNT",
      "STATUS"
    ];

    const formatDateForCSV = (dateStr: string) => {
      if (!dateStr) return "N/A";
      try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return String(dateStr);
        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const year = d.getFullYear().toString().slice(-2);
        return `${day}/${month}/${year}`;
      } catch {
        return String(dateStr);
      }
    };

    const rows: string[][] = creditNotes.map((note) => [
      note.noteNo,
      note.invoiceNo,
      note.customerName,
      note.reason,
      formatDateForCSV(note.dateIssued),
      `₹${note.amount.toLocaleString()}`,
      note.status
    ]);

    const csvRows = [headers, ...rows];
    const csvContent = csvRows
      .map((row) => {
        const formattedRow = row.map((cell) => {
          const str = cell == null ? "" : String(cell);
          const cleanStr = str.replace(/"/g, '""');
          return `"${cleanStr}"`;
        });
        return formattedRow.join(",");
      })
      .join("\n");

    const currentDate = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    const professionalHeader = [
      "CREDIT NOTES REPORT",
      `Generated on: ${currentDate}`,
      `Total Records: ${rows.length}`,
      "",
      csvContent
    ].join("\n");

    const BOM = "\uFEFF";
    const blob = new Blob([BOM + professionalHeader], { type: "text/csv;charset=utf-8;" });
    const filename = getExportFilename("csv", "credit-notes");
    downloadBlob(blob, filename);

    // Show success message
    toast({
      title: "CSV Export Successful",
      description: `CSV file "${filename}" has been downloaded successfully!`,
    });
  };

  const exportCreditNotesToExcel = async () => {
    console.log("🔄 Excel Export - Starting Credit Notes...");

    if (!Array.isArray(creditNotes) || creditNotes.length === 0) {
      console.log("❌ No credit notes found for export");
      toast({
        title: "Export Failed",
        description: "No credit notes found to export",
        variant: "destructive",
      });
      return;
    }

    const formatDateForExcel = (dateStr: string) => {
      if (!dateStr) return "N/A";
      try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return String(dateStr);
        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const year = d.getFullYear().toString().slice(-2);
        return `${day}/${month}/${year}`;
      } catch {
        return String(dateStr);
      }
    };

    // Prepare data for Excel export
    const rows = creditNotes.map((note) => ({
      "NOTE NO": note.noteNo,
      "INVOICE NO": note.invoiceNo,
      "CUSTOMER NAME": note.customerName,
      "REASON": note.reason,
      "DATE ISSUED": formatDateForExcel(note.dateIssued),
      "AMOUNT": note.amount,
      "STATUS": note.status,
    }));


    // Create Excel workbook using xlsx library
    const workbook = XLSX.utils.book_new();

    // Create worksheet from data
    const worksheet = XLSX.utils.json_to_sheet(rows);

    // Set column widths for better readability
    const columnWidths = [
      { wch: 15 }, // NOTE NO
      { wch: 15 }, // INVOICE NO
      { wch: 20 }, // CUSTOMER NAME
      { wch: 25 }, // REASON
      { wch: 12 }, // DATE ISSUED
      { wch: 15 }, // AMOUNT
      { wch: 12 }, // STATUS
    ];
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Credit Notes Report");

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // Create blob and download
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const filename = getExportFilename("excel", "credit-notes");
    downloadBlob(blob, filename);

    // Show success message
    toast({
      title: "Excel Export Successful",
      description: `Excel file "${filename}" has been downloaded successfully!`,
    });
  };

  const exportCreditNotesToPDF = async () => {
    try {
      console.log("🔄 Starting PDF export for Credit Notes...");

      if (!Array.isArray(creditNotes) || creditNotes.length === 0) {
        console.log("❌ No credit notes found for export");
        toast({
          title: "Export Failed",
          description: "No credit notes found to export",
          variant: "destructive",
        });
        return;
      }

      const doc = new jsPDF('l', 'mm', 'a4');
      const primaryColor: [number, number, number] = [101, 75, 205];
      const headerColor: [number, number, number] = [59, 130, 246];
      const lightGray: [number, number, number] = [248, 250, 252];
      const darkGray: [number, number, number] = [55, 65, 81];

      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, 297, 30, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('CREDIT NOTES REPORT', 20, 20);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const currentDate = new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      doc.text(`Generated on: ${currentDate}`, 20, 35);
      doc.text(`Total Records: ${creditNotes.length}`, 150, 35);

      const formatDateForPDF = (dateStr: string) => {
        if (!dateStr) return "N/A";
        try {
          const d = new Date(dateStr);
          if (isNaN(d.getTime())) return String(dateStr);
          const day = d.getDate().toString().padStart(2, '0');
          const month = (d.getMonth() + 1).toString().padStart(2, '0');
          const year = d.getFullYear().toString().slice(-2);
          return `${day}/${month}/${year}`;
        } catch {
          return String(dateStr);
        }
      };

      const tableHeaders = [
        'Credit Note No',
        'Invoice No',
        'Customer Name',
        'Reason',
        'Date Issued',
        'Amount',
        'Status'
      ];

      const tableData: string[][] = creditNotes.map((note) => [
        note.noteNo,
        note.invoiceNo,
        note.customerName,
        note.reason,
        formatDateForPDF(note.dateIssued),
        note.amount.toLocaleString(),
        note.status
      ]);

      if (typeof autoTable === 'function') {
        autoTable(doc, {
          head: [tableHeaders],
          body: tableData,
          startY: 45,
          theme: 'grid',
          headStyles: {
            fillColor: headerColor,
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 10,
            halign: 'center'
          },
          bodyStyles: {
            fontSize: 9,
            textColor: darkGray,
            halign: 'left'
          },
          alternateRowStyles: {
            fillColor: lightGray
          },
          columnStyles: {
            0: { halign: 'left', cellWidth: 30 },
            1: { halign: 'left', cellWidth: 30 },
            2: { halign: 'left', cellWidth: 40 },
            3: { halign: 'left', cellWidth: 35 },
            4: { halign: 'center', cellWidth: 25 },
            5: { halign: 'right', cellWidth: 25 },
            6: { halign: 'center', cellWidth: 20 }
          },
          margin: { left: 20, right: 20 },
          tableWidth: 'auto',
          showHead: 'everyPage',
          pageBreak: 'auto'
        });
      }

      const filename = getExportFilename("pdf", "credit-notes");
      doc.save(filename);

      // Show success message
      toast({
        title: "PDF Export Successful",
        description: `PDF file "${filename}" has been downloaded successfully!`,
      });
    } catch (error) {
      console.error("❌ PDF export error:", error);
      throw new Error(`PDF export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Client-side export functions for debit notes
  const exportDebitNotesToCSV = async () => {
    console.log("🔄 CSV Export - Starting Debit Notes...");

    if (!Array.isArray(debitNotes) || debitNotes.length === 0) {
      console.log("❌ No debit notes found for export");
      toast({
        title: "Export Failed",
        description: "No debit notes found to export",
        variant: "destructive",
      });
      return;
    }

    console.log("🔄 CSV Export - Processing", debitNotes.length, "debit notes");

    const headers = [
      "DEBIT NOTE NO",
      "INVOICE NO",
      "VENDOR NAME",
      "REASON",
      "DATE ISSUED",
      "AMOUNT",
      "STATUS"
    ];

    const formatDateForCSV = (dateStr: string) => {
      if (!dateStr) return "N/A";
      try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return String(dateStr);
        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const year = d.getFullYear().toString().slice(-2);
        return `${day}/${month}/${year}`;
      } catch {
        return String(dateStr);
      }
    };

    const rows: string[][] = debitNotes.map((note) => [
      note.noteNo,
      note.invoiceNo,
      note.vendorName,
      note.reason,
      formatDateForCSV(note.dateIssued),
      `₹${note.amount.toLocaleString()}`,
      note.status
    ]);

    const csvRows = [headers, ...rows];
    const csvContent = csvRows
      .map((row) => {
        const formattedRow = row.map((cell) => {
          const str = cell == null ? "" : String(cell);
          const cleanStr = str.replace(/"/g, '""');
          return `"${cleanStr}"`;
        });
        return formattedRow.join(",");
      })
      .join("\n");

    const currentDate = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    const professionalHeader = [
      "DEBIT NOTES REPORT",
      `Generated on: ${currentDate}`,
      `Total Records: ${rows.length}`,
      "",
      csvContent
    ].join("\n");

    const BOM = "\uFEFF";
    const blob = new Blob([BOM + professionalHeader], { type: "text/csv;charset=utf-8;" });
    const filename = getExportFilename("csv", "debit-notes");
    downloadBlob(blob, filename);

    // Show success message
    toast({
      title: "CSV Export Successful",
      description: `CSV file "${filename}" has been downloaded successfully!`,
    });
  };

  const exportDebitNotesToExcel = async () => {
    console.log("🔄 Excel Export - Starting Debit Notes...");

    if (!Array.isArray(debitNotes) || debitNotes.length === 0) {
      console.log("❌ No debit notes found for export");
      toast({
        title: "Export Failed",
        description: "No debit notes found to export",
        variant: "destructive",
      });
      return;
    }

    const formatDateForExcel = (dateStr: string) => {
      if (!dateStr) return "N/A";
      try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return String(dateStr);
        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const year = d.getFullYear().toString().slice(-2);
        return `${day}/${month}/${year}`;
      } catch {
        return String(dateStr);
      }
    };

    // Prepare data for Excel export
    const rows = debitNotes.map((note) => ({
      "NOTE NO": note.noteNo,
      "INVOICE NO": note.invoiceNo,
      "VENDOR NAME": note.vendorName,
      "REASON": note.reason,
      "DATE ISSUED": formatDateForExcel(note.dateIssued),
      "AMOUNT": note.amount,
      "STATUS": note.status,
    }));


    // Create Excel workbook using xlsx library
    const workbook = XLSX.utils.book_new();

    // Create worksheet from data
    const worksheet = XLSX.utils.json_to_sheet(rows);

    // Set column widths for better readability
    const columnWidths = [
      { wch: 15 }, // NOTE NO
      { wch: 15 }, // INVOICE NO
      { wch: 20 }, // VENDOR NAME
      { wch: 25 }, // REASON
      { wch: 12 }, // DATE ISSUED
      { wch: 15 }, // AMOUNT
      { wch: 12 }, // STATUS
    ];
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Debit Notes Report");

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // Create blob and download
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const filename = getExportFilename("excel", "debit-notes");
    downloadBlob(blob, filename);

    // Show success message
    toast({
      title: "Excel Export Successful",
      description: `Excel file "${filename}" has been downloaded successfully!`,
    });
  };

  const exportDebitNotesToPDF = async () => {
    try {
      console.log("🔄 Starting PDF export for Debit Notes...");

      if (!Array.isArray(debitNotes) || debitNotes.length === 0) {
        console.log("❌ No debit notes found for export");
        toast({
          title: "Export Failed",
          description: "No debit notes found to export",
          variant: "destructive",
        });
        return;
      }

      const doc = new jsPDF('l', 'mm', 'a4');
      const primaryColor: [number, number, number] = [101, 75, 205];
      const headerColor: [number, number, number] = [59, 130, 246];
      const lightGray: [number, number, number] = [248, 250, 252];
      const darkGray: [number, number, number] = [55, 65, 81];

      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, 297, 30, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('DEBIT NOTES REPORT', 20, 20);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const currentDate = new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      doc.text(`Generated on: ${currentDate}`, 20, 35);
      doc.text(`Total Records: ${debitNotes.length}`, 150, 35);

      const formatDateForPDF = (dateStr: string) => {
        if (!dateStr) return "N/A";
        try {
          const d = new Date(dateStr);
          if (isNaN(d.getTime())) return String(dateStr);
          const day = d.getDate().toString().padStart(2, '0');
          const month = (d.getMonth() + 1).toString().padStart(2, '0');
          const year = d.getFullYear().toString().slice(-2);
          return `${day}/${month}/${year}`;
        } catch {
          return String(dateStr);
        }
      };

      const tableHeaders = [
        'Debit Note No',
        'Invoice No',
        'Vendor Name',
        'Reason',
        'Date Issued',
        'Amount',
        'Status'
      ];

      const tableData: string[][] = debitNotes.map((note) => [
        note.noteNo,
        note.invoiceNo,
        note.vendorName,
        note.reason,
        formatDateForPDF(note.dateIssued),
        note.amount.toLocaleString(),
        note.status
      ]);

      if (typeof autoTable === 'function') {
        autoTable(doc, {
          head: [tableHeaders],
          body: tableData,
          startY: 45,
          theme: 'grid',
          headStyles: {
            fillColor: headerColor,
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 10,
            halign: 'center'
          },
          bodyStyles: {
            fontSize: 9,
            textColor: darkGray,
            halign: 'left'
          },
          alternateRowStyles: {
            fillColor: lightGray
          },
          columnStyles: {
            0: { halign: 'left', cellWidth: 30 },
            1: { halign: 'left', cellWidth: 30 },
            2: { halign: 'left', cellWidth: 40 },
            3: { halign: 'left', cellWidth: 35 },
            4: { halign: 'center', cellWidth: 25 },
            5: { halign: 'right', cellWidth: 25 },
            6: { halign: 'center', cellWidth: 20 }
          },
          margin: { left: 20, right: 20 },
          tableWidth: 'auto',
          showHead: 'everyPage',
          pageBreak: 'auto'
        });
      }

      const filename = getExportFilename("pdf", "debit-notes");
      doc.save(filename);

      // Show success message
      toast({
        title: "PDF Export Successful",
        description: `PDF file "${filename}" has been downloaded successfully!`,
      });
    } catch (error) {
      console.error("❌ PDF export error:", error);
      throw new Error(`PDF export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Handle export
  const handleExport = async (format: "csv" | "excel" | "pdf") => {
    try {
      setLoading(true);

      toast({
        title: "Exporting...",
        description: `Preparing ${format.toUpperCase()} export...`,
      });

      // Try server export first for all types
      try {
        const response = await apiExportReceipts(undefined, format, activeTab);
        const blob = response.data;
        const contentDisposition = response.headers["content-disposition"] || "";
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
        console.log("Server export failed, falling back to client-side export:", error);

        // Fallback to client-side export based on active tab and format
        console.log("🔄 Starting client-side export for:", activeTab, format);
        if (activeTab === "invoices") {
          if (format === "csv") {
            console.log("📄 Calling exportInvoicesToCSV()");
            await exportInvoicesToCSV();
          } else if (format === "excel") {
            console.log("📄 Calling exportInvoicesToExcel()");
            await exportInvoicesToExcel();
          } else if (format === "pdf") {
            console.log("📄 Calling exportInvoicesToPDF()");
            await exportInvoicesToPDF();
          }
        } else if (activeTab === "credit-notes") {
          if (format === "csv") {
            await exportCreditNotesToCSV();
          } else if (format === "excel") {
            await exportCreditNotesToExcel();
          } else if (format === "pdf") {
            await exportCreditNotesToPDF();
          }
        } else if (activeTab === "debit-notes") {
          if (format === "csv") {
            await exportDebitNotesToCSV();
          } else if (format === "excel") {
            await exportDebitNotesToExcel();
          } else if (format === "pdf") {
            await exportDebitNotesToPDF();
          }
        }

        toast({
          title: "Export Successful",
          description: `Exported as ${format.toUpperCase()} successfully! (Client-side)`,
        });
        return;
      }
    } catch (error) {
      console.error("Error exporting receipts:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

      let userMessage = errorMessage;
      if (errorMessage.includes("No") && errorMessage.includes("found")) {
        userMessage = `No ${activeTab} available to export.`;
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
      // const token = Cookies.get("authToken") || undefined; // Removed unused variable

      toast({
        title: "Importing...",
        description: `Uploading ${activeTab} file`,
      });

      const response = await apiImportReceipts(undefined, file, activeTab);

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



  // Handle edit - fetch detailed data by ID
  const handleEdit = async (item: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    try {
      setLoading(true);
      const token = Cookies.get("authToken");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      let endpoint = "";
      if (activeTab === "invoices") {
        endpoint = `/api/invoices/${item.id}`;
      } else if (activeTab === "credit-notes") {
        endpoint = `/api/credit-notes/${item.id}`;
      } else if (activeTab === "debit-notes") {
        endpoint = `/api/debit-notes/${item.id}`;
      }

      const response = await api.get(endpoint);
      // ⚠️ Extract actual data from response wrapper {success: true, data: {...}}
      const detailedData = response.data.data || response.data;
      console.log(`Fetched detailed data for ${activeTab}:`, detailedData); // Debug log

      if (activeTab === "invoices") {
        // Handle invoice edit
        setEditingInvoice(detailedData);
        setShowInvoiceForm(true);
      } else if (activeTab === "credit-notes") {
        // Handle credit note edit
        setEditingCreditNote(detailedData);
        setActiveCreditForm(true);
      } else if (activeTab === "debit-notes") {
        // Handle debit note edit
        setEditingDebitNote(detailedData);
        setActiveDebitForm(true);
      }
    } catch (error) {
      console.error("Error fetching item details:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch item details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for HTML generation
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
    if (inv.subtotal && inv.cgst && inv.sgst && inv.amount) {
      console.log("🔢 Using backend pre-calculated values:", {
        subtotal: inv.subtotal,
        cgst: inv.cgst,
        sgst: inv.sgst,
        amount: inv.amount,
        roundOff: inv.roundOff
      });

      return {
        taxableTotal: Number(inv.subtotal) - Number(inv.cgst) - Number(inv.sgst),
        totalGst: Number(inv.cgst) + Number(inv.sgst),
        cgst: Number(inv.cgst),
        sgst: Number(inv.sgst),
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
    let subtotal = 0; // sum of nets (taxable + gst)

    items.forEach((it: any) => {
      const r = calcRow(it);
      taxableTotal += r.taxable;
      totalGst += r.gstAmount;
      subtotal += r.net;
    });

    const cgst = +(totalGst / 2).toFixed(2);
    const sgst = +(totalGst / 2).toFixed(2);

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

    const docTitle = docType === "invoices" ? "INVOICE" :
      docType === "credit-notes" ? "CREDIT NOTE" :
        docType === "debit-notes" ? "DEBIT NOTE" : "DOCUMENT";

    const docNumber = docType === "invoices" ? (invoiceData.number || invoiceData.invoiceNumber || invoiceData.billNo) :
      docType === "credit-notes" ? (invoiceData.noteNo || invoiceData.billNo) :
        docType === "debit-notes" ? (invoiceData.noteNo || invoiceData.billNo) : (invoiceData.billNo || invoiceData.id);

    const partyName = docType === "invoices" ? (invoiceData.clientName || invoiceData.partyName || invoiceData.customerName || invoiceData.billTo?.name) :
      docType === "credit-notes" ? (invoiceData.partyName || invoiceData.customerName) :
        docType === "debit-notes" ? (invoiceData.partyName || invoiceData.vendorName) : "";

    const html = `<!doctype html>
      <html>
      <head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${docTitle} ${safe(docNumber)}</title><style>${style}</style></head>
      <body>
        <div class="sheet">
          <div class="header">
            <div style="flex:1">
              <div class="seller">${safe(invoiceData.billFrom?.businessName || invoiceData.billFrom?.name || "Seller Name")}</div>
              <div class="muted">${safe(invoiceData.billFrom?.address || "")}</div>
              <div class="muted">Phone: ${safe(invoiceData.billFrom?.phone || "")} • Email: ${safe(invoiceData.billFrom?.email || "")}</div>
              <div class="muted">GSTIN: ${safe(invoiceData.billFrom?.gst || invoiceData.billFrom?.gstin || invoiceData.gstin || "")}</div>
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
              <div style="font-weight:700">${docType === "debit-notes" ? "Vendor" : "Customer"} Name & Billing Address</div>
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

  // Handle download functionality
  const handleDownload = async (item: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    try {
      console.log("🔄 Starting download for item:", item);

      // Fetch complete invoice data by ID
      let completeItemData;
      if (activeTab === "invoices") {
        console.log("📥 Fetching complete invoice data for ID:", item.id);
        const response = await api.get(`/api/invoices/${item.id}`);
        completeItemData = response.data;
        console.log("✅ Complete invoice data received:", completeItemData);
      } else if (activeTab === "credit-notes") {
        console.log("📥 Fetching complete credit note data for ID:", item.id);
        const response = await api.get(`/api/credit-notes/${item.id}`);
        completeItemData = response.data;
        console.log("✅ Complete credit note data received:", completeItemData);
      } else if (activeTab === "debit-notes") {
        console.log("📥 Fetching complete debit note data for ID:", item.id);
        const response = await api.get(`/api/debit-notes/${item.id}`);
        completeItemData = response.data;
        console.log("✅ Complete debit note data received:", completeItemData);
      }

      // Console log the complete backend response data
      console.log("📤 Complete backend response data for download:", completeItemData);

      const html = generatePrintableHTML(completeItemData, activeTab);
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      const docTitle = activeTab === "invoices" ? "invoice" :
        activeTab === "credit-notes" ? "credit-note" :
          activeTab === "debit-notes" ? "debit-note" : "document";

      const docNumber = activeTab === "invoices" ? (completeItemData.invoiceNumber || completeItemData.billNo) :
        activeTab === "credit-notes" ? (completeItemData.noteNo || completeItemData.billNo) :
          activeTab === "debit-notes" ? (completeItemData.noteNo || completeItemData.billNo) : (completeItemData.billNo || completeItemData.id);

      const safeName = (docNumber || docTitle).replace(/[^\w-]/g, "_");
      a.download = `${safeName}.html`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);

      console.log("✅ Download completed successfully");
    } catch (err: any) {
      console.error("❌ Download error:", err);
      alert(`Could not download ${activeTab === "invoices" ? "invoice" : activeTab === "credit-notes" ? "credit note" : activeTab === "debit-notes" ? "debit note" : "document"}. Error: ${err.message || "Unknown error"}`);
    }
  };

  // Handle delete functionality
  const handleDelete = async (itemId: string | number) => {
    if (!confirm(`Are you sure you want to delete this ${activeTab === "invoices" ? "invoice" : activeTab === "credit-notes" ? "credit note" : "debit note"}?`)) return;

    try {
      if (activeTab === "invoices") {
        await api.delete(`/api/invoices/${itemId}`);
      } else if (activeTab === "credit-notes") {
        await deleteCreditNote(String(itemId));
      } else if (activeTab === "debit-notes") {
        await deleteDebitNote(String(itemId));
      }

      toast({
        title: "Success",
        description: `${activeTab === "invoices" ? "Invoice" : activeTab === "credit-notes" ? "Credit note" : "Debit note"} deleted successfully!`,
      });

      // Refresh data based on active tab
      if (activeTab === "invoices") {
        fetchInvoices();
      } else if (activeTab === "credit-notes") {
        fetchCreditNotes();
      } else if (activeTab === "debit-notes") {
        fetchDebitNotes();
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to delete ${activeTab === "invoices" ? "invoice" : activeTab === "credit-notes" ? "credit note" : "debit note"}`,
        variant: "destructive",
      });
    }
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
  }, [activeTab, currentPage, searchTerm, selectedDate, fetchInvoices, fetchCreditNotes, fetchDebitNotes]);

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
                {editingCreditNote ? "Edit Credit Note" : "Create Credit Note"}
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
              initialData={editingCreditNote}
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
                {editingDebitNote ? "Edit Debit Note" : "Create Debit Note"}
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
              initialData={editingDebitNote}
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
                className={`border-b-2 px-1 py-4 font-medium ${activeTab === "invoices"
                  ? "border-[#b5a3ff]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                onClick={() => setActiveTab("invoices")}
              >
                <span className="hidden sm:inline">Invoices</span>
                <span className="sm:hidden">Inv</span>
              </button>
              <button
                className={`border-b-2 px-1 py-4 font-medium ${activeTab === "credit-notes"
                  ? "border-[#b5a3ff]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                onClick={() => setActiveTab("credit-notes")}
              >
                <span className="hidden sm:inline">Credit Note</span>
                <span className="sm:hidden">CN</span>
              </button>
              <button
                className={`border-b-2 px-1 py-4 font-medium ${activeTab === "debit-notes"
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
                <div className="relative flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search by Customer Name..."
                      className="w-48 pl-10 sm:w-64"
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      onFocus={() => {
                        if (customerSearchResults.length > 0) {
                          setShowCustomerSuggestions(true);
                        }
                      }}
                      onBlur={() => {
                        // Delay hiding suggestions to allow clicking on them
                        setTimeout(() => setShowCustomerSuggestions(false), 200);
                      }}
                    />

                    {/* Customer Search Suggestions */}
                    {showCustomerSuggestions && (
                      <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {(() => {
                          console.log("🔍 Rendering suggestions:", {
                            showCustomerSuggestions,
                            customerSearchLoading,
                            customerSearchResults: customerSearchResults.length,
                            searchTerm
                          });
                          return null;
                        })()}
                        {customerSearchLoading ? (
                          <div className="px-4 py-2 text-sm text-gray-500 flex items-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-purple-600 border-t-transparent"></div>
                            Searching customers...
                          </div>
                        ) : customerSearchResults.length > 0 ? (
                          customerSearchResults.map((customer, index) => (
                            <div
                              key={customer.id || index}
                              className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                              onClick={() => handleCustomerSelect(customer)}
                            >
                              <div className="font-medium text-gray-900">
                                {customer.name || customer.customerName || customer.businessName}
                              </div>
                              {customer.email && (
                                <div className="text-xs text-gray-500">{customer.email}</div>
                              )}
                              {customer.phone && (
                                <div className="text-xs text-gray-500">{customer.phone}</div>
                              )}
                            </div>
                          ))
                        ) : searchTerm.length >= 2 ? (
                          <div className="px-4 py-2 text-sm text-gray-500">
                            No customers found for "{searchTerm}"
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>

                  {/* Clear Filter Button */}
                  {selectedCustomer && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedCustomer(null);
                        setSearchTerm("");
                        setCurrentPage(1);
                        // Refresh data without customer filter
                        if (activeTab === "invoices") {
                          fetchInvoices();
                        } else if (activeTab === "credit-notes") {
                          fetchCreditNotes();
                        } else if (activeTab === "debit-notes") {
                          fetchDebitNotes();
                        }
                        toast({
                          title: "Filter Cleared",
                          description: "Showing all records",
                        });
                      }}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>

                {/* Enhanced Date Filter */}
                <SingleDatePicker
                  selectedDate={selectedDate}
                  onDateChange={handleDateFilter}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {/* Import Dropdown */}
                {/* <DropdownMenu>
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
                </DropdownMenu> */}

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
            aria-label="Import CSV file"
            title="Import CSV file"
          />
          <input
            id="import-excel"
            type="file"
            accept=".xlsx,.xls"
            aria-label="Import Excel file"
            title="Import Excel file"
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
                          : activeTab === "debit-notes"
                            ? "debit notes"
                            : "sales returns"}{" "}
                      found
                    </td>
                  </tr>
                ) : (
                  currentData.map((item) => (
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
                                <DropdownMenuContent className="bg-gray-900 text-white" align="end">
                                  <DropdownMenuItem onClick={() => handleDownload(item)}>
                                    <Download className="mr-2 h-4 w-4" /> Download
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-500" onClick={() => handleDelete(item.id)}>
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
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
                                <DropdownMenuContent className="bg-gray-900 text-white" align="end">
                                  <DropdownMenuItem onClick={() => handleDownload(item)}>
                                    <Download className="mr-2 h-4 w-4" /> Download
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-500" onClick={() => handleDelete(item.id)}>
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
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
                                <DropdownMenuContent className="bg-gray-900 text-white" align="end">
                                  <DropdownMenuItem onClick={() => handleDownload(item)}>
                                    <Download className="mr-2 h-4 w-4" /> Download
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-500" onClick={() => handleDelete(item.id)}>
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
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
                  Showing {pagination.totalItems === 0 ? 0 : (pagination.currentPage - 1) * pagination.perPage + 1}-{Math.min(pagination.currentPage * pagination.perPage, pagination.totalItems)} of {pagination.totalItems} results
                  {pagination.totalPages > 1 && ` (Page ${pagination.currentPage} of ${pagination.totalPages})`}
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
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToPage(page)}
                        className={`w-8 h-8 p-0 ${page !== currentPage ? "hover:text-black" : ""}`}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  <Button
                    className="hover:bg-white bg-white text-slate-500 hover:text-[#654BCD] cursor-pointer"
                    size="sm"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === pagination.totalPages}
                  >
                    Next <ChevronRight className="h-4 w-4 ml-1" />
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
