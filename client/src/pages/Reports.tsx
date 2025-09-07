import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/card";
import Invoices from "@/pages/invoices"
import {
  Search,
  Download,
  Upload,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
// import { Calendar } from "@/components/ui/calendar";
import { SingleDatePicker } from "@/components/ui/SingleDatePicker";
import Cookies from "js-cookie";
import CreditDebitTable from "@/components/reports/CreditDebitTable";

const API_BASE = "https://invoice-backend-604217703209.asia-south1.run.app";

type Tab = "sales" | "credit-notes" | "debit-notes";

export default function Report() {
  const [activeTab, setActiveTab] = useState<Tab>("sales");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [creditNotes, setCreditNotes] = useState<any[]>([]);
  const [debitNotes, setDebitNotes] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0, perPage: 10 });
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedReason, setSelectedReason] = useState("All");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const { toast } = useToast();

  // Helper function to check if user is authenticated
  const isAuthenticated = () => {
    const token = Cookies.get("authToken");
    return !!token;
  };

  const apiImportNotes = async (
    token: string | undefined,
    file: File,
  ) => {
    const formData = new FormData();
    formData.append("file", file);

    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    // Only credit notes import is provided
    const res = await fetch(`${API_BASE}/api/credit-notes/import`, {
      method: "POST",
      headers: headers,
      body: formData,
    });

    if (!res.ok) {
      let errText = `Failed to import notes (status ${res.status})`;
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

  const apiExportNotes = async (
    token: string | undefined,
    format: "csv" | "excel" | "pdf",
  ) => {
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    // Only credit notes export endpoint is specified
    const res = await fetch(
      `${API_BASE}/api/credit-notes/export?format=${format}`,
      { method: "GET", headers },
    );

    if (!res.ok) {
      if (res.status === 204) {
        throw new Error("No notes found to export");
      }

      let errText = `Failed to export notes (status ${res.status})`;
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

  const getExportFilename = (format: "csv" | "excel" | "pdf") => {
    const timestamp = new Date().toISOString().split("T")[0];
    switch (format) {
      case "csv":
        return `credit_notes_${timestamp}.csv`;
      case "excel":
        return `credit_notes_${timestamp}.xlsx`;
      case "pdf":
        return `credit_notes_${timestamp}.pdf`;
      default:
        return `credit_notes_${timestamp}.${format}`;
    }
  };

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

  const fetchCreditNotes = useCallback(async () => {
    try {
      setLoading(true);
      const token = Cookies.get("authToken") || undefined;
      const params = new URLSearchParams({ 
        page: String(currentPage), 
        perPage: String(pagination.perPage),
        ...(selectedStatus !== "All" && { status: selectedStatus }),
        ...(selectedReason !== "All" && { reason: selectedReason }),
        ...(searchTerm && { search: searchTerm }),
        ...(selectedDate && { date: selectedDate.toISOString().split('T')[0] })
      });
      const res = await fetch(`${API_BASE}/api/credit-notes?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error(`Failed to fetch credit notes (${res.status})`);
      const data = await res.json();
      const arr = Array.isArray(data) ? data : data.data || data.notes || [];
      const mapped = arr.map((n: any) => ({
        id: n._id || n.id || n.creditNoteId || String(n._id || n.id || ""),
        noteNo: n.creditNoteNumber || n.noteNo || n.number || "",
        invoiceNo: n.againstInvoiceNumber || n.invoiceNo || "",
        customerName: n.customerName || n.bussinessName || n.clientName || "",
        reason: n.reason || n.noteReason || "",
        dateIssued: formatDate(n.creditNoteDate || n.dateIssued || n.date || n.createdAt || ""),
        amount: n.total ?? n.amount ?? 0,
        status: n.refund === true ? "Refunded" : (n.status || "Open"),
      }));
      const pg = data.pagination || {};
      setPagination((p) => ({
        currentPage: pg.currentPage || currentPage,
        totalPages: pg.totalPages || 1,
        totalItems: pg.total || mapped.length,
        perPage: pg.perPage || p.perPage || 10,
      }));
      setCreditNotes(mapped);
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Failed to fetch credit notes", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [currentPage, pagination.perPage, selectedStatus, selectedReason, searchTerm, selectedDate, toast]);

  const fetchDebitNotes = useCallback(async () => {
    try {
      setLoading(true);
      const token = Cookies.get("authToken") || undefined;
      const params = new URLSearchParams({ 
        page: String(currentPage), 
        perPage: String(pagination.perPage),
        ...(selectedStatus !== "All" && { status: selectedStatus }),
        ...(selectedReason !== "All" && { reason: selectedReason }),
        ...(searchTerm && { search: searchTerm }),
        ...(selectedDate && { date: selectedDate.toISOString().split('T')[0] })
      });
      const res = await fetch(`${API_BASE}/api/debit-notes?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error(`Failed to fetch debit notes (${res.status})`);
      const data = await res.json();
      const arr = Array.isArray(data) ? data : data.data || data.notes || [];
      const mapped = arr.map((n: any) => ({
        id: n._id || n.id || n.debitNoteId || String(n._id || n.id || ""),
        noteNo: n.debitNoteNumber || n.noteNo || n.number || "",
        invoiceNo: n.againstInvoiceNumber || n.invoiceNo || "",
        vendorName: n.vendorName || n.vendor || n.supplierName || "",
        reason: n.reason || n.noteReason || "",
        dateIssued: formatDate(n.debitNoteDate || n.dateIssued || n.date || n.createdAt || ""),
        amount: n.total ?? n.amount ?? 0,
        status: n.status || "Open",
      }));
      const pg = data.pagination || {};
      setPagination((p) => ({
        currentPage: pg.currentPage || currentPage,
        totalPages: pg.totalPages || 1,
        totalItems: pg.total || mapped.length,
        perPage: pg.perPage || p.perPage || 10,
      }));
      setDebitNotes(mapped);
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Failed to fetch debit notes", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [currentPage, pagination.perPage, selectedStatus, selectedReason, searchTerm, selectedDate, toast]);

  // Reset filters when changing tabs
  useEffect(() => {
    setSelectedStatus("All");
    setSelectedReason("All");
    setSelectedDate(undefined);
    setCurrentPage(1);
  }, [activeTab]);

  // Fetch notes
  useEffect(() => {
    if (isAuthenticated()) {
      if (activeTab === "credit-notes") {
        fetchCreditNotes();
      } else if (activeTab === "debit-notes") {
        fetchDebitNotes();
      }
    } else {
      setCreditNotes([]);
      setDebitNotes([]);
    }
  }, [fetchCreditNotes, fetchDebitNotes, activeTab]);

  // Handle import
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = [".csv", ".xlsx", ".xls"];
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();

    if (!validTypes.includes(fileExtension)) {
      toast({
        title: "Error",
        description: "Only CSV and Excel files (.csv, .xlsx, .xls) are supported",
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

      if (activeTab !== "credit-notes") {
        toast({ title: "Not supported", description: "Import is available for Credit Notes only currently.", variant: "destructive" });
        event.target.value = "";
        return;
      }

      toast({ title: "Importing...", description: "Uploading credit notes file" });

      const response = await apiImportNotes(token, file);

      toast({ title: "Success", description: response.message || "Credit notes imported successfully!" });

      await fetchCreditNotes();

      event.target.value = "";
    } catch (error) {
      console.error("Error importing notes:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

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

  // Handle export
  const handleExport = async (format: "csv" | "excel" | "pdf") => {
    try {
      setLoading(true);
      const token = Cookies.get("authToken") || undefined;

      if (activeTab !== "credit-notes") {
        toast({ title: "Not supported", description: "Export is available for Credit Notes only currently.", variant: "destructive" });
        return;
      }

      toast({ title: "Exporting...", description: `Preparing ${format.toUpperCase()} export...` });

      const response = await apiExportNotes(token, format);

      const blob = await response.blob();

      const contentDisposition = response.headers.get("content-disposition") || "";
      let filename = getExportFilename(format);

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, "");
        }
      }

      downloadBlob(blob, filename);

      toast({ title: "Export Successful", description: `Exported as ${format.toUpperCase()} successfully!` });
    } catch (error) {
      console.error("Error exporting notes:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

      let userMessage = errorMessage;
      if (errorMessage.includes("No notes found")) {
        userMessage = "No notes available to export.";
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

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const filteredNotes = (activeTab === "credit-notes" ? creditNotes : debitNotes).filter((n) => {
    const term = (searchTerm || "").toLowerCase();
    const matchesTerm = !term || [n.noteNo, n.invoiceNo, n.customerName, n.vendorName, n.reason]
      .filter(Boolean)
      .some((v: any) => String(v).toLowerCase().includes(term));
    const matchesDate = selectedDate
      ? (n.dateIssued && String(n.dateIssued).slice(0, 10) === selectedDate.toISOString().slice(0, 10))
      : true;
    return matchesTerm && matchesDate;
  });

  // Handle filter changes
  const handleStatusFilterChange = (newStatus: string) => {
    setSelectedStatus(newStatus);
    setCurrentPage(1);
  };

  const handleReasonFilterChange = (newReason: string) => {
    setSelectedReason(newReason);
    setCurrentPage(1);
  };

  // Pagination navigation
  const goToPage = (page: number) => setCurrentPage(Math.max(1, Math.min(page, pagination.totalPages)));

  return (
    <div className="bg-background min-h-screen p-2 sm:p-4 lg:p-8">
      <div className="max-w-8xl mx-auto space-y-4 sm:space-y-6">
        {/* Main Content */}
        <Card className="bg-white">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex space-x-4 px-4 sm:space-x-8 sm:px-6">
              <button
                className={`border-b-2 px-1 py-4 font-medium ${
                  activeTab === "sales"
                    ? "border-[#b5a3ff]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("sales")}
              >
                <span className="hidden sm:inline">Sales</span>
                <span className="sm:hidden">Sales</span>
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
          {activeTab !== "sales" && (
            <div className="border-b border-gray-200 p-4 sm:p-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row">
                <div className="flex flex-col gap-4 sm:flex-row">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search by name, email, or role..."
                      className="w-48 pl-10 sm:w-64"
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                    />
                  </div>

                  {/* Enhanced Date Filter */}
                  <SingleDatePicker
                    selectedDate={selectedDate}
                    onDateChange={setSelectedDate}
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {/* Import Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className="flex items-center gap-2 border-1 border-gray-200 bg-white text-black hover:bg-gray-100">
                        <Download className="h-4 w-4" />
                        <span className="hidden sm:inline">Import</span>
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
                      </Button>
                    </DropdownMenuTrigger>
                    {loading && (
                      <div className="absolute top-full left-0 mt-2 px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded shadow-lg">
                        Processing...
                      </div>
                    )}
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
                </div>
              </div>
            </div>
          )}

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

          {/* Content */}
          {activeTab === "sales" ? (
            <Invoices />
          ) : (
            <CreditDebitTable 
              activeTab={activeTab} 
              notesData={filteredNotes}
              selectedStatus={selectedStatus}
              selectedReason={selectedReason}
              onStatusFilterChange={handleStatusFilterChange}
              onReasonFilterChange={handleReasonFilterChange}
            />
          )}

          {/* Pagination */}
          {activeTab !== "sales" && filteredNotes.length > 0 && (
            <div className="border-t border-gray-200 px-4 py-4 sm:px-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
                <div className="text-center text-sm text-gray-700 sm:text-left">
                  Showing {pagination.totalItems === 0 ? 0 : (pagination.currentPage - 1) * pagination.perPage + 1}-{Math.min(pagination.currentPage * pagination.perPage, pagination.totalItems)} of {pagination.totalItems} results
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
