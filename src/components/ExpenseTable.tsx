// client/src/components/ExpenseTable.tsx

import { useState, useEffect, useMemo } from "react";
import type { RefObject } from "react";
import { Search, Calendar, Download, Upload, Plus, Edit, MoreVertical, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/Input";
import { NavbarButton } from "./ui/resizable-navbar";

// NEW: import ExpenseForm for fallback edit modal
import ExpenseForm from "./expense-form/ExpenseForm";

interface Expense {
  id?: string;
  _id?: string;
  expenseId?: string;
  title?: string;
  vendorName?: string;
  vendorAvatar?: string;
  paymentMethod?: string;
  amount?: number;
  status?: "Paid" | "Unpaid" | "Overdue";
  date?: string; // ISO or display string
  // allow additional fields returned by API
  [k: string]: any;
}

interface ExpenseTableFilters {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: string;
  dateRange?: { from?: Date; to?: Date };
}

const PaymentStatusBadge = ({ status }: { status: Expense["status"] }) => {
  const variants: Record<string, string> = {
    Paid: "bg-green-100 text-green-800 border-green-200",
    Overdue: "bg-red-100 text-red-800 border-red-200",
    Unpaid: "bg-orange-100 text-orange-800 border-orange-200",
  };
  return (
    <Badge variant="outline" className={variants[status || ""] || ""}>
      {status || "—"}
    </Badge>
  );
};

const formatCurrency = (amount: number | undefined) => {
  const num = typeof amount === "number" ? amount : 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

interface ExpenseTableProps {
  expenses?: Expense[]; // made optional for safety
  searchTerm?: string;
  onDeleteExpense: (id: string) => void;
  setIsExpenseFormOpen?: (val: boolean) => void;
  // Accept both nullable and non-nullable RefObject shapes so parent refs fit both patterns
  fileInputRef?: RefObject<HTMLInputElement> | RefObject<HTMLInputElement | null>;
  onExport?: () => void;

  // NEW optional callback: parent can use this to persist an updated expense
  onUpdateExpense?: (updated: Expense) => void;

  // NEW optional callback: parent should pass this so Edit opens the same UI as "Add New Expense"
  onEditExpense?: (expense: Expense) => void;
}

export function ExpenseTable({
  expenses = [],
  searchTerm = "",
  onDeleteExpense,
  setIsExpenseFormOpen,
  fileInputRef,
  onExport,
  onUpdateExpense,
  onEditExpense,
}: ExpenseTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filters, setFilters] = useState<ExpenseTableFilters>({});
  // keep local search input synced with filter (controlled)
  useEffect(() => {
    setFilters((prev) => ({ ...prev, search: searchTerm || prev.search }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  // --- New state for editing modal & optimistic updates (fallback only) ---
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isEditingOpen, setIsEditingOpen] = useState(false);

  // Map of optimistic updates keyed by uniqueKey -> Expense (fallback use)
  const [updatedMap, setUpdatedMap] = useState<Record<string, Expense>>({});

  // Date popover state
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState<string | "">("");
  const [dateTo, setDateTo] = useState<string | "">("");

  // View details modal state
  const [viewExpense, setViewExpense] = useState<Expense | null>(null);

  // helper to derive unique key for an expense-like object
  const getUniqueKey = (e: Expense | null | undefined) =>
    e ? (e.id ?? e._id ?? e.expenseId ?? String(e.date ?? "") + String(e.amount ?? "")) : "";

  // Listen for external global updates so other components can update this table
  useEffect(() => {
    const handler = (ev: Event) => {
      try {
        const custom = ev as CustomEvent;
        const payload = custom?.detail;
        if (!payload) return;
        const key = getUniqueKey(payload);
        if (!key) return;
        setUpdatedMap((prev) => ({ ...prev, [key]: { ...payload } }));
      } catch (err) {
        // ignore
      }
    };
    window.addEventListener("expense:updated", handler as EventListener);
    return () => window.removeEventListener("expense:updated", handler as EventListener);
  }, []);

  // Comparator that handles numbers, strings and dates (if column === 'date')
  const compareValues = (aVal: any, bVal: any, column?: string) => {
    if (column === "date") {
      const aTime = aVal ? new Date(aVal).getTime() : 0;
      const bTime = bVal ? new Date(bVal).getTime() : 0;
      if (aTime < bTime) return -1;
      if (aTime > bTime) return 1;
      return 0;
    }

    // If both are numbers
    if (typeof aVal === "number" && typeof bVal === "number") {
      return aVal - bVal;
    }

    // string compare (case-insensitive)
    const aStr = aVal !== undefined && aVal !== null ? String(aVal).toLowerCase() : "";
    const bStr = bVal !== undefined && bVal !== null ? String(bVal).toLowerCase() : "";
    if (aStr < bStr) return -1;
    if (aStr > bStr) return 1;
    return 0;
  };

  // Helper: parse a date-like string into Date or null
  const parseDateSafe = (d?: string | null): Date | null => {
    if (!d) return null;
    const dt = new Date(d);
    if (!isNaN(dt.getTime())) return dt;
    // attempt to parse "dd MMMM yyyy" (e.g. "25 August 2025")
    try {
      const parts = String(d).trim().split(" ");
      if (parts.length >= 3) {
        const day = Number(parts[0]);
        const monthName = parts[1];
        const year = Number(parts[2]);
        const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth();
        if (!isNaN(day) && !isNaN(monthIndex) && !isNaN(year)) {
          const dd = new Date(year, monthIndex, day);
          if (!isNaN(dd.getTime())) return dd;
        }
      }
    } catch {}
    return null;
  };

  // day-level equality (ignore time)
  // const sameDay = (a?: Date | null, b?: Date | null) => {
  //   if (!a || !b) return false;
  //   return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  // };

  // within day-range inclusive
  const inRange = (d: Date | null, from?: Date | null, to?: Date | null) => {
    if (!d) return false;
    const start = from ? new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime() : -Infinity;
    const end = to ? new Date(to.getFullYear(), to.getMonth(), to.getDate()).getTime() + 24 * 60 * 60 * 1000 - 1 : Infinity;
    const t = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    return t >= start && t <= end;
  };

  // Memoized filtered + sorted expenses
  const sortedExpenses = useMemo(() => {
    let filtered = Array.isArray(expenses) ? [...expenses] : [];

    // apply search from filter or prop
    const search = (filters.search || "").trim().toLowerCase();
    if (search) {
      filtered = filtered.filter((expense) =>
        (expense.title || "").toLowerCase().includes(search) ||
        (expense.vendorName || "").toLowerCase().includes(search) ||
        (expense.expenseId || "").toLowerCase().includes(search) ||
        (expense.paymentMethod || "").toLowerCase().includes(search)
      );
    }

    // apply status filter if any
    if (filters.status) {
      filtered = filtered.filter((e) => e.status === filters.status);
    }

    // apply dateRange filter if present (use day-level comparison)
    if (filters.dateRange?.from || filters.dateRange?.to) {
      const from = filters.dateRange?.from ?? undefined;
      const to = filters.dateRange?.to ?? undefined;
      filtered = filtered.filter((e) => {
        const d = parseDateSafe(e.date);
        return inRange(d, from ?? null, to ?? null);
      });
    }

    // apply sorting
    if (filters.sortBy) {
      const sortBy = filters.sortBy;
      const sortOrder = filters.sortOrder === "desc" ? -1 : 1;
      filtered.sort((a, b) => {
        const aVal = (a as any)[sortBy];
        const bVal = (b as any)[sortBy];
        const cmp = compareValues(aVal, bVal, sortBy);
        return cmp * sortOrder;
      });
    }

    return filtered;
  }, [expenses, filters]);

  // pagination calculations (derived)
  const totalPages = Math.max(1, Math.ceil(sortedExpenses.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentExpenses = sortedExpenses.slice(startIndex, endIndex);

  // clamp currentPage if itemsPerPage or sortedExpenses length change
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const handleSearch = (search: string) => {
    setFilters((prev) => ({ ...prev, search }));
    setCurrentPage(1);
  };

  const handleSort = (column: string) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: column,
      sortOrder: prev.sortBy === column && prev.sortOrder === "asc" ? "desc" : "asc",
    }));
  };

  // CSV escaping: wrap fields in quotes and escape internal quotes
  const escapeCsvCell = (value: any) => {
    if (value === null || value === undefined) return '""';
    const str = String(value);
    const escaped = str.replace(/"/g, '""');
    return `"${escaped}"`;
  };

  const downloadCSV = (data: Expense[], filename: string) => {
    const headers = ['Date', 'Expense ID', 'Expense Title', 'Vendor Name', 'Payment Method', 'Amount', 'Status'];
    const csvRows = [
      headers.map(escapeCsvCell).join(','),
      ...data.map(expense =>
        [
          escapeCsvCell(expense.date),
          escapeCsvCell(expense.expenseId ?? expense.id ?? expense._id),
          escapeCsvCell(expense.title),
          escapeCsvCell(expense.vendorName),
          escapeCsvCell(expense.paymentMethod),
          escapeCsvCell(expense.amount),
          escapeCsvCell(expense.status),
        ].join(',')
      )
    ];
    const csvContent = csvRows.join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderPaginationItems = () => {
    const items: React.ReactNode[] = [];

    // Previous button
    items.push(
      <PaginationItem key="prev">
        <PaginationPrevious
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
        />
      </PaginationItem>
    );

    // Page numbers (compact around current)
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    if (startPage > 1) {
      items.push(
        <PaginationItem key={1}>
          <PaginationLink onClick={() => setCurrentPage(1)} className="cursor-pointer">
            1
          </PaginationLink>
        </PaginationItem>
      );
      if (startPage > 2) {
        items.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => setCurrentPage(i)}
            isActive={currentPage === i}
            className="cursor-pointer"
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink onClick={() => setCurrentPage(totalPages)} className="cursor-pointer">
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Next button
    items.push(
      <PaginationItem key="next">
        <PaginationNext
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
        />
      </PaginationItem>
    );

    return items;
  };

  // --- Edit flow handlers ---
  // Prefer parent handler so Edit opens the same UI as 'Add New Expense'
  const handleEditClick = (expense: Expense) => {
    if (onEditExpense) {
      try {
        onEditExpense(expense);
        return;
      } catch (err) {
        console.error("onEditExpense callback failed:", err);
        // fallback to internal modal below
      }
    }

    // fallback: open internal modal if parent doesn't provide onEditExpense or it failed
    setEditingExpense(expense);
    setIsEditingOpen(true);
  };

  const closeEditModal = () => {
    setIsEditingOpen(false);
    setEditingExpense(null);
  };

  const handleSavedFromForm = (updated: Expense) => {
    // normalized key
    const key = getUniqueKey(updated);
    if (key) {
      setUpdatedMap((prev) => ({ ...prev, [key]: { ...updated } }));
    }

    // notify parent if available (preferred)
    if (onUpdateExpense) {
      try {
        onUpdateExpense(updated);
      } catch (err) {
        console.error("onUpdateExpense callback failed:", err);
      }
    } else {
      // fallback: global event
      window.dispatchEvent(new CustomEvent("expense:updated", { detail: updated }));
    }

    // close modal
    closeEditModal();
  };

  // helper to merge original expense with optimistic update if any
  const appliedExpense = (expense: Expense) => {
    const key = getUniqueKey(expense);
    if (key && updatedMap[key]) {
      return { ...expense, ...updatedMap[key] };
    }
    return expense;
  };

  // --- Date popover handlers ---
  const applyDateFilter = () => {
    const fromDate = dateFrom ? parseDateSafe(dateFrom) : undefined;
    const toDate = dateTo ? parseDateSafe(dateTo) : undefined;
    setFilters((prev) => ({ ...prev, dateRange: { from: fromDate ?? undefined, to: toDate ?? undefined } }));
    setCurrentPage(1);
    setIsDateOpen(false);
  };

  const clearDateFilter = () => {
    setDateFrom("");
    setDateTo("");
    setFilters((prev) => {
      const { dateRange, ...rest } = prev;
      return rest;
    });
    setCurrentPage(1);
    setIsDateOpen(false);
  };

  // --- View details handler ---
  const handleViewDetails = (expense: Expense) => {
    setViewExpense(expense);
  };
  const closeViewDetails = () => setViewExpense(null);

  return (
    <Card className="w-full shadow-sm bg-white">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-lg font-semibold text-gray-900">Total Expenses</h2>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative flex-grow sm:flex-grow-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search..."
                className="pl-10 w-full sm:w-64"
                onChange={(e) => handleSearch(e.target.value)}
                value={filters.search || ''}
              />
            </div>

            <div className="flex gap-2 flex-wrap justify-end">
              {/* DATE button: toggles small popover */}
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-shrink-0 bg-transparent"
                  onClick={() => setIsDateOpen((s) => !s)}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Date
                </Button>

                {isDateOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 shadow-lg z-50 p-3 rounded">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs text-gray-600">From</label>
                      <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="w-full rounded border px-2 py-1"
                      />
                      <label className="text-xs text-gray-600">To</label>
                      <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="w-full rounded border px-2 py-1"
                      />

                      <div className="flex justify-between gap-2 pt-2">
                        <button
                          className="px-3 py-1 rounded border text-sm"
                          onClick={clearDateFilter}
                        >
                          Clear
                        </button>
                        <div className="flex gap-2">
                          <button
                            className="px-3 py-1 rounded border text-sm"
                            onClick={() => {
                              // quick apply single-day if neither set: use today
                              if (!dateFrom && !dateTo) {
                                const today = new Date();
                                const iso = today.toISOString().slice(0, 10);
                                setDateFrom(iso);
                                setDateTo(iso);
                                // apply after state set (next tick)
                                setTimeout(applyDateFilter, 0);
                                return;
                              }
                              applyDateFilter();
                            }}
                          >
                            Apply
                          </button>
                          <button
                            className="px-3 py-1 rounded bg-gray-100 text-sm"
                            onClick={() => setIsDateOpen(false)}
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button variant="outline" size="sm" className="flex-shrink-0 bg-transparent">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={4}
                  className="z-50 bg-white border border-gray-200 shadow-lg text-black"
                >
                  <DropdownMenuItem
                    className="hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      if (onExport) return onExport();
                      return downloadCSV(sortedExpenses, `expenses_all_${new Date().toISOString().split('T')[0]}.csv`);
                    }}
                  >
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      if (onExport) return onExport();
                      return downloadCSV(currentExpenses, `expenses_current_page_${new Date().toISOString().split('T')[0]}.csv`);
                    }}
                  >
                    Export Current Page
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-gray-100 cursor-pointer">Export as PDF</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* IMPORT BUTTON:
                  If parent provided fileInputRef, clicking the button will trigger that hidden input.
                  Otherwise, fall back to having an invisible input overlay (original behavior).
              */}
              {fileInputRef ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-shrink-0 bg-transparent"
                  onClick={() => {
                    // safe nullable access: fileInputRef may be either RefObject<HTMLInputElement> or RefObject<HTMLInputElement | null>
                    try {
                      (fileInputRef as RefObject<HTMLInputElement | null>)?.current?.click();
                    } catch {
                      // fallback safe attempt
                      if ((fileInputRef as RefObject<HTMLInputElement>)?.current) {
                        (fileInputRef as RefObject<HTMLInputElement>).current!.click();
                      }
                    }
                  }}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </Button>
              ) : (
                <div className="relative">
                  {/* local fallback input (only if parent didn't provide fileInputRef) */}
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={(e) => {
                      // minimal local fallback: read file & log length (parsing handled by parent normally)
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        try {
                          const txt = ev.target?.result;
                          if (typeof txt === "string") {
                            console.log('Imported CSV raw text length:', txt.length);
                          }
                        } catch (error) {
                          console.error('Import failed:', error);
                        }
                      };
                      reader.readAsText(file);
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Button variant="outline" size="sm" className="flex-shrink-0 bg-transparent" >
                    <Upload className="h-4 w-4 mr-2" />
                    Import
                  </Button>
                </div>
              )}

              {setIsExpenseFormOpen && (
                <NavbarButton
                  className="bg-gradient-to-b from-[#B5A3FF] via-[#785FDA] to-[#9F91D8] text-white px-4 py-2 rounded-lg flex"
                  onClick={() => setIsExpenseFormOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Expense
                </NavbarButton>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-12"></TableHead>
                <TableHead className="cursor-pointer hover:bg-gray-100" onClick={() => handleSort("expenseId")}>
                  <div className="flex items-center gap-1">
                    Expense ID
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-gray-100" onClick={() => handleSort("title")}>
                  <div className="flex items-center gap-1">
                    Expense Title
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-gray-100" onClick={() => handleSort("vendorName")}>
                  <div className="flex items-center gap-1">
                    Vendor Name
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-gray-100" onClick={() => handleSort("paymentMethod")}>
                  <div className="flex items-center gap-1">
                    Payment Method
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-gray-100" onClick={() => handleSort("date")}>
                  <div className="flex items-center gap-1">
                    Date
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-gray-100" onClick={() => handleSort("amount")}>
                  <div className="flex items-center gap-1">
                    Amount
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-gray-100" onClick={() => handleSort("status")}>
                  <div className="flex items-center gap-1">
                    Status
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentExpenses.map((expense) => {
                const displayed = appliedExpense(expense);
                const key = getUniqueKey(expense) || JSON.stringify(expense);
                return (
                  <TableRow key={key} className="hover:bg-gray-50">
                    <TableCell>
                      <Avatar className="h-8 w-8">
                        {displayed.vendorAvatar ? (
                          <AvatarImage src={displayed.vendorAvatar} alt={displayed.vendorName || "Vendor"} />
                        ) : (
                          <AvatarFallback>{(displayed.vendorName && displayed.vendorName.charAt(0)) || "?"}</AvatarFallback>
                        )}
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium text-gray-900">{displayed.expenseId ?? displayed.id ?? displayed._id}</TableCell>
                    <TableCell className="text-gray-700">{displayed.title}</TableCell>
                    <TableCell className="text-gray-700">{displayed.vendorName}</TableCell>
                    <TableCell className="text-gray-700">{displayed.paymentMethod}</TableCell>
                    <TableCell className="text-gray-700">{displayed.date}</TableCell>
                    <TableCell className="text-gray-700">{formatCurrency(displayed.amount)}</TableCell>
                    <TableCell>
                      <PaymentStatusBadge status={displayed.status || "Unpaid"} />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEditClick(displayed)}
                          title="Edit expense"
                          aria-label={`Edit expense ${displayed.expenseId ?? displayed.id ?? displayed._id ?? displayed.title}`}
                        >
                          <Edit className="h-4 w-4 text-gray-600" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4 text-gray-600" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            sideOffset={4}
                            className="z-50 bg-white border border-gray-200 shadow-lg text-black"
                          >
                            <DropdownMenuItem className="hover:bg-gray-100 cursor-pointer" onClick={() => handleViewDetails(displayed)}>View Details</DropdownMenuItem>
                            <DropdownMenuItem
                              className="hover:bg-gray-100 cursor-pointer"
                              onClick={() => onDeleteExpense(displayed.id ?? displayed._id ?? String(displayed.expenseId))}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Items per page:</span>
            <Select value={itemsPerPage.toString()} onValueChange={(value) => { setItemsPerPage(Number(value)); setCurrentPage(1); }}>
              <SelectTrigger className="w-20 h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span>
              {sortedExpenses.length > 0
                ? `${startIndex + 1}-${Math.min(endIndex, sortedExpenses.length)} of ${sortedExpenses.length} items`
                : "0 items"}
            </span>
          </div>

          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>{renderPaginationItems()}</PaginationContent>
            </Pagination>
          )}
        </div>
      </CardContent>

      {/* --- fallback internal modal if parent didn't provide onEditExpense --- */}
      {isEditingOpen && editingExpense && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-auto bg-black/40">
          <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg">
            <ExpenseForm
              onCancel={closeEditModal}
              initialData={editingExpense}
              onSaved={(u) => handleSavedFromForm(u)}
            />
          </div>
        </div>
      )}

      {/* View Details modal */}
      {viewExpense && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-auto bg-black/40">
          <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Expense Details</h3>
              <button onClick={closeViewDetails} className="p-1 rounded hover:bg-gray-100">
                <X />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-xs text-gray-500">Expense ID</div>
                <div className="font-medium">{viewExpense.expenseId ?? viewExpense.id ?? viewExpense._id}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Date</div>
                <div className="font-medium">{viewExpense.date}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Vendor</div>
                <div className="font-medium">{viewExpense.vendorName}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Payment Method</div>
                <div className="font-medium">{viewExpense.paymentMethod}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Amount</div>
                <div className="font-medium">{formatCurrency(viewExpense.amount)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Status</div>
                <div className="font-medium"><PaymentStatusBadge status={viewExpense.status || "Unpaid"} /></div>
              </div>
            </div>

            {/* Items (if present) */}
            {Array.isArray(viewExpense.items) && viewExpense.items.length > 0 && (
              <div className="mb-4">
                <div className="text-sm font-semibold mb-2">Items</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-xs text-gray-500">
                        <th className="pb-2">Name</th>
                        <th className="pb-2">Qty</th>
                        <th className="pb-2">Price</th>
                        <th className="pb-2">GST</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewExpense.items.map((it: any, i: number) => (
                        <tr key={i} className="border-t">
                          <td className="py-2">{it.name ?? it.description}</td>
                          <td className="py-2">{it.qty ?? it.quantity ?? "-"}</td>
                          <td className="py-2">{it.price ?? it.rate ?? "-"}</td>
                          <td className="py-2">{it.gst ?? it.tax ?? "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button className="px-4 py-2 rounded border" onClick={closeViewDetails}>Close</button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
