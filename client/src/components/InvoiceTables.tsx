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
  Edit,
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
import { getSalesData, type SalesRecord } from "@/services/api/sales";
import autoTable from "jspdf-autotable";
import jsPDF from "jspdf";
import { useLocation, useNavigate } from "react-router-dom"; // <-- ADDED

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
  const [invoices, setInvoices] = useState<SalesRecord[]>([]);
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

  const fetchInvoices = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getSalesData();
      setInvoices(res || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch invoices");
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

  // Initial fetch (mount) and re-fetch when selectedDate or external refreshFlag change
  useEffect(() => {
    fetchInvoices();
  }, [selectedDate, refreshFlag]);

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
  }, [selectedDate, activeStatusFilter, refreshFlag]);

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
        mapStatusToFilter(invoice.paymentStatus || "") === activeStatusFilter
      );
    }

    // Search term (searches across multiple fields)
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(invoice =>
        (invoice.invoiceNumber || "").toString().toLowerCase().includes(searchLower) ||
        (invoice.customerName || "").toLowerCase().includes(searchLower) ||
        (invoice.product || "").toLowerCase().includes(searchLower)
      );
    }

    // Customer name filter
    if (filters.customerName) {
      const customerLower = filters.customerName.toLowerCase();
      filtered = filtered.filter(invoice =>
        (invoice.customerName || "").toLowerCase().includes(customerLower)
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
        const amount = Number(invoice.totalAmount || 0);
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

  const downloadCSV = (data: SalesRecord[], filename: string) => {
    const csvRows = [
      [
        "Invoice Number",
        "Customer Name",
        "Product",
        "Quantity",
        "Unit Price",
        "Total Amount",
        "Date of Sale",
        "Payment Status",
      ],
      ...data.map((sale) => [
        sale.invoiceNumber,
        sale.customerName,
        sale.product,
        sale.quantity,
        sale.unitPrice,
        sale.totalAmount,
        sale.dateOfSale,
        sale.paymentStatus,
      ]),
    ];

    const csvContent = csvRows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
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
      setInvoices(prev => prev.filter(inv => inv.id !== invoiceId && (inv as any)._id !== invoiceId));
      // re-fetch to make sure UI matches server
      fetchInvoices();
    } catch (err: any) {
      alert(err.message || "Failed to delete invoice");
    }
  };

  const handleDownload = (invoice: SalesRecord) => {
    try {
      const doc = new jsPDF();

      // Title
      doc.setFontSize(16);
      doc.text("Invoice", 14, 20);

      // Invoice details
      doc.setFontSize(12);
      doc.text(`Invoice Number: ${invoice.invoiceNumber}`, 14, 35);
      doc.text(`Customer: ${invoice.customerName}`, 14, 45);
      doc.text(`Date of Sale: ${invoice.dateOfSale}`, 14, 55);
      doc.text(`Status: ${invoice.paymentStatus}`, 14, 65);

      // Product Table
      autoTable(doc, {
        startY: 80,
        head: [["Product", "Quantity", "Unit Price", "Total"]],
        body: [
          [
            invoice.product,
            invoice.quantity,
            `₹${invoice.unitPrice}`,
            `₹${invoice.totalAmount}`,
          ],
        ],
      });

      // Footer / total
      doc.setFontSize(12);
      // @ts-ignore
      doc.text(`Total Amount: ₹${invoice.totalAmount}`, 14, doc.lastAutoTable.finalY + 20);

      // Save the file
      doc.save(`${invoice.invoiceNumber}.pdf`);
    } catch (err: any) {
      alert(err.message || "Failed to generate invoice PDF");
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

    return filterButtons.map(btn => ({
      ...btn,
      count: btn.value === "all"
        ? invoices.length
        : invoices.filter(inv => mapStatusToFilter(inv.paymentStatus || "") === btn.value).length
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Invoice Number</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Customer Name</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Product</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Quantity</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Unit Price</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Total Amount</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Date of Sale</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Payment Status</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>

              <tbody>
                {currentInvoices && currentInvoices.map((invoice) => (
                  <tr key={invoice.id || (invoice as any)._id} className="border-b border-border hover:bg-muted/20">
                    <td className="py-3 px-2 text-sm text-foreground">{invoice.invoiceNumber}</td>
                    <td className="py-3 px-2">{invoice.customerName}</td>
                    <td className="py-3 px-2">{invoice.product}</td>
                    <td className="py-3 px-2">{invoice.quantity}</td>
                    <td className="py-3 px-2">₹{(invoice as any).unitPrice?.toLocaleString?.()}</td>
                    <td className="py-3 px-2">₹{(invoice as any).totalAmount?.toLocaleString?.()}</td>
                    <td className="py-3 px-2">{(invoice as any).dateOfSale || (invoice as any).date}</td>
                    <td className="py-3 px-2">{getStatusBadge(invoice.paymentStatus)}</td>
                    <td className="py-3 px-2 flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // Normalize the invoice row into a shape the InvoiceForm expects.
                          const normalized: any = {
                            // copy raw fields
                            ...invoice,
                            // ensure we have _id and id for detection
                            _id: (invoice as any)._id || invoice.id || undefined,
                            id: invoice.id || (invoice as any)._id || undefined,
                            // map dateOfSale -> date (use as any to satisfy TS)
                            date: (invoice as any).dateOfSale || (invoice as any).date || new Date().toISOString().slice(0,10),
                            // map customer -> billTo
                            billTo: {
                              name: invoice.customerName || "",
                              email: (invoice as any).customerEmail || "",
                              address: (invoice as any).customerAddress || "",
                              phone: (invoice as any).customerPhone || "",
                              gst: (invoice as any).customerGst || "",
                              pan: (invoice as any).customerPan || "",
                            },
                            // ensure items array exists (fallback to single-item from row)
                            items: (invoice as any).items && Array.isArray((invoice as any).items) && (invoice as any).items.length > 0
                              ? (invoice as any).items
                              : [
                                  {
                                    description: invoice.product || "",
                                    hsn: (invoice as any).hsn || "",
                                    quantity: invoice.quantity || 1,
                                    unitPrice: (invoice as any).unitPrice || 0,
                                    gst: (invoice as any).gst || 0,
                                    discount: (invoice as any).discount || 0,
                                    amount: (invoice as any).totalAmount || 0,
                                  }
                                ],
                            total: (invoice as any).totalAmount || (invoice as any).total || 0,
                            subtotal: (invoice as any).subtotal || (invoice as any).totalAmount || 0,
                            currency: (invoice as any).currency || "INR",
                            status: (invoice as any).paymentStatus || (invoice as any).status || "draft",
                          };

                          // open form in parent - removed new invoice functionality

                          if (setEditingInvoice) {
                            // preferred: directly pass normalized invoice to parent setter
                            setEditingInvoice(normalized);
                          } else {
                            // fallback: emit event for older code paths
                            window.dispatchEvent(new CustomEvent("invoice:edit", { detail: normalized }));
                          }
                        }}
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
                          <DropdownMenuItem onClick={() => handleDownload(invoice)}>
                            <Download className="mr-2 h-4 w-4" /> Download
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-500" onClick={() => handleDelete(invoice.id || (invoice as any)._id)}>
                            <Trash className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
                {currentInvoices && currentInvoices.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-4 text-center text-muted-foreground">
                      No invoices found for selected filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-muted-foreground">
              Showing {filteredInvoices.length === 0 ? 0 : startIndex + 1}-{Math.min(endIndex, filteredInvoices.length)} of {filteredInvoices.length} results
              {(hasActiveFilters() && filteredInvoices.length !== invoices.length) &&
                ` (filtered from ${invoices.length} total)`
              }
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
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
              <Button variant="outline" size="sm" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
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
