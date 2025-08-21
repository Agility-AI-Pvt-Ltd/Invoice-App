// @ts-nocheck
import { useEffect, useRef, useState, useCallback } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import { MoreVertical, MoveLeft, MoveRight, Pencil, Trash2 } from "lucide-react";
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

const ITEMS_PER_PAGE = 10;

export default function CustomerDashboard() {
  const [page, setPage] = useState(1);
  const [customers, setCustomers] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddCustomerForm, setShowAddCustomerForm] = useState(false);

  // 🔹 Filter states
  const [statusFilter, setStatusFilter] = useState("__all");
  const [dateFilter, setDateFilter] = useState("__any");
  const [balanceFilter, setBalanceFilter] = useState("__any");

  // file input ref for import
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
    [] // no internal deps — we'll pass page param explicitly when calling
  );

  // call fetch on page change
  useEffect(() => {
    fetchCustomers(page);
  }, [page, fetchCustomers]);

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
      const jsPDF = (await import("jspdf")).default;
      await import("jspdf-autotable");
      return jsPDF;
    } catch (err) {
      console.error("jspdf or jspdf-autotable missing. Install with `npm i jspdf jspdf-autotable`", err);
      throw err;
    }
  };

  const mapCustomersForExport = (arr) =>
    arr.map((c) => ({
      "Company Name": c.company?.name ?? "-",
      "Company Email": c.company?.email ?? "-",
      "Customer Name": c.customer?.name ?? "-",
      "Phone Number": c.phone ?? "-",
      "Status": c.status ?? "-",
      "Last Invoice Date": c.lastInvoice ?? "-",
      "Outstanding Balance": c.balance ?? "-",
    }));

  const handleExportExcel = async () => {
    try {
      const XLSX = await loadXLSX();
      const ws = XLSX.utils.json_to_sheet(mapCustomersForExport(filteredCustomers));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Customers");
      XLSX.writeFile(wb, "customers.xlsx");
    } catch (err) {
      console.error("Excel export failed:", err);
      alert("Table is Empty");
    }
  };

  const handleExportCompanyWise = async () => {
    try {
      const XLSX = await loadXLSX();
      const byCompany: Record<string, any[]> = {};
      filteredCustomers.forEach((c) => {
        const name = (c.company?.name || "Unknown Company").toString();
        byCompany[name] = byCompany[name] || [];
        byCompany[name].push({
          "Customer Name": c.customer?.name ?? "-",
          "Phone Number": c.phone ?? "-",
          "Status": c.status ?? "-",
          "Last Invoice Date": c.lastInvoice ?? "-",
          "Outstanding Balance": c.balance ?? "-",
        });
      });

      const wb = XLSX.utils.book_new();
      Object.keys(byCompany).forEach((companyName) => {
        const ws = XLSX.utils.json_to_sheet(byCompany[companyName]);
        const safeName = companyName.substring(0, 30);
        XLSX.utils.book_append_sheet(wb, ws, safeName || "Company");
      });

      XLSX.writeFile(wb, "customers_by_company.xlsx");
    } catch (err) {
      console.error("Company-wise export failed:", err);
      alert("Table is Empty.");
    }
  };

  const handleExportPDF = async () => {
    try {
      const jsPDF = await loadJsPDF();
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "pt",
        format: "a4",
      });

      const headers = [
        "Company Name",
        "Customer Name",
        "Phone Number",
        "Status",
        "Last Invoice Date",
        "Outstanding Balance",
      ];

      const body = filteredCustomers.map((c) => [
        c.company?.name ?? "-",
        c.customer?.name ?? "-",
        c.phone ?? "-",
        c.status ?? "-",
        c.lastInvoice ?? "-",
        c.balance ?? "-",
      ]);

      // @ts-ignore - autotable plugin
      (doc as any).autoTable({
        head: [headers],
        body,
        startY: 40,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [230, 230, 230] },
      });

      doc.save("customers.pdf");
    } catch (err) {
      console.error("PDF export failed:", err);
      alert("Table is Empty");
    }
  };

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

  const triggerFileSelect = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

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
    <Card className="max-w-full p-4 sm:p-6 bg-white mx-2 sm:mx-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4 sm:mt-6 ml-2 sm:ml-6 mr-2 sm:mr-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold">Customers List</h2>
          <p className="text-gray-500 text-sm">Total {filteredCustomers.length}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="text-blue-500 hover:text-blue-600 shadow-sm"
            onClick={() => setShowAddCustomerForm(true)}
          >
            Add Customer
          </Button>

          {/* 🔹 Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Filter</Button>
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
                <Select onValueChange={setDateFilter} defaultValue="__any">
                  <SelectTrigger>
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__any">Any</SelectItem>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="365">Last 1 year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Outstanding Balance */}
              <div>
                <p className="text-sm font-medium mb-1">Outstanding Balance</p>
                <Select onValueChange={setBalanceFilter} defaultValue="__any">
                  <SelectTrigger>
                    <SelectValue placeholder="Select balance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__any">Any</SelectItem>
                    <SelectItem value="low">Less than 10k</SelectItem>
                    <SelectItem value="medium">10k - 50k</SelectItem>
                    <SelectItem value="high">More than 50k</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 🔹 Export / Import Dropdown (replaces previous MoreVertical single button) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              {/* kept same visual as before */}
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-48 p-2 bg-white text-black">
              <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleExportCompanyWise(); }}>
                Export as Company wise
              </DropdownMenuItem>

              <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleExportExcel(); }}>
                Export as Excel
              </DropdownMenuItem>

              <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleExportPDF(); }}>
                Export as PDF
              </DropdownMenuItem>

              <DropdownMenuItem onSelect={(e) => { e.preventDefault(); triggerFileSelect(); }}>
                Import (Excel/CSV)
              </DropdownMenuItem>
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

      <CardContent className="overflow-x-auto mt-4">
        <div className="min-w-[750px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company Name</TableHead>
                <TableHead>Customer Name</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Invoice Date</TableHead>
                <TableHead>Outstanding Balance</TableHead>
                <TableHead>Download</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((c, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar>
                        <AvatarImage src={c.company?.logo} />
                        <AvatarFallback>
                          {c.company?.name?.[0] || "C"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{c.company?.name}</p>
                        <p className="text-sm text-gray-500">
                          {c.company?.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar>
                        <AvatarImage src={c.customer?.avatar} />
                        <AvatarFallback>
                          {c.customer?.name?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <p>{c.customer?.name}</p>
                    </div>
                  </TableCell>
                  <TableCell>{c.phone}</TableCell>
                  <TableCell>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        c.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-300 text-red-800"
                      }`}
                    >
                      {c.status}
                    </span>
                  </TableCell>
                  <TableCell>{c.lastInvoice}</TableCell>
                  <TableCell className="font-semibold">{c.balance}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8 p-1"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8 p-1 "
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <Pagination className="mt-6 justify-center sm:justify-end">
          <PaginationContent className="gap-2 px-2 sm:px-4 py-2">
            {/* Previous */}
            <PaginationItem>
              <PaginationLink
                href="#"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                isActive={false}
                className={`px-6 sm:px-14 py-2 ${
                  page === 1 ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <MoveLeft /> Previous
              </PaginationLink>
            </PaginationItem>

            {[page, page + 1, page + 2].map((pageNum) => {
              if (pageNum > totalPages) return null;
              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    href="#"
                    isActive={page === pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`px-4 py-2 ${
                      page === pageNum
                        ? "bg-blue-500 text-white rounded"
                        : ""
                    } hover:bg-blue-600 hover:text-black`}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            {page + 2 < totalPages && (
              <>
                <PaginationItem>
                  <PaginationEllipsis className="px-3 py-2" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    isActive={page === totalPages}
                    onClick={() => setPage(totalPages)}
                    className="px-4 py-2"
                  >
                    {totalPages}
                  </PaginationLink>
                </PaginationItem>
              </>
            )}

            {/* Next */}
            <PaginationItem>
              <PaginationLink
                href="#"
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                className={`px-4 sm:px-6 py-2 ${
                  page === totalPages ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                Next <MoveRight />
              </PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </CardContent>
    </Card>
  );
}
