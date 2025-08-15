import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Search, Download, Upload, Plus, Filter } from "lucide-react";
import { ExpenseMetricCard } from "@/components/ExpenseMetricCard";
import { ExpenseTable } from "@/components/ExpenseTable";

import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { format, parse } from "date-fns";
import { SingleDatePicker } from "@/components/ui/SingleDatePicker";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { Card, CardContent } from "@/components/ui/card";
import ExpenseForm from "@/components/expense-form/ExpenseForm";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getExpenseInvoices, type ExpenseInvoice } from "@/services/api/expense";
import Cookies from "js-cookie";

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

// Transform API data to match the Expense interface
const transformExpenseData = (apiExpense: ExpenseInvoice): Expense => {
  return {
    id: apiExpense._id || `expense-${Date.now()}`,
    expenseId: apiExpense.invoiceNumber,
    title: apiExpense.items?.[0]?.description || "No Description",
    vendorName: apiExpense.billFrom?.name || "Unknown Vendor",
    vendorAvatar: apiExpense.billFrom?.name?.[0]?.toUpperCase() || "V",
    paymentMethod: "Cash", // Default value as API doesn't provide this
    amount: apiExpense.total || 0,
    status: apiExpense.status === "paid" ? "Paid" : 
            apiExpense.status === "overdue" ? "Overdue" : "Unpaid",
    date: format(new Date(apiExpense.date), "dd MMMM yyyy"),
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
  const [searchTerm, setSearchTerm] = useState("");
  //@ts-expect-error - might use later
  const [showAddExpense, setShowAddExpense] = useState(false);
  //@ts-expect-error - might use later
  const [showExportDialog, setShowExportDialog] = useState(false);
  //@ts-expect-error - might use later
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: { from: undefined as Date | undefined, to: undefined as Date | undefined },
    status: "all",
    month: "all",
    minAmount: ""
  });
  const [newExpense, setNewExpense] = useState({
    title: "",
    vendorName: "",
    paymentMethod: "",
    amount: "",
    status: "Unpaid" as "Paid" | "Unpaid" | "Overdue",
    date: ""
  });

  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);

  const { toast } = useToast();

  // Fetch expenses from API
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = Cookies.get('authToken');
        
        if (!token) {
          setError('Authentication token not found');
          setLoading(false);
          return;
        }

        const apiExpenses = await getExpenseInvoices(token);
        const transformedExpenses = apiExpenses.map(transformExpenseData);
        setExpenses(transformedExpenses);
      } catch (err) {
        console.error('Error fetching expenses:', err);
        setError('Failed to fetch expenses');
        toast({
          title: "Error",
          description: "Failed to fetch expenses from the server",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [toast]);

  const generateExpenseId = () => {
    const year = new Date().getFullYear();
    const count = expenses.length + 1;
    return `EX-${year}/${count.toString().padStart(3, '0')}`;
  };

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

  // Filter expenses based on selected filters
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

  const handleExport = (includeFilters: boolean) => {
    const dataToExport = includeFilters ? filteredExpenses : expenses;
    downloadCSV(dataToExport, `expenses_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    toast({
      title: "Export Successful",
      description: `Expenses exported as CSV ${includeFilters ? 'with filters applied' : 'without filters'}`
    });

  };

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

  //@ts-expect-error - might use later
  const handleAddExpense = () => {
    if (!newExpense.title || !newExpense.vendorName || !newExpense.amount || !newExpense.date) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const expense: Expense = {
      id: `expense-${Date.now()}`,
      expenseId: generateExpenseId(),
      title: newExpense.title,
      vendorName: newExpense.vendorName,
      vendorAvatar: newExpense.vendorName[0]?.toUpperCase() || 'V',
      paymentMethod: newExpense.paymentMethod,
      amount: parseInt(newExpense.amount),
      status: newExpense.status,
      date: format(new Date(newExpense.date), 'dd MMMM yyyy'),
    };

    setExpenses(prev => [expense, ...prev]);
    toast({
      title: "Expense Added",
      description: "New expense has been added successfully"
    });

    setNewExpense({
      title: "",
      vendorName: "",
      paymentMethod: "",
      amount: "",
      status: "Unpaid",
      date: ""
    });
  }


  const handleDeleteExpense = (expenseId: string) => {
    setExpenses(prev => prev.filter(expense => expense.id !== expenseId));
    toast({
      title: "Expense Deleted",
      description: "Expense has been deleted successfully"
    });
  };

  if (isExpenseFormOpen) {
    return (
      <div className="px-2 sm:px-4">
        <Card className="w-full p-4 sm:p-6 bg-white">
          <p className="font-semibold text-2xl">Create Purchase Form</p>
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
            trendPercentage="3.46%"
            subtitle="Since last month"
          />
          <ExpenseMetricCard
            title="Paid Expenses"
            amount={`₹${filteredExpenses.filter(exp => exp.status === 'Paid').reduce((sum, exp) => sum + exp.amount, 0).toLocaleString()}`}
            trend="down"
            trendPercentage="3.46%"
            subtitle="Since last month"
          />
          <ExpenseMetricCard
            title="Pending Expenses"
            amount={`₹${filteredExpenses.filter(exp => exp.status === 'Unpaid').reduce((sum, exp) => sum + exp.amount, 0).toLocaleString()}`}
            trend="up"
            trendPercentage="3.46%"
            subtitle="Since last month"
          />
          <ExpenseMetricCard
            title="Overdue Expenses"
            amount={`₹${filteredExpenses.filter(exp => exp.status === 'Overdue').reduce((sum, exp) => sum + exp.amount, 0).toLocaleString()}`}
            trend="up"
            trendPercentage="3.46%"
            subtitle="Since last month"
          />
        </div>

        {/* Expenses Table */}
        <div className="bg-white rounded-lg border border-border p-3 sm:p-4 lg:p-6 w-full overflow-hidden">
          <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground truncate">Total Expenses</h2>
            <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:gap-3 sm:space-y-0">
              {/* Search Bar */}
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search"
                  className="pl-10 w-full sm:w-48 lg:w-56 bg-background border-border"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="space-y-4">
                    <h4 className="font-medium">Filter Expenses</h4>

                    <div className="space-y-2">
                      <Label>Date</Label>
                      <DateRangePicker
                      // date={filters.dateRange.from}
                      // onDateChange={(date) => setFilters({...filters, dateRange: { from: date, to: date }})} // TODO: Uncomment when DateRangePicker is implemented
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="Paid">Paid</SelectItem>
                          <SelectItem value="Unpaid">Unpaid</SelectItem>
                          <SelectItem value="Overdue">Overdue</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Month</Label>
                      <Select value={filters.month} onValueChange={(value) => setFilters({ ...filters, month: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="All months" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Months</SelectItem>
                          <SelectItem value="January">January</SelectItem>
                          <SelectItem value="February">February</SelectItem>
                          <SelectItem value="March">March</SelectItem>
                          <SelectItem value="April">April</SelectItem>
                          <SelectItem value="May">May</SelectItem>
                          <SelectItem value="June">June</SelectItem>
                          <SelectItem value="July">July</SelectItem>
                          <SelectItem value="August">August</SelectItem>
                          <SelectItem value="September">September</SelectItem>
                          <SelectItem value="October">October</SelectItem>
                          <SelectItem value="November">November</SelectItem>
                          <SelectItem value="December">December</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Minimum Amount</Label>
                      <Input
                        type="number"
                        placeholder="Enter minimum amount"
                        value={filters.minAmount}
                        onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Minimum Amount</Label>
                      <Input
                        type="number"
                        placeholder="Enter minimum amount"
                        value={filters.minAmount}
                        onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
                      />
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => setFilters({
                        dateRange: { from: undefined as Date | undefined, to: undefined as Date | undefined },
                        status: "all",
                        month: "all",
                        minAmount: ""
                      })}
                      className="w-full"
                    >
                      Clear Filters
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              {/* </DropdownMenuContent>
              </DropdownMenu> */}
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setIsExpenseFormOpen(true)}>
                <Plus className="h-4 w-4" />
                <span className="ml-2">Add New Expenses</span>
              </Button>
            </div>

            {/* Mobile Actions - Icon Only */}
            <div className="sm:hidden flex items-center gap-2">
              {/* Filter Icon Button */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="outline">
                    <Filter className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80 p-4 bg-white text-black">
                  <div className="space-y-4">
                    <h4 className="font-medium">Filter Expenses</h4>

                    <div className="space-y-2">
                      <Label>Date</Label>
                      <SingleDatePicker
                        date={filters.dateRange.from}
                        onDateChange={(date) => {
                          setFilters({ ...filters, dateRange: { from: date, to: date } });
                        }}
                        iconOnly={true}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select value={filters.status} onValueChange={(value) => {
                        setFilters({ ...filters, status: value });
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="Paid">Paid</SelectItem>
                          <SelectItem value="Unpaid">Unpaid</SelectItem>
                          <SelectItem value="Overdue">Overdue</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Month</Label>
                      <Select value={filters.month} onValueChange={(value) => {
                        setFilters({ ...filters, month: value });
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="All months" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Months</SelectItem>
                          <SelectItem value="January">January</SelectItem>
                          <SelectItem value="February">February</SelectItem>
                          <SelectItem value="March">March</SelectItem>
                          <SelectItem value="April">April</SelectItem>
                          <SelectItem value="May">May</SelectItem>
                          <SelectItem value="June">June</SelectItem>
                          <SelectItem value="July">July</SelectItem>
                          <SelectItem value="August">August</SelectItem>
                          <SelectItem value="September">September</SelectItem>
                          <SelectItem value="October">October</SelectItem>
                          <SelectItem value="November">November</SelectItem>
                          <SelectItem value="December">December</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Minimum Amount</Label>
                      <Input
                        type="number"
                        placeholder="Enter minimum amount"
                        value={filters.minAmount}
                        onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
                      />
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => {
                        setFilters({
                          dateRange: { from: undefined as Date | undefined, to: undefined as Date | undefined },
                          status: "all",
                          month: "all",
                          minAmount: ""
                        });
                      }}
                      className="w-full"
                    >
                      Clear Filters
                    </Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Export Icon Button */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="outline">
                    <Download className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white text-black">
                  <DropdownMenuItem onClick={() => handleExport(false)}>
                    Export All Records
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport(true)}>
                    Export Filtered Records
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Import Icon Button */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="outline">
                    <Upload className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80 p-4 bg-white text-black">
                  <div className="space-y-4">
                    <h4 className="font-medium">Import Expenses</h4>
                    <div>
                      <Label htmlFor="file-upload">Select CSV File</Label>
                      <Input
                        id="file-upload"
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleImport}
                        className="mt-2"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Missing columns will be filled with "-". Supported formats: CSV, Excel
                    </p>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button size="icon" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          </div>
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

        {!loading && !error && (
          <ExpenseTable
            expenses={filteredExpenses}
            searchTerm={searchTerm}
            onDeleteExpense={handleDeleteExpense}
          />
        )}

      </div>
    </div>
  );
}