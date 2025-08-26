// client/src/pages/expenses.tsx
import { useState, useEffect, useRef, useMemo } from "react";
import type { RefObject } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ExpenseMetricCard } from "@/components/ExpenseMetricCard";
import { ExpenseTable } from "@/components/ExpenseTable";
import { useToast } from "@/hooks/use-toast";
import { format, parse } from "date-fns";
import ExpenseForm from "@/components/expense-form/ExpenseForm";
import Cookies from "js-cookie";

const API_BASE = "https://invoice-backend-604217703209.asia-south1.run.app";

interface Expense {
  id: string;
  expenseId: string;
  title: string;
  vendorName: string;
  vendorAvatar: string;
  paymentMethod: string;
  amount: number;
  status: "Paid" | "Unpaid" | "Overdue";
  date: string;
  [k: string]: any;
}

type Filters = {
  dateRange: { from?: Date; to?: Date };
  status: string;
  month: string;
  minAmount: string;
};

// transform API shape -> Expense (keeps resiliency for different server payloads)
const transformExpenseData = (apiExpense: any): Expense => {
  return {
    id: apiExpense._id || apiExpense.id || `expense-${Date.now()}`,
    expenseId:
      apiExpense.invoiceNumber ||
      apiExpense.expenseId ||
      apiExpense.expense_id ||
      `EX-${Date.now()}`,
    title:
      apiExpense.items?.[0]?.description ||
      apiExpense.step3?.items?.[0]?.name ||
      apiExpense.title ||
      "No Description",
    vendorName:
      apiExpense.billFrom?.name ||
      apiExpense.step2?.vendorName ||
      apiExpense.vendorName ||
      "Unknown Vendor",
    vendorAvatar:
      (apiExpense.billFrom?.name ||
        apiExpense.step2?.vendorName ||
        apiExpense.vendorName ||
        "V")[0]?.toUpperCase() || "V",
    paymentMethod:
      apiExpense.step2?.paymentMethod || apiExpense.paymentMethod || "Cash",
    amount:
      apiExpense.total ??
      apiExpense.step4?.total ??
      apiExpense.step2?.amount ??
      apiExpense.amount ??
      0,
    status:
      apiExpense.status === "paid"
        ? "Paid"
        : apiExpense.step1?.status?.toLowerCase?.() === "paid"
          ? "Paid"
          : apiExpense.status === "overdue"
            ? "Overdue"
            : apiExpense.step1?.status === "overdue"
              ? "Overdue"
              : apiExpense.status === "Paid"
                ? "Paid"
                : "Unpaid",
    date: apiExpense.step1?.expenseDate
      ? format(new Date(apiExpense.step1.expenseDate), "dd MMMM yyyy")
      : apiExpense.date
        ? format(new Date(apiExpense.date), "dd MMMM yyyy")
        : format(new Date(), "dd MMMM yyyy"),
    // keep raw payload for any extras that other components might need
    raw: apiExpense,
  };
};

// Helper to parse display date "29 July 2024" -> Date object (safe)
const parseExpenseDate = (dateString: string): Date | null => {
  try {
    return parse(dateString, "dd MMMM yyyy", new Date());
  } catch (error) {
    // fallback try Date constructor
    try {
      const d = new Date(dateString);
      if (!isNaN(d.getTime())) return d;
    } catch {}
    console.warn(`Failed to parse date: ${dateString}`, error);
    return null;
  }
};

/* Auth helpers: try localStorage, cookies, document.cookie (non-HttpOnly) */
const getAuthToken = (): string | null => {
  try {
    const lsCandidates = ["token", "authToken", "access_token"];
    for (const k of lsCandidates) {
      try {
        const v = localStorage.getItem(k);
        if (v && v.trim()) return v.trim();
      } catch (e) {
        /* ignore localStorage read errors */
      }
    }

    const cookieCandidates = [
      "authToken",
      "token",
      "access_token",
      "bearer",
      "Authorization",
      "auth_token",
    ];
    for (const k of cookieCandidates) {
      const v = Cookies.get(k);
      if (v && v.trim()) return v.trim();
    }

    if (typeof document !== "undefined" && document.cookie) {
      const cookieMap: Record<string, string> = {};
      document.cookie.split(";").forEach((part) => {
        const [rawK, ...rest] = part.split("=");
        if (!rawK) return;
        const key = rawK.trim();
        const val = rest.join("=").trim();
        try {
          cookieMap[key] = decodeURIComponent(val);
        } catch {
          cookieMap[key] = val;
        }
      });
      for (const k of cookieCandidates) {
        if (cookieMap[k]) return cookieMap[k];
      }
    }
  } catch (e) {
    console.warn("getAuthToken error:", e);
  }
  return null;
};

const buildFetchOptions = (method: string = "GET", body?: any) => {
  const token = getAuthToken();
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) {
    const normalized = token.toLowerCase().startsWith("bearer ")
      ? token
      : `Bearer ${token}`;
    headers["Authorization"] = normalized;
  }
  return {
    method,
    headers,
    credentials: "include" as RequestCredentials,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  };
};

const safeParseJson = async (res: Response) => {
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      return await res.json();
    } catch (e) {
      console.warn("Failed to parse JSON response:", e);
      return null;
    }
  }
  return null;
};

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Note: setters for searchTerm and filters were unused in the original file,
  // removing the unused setters resolves TS6133 while keeping functionality intact.
  const [searchTerm] = useState<string>("");
  const [filters] = useState<Filters>({
    dateRange: { from: undefined, to: undefined },
    status: "all",
    month: "all",
    minAmount: "",
  });

  const [metrics, setMetrics] = useState<any>(null);

  // show/create/edit form state
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
  // selectedExpense holds the raw payload (or transformed) for editing; null => create flow
  const [selectedExpense, setSelectedExpense] = useState<any | null>(null);

  const { toast } = useToast();

  // hidden file input reference (used by table header Import button)
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const generateExpenseId = () => {
    const year = new Date().getFullYear();
    const count = expenses.length + 1;
    return `EX-${year}/${count.toString().padStart(3, "0")}`;
  };

  // CSV export helper
  const downloadCSV = (data: Expense[] = expenses, filename?: string) => {
    const escape = (val: any) => {
      if (val === null || val === undefined) return '""';
      const s = String(val).replace(/"/g, '""');
      return `"${s}"`;
    };
    const headers = [
      "Date",
      "Expense ID",
      "Expense Title",
      "Vendor Name",
      "Payment Method",
      "Amount",
      "Status",
    ];
    const csvRows = [
      headers.map(escape).join(","),
      ...data.map((expense) =>
        [
          escape(expense.date),
          escape(expense.expenseId),
          escape(expense.title),
          escape(expense.vendorName),
          escape(expense.paymentMethod),
          escape(expense.amount),
          escape(expense.status),
        ].join(","),
      ),
    ];
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      filename || `expenses_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  /* Fetch helpers */
  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError(null);

      const url = `${API_BASE}/api/expenses`;
      const opts = buildFetchOptions("GET");

      const res = await fetch(url, opts);
      if (!res.ok) {
        const body = await safeParseJson(res);
        const message =
          body?.detail ||
          body?.message ||
          `Failed to fetch expenses (status ${res.status})`;
        throw new Error(message);
      }

      const body = (await safeParseJson(res)) ?? null;
      const serverExpenses =
        body?.data?.expenses ?? body?.expenses ?? body ?? [];

      const mapped = (serverExpenses as []).map((e) => transformExpenseData(e));
      setExpenses(mapped);
    } catch (err: any) {
      console.error("Error fetching expenses:", err);
      setError(err?.message || "Failed to fetch expenses");
      toast({
        title: "Error",
        description: err?.message || "Failed to fetch expenses from the server",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      const url = `${API_BASE}/api/expenses/metrics`;
      const opts = buildFetchOptions("GET");

      const res = await fetch(url, opts);
      if (!res.ok) {
        const body = await safeParseJson(res);
        throw new Error(
          body?.detail ||
            body?.message ||
            `Failed to fetch metrics (status ${res.status})`,
        );
      }
      const body = (await safeParseJson(res)) ?? null;
      setMetrics(body);
    } catch (err: any) {
      console.error("Error fetching metrics:", err);
      toast({
        title: "Error",
        description: err?.message || "Failed to fetch metrics",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchExpenses();
    fetchMetrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Simple CSV parse (handles quoted fields; CRLF)
  const parseCSV = (csvText: string): Expense[] => {
    // Normalize line endings and trim
    const normalized = csvText
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .trim();
    if (!normalized) return [];
    // Split lines but handle quoted fields with commas
    const lines: string[] = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < normalized.length; i++) {
      const ch = normalized[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
        cur += ch;
      } else if (ch === "\n" && !inQuotes) {
        lines.push(cur);
        cur = "";
      } else {
        cur += ch;
      }
    }
    if (cur) lines.push(cur);

    const headerLine = lines[0] ?? "";
    const headers = headerLine
      .split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/) // split by commas not inside quotes
      .map((h) => h.trim().replace(/^"|"$/g, ""));

    return lines.slice(1).map((line, index) => {
      const values = line
        .split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/)
        .map((v) => v.trim().replace(/^"|"$/g, ""));

      const get = (nameVariants: string[]) => {
        for (const n of nameVariants) {
          const idx = headers
            .map((h) => h.toLowerCase())
            .indexOf(n.toLowerCase());
          if (idx >= 0 && values[idx] !== undefined) return values[idx];
        }
        return undefined;
      };

      return {
        id: `imported-${Date.now()}-${index}`,
        expenseId:
          get(["Expense ID", "expense id", "expenseId"]) || generateExpenseId(),
        title: get(["Expense Title", "title", "description"]) || "-",
        vendorName: get(["Vendor Name", "vendor", "vendorName"]) || "-",
        vendorAvatar: (get(["Vendor Name", "vendor", "vendorName"])?.[0] ||
          "V") as string,
        paymentMethod:
          get(["Payment Method", "payment", "paymentMethod"]) || "-",
        amount: parseInt(get(["Amount", "amount"]) || "0") || 0,
        status: (get(["Status", "status"]) || "Unpaid") as
          | "Paid"
          | "Unpaid"
          | "Overdue",
        date: get(["Date", "date"]) || format(new Date(), "dd MMMM yyyy"),
      };
    });
  };

  // Import handler with duplicate detection (by expenseId)
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvText = e.target?.result as string;
        const importedExpenses = parseCSV(csvText);

        // Remove duplicates: items with expenseId already present
        const existingIds = new Set(expenses.map((ex) => ex.expenseId));
        const uniques = importedExpenses.filter(
          (im) => !existingIds.has(im.expenseId),
        );

        if (uniques.length === 0) {
          toast?.({
            title: "No new items",
            description:
              "Imported file contained no new expenses (duplicates skipped).",
          });
          return;
        }

        setExpenses((prev) => [...prev, ...uniques]);

        toast?.({
          title: "Import Successful",
          description: `${uniques.length} new expenses imported from ${file.name}`,
        });
      } catch (err) {
        console.error("CSV import error:", err);
        toast?.({
          title: "Import Failed",
          description: "Could not parse CSV. Check file format.",
        });
      } finally {
        // clear input value so same file can be re-selected if needed
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };

    reader.readAsText(file);
  };

  // Delete expense => call backend and remove locally
  const handleDeleteExpense = async (expenseId: string) => {
    try {
      const url = `${API_BASE}/api/expenses/${expenseId}`;
      const opts = buildFetchOptions("DELETE");

      const res = await fetch(url, opts);
      if (!res.ok) {
        const body = await safeParseJson(res);
        throw new Error(
          body?.detail ||
            body?.message ||
            `Failed to delete expense (status ${res.status})`,
        );
      }

      toast({
        title: "Expense Deleted",
        description: "Expense has been deleted successfully",
      });

      setExpenses((prev) => prev.filter((expense) => expense.id !== expenseId));
    } catch (err: any) {
      console.error("Delete expense error:", err);
      toast({
        title: "Delete Failed",
        description: err?.message || "Failed to delete expense",
        variant: "destructive",
      });
    }
  };

  // Handler invoked by ExpenseTable when it wants the parent to persist/update a changed expense.
  // The table will call this with the updated expense object returned by backend (or the form).
  const handleUpdateExpense = (updated: any) => {
    try {
      const mapped = transformExpenseData(updated);
      setExpenses((prev) =>
        prev.map((e) =>
          e.expenseId === mapped.expenseId ||
          e.id === mapped.id ||
          e.id === mapped._id
            ? mapped
            : e,
        ),
      );
      toast?.({
        title: "Expense Updated",
        description: `Expense ${mapped.expenseId} updated successfully.`,
      });
    } catch (err) {
      console.error("handleUpdateExpense:", err);
    }
  };

  // Parent-level handler to open form in the same style as Add New (create)
  const handleOpenEdit = (expense: any) => {
    // If caller passed a transformed object that includes raw, prefer raw (server shape)
    const raw = expense?.raw ?? expense;
    setSelectedExpense(raw);
    setIsExpenseFormOpen(true);
  };

  // Listen to global events dispatched by the form(s): expense:created, expense:updated
  useEffect(() => {
    const onCreated = (ev: Event) => {
      try {
        const custom = ev as CustomEvent;
        const payload = custom?.detail;
        if (!payload) return;
        const mapped = transformExpenseData(payload);
        // prepend created expense
        setExpenses((prev) => [mapped, ...prev]);
        toast?.({
          title: "Expense Created",
          description: `Expense ${mapped.expenseId} created.`,
        });
      } catch (err) {
        console.error("expense:created handler failed", err);
      }
    };

    const onUpdated = (ev: Event) => {
      try {
        const custom = ev as CustomEvent;
        const payload = custom?.detail;
        if (!payload) return;
        const mapped = transformExpenseData(payload);
        setExpenses((prev) =>
          prev.map((e) =>
            e.expenseId === mapped.expenseId ||
            e.id === mapped.id ||
            e.id === mapped._id
              ? mapped
              : e,
          ),
        );
        toast?.({
          title: "Expense Updated",
          description: `Expense ${mapped.expenseId} updated.`,
        });
      } catch (err) {
        console.error("expense:updated handler failed", err);
      }
    };

    window.addEventListener("expense:created", onCreated as EventListener);
    window.addEventListener("expense:updated", onUpdated as EventListener);

    return () => {
      window.removeEventListener("expense:created", onCreated as EventListener);
      window.removeEventListener("expense:updated", onUpdated as EventListener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Memoized filteredExpenses (uses searchTerm + filters)
  const filteredExpenses = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return expenses.filter((expense) => {
      const matchesSearch =
        !term ||
        (expense.title && expense.title.toLowerCase().includes(term)) ||
        (expense.vendorName &&
          expense.vendorName.toLowerCase().includes(term)) ||
        (expense.expenseId && expense.expenseId.toLowerCase().includes(term)) ||
        (expense.paymentMethod &&
          expense.paymentMethod.toLowerCase().includes(term)) ||
        String(expense.amount || "").includes(term);

      const matchesStatus =
        filters.status === "all" || expense.status === filters.status;

      let matchesMonth = true;
      if (filters.month !== "all") {
        const monthIndex = Number(filters.month);
        const parsed = parseExpenseDate(expense.date);
        matchesMonth = parsed ? parsed.getMonth() === monthIndex : false;
      }

      const matchesAmount =
        !filters.minAmount || expense.amount >= Number(filters.minAmount);

      // dateRange from filter
      let matchesDate = true;
      if (filters.dateRange.from) {
        const expenseDate = parseExpenseDate(expense.date);
        if (expenseDate)
          matchesDate =
            expenseDate.getTime() >= filters.dateRange.from.getTime();
      }

      return (
        matchesSearch &&
        matchesStatus &&
        matchesMonth &&
        matchesAmount &&
        matchesDate
      );
    });
  }, [expenses, searchTerm, filters]);

  // If form open show form (create or edit depending on selectedExpense)
  if (isExpenseFormOpen) {
    return (
      <div className="px-2 sm:px-4">
        <Card className="w-full bg-white p-4 sm:p-6">
          <p className="text-2xl font-semibold">
            {selectedExpense ? "Edit Expense" : "Create Expense Form"}
          </p>
          <CardContent className="mt-2">
            <ExpenseForm
              onCancel={() => {
                setIsExpenseFormOpen(false);
                setSelectedExpense(null);
              }}
              initialData={selectedExpense ?? undefined}
              // onSaved handles the update flow (PUT) — ExpenseForm should call this when an edit/save occurs
              onSaved={(u: any) => {
                // ExpenseForm may pass server response or raw payload — map then update
                handleUpdateExpense(u);
                setIsExpenseFormOpen(false);
                setSelectedExpense(null);
              }}
              // onCreated handles create flow (if ExpenseForm calls it)
              onCreated={(c: any) => {
                try {
                  const mapped = transformExpenseData(c);
                  setExpenses((prev) => [mapped, ...prev]);
                } catch (err) {
                  console.error("onCreated callback error:", err);
                } finally {
                  setIsExpenseFormOpen(false);
                  setSelectedExpense(null);
                }
              }}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen p-2 sm:p-4 lg:p-6">
      {/* Locked Features Overlay */}
      <div className="flex h-[70vh] items-center justify-center">
        <Card className="border-border w-full max-w-md rounded-2xl border bg-white shadow-lg">
          <CardContent className="space-y-4 p-8 text-center">
            {/* Lock Icon */}
            <div className="flex justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-14 w-14 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V7.5a4.5 4.5 0 00-9 0v3m-3 0h15a1.5 1.5 0 011.5 1.5v7.5a1.5 1.5 0 01-1.5 1.5h-15a1.5 1.5 0 01-1.5-1.5v-7.5a1.5 1.5 0 011.5-1.5z"
                />
              </svg>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-semibold">Locked Feature</h2>

            {/* Description */}
            <p className="text-muted-foreground text-base">
              This feature is currently unavailable. Please check back later or
              upgrade to unlock access.
            </p>

            {/* Action */}
            <Button disabled variant="secondary" className="mt-4 w-full">
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="max-w-8xl mx-auto hidden space-y-4 sm:space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4 lg:gap-6">
          {metrics && (
            <>
              <ExpenseMetricCard
                title="Total Expenses"
                amount={`₹${metrics.totalExpenses?.amount?.toLocaleString?.() ?? 0}`}
                trend={metrics.totalExpenses?.trend}
                trendPercentage={`${metrics.totalExpenses?.percentageChange ?? 0}%`}
                subtitle="Since last month"
              />
              <ExpenseMetricCard
                title="Paid Expenses"
                amount={`₹${metrics.paidExpenses?.amount?.toLocaleString?.() ?? 0}`}
                trend={metrics.paidExpenses?.trend}
                trendPercentage={`${metrics.paidExpenses?.percentageChange ?? 0}%`}
                subtitle="Since last month"
              />
              <ExpenseMetricCard
                title="Pending Expenses"
                amount={`₹${metrics.pendingExpenses?.amount?.toLocaleString?.() ?? 0}`}
                trend={metrics.pendingExpenses?.trend}
                trendPercentage={`${metrics.pendingExpenses?.percentageChange ?? 0}%`}
                subtitle="Since last month"
              />
              <ExpenseMetricCard
                title="Overdue Expenses"
                amount={`₹${metrics.overdueExpenses?.amount?.toLocaleString?.() ?? 0}`}
                trend={metrics.overdueExpenses?.trend}
                trendPercentage={`${metrics.overdueExpenses?.percentageChange ?? 0}%`}
                subtitle="Since last month"
              />
            </>
          )}
        </div>

        {/* Loading & Error */}
        {loading && (
          <div className="border-border w-full rounded-lg border bg-white p-6">
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
                <p className="text-muted-foreground">Loading expenses...</p>
              </div>
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="border-border w-full rounded-lg border bg-white p-6">
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <p className="text-destructive mb-4">{error}</p>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                >
                  Retry
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ExpenseTable: pass fileInputRef + onExport + onUpdateExpense + onEditExpense so header buttons live inside table header (no layout change) */}
        {!loading && !error && (
          <ExpenseTable
            expenses={filteredExpenses}
            searchTerm={searchTerm}
            onDeleteExpense={handleDeleteExpense}
            setIsExpenseFormOpen={setIsExpenseFormOpen}
            fileInputRef={fileInputRef as RefObject<HTMLInputElement>}
            onExport={() => downloadCSV(filteredExpenses)}
            onUpdateExpense={handleUpdateExpense} // let table notify parent of updates
            onEditExpense={handleOpenEdit} // when edit clicked in table, open page-level form (same as Add New)
          />
        )}

        {/* hidden file input (invisible, does not affect layout) */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={handleImport}
          className="hidden"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
