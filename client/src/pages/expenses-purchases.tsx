

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Search, Download, Upload, Plus, Filter } from "lucide-react";
import { ExpenseMetricCard } from "@/components/ExpenseMetricCard";
import { ExpenseTable } from "@/components/ExpenseTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { DateRangePicker } from "@/components/ui/DateRangePicker";

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

const initialExpenses: Expense[] = [
  {
    id: "expense-1",
    expenseId: "EX-2024/001",
    title: "Product 1",
    vendorName: "Vendor Name",
    vendorAvatar: "V",
    paymentMethod: "Cash",
    amount: 2000,
    status: "Paid",
    date: "29 July 2024",
  },
  {
    id: "expense-2",
    expenseId: "EX-2024/002",
    title: "Product 2",
    vendorName: "Vendor Name",
    vendorAvatar: "V",
    paymentMethod: "UPI",
    amount: 3500,
    status: "Paid",
    date: "28 July 2024",
  },
  {
    id: "expense-3",
    expenseId: "EX-2024/003",
    title: "Product 3",
    vendorName: "Vendor Name",
    vendorAvatar: "V",
    paymentMethod: "NET Banking",
    amount: 1500,
    status: "Overdue",
    date: "27 July 2024",
  },
  {
    id: "expense-4",
    expenseId: "EX-2024/004",
    title: "Product 4",
    vendorName: "Vendor Name",
    vendorAvatar: "V",
    paymentMethod: "Credit Card",
    amount: 5000,
    status: "Paid",
    date: "26 July 2024",
  },
  {
    id: "expense-5",
    expenseId: "EX-2024/005",
    title: "Product 5",
    vendorName: "Vendor Name",
    vendorAvatar: "V",
    paymentMethod: "Cash",
    amount: 2200,
    status: "Paid",
    date: "25 July 2024",
  },
  {
    id: "expense-6",
    expenseId: "EX-2024/006",
    title: "Product 6",
    vendorName: "Vendor Name",
    vendorAvatar: "V",
    paymentMethod: "UPI",
    amount: 1800,
    status: "Paid",
    date: "24 July 2024",
  },
  {
    id: "expense-7",
    expenseId: "EX-2024/007",
    title: "Product 7",
    vendorName: "Vendor Name",
    vendorAvatar: "V",
    paymentMethod: "NET Banking",
    amount: 4200,
    status: "Paid",
    date: "23 July 2024",
  },
  {
    id: "expense-8",
    expenseId: "EX-2024/008",
    title: "Product 8",
    vendorName: "Vendor Name",
    vendorAvatar: "V",
    paymentMethod: "Credit Card",
    amount: 3000,
    status: "Unpaid",
    date: "22 July 2024",
  },
];

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: { from: undefined, to: undefined },
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
  const { toast } = useToast();

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
    const matchesDate = !filters.dateRange.from || 
      new Date(expense.date).getTime() >= new Date(filters.dateRange.from).getTime();

    return matchesSearch && matchesStatus && matchesMonth && matchesAmount && matchesDate;
  });

  const handleExport = (includeFilters: boolean) => {
    const dataToExport = includeFilters ? filteredExpenses : expenses;
    downloadCSV(dataToExport, `expenses_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    toast({
      title: "Export Successful",
      description: `Expenses exported as CSV ${includeFilters ? 'with filters applied' : 'without filters'}`
    });
    setShowExportDialog(false);
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
      setShowImportDialog(false);
    }
  };

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
    setShowAddExpense(false);
    setNewExpense({
      title: "",
      vendorName: "",
      paymentMethod: "",
      amount: "",
      status: "Unpaid",
      date: ""
    });
  };

  const handleDeleteExpense = (expenseId: string) => {
    setExpenses(prev => prev.filter(expense => expense.id !== expenseId));
    toast({
      title: "Expense Deleted",
      description: "Expense has been deleted successfully"
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-8xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Hello A</h1>
          {/* <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search Client, Invoice ID & more..."
                className="pl-10 w-80 bg-background border-border"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Dialog open={showAddExpense} onOpenChange={setShowAddExpense}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
            </Dialog>
          </div> */}
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
        <div className="bg-white rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">Total Expenses</h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search"
                  className="pl-10 w-64 bg-background border-border"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Import
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white">
                  <DialogHeader>
                    <DialogTitle>Import Expenses</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
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
                </DialogContent>
              </Dialog>

              <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white">
                  <DialogHeader>
                    <DialogTitle>Export Expenses</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex flex-col gap-3">
                      <Button onClick={() => handleExport(false)} variant="outline">
                        Export All Records
                      </Button>
                      <Button onClick={() => handleExport(true)} variant="outline">
                        Export Filtered Records
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

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
                        date={filters.dateRange.from}
                        onDateChange={(date) => setFilters({...filters, dateRange: { from: date, to: date }})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
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
                      <Select value={filters.month} onValueChange={(value) => setFilters({...filters, month: value})}>
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
                        onChange={(e) => setFilters({...filters, minAmount: e.target.value})}
                      />
                    </div>

                    <Button 
                      variant="outline" 
                      onClick={() => setFilters({
                        dateRange: { from: undefined, to: undefined },
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

              <Dialog open={showAddExpense} onOpenChange={setShowAddExpense}>
                <DialogTrigger asChild>
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Expenses
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md bg-white">
                  <DialogHeader>
                    <DialogTitle>Add New Expense</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="expense-title">Expense Title</Label>
                      <Input
                        id="expense-title"
                        value={newExpense.title}
                        onChange={(e) => setNewExpense({...newExpense, title: e.target.value})}
                        placeholder="Enter expense title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="vendor-name">Vendor Name</Label>
                      <Input
                        id="vendor-name"
                        value={newExpense.vendorName}
                        onChange={(e) => setNewExpense({...newExpense, vendorName: e.target.value})}
                        placeholder="Enter vendor name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="payment-method">Payment Method</Label>
                      <Select value={newExpense.paymentMethod} onValueChange={(value) => setNewExpense({...newExpense, paymentMethod: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Cash">Cash</SelectItem>
                          <SelectItem value="UPI">UPI</SelectItem>
                          <SelectItem value="NET Banking">NET Banking</SelectItem>
                          <SelectItem value="Credit Card">Credit Card</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="amount">Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={newExpense.amount}
                        onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                        placeholder="Enter amount"
                      />
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select value={newExpense.status} onValueChange={(value) => setNewExpense({...newExpense, status: value as "Paid" | "Unpaid" | "Overdue"})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Paid">Paid</SelectItem>
                          <SelectItem value="Unpaid">Unpaid</SelectItem>
                          <SelectItem value="Overdue">Overdue</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="expense-date">Date</Label>
                      <Input
                        id="expense-date"
                        type="date"
                        value={newExpense.date}
                        onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                      />
                    </div>
                    <Button onClick={handleAddExpense} className="w-full">
                      Add Expense
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          <ExpenseTable 
            expenses={filteredExpenses}
            searchTerm={searchTerm}
            onDeleteExpense={handleDeleteExpense}
          />
        </div>
      </div>
    </div>
  );
}