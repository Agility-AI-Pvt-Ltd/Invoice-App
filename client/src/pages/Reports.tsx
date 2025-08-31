import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/card";
import Invoices from "@/pages/invoices"
import {
  Search,
  Download,
  Upload,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
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

  return (
    <div className="bg-background min-h-screen p-4 lg:p-8">
      <div className="max-w-8xl mx-auto">
        <Card className="border-0 bg-white shadow-sm">
          {/* Header */}
          <div className="border-b border-slate-200 p-4 lg:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-6">
                   <button
                    className={`pb-2 font-medium transition-colors ${
                      activeTab === "sales"
                        ? "border-b-3 border-[#b5a3ff]"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => {
                      setActiveTab("sales");
                      setCurrentPage(1);
                    }}
                  >
                    Sales
                  </button>
                   <button
                    className={`pb-2 font-medium transition-colors ${
                      activeTab === "credit-notes"
                        ? "border-b-3 border-[#b5a3ff]"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => {
                      setActiveTab("credit-notes");
                      setCurrentPage(1);
                    }}
                  >
                    Credit Note
                  </button>
                  <button
                    className={`pb-2 font-medium transition-colors ${
                      activeTab === "debit-notes"
                        ? "border-b-3 border-[#b5a3ff]"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => {
                      setActiveTab("debit-notes");
                      setCurrentPage(1);
                    }}
                  >
                    Debit Note
                  </button>
                </div>

              {activeTab === "sales" ? (
                <></>
              ) : (
                <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
                {/* Search */}
                <div className="relative flex-1 lg:w-80">
                  <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-slate-400" />
                  <Input
                    placeholder="Search by name, email, or role"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="h-10 border-slate-200 bg-white pl-10 text-slate-600"
                  />
                </div>



                {/* Desktop/Tablet Actions */}
                <div className="hidden flex-wrap gap-2 sm:flex">
                  <div>
                    <div className="hidden sm:block">
                      <SingleDatePicker
                        selectedDate={selectedDate}
                        onDateChange={setSelectedDate}
                      />
                    </div>
                    <div className="sm:hidden">
                      <SingleDatePicker
                        selectedDate={selectedDate}
                        onDateChange={setSelectedDate}
                        iconOnly
                      />
                    </div>
                  </div>
                  {/* Export Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button
                        variant="outline"
                        className={`h-10 border-slate-200 px-4 text-slate-600 hover:bg-slate-50 hover:text-black`}
                        disabled={loading}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        {"Export"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-white text-black hover:bg-slate-50 hover:text-black">
                      <DropdownMenuItem
                        onClick={() => handleExport("csv")}
                        disabled={loading}
                        className={loading ? "cursor-not-allowed opacity-50" : ""}
                      >
                        Export as CSV
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleExport("excel")}
                        disabled={loading}
                        className={loading ? "cursor-not-allowed opacity-50" : ""}
                      >
                        Export as Excel
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <div className="relative">
                    <label>
                      <input
                        type="file"
                        accept=".csv,.xlsx"
                        onChange={handleImport}
                        className="hidden"
                      />
                      <Button
                        asChild
                        variant="outline"
                        className="h-10 cursor-pointer border-slate-200 px-4 text-slate-600 hover:bg-slate-50 hover:text-black"
                      >
                        <span className="flex items-center">
                          <Download className="mr-2 h-4 w-4" />
                          Import
                        </span>
                      </Button>
                    </label>
                  </div>
                </div>

                {/* Mobile Actions */}
                <div className="no-scrollbar flex flex-nowrap items-center gap-2 overflow-x-auto sm:hidden">
                  <Button variant="outline" size="icon" className="shrink-0">
                    <Calendar className="h-5 w-5" />
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className={`shrink-0`}
                        disabled={loading}
                      >
                        <Download className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => handleExport("csv")}
                        disabled={loading}
                      >
                        CSV
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleExport("excel")}
                        disabled={loading}
                      >
                        Excel
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleExport("pdf")}
                        disabled={loading}
                      >
                        PDF
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <div className="relative">
                    <input
                      type="file"
                      accept=".csv,.xlsx"
                      onChange={handleImport}
                      className="hidden"
                      id="import-file-mobile"
                    />
                    <label htmlFor="import-file-mobile">
                      <Button
                        variant="outline"
                        size="icon"
                        className="shrink-0 cursor-pointer"
                      >
                        <Upload className="h-5 w-5" />
                      </Button>
                    </label>
                  </div>
                </div>
              </div>
              )}
            </div>
          </div>

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

          {/* No Data State */}
          {/* {activeTab !== "sales" && !loading && filteredNotes.length === 0 && (
            <div className="flex items-center justify-center border-t border-slate-200 px-4 py-12">
              <div className="text-center text-slate-500">
                <div className="mb-2 text-4xl">📄</div>
                <p className="text-lg font-medium">No {activeTab === "credit-notes" ? "Credit" : "Debit"} Notes Found</p>
                <p className="text-sm">Try adjusting your search or filters</p>
              </div>
            </div>
          )} */}

          {/* Loading State */}
          {/* {loading && (
            <div className="flex items-center justify-center border-t border-slate-200 px-4 py-8">
              <div className="flex items-center gap-2 text-slate-500">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-[#8066FF]"></div>
                <span>Loading...</span>
              </div>
            </div>
          )} */}

          {/* Page Info */}
          {activeTab !== "sales" && pagination.totalItems > 0 && (
            <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm text-slate-500">
              <span>
                {`${(pagination.currentPage - 1) * pagination.perPage + 1}-${Math.min(
                  pagination.currentPage * pagination.perPage,
                  pagination.totalItems
                )} of ${pagination.totalItems} items`}
              </span>
            </div>
          )}

          {/* Pagination */}
          {activeTab !== "sales" && pagination.totalPages > 1 && (
            <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 p-4 sm:flex-row lg:p-6">
              <button
                className={`flex items-center gap-2 text-sm ${pagination.currentPage <= 1 ? "cursor-not-allowed text-slate-300" : "text-slate-600 hover:text-slate-800"}`}
                disabled={pagination.currentPage <= 1 || loading}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                <span>←</span>
                <span className="hidden sm:inline">Previous</span>
              </button>

              <div className="flex items-center gap-2">
                {getPaginationRange(pagination.currentPage, pagination.totalPages).map((item, idx) =>
                  item === "..." ? (
                    <span key={`dots-${idx}`} className="px-2 text-slate-400">...</span>
                  ) : (
                    <button
                      key={item as number}
                      className={`h-8 w-8 rounded ${item === pagination.currentPage ? "bg-[#8066FF] text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                      onClick={() => setCurrentPage(item as number)}
                      disabled={loading}
                    >
                      {item}
                    </button>
                  ),
                )}
              </div>

              <button
                className={`flex items-center gap-2 text-sm ${pagination.currentPage >= pagination.totalPages ? "cursor-not-allowed text-slate-300" : "text-slate-600 hover:text-slate-800"}`}
                disabled={pagination.currentPage >= pagination.totalPages || loading}
                onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
              >
                <span className="hidden sm:inline">Next</span>
                <span>→</span>
              </button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// Create a compact pagination sequence like: 1 … 5 6 [7] 8 9 … 68
function getPaginationRange(current: number, total: number) {
  const delta = 2; // pages around current
  const range: (number | string)[] = [];
  const rangeWithDots: (number | string)[] = [];
  const left = Math.max(2, current - delta);
  const right = Math.min(total - 1, current + delta);

  range.push(1);
  for (let i = left; i <= right; i++) range.push(i);
  if (total > 1) range.push(total);

  let l: number | undefined;
  for (const i of range) {
    if (typeof i === "number") {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l > 2) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    } else {
      rangeWithDots.push(i);
    }
  }
  return Array.from(new Set(rangeWithDots));
}
