// @ts-nocheck
import { useEffect, useRef, useState, useCallback } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Download, MoreVertical, MoveLeft, MoveRight, Pencil, Trash2 } from "lucide-react";
import MultiStepForm from "./add-customer";
import axios from "axios";
import Cookies from "js-cookie";

// 🔹 Added imports for dropdowns & menu (used for Filter and Export/Import)
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useLocation, useNavigate } from "react-router-dom";
import { SingleDatePicker } from "@/components/ui/SingleDatePicker";
import { Input } from "@/components/ui/Input";

const ITEMS_PER_PAGE = 10;

export default function CustomerDashboard() {
  const [page, setPage] = useState(1);
  const [customers, setCustomers] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddCustomerForm, setShowAddCustomerForm] = useState(false);

  // 🔹 Filter states
  const [statusFilter, setStatusFilter] = useState("__all");
  const [dateFilter, setDateFilter] = useState("__any");
  const [customDate, setCustomDate] = useState<Date | null>(null)
  const [balanceFilter, setBalanceFilter] = useState("__any")
  const [customBalance, setCustomBalance] = useState("")

  // file input ref for import
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const location = useLocation();
  const navigate = useNavigate();

  // ------------------ Fetch customers (extracted so we can call it from event handler) ------------------
  const fetchCustomers = useCallback(
    async (p = page) => {
      try {
        const token = Cookies.get("authToken");
        const res = await axios.get(
          `https://invoice-backend-604217703209.asia-south1.run.app/api/get_customer?page=${p}&limit=${ITEMS_PER_PAGE}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );
        setCustomers(res.data.data || []);
        setTotalPages(res.data.pagination?.totalPages || 1);
      } catch (err) {
        console.error("Failed to fetch customers:", err);
      }
    },
    []
  );

  // call fetch on page change
  useEffect(() => {
    fetchCustomers(page);
  }, [page, fetchCustomers]);

  // If navigated here with state.openAddCustomerForm -> open the add-customer form and clear history state.
  useEffect(() => {
    try {
      const stateAny = (location && (location.state as any)) || {};
      if (stateAny && stateAny.openAddCustomerForm) {
        setShowAddCustomerForm(true);
        // Clear navigation state so it doesn't re-trigger on refresh/back
        navigate(location.pathname, { replace: true, state: {} });
      }
    } catch (err) {
      // ignore
    }
    // run on mount only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen for "customer:added" event and refetch (non-invasive)
  useEffect(() => {
    const handler = (e: any) => {
      try {
        console.log("customer:added event received, refetching list", e?.detail);
        // If user is on page 1, optimistically show the new customer at top for instant feedback
        if (page === 1 && e?.detail) {
          setCustomers((prev) => {
            // avoid duplicate if already present by id (best-effort)
            try {
              const newId = e.detail?.id ?? e.detail?._id ?? null;
              if (newId && prev.some((c) => c.id === newId || c._id === newId)) {
                // already present, just return prev and trigger fetch
                fetchCustomers(page);
                return prev;
              }
            } catch (err) {
              /* ignore id check errors */
            }
            // prepend created customer
            return [e.detail, ...prev];
          });
        }
        // always ensure we re-sync with server
        fetchCustomers(page);
      } catch (err) {
        console.error("Error handling customer:added event:", err);
      }
    };

    window.addEventListener("customer:added", handler);
    return () => window.removeEventListener("customer:added", handler);
  }, [page, fetchCustomers]);

  // ------------------ Export / Import Helpers ------------------
  const loadXLSX = async () => {
    try {
      const XLSX = await import("xlsx");
      return XLSX;
    } catch (err) {
      console.error("xlsx library is required for Excel import/export. Install with `npm i xlsx`", err);
      throw err;
    }
  };

  const loadJsPDF = async () => {
    try {
      // Import jsPDF first
      const jsPDFModule = await import("jspdf");
      const jsPDF = jsPDFModule.default || jsPDFModule.jsPDF || jsPDFModule;

      // Import autotable plugin - this extends jsPDF prototype
      const autoTableModule = await import("jspdf-autotable");

      // Return the jsPDF constructor (the plugin automatically extends it)
      return jsPDF;
    } catch (err) {
      console.error("jspdf or jspdf-autotable missing. Install with `npm i jspdf jspdf-autotable`", err);
      throw err;
    }
  };

  const handleDownloadCustomerPDF = async (customer) => {
    try {
      const jsPDF = await loadJsPDF();

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });

      // 🔹 Title
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text("Customer Report", 40, 50);

      // 🔹 Company Info
      doc.setFontSize(14);
      doc.text(`Company: ${customer.company?.name ?? "-"}`, 40, 90);
      doc.setFontSize(12);
      doc.text(`Email: ${customer.company?.email ?? "-"}`, 40, 110);

      // 🔹 Customer Info
      doc.setFontSize(14);
      doc.text(`Customer: ${customer.customer?.name ?? "-"}`, 40, 150);
      doc.setFontSize(12);
      doc.text(`Phone: ${customer.phone ?? "-"}`, 40, 170);
      doc.text(`Status: ${customer.status ?? "-"}`, 40, 190);

      // 🔹 Details Table
      const details = [
        ["Last Invoice Date", customer.lastInvoice ?? "-"],
        ["Outstanding Balance", customer.balance ?? "-"],
      ];

      // Check if autoTable is available, if not, fall back to basic PDF
      if (typeof doc.autoTable === 'function') {
        doc.autoTable({
          startY: 220,
          head: [["Field", "Value"]],
          body: details,
          theme: "grid",
          styles: { fontSize: 12, cellPadding: 6 },
          headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" },
        });
      } else {
        // Fallback: add text manually
        let yPosition = 220;
        doc.setFontSize(12);
        details.forEach(([field, value]) => {
          doc.text(`${field}: ${value}`, 40, yPosition);
          yPosition += 20;
        });
      }

      // Save with safe filename
      const safeFilename = (customer.customer?.name || "customer").replace(/[^a-zA-Z0-9]/g, '_');
      doc.save(`${safeFilename}_report.pdf`);

    } catch (err) {
      console.error("Customer PDF download failed:", err);
      alert(`Could not generate PDF: ${err.message || 'Unknown error'}`);
    }
  };

  // const mapCustomersForExport = (arr) =>
  //   arr.map((c) => ({
  //     "Company Name": c.company?.name ?? "-",
  //     "Company Email": c.company?.email ?? "-",
  //     "Customer Name": c.customer?.name ?? "-",
  //     "Phone Number": c.phone ?? "-",
  //     "Status": c.status ?? "-",
  //     "Last Invoice Date": c.lastInvoice ?? "-",
  //     "Outstanding Balance": c.balance ?? "-",
  //   }));

  // const handleExportExcel = async () => {
  //   try {
  //     const XLSX = await loadXLSX();
  //     const ws = XLSX.utils.json_to_sheet(mapCustomersForExport(filteredCustomers));
  //     const wb = XLSX.utils.book_new();
  //     XLSX.utils.book_append_sheet(wb, ws, "Customers");
  //     XLSX.writeFile(wb, "customers.xlsx");
  //   } catch (err) {
  //     console.error("Excel export failed:", err);
  //     alert("Table is Empty");
  //   }
  // };

  // const handleExportCompanyWise = async () => {
  //   try {
  //     const XLSX = await loadXLSX();
  //     const byCompany: Record<string, any[]> = {};
  //     filteredCustomers.forEach((c) => {
  //       const name = (c.company?.name || "Unknown Company").toString();
  //       byCompany[name] = byCompany[name] || [];
  //       byCompany[name].push({
  //         "Customer Name": c.customer?.name ?? "-",
  //         "Phone Number": c.phone ?? "-",
  //         "Status": c.status ?? "-",
  //         "Last Invoice Date": c.lastInvoice ?? "-",
  //         "Outstanding Balance": c.balance ?? "-",
  //       });
  //     });

  //     const wb = XLSX.utils.book_new();
  //     Object.keys(byCompany).forEach((companyName) => {
  //       const ws = XLSX.utils.json_to_sheet(byCompany[companyName]);
  //       const safeName = companyName.substring(0, 30);
  //       XLSX.utils.book_append_sheet(wb, ws, safeName || "Company");
  //     });

  //     XLSX.writeFile(wb, "customers_by_company.xlsx");
  //   } catch (err) {
  //     console.error("Company-wise export failed:", err);
  //     alert("Table is Empty.");
  //   }
  // };

  // const handleExportPDF = async () => {
  //   try {
  //     const jsPDF = await loadJsPDF();

  //     const doc = new jsPDF({
  //       orientation: "landscape",
  //       unit: "pt",
  //       format: "a4",
  //     });

  //     const headers = [
  //       "Company Name",
  //       "Customer Name",
  //       "Phone Number",
  //       "Status",
  //       "Last Invoice Date",
  //       "Outstanding Balance",
  //     ];

  //     const body = filteredCustomers.map((c) => [
  //       c.company?.name ?? "-",
  //       c.customer?.name ?? "-",
  //       c.phone ?? "-",
  //       c.status ?? "-",
  //       c.lastInvoice ?? "-",
  //       c.balance ?? "-",
  //     ]);

  //     // Check if autoTable is available
  //     if (typeof doc.autoTable === 'function') {
  //       doc.autoTable({
  //         head: [headers],
  //         body,
  //         startY: 40,
  //         styles: { fontSize: 8 },
  //         headStyles: { fillColor: [230, 230, 230] },
  //       });
  //     } else {
  //       // Fallback: basic table layout
  //       let yPos = 40;
  //       doc.setFontSize(8);

  //       // Headers
  //       let xPos = 40;
  //       headers.forEach(header => {
  //         doc.text(header, xPos, yPos);
  //         xPos += 100;
  //       });

  //       yPos += 20;

  //       // Body rows
  //       body.forEach(row => {
  //         xPos = 40;
  //         row.forEach(cell => {
  //           doc.text(String(cell), xPos, yPos);
  //           xPos += 100;
  //         });
  //         yPos += 15;
  //       });
  //     }

  //     doc.save("customers.pdf");
  //   } catch (err) {
  //     console.error("PDF export failed:", err);
  //     alert(`PDF export failed: ${err.message || 'Unknown error'}`);
  //   }
  // };

  const getValueFromRow = (row, candidates = []) => {
    for (const key of Object.keys(row)) {
      const lk = key.toLowerCase().trim();
      for (const cand of candidates) {
        if (lk.includes(cand)) {
          return row[key];
        }
      }
    }
    return null;
  };

  const handleImportFile = async (file: File | null) => {
    if (!file) return;
    try {
      const XLSX = await loadXLSX();
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet, { defval: null });

      if (!Array.isArray(json) || json.length === 0) {
        alert("Imported file contains no rows.");
        return;
      }

      const mappedRows = json.map((row) => {
        const companyVal = getValueFromRow(row, ["company name", "company", "companyname"]) ?? getValueFromRow(row, ["company email"]) ?? null;
        const customerVal = getValueFromRow(row, ["customer name", "customer", "name", "client name"]);
        const phoneVal = getValueFromRow(row, ["phone", "phone number", "mobile", "contact"]);
        const statusVal = getValueFromRow(row, ["status", "state"]);
        const lastInvVal = getValueFromRow(row, ["last invoice date", "last invoice", "invoice date", "date"]);
        const balanceVal = getValueFromRow(row, ["outstanding balance", "balance", "amount", "due"]);

        return {
          company: {
            name: companyVal ?? "-",
            email: getValueFromRow(row, ["company email", "email"]) ?? "-",
          },
          customer: {
            name: customerVal ?? "-",
          },
          phone: phoneVal ?? "-",
          status: statusVal ?? "-",
          lastInvoice: lastInvVal ?? "-",
          balance: balanceVal ?? "-",
        };
      });

      setCustomers((prev) => [...mappedRows, ...prev]);

      alert(`Imported ${mappedRows.length} rows. Missing columns are filled with "-"`);
    } catch (err) {
      console.error("Import failed:", err);
      alert("Import failed..");
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // const triggerFileSelect = () => {
  //   if (fileInputRef.current) fileInputRef.current.click();
  // };

  // ------------------ Apply filters (frontend)
  const filteredCustomers = customers.filter((c) => {
    if (statusFilter && statusFilter !== "__all") {
      if (!c.status || c.status !== statusFilter) return false;
    }

    if (dateFilter && dateFilter !== "__any") {
      if (!c.lastInvoice) return false;
      const today = new Date();
      const invoiceDate = new Date(c.lastInvoice);
      if (isNaN(invoiceDate.getTime())) return false;
      const daysDiff =
        (today.getTime() - invoiceDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysDiff > parseInt(dateFilter, 10)) return false;
    }

    if (balanceFilter && balanceFilter !== "__any") {
      const balance = parseFloat(c.balance || 0);
      if (balanceFilter === "low" && balance >= 10000) return false;
      if (balanceFilter === "medium" && (balance < 10000 || balance > 50000)) return false;
      if (balanceFilter === "high" && balance <= 50000) return false;
    }

    return true;
  });

  if (showAddCustomerForm) {
    return (
      <Card className="max-w-full p-4 sm:p-6 bg-white mx-2 sm:mx-4">
        <p className="font-semibold text-2xl ">Add New Customer</p>
        <CardContent className="mt-2 ">
          <MultiStepForm onCancel={() => setShowAddCustomerForm(false)} />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="bg-background min-h-screen p-2 sm:p-4 lg:p-8">
      <div className="max-w-8xl mx-auto space-y-4 sm:space-y-6">
        <Card className="bg-white">
          {/* Header */}
          <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">Customers List</h2>
                <p className="text-sm text-gray-500 mt-1">Total {filteredCustomers.length} customers</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-blue-600 hover:text-blue-700"
                  onClick={() => setShowAddCustomerForm(true)}
                >
                  Add Customer
                </Button>

                {/* Filter Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Filter
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 p-4 space-y-3 bg-white text-black">
                    {/* Status */}
                    <div>
                      <p className="text-sm font-medium mb-1">Status</p>
                      <Select onValueChange={setStatusFilter} defaultValue="__all">
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__all">All</SelectItem>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Last Invoice Date */}
                    <div>
                      <p className="text-sm font-medium mb-1">Last Invoice Date</p>
                      <Select value={dateFilter} onValueChange={setDateFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select range">
                            {dateFilter === "custom" && customDate
                              ? customDate.toDateString()
                              : undefined}
                          </SelectValue>
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="__any">Any</SelectItem>
                          <SelectItem value="7">Last 7 days</SelectItem>
                          <SelectItem value="30">Last 30 days</SelectItem>
                          <SelectItem value="365">Last 1 year</SelectItem>

                          {/* Inline custom date picker */}
                          <div
                            className="p-2 border-t cursor-pointer"
                            onClick={() => setDateFilter("custom")}
                          >
                            <p className="text-sm mb-2">Custom Date</p>
                            {dateFilter === "custom" && (
                              <SingleDatePicker
                                selectedDate={customDate ?? undefined}
                                onDateChange={(date) => {
                                  setCustomDate(date)
                                  setDateFilter("custom")
                                }}
                              />
                            )}
                          </div>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Outstanding Balance */}
                    <div>
                      <p className="text-sm font-medium mb-1">Outstanding Balance</p>

                      <Select value={balanceFilter} onValueChange={setBalanceFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select balance">
                            {balanceFilter === "custom" && customBalance
                              ? `₹${customBalance}`
                              : undefined}
                          </SelectValue>
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="__any">Any</SelectItem>
                          <SelectItem value="low">Less than 10k</SelectItem>
                          <SelectItem value="medium">10k - 50k</SelectItem>
                          <SelectItem value="high">More than 50k</SelectItem>

                          {/* Custom input field */}
                          <div
                            className="p-2 border-t space-y-2 cursor-pointer"
                            onClick={() => setBalanceFilter("custom")}
                          >
                            <p className="text-sm">Custom Amount</p>
                            {balanceFilter === "custom" && (
                              <Input
                                type="number"
                                placeholder="Enter balance"
                                value={customBalance}
                                onChange={(e) => setCustomBalance(e.target.value)}
                              />
                            )}
                          </div>
                        </SelectContent>
                      </Select>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* hidden file input for import */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    handleImportFile(f);
                  }}
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="w-full overflow-x-auto rounded-md border">
            <table className="min-w-[900px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-3 py-3 text-left text-sm font-medium text-gray-500 sm:px-6">Company Name</th>
                  <th className="px-3 py-3 text-left text-sm font-medium text-gray-500 sm:px-6">Customer Name</th>
                  <th className="px-3 py-3 text-left text-sm font-medium text-gray-500 sm:px-6">Phone Number</th>
                  <th className="px-3 py-3 text-left text-sm font-medium text-gray-500 sm:px-6">Status</th>
                  <th className="px-3 py-3 text-left text-sm font-medium text-gray-500 sm:px-6">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((c, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-4 sm:px-6">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={c.company?.logo} />
                          <AvatarFallback className="text-xs">
                            {c.company?.name?.[0] || "C"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900">{c.company?.name}</p>
                          <p className="text-sm text-gray-500">
                            {c.company?.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4 sm:px-6">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={c.customer?.avatar} />
                          <AvatarFallback className="text-xs">
                            {c.customer?.name?.[0] || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-gray-900">{c.customer?.name || "Unknown"}</p>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-900 sm:px-6">{c.phone}</td>
                    <td className="px-3 py-4 sm:px-6">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${c.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                          }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-3 py-4 sm:px-6">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-gray-100"
                          onClick={() => handleDownloadCustomerPDF(c)}
                        >
                          <img src='/edit.svg' className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredCustomers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-3 py-8 text-center text-gray-500 sm:px-6">
                      No customers found for selected filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredCustomers.length > 0 && (
            <div className="border-t border-gray-200 px-4 py-4 sm:px-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
                <div className="text-center text-sm text-gray-700 sm:text-left">
                  Showing {((page - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(page * ITEMS_PER_PAGE, filteredCustomers.length)} of {filteredCustomers.length} results
                  {totalPages > 1 && ` (Page ${page} of ${totalPages})`}
                </div>

                <div className="flex items-center justify-center gap-2">
                  <Button
                    className="hover:bg-white bg-white text-slate-500 hover:text-[#654BCD] cursor-pointer"
                    size="sm"
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                  >
                    <MoveLeft className="h-4 w-4 mr-1" /> Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPage(pageNum)}
                        className={`w-8 h-8 p-0 ${page !== pageNum ? "hover:text-black" : ""}`}
                      >
                        {pageNum}
                      </Button>
                    ))}
                  </div>
                  <Button
                    className="hover:bg-white bg-white text-slate-500 hover:text-[#654BCD] cursor-pointer"
                    size="sm"
                    onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={page === totalPages}
                  >
                    Next <MoveRight className="h-4 w-4 ml-1" />
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