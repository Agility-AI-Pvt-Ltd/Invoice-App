import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ExpenseMetricCard } from "@/components/ExpenseMetricCard";
import { ExpenseTable } from "@/components/ExpenseTable";
import { useToast } from "@/hooks/use-toast";
import { format, parse } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import ExpenseForm from "@/components/expense-form/ExpenseForm";;
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
}

// NOTE: this was your old transform for an external API; we keep it in case some entries come in that shape
const transformExpenseData = (apiExpense: any): Expense => {
  return {
    id: apiExpense._id || `expense-${Date.now()}`,
    expenseId: apiExpense.invoiceNumber || apiExpense.expenseId || "",
    title: apiExpense.items?.[0]?.description || apiExpense.step3?.items?.[0]?.name || "No Description",
    vendorName: apiExpense.billFrom?.name || apiExpense.step2?.vendorName || "Unknown Vendor",
    vendorAvatar: (apiExpense.billFrom?.name || apiExpense.step2?.vendorName || "V")[0]?.toUpperCase() || "V",
    paymentMethod: apiExpense.step2?.paymentMethod || apiExpense.paymentMethod || "Cash",
    amount: apiExpense.total || apiExpense.step4?.total || apiExpense.step2?.amount || 0,
    status: apiExpense.status === "paid" ? "Paid" : apiExpense.step1?.status?.toLowerCase?.() === "paid" ? "Paid" :
      apiExpense.status === "overdue" ? "Overdue" : apiExpense.step1?.status === "overdue" ? "Overdue" : "Unpaid",
    date: apiExpense.step1?.expenseDate
      ? format(new Date(apiExpense.step1.expenseDate), "dd MMMM yyyy")
      : apiExpense.date
        ? format(new Date(apiExpense.date), "dd MMMM yyyy")
        : format(new Date(), "dd MMMM yyyy"),
  };
};

// Helper function to parse expense date string to Date object
const parseExpenseDate = (dateString: string): Date | null => {
  try {
    // Parse date in format "29 July 2024"
    return parse(dateString, "dd MMMM yyyy", new Date());
  } catch (error) {
    console.warn(`Failed to parse date: ${dateString}`, error);
    return null;
  }
};

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  //@ts-ignore
  const [searchTerm, setSearchTerm] = useState("");
  //@ts-ignore
  const [filters, setFilters] = useState({
    dateRange: { from: undefined as Date | undefined, to: undefined as Date | undefined },
    status: "all",
    month: "all",
    minAmount: ""
  });

  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);

  const { toast } = useToast();

  const generateExpenseId = () => {
    const year = new Date().getFullYear();
    const count = expenses.length + 1;
    return `EX-${year}/${count.toString().padStart(3, '0')}`;
  };

  //@ts-ignore
  const downloadCSV = (data: Expense[], filename: string) => {
    const headers = ['Date', 'Expense ID', 'Expense Title', 'Vendor Name', 'Payment Method', 'Amount', 'Status'];
    const csvContent = [
      headers.join(','),
      ...data.map(expense => [
        expense.date,
        expense.expenseId,
        expense.title,
        expense.vendorName,
        expense.paymentMethod,
        expense.amount,
        expense.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Fetch expenses from backend (our integrated version)
  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = Cookies.get("authToken");
      if (!token) {
        setError("Authentication token not found");
        setLoading(false);
        return;
      }

      const url = `${API_BASE}/api/expenses`;
      const res = await fetch(url, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const message = body?.detail || "Failed to fetch expenses";
        throw new Error(message);
      }

      const body = await res.json();
      const serverExpenses = body?.data?.expenses ?? body?.expenses ?? body ?? [];

      const mapped = (serverExpenses as []).map((e) => transformExpenseData(e));
      setExpenses(mapped);
    } catch (err: any) {
      console.error("Error fetching expenses:", err);
      setError(err?.message || "Failed to fetch expenses");
      toast({
        title: "Error",
        description: err?.message || "Failed to fetch expenses from the server",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // call fetch on mount
  useEffect(() => {
    fetchExpenses();
    const handler = () => {
      fetchExpenses();
      toast({ title: "Expense Created", description: "New expense added" });
    };
    window.addEventListener("expense:created", handler as EventListener);

    return () => {
      window.removeEventListener("expense:created", handler as EventListener);
    };
  }, []);

  const parseCSV = (csvText: string): Expense[] => {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());

    return lines.slice(1).filter(line => line.trim()).map((line, index) => {
      const values = line.split(',').map(v => v.trim());

      return {
        id: `imported-${Date.now()}-${index}`,
        expenseId: values[headers.indexOf('Expense ID')] || generateExpenseId(),
        title: values[headers.indexOf('Expense Title')] || values[headers.indexOf('title')] || '-',
        vendorName: values[headers.indexOf('Vendor Name')] || values[headers.indexOf('vendor')] || '-',
        vendorAvatar: values[headers.indexOf('Vendor Name')]?.[0] || values[headers.indexOf('vendor')]?.[0] || 'V',
        paymentMethod: values[headers.indexOf('Payment Method')] || values[headers.indexOf('payment')] || '-',
        amount: parseInt(values[headers.indexOf('Amount')] || values[headers.indexOf('amount')] || '0') || 0,
        status: (values[headers.indexOf('Status')] || values[headers.indexOf('status')] || 'Unpaid') as "Paid" | "Unpaid" | "Overdue",
        date: values[headers.indexOf('Date')] || values[headers.indexOf('date')] || format(new Date(), 'dd MMMM yyyy'),
      };
    });
  };
  //@ts-ignore
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const csvText = e.target?.result as string;
          const importedExpenses = parseCSV(csvText);
          setExpenses(prev => [...prev, ...importedExpenses]);
          toast({
            title: "Import Successful",
            description: `${importedExpenses.length} expenses imported from ${file.name}`
          });
        } catch (error) {
          console.log(error)
          toast({
            title: "Import Failed",
            description: "Failed to parse the CSV file",
            variant: "destructive"
          });
        }
      };
      reader.readAsText(file);
    }
  };

  // Delete expense => hit backend, then update local list
  const handleDeleteExpense = async (expenseId: string) => {
    try {
      const token = Cookies.get("authToken");
      if (!token) throw new Error("Auth token not found");

      const res = await fetch(`${API_BASE}/api/expenses/${expenseId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.detail || "Failed to delete expense");
      }

      toast({
        title: "Expense Deleted",
        description: "Expense has been deleted successfully"
      });

      // remove locally
      setExpenses(prev => prev.filter(expense => expense.id !== expenseId));
    } catch (err: any) {
      console.error("Delete expense error:", err);
      toast({
        title: "Delete Failed",
        description: err?.message || "Failed to delete expense",
        variant: "destructive"
      });
    }
  };

  // Filter logic remains unchanged
  const filteredExpenses = expenses.filter(expense => {
    // Search term filter
    const matchesSearch = !searchTerm ||
      expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.expenseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    const matchesStatus = filters.status === "all" || expense.status === filters.status;

    // Month filter
    const matchesMonth = filters.month === "all" || expense.date.includes(filters.month);

    // Minimum amount filter
    const matchesAmount = !filters.minAmount || expense.amount >= parseInt(filters.minAmount);

    // Date filter
    // Date filter - Fixed to handle date parsing properly
    let matchesDate = true;
    if (filters.dateRange.from) {
      const expenseDate = parseExpenseDate(expense.date);
      if (expenseDate) {
        matchesDate = expenseDate.getTime() >= filters.dateRange.from.getTime();
      }
    }

    return matchesSearch && matchesStatus && matchesMonth && matchesAmount && matchesDate;
  });

  if (isExpenseFormOpen) {
    return (
      <div className="px-2 sm:px-4">
        <Card className="w-full p-4 sm:p-6 bg-white">
          <p className="font-semibold text-2xl">Create Expense Form</p>
          <CardContent className="mt-2">
            <ExpenseForm onCancel={() => setIsExpenseFormOpen(false)} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-2 sm:p-4 lg:p-6">
      <div className="max-w-8xl mx-auto space-y-4 sm:space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <ExpenseMetricCard
            title="Total Expenses"
            amount={`₹${filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0).toLocaleString()}`}
            trend="up"
            // trendPercentage="3.46%"
            // subtitle="Since last month"
          />
          <ExpenseMetricCard
            title="Paid Expenses"
            amount={`₹${filteredExpenses.filter(exp => exp.status === 'Paid').reduce((sum, exp) => sum + exp.amount, 0).toLocaleString()}`}
            trend="down"
            // trendPercentage="3.46%"
            // subtitle="Since last month"
          />
          <ExpenseMetricCard
            title="Pending Expenses"
            amount={`₹${filteredExpenses.filter(exp => exp.status === 'Unpaid').reduce((sum, exp) => sum + exp.amount, 0).toLocaleString()}`}
            trend="up"
            // trendPercentage="3.46%"
            // subtitle="Since last month"
          />
          <ExpenseMetricCard
            title="Overdue Expenses"
            amount={`₹${filteredExpenses.filter(exp => exp.status === 'Overdue').reduce((sum, exp) => sum + exp.amount, 0).toLocaleString()}`}
            trend="up"
            // trendPercentage="3.46%"
            // subtitle="Since last month"
          />
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div className="bg-white rounded-lg border border-border p-6 w-full">
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading expenses...</p>
              </div>
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="bg-white rounded-lg border border-border p-6 w-full">
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

        {/* Enhanced ExpenseTable with all features */}
        {!loading && !error && (
          <ExpenseTable
            expenses={filteredExpenses}
            searchTerm={searchTerm}
            onDeleteExpense={handleDeleteExpense}
            setIsExpenseFormOpen={setIsExpenseFormOpen}
          />
        )}
      </div>
    </div>
  );
}