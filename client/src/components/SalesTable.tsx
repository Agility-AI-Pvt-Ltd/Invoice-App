// File: client/src/components/SalesTable.tsx

import { useState, useCallback, useEffect, useRef } from "react";
// import Cookies from "js-cookie"; // ✅ Added
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  CalendarIcon,
  Download,
  MoreHorizontal,
  Edit,
  Printer,
  Send,
  Trash2,
  ArrowUpDown,
  Filter,
  Upload,
  Plus,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

import {
  getSalesData,
  deleteSale,
  sendSale,
  getSalePDF,
  exportSalesCSV,
  createSalesBulk,
  type SalesRecord
} from "@/services/api/sales";

import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const SalesTable = ({
  setIsSalesFormOn
}: {
  setIsSalesFormOn: (isOpen: boolean) => void;
}) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState<SalesRecord[]>([]);
  const [allData, setAllData] = useState<SalesRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [sortField, setSortField] = useState<keyof SalesRecord | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);

  const [filters, setFilters] = useState({
    paymentStatus: "all",
    monthBefore: "all",
    minQuantity: "",
    minAmount: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 🔄 Refresh data with filters applied
  const refreshData = useCallback(async () => {
    try {
 // ✅ token from cookies
      const data = await getSalesData();       // ✅ pass token
      setAllData(data);

      let filtered = [...data];

      if (searchTerm) {
        filtered = filtered.filter(item =>
          item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.product.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (selectedDate) {
        const filterDate = format(selectedDate, "dd MMMM yyyy");
        filtered = filtered.filter(item => item.dateOfSale === filterDate);
      }

      setFilteredData(filtered);
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: "Failed to load sales data.",
        variant: "destructive",
      });
    }
  }, [searchTerm, selectedDate, toast]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);
  

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    let filtered = [...allData];

    if (value) {
      filtered = filtered.filter(item =>
        item.customerName.toLowerCase().includes(value.toLowerCase()) ||
        item.invoiceNumber.toLowerCase().includes(value.toLowerCase()) ||
        item.product.toLowerCase().includes(value.toLowerCase())
      );
    }

    if (selectedDate) {
      const filterDate = format(selectedDate, 'dd MMMM yyyy');
      filtered = filtered.filter(item => item.dateOfSale === filterDate);
    }

    setFilteredData(filtered);
  }, [allData, selectedDate]);

  const handleDateFilter = (date: Date | undefined) => {
    setSelectedDate(date);
    let filtered = [...allData];

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.product.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (date) {
      const filterDate = format(date, 'dd MMMM yyyy');
      filtered = filtered.filter(item => item.dateOfSale === filterDate);
    }

    setFilteredData(filtered);
  };

  const handleSort = (field: keyof SalesRecord) => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);

    const sorted = [...filteredData].sort((a, b) => {
      const aValue = a[field];
      const bValue = b[field];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return newDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return newDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });

    setFilteredData(sorted);
  };

  const handleImportData = async (importedData: SalesRecord[]) => {
    try {
      await createSalesBulk(importedData);
      await refreshData();
      toast({
        title: "Data Imported",
        description: `${importedData.length} records have been imported successfully.`,
      });
    } catch {
      toast({
        title: "Import Failed",
        description: "Server rejected the imported data.",
        variant: "destructive",
      });
    }
  };

  const handleActionClick = async (action: string, record: SalesRecord) => {
    switch (action) {
      case 'edit': {
        // hand-off to your form without changing UI
        sessionStorage.setItem("editSale", JSON.stringify(record));
        setIsSalesFormOn(true);
        toast({
          title: "Edit Record",
          description: `Editing record for ${record.customerName}`,
        });
        break;
      }
      case 'download': {
        // single-row CSV client-side (kept as-is)
        const csvContent = [
          ["Invoice Number", "Customer Name", "Product", "Quantity", "Unit Price", "Total Amount", "Date of Sale", "Payment Status"],
          [record.invoiceNumber, record.customerName, record.product, record.quantity, record.unitPrice, record.totalAmount, record.dateOfSale, record.paymentStatus]
        ].map(row => row.join(",")).join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${record.invoiceNumber}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        break;
      }
      case 'print': {
        try {
          const pdfBlob = await getSalePDF(record.id);
          const url = URL.createObjectURL(pdfBlob);
          // open print dialog in a new tab
          const win = window.open(url);
          if (!win) {
            // fallback: trigger download
            const a = document.createElement("a");
            a.href = url;
            a.download = `${record.invoiceNumber}.pdf`;
            a.click();
          }
          toast({
            title: "Print",
            description: `Opened PDF for ${record.invoiceNumber}`,
          });
        } catch {
          toast({
            title: "Error",
            description: "Failed to generate PDF.",
            variant: "destructive",
          });
        }
        break;
      }
      case 'send': {
        try {
          await sendSale(record.id);
          toast({
            title: "Sent",
            description: `Record for ${record.customerName} has been sent.`,
          });
        } catch {
          toast({
            title: "Error",
            description: "Failed to send record.",
            variant: "destructive",
          });
        }
        break;
      }
      case 'delete': {
        // optimistic UI
        const prevAll = [...allData];
        const prevFiltered = [...filteredData];
        const nextAll = allData.filter(item => item.id !== record.id);
        const nextFiltered = filteredData.filter(item => item.id !== record.id);
        setAllData(nextAll);
        setFilteredData(nextFiltered);

        try {
          await deleteSale(record.id);
          toast({
            title: "Record Deleted",
            description: `Record for ${record.customerName} has been deleted.`,
          });
        } catch {
          // rollback on failure
          setAllData(prevAll);
          setFilteredData(prevFiltered);
          toast({
            title: "Error",
            description: "Failed to delete record.",
            variant: "destructive",
          });
        }
        break;
      }
    }
  };

  const exportToCSV = async (filtered = false) => {
    try {
      // use server-side export to preserve parity
      const payload = filtered
        ? {
            searchTerm,
            selectedDate: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined,
            filters
          }
        : { all: true };

      const csvBlob = await exportSalesCSV(payload);
      const url = URL.createObjectURL(csvBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sales-data-${new Date().toISOString().split('T')[0]}${filtered ? "-filtered" : ""}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast({
        title: "Export Failed",
        description: "Could not export CSV from server.",
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleImport = () => {
    if (!selectedFile) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      if (event.target?.result) {
        try {
          const csvData = event.target.result as string;
          const lines = csvData.split('\n').filter(l => l.trim().length);
          const headers = lines[0].split(',').map(h => h.trim());
          const data: SalesRecord[] = [];

          for (let i = 1; i < lines.length; i++) {
            const row = lines[i].split(',').map(c => c.trim());
            if (row.length === headers.length) {
              const record: SalesRecord = {
                id: "", // let backend generate id
                invoiceNumber: row[0] || "",
                customerName: row[1] || "",
                product: row[2] || "",
                quantity: parseInt(row[3] || "0", 10),
                unitPrice: parseFloat(row[4] || "0"),
                totalAmount: parseFloat(row[5] || "0"),
                dateOfSale: row[6] || "",
                paymentStatus: (row[7] || "Paid") as "Paid" | "Unpaid",
              };
              data.push(record);
            }
          }

          await handleImportData(data);
        } catch {
          toast({
            title: "Import Failed",
            description: "Failed to parse CSV file. Please ensure it's in the correct format.",
            variant: "destructive",
          });
        }
      }
    };
    reader.readAsText(selectedFile);
  };

  const clearFilters = () => {
    setFilters({
      paymentStatus: "all",
      monthBefore: "all",
      minQuantity: "",
      minAmount: "",
    });
    setFilteredData(allData); // Reset filtered data to all data
  };

  const applyFilters = () => {
    let filtered = [...allData];

    if (filters.paymentStatus !== "all") {
      filtered = filtered.filter(item => item.paymentStatus === filters.paymentStatus);
    }

    if (filters.monthBefore !== "all") {
      const monthIndex = new Date().getMonth(); // Current month
      const monthBeforeIndex = new Date(new Date().setMonth(monthIndex - 1)).getMonth(); // Previous month

      filtered = filtered.filter(item => {
        const itemDate = new Date(item.dateOfSale);
        return itemDate.getMonth() === monthBeforeIndex;
      });
    }

    if (filters.minQuantity) {
      filtered = filtered.filter(item => item.quantity >= parseInt(filters.minQuantity, 10));
    }

    if (filters.minAmount) {
      filtered = filtered.filter(item => item.totalAmount >= parseFloat(filters.minAmount));
    }

    setFilteredData(filtered);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-lg sm:text-xl font-semibold text-card-foreground">Total Sales</h2>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search Client, Invoice ID & more..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 w-full sm:w-72"
            />
          </div>

          {/* Desktop Actions */}
          <div className="hidden sm:flex gap-2">
            {/* Filter Dropdown */}
            <DropdownMenu >
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 p-4 bg-white text-black">
                <div className="space-y-4">
                  <h4 className="font-medium">Filter Sales Data</h4>

                  <div className="space-y-2">
                    <Label htmlFor="paymentStatus">Payment Status</Label>
                    <Select
                      value={filters.paymentStatus}
                      onValueChange={(value) => setFilters(prev => ({ ...prev, paymentStatus: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="Paid">Paid</SelectItem>
                        <SelectItem value="Unpaid">Unpaid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="monthBefore">Month</Label>
                    <Select
                      value={filters.monthBefore}
                      onValueChange={(value) => setFilters(prev => ({ ...prev, monthBefore: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All months" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="january">January</SelectItem>
                        <SelectItem value="february">February</SelectItem>
                        <SelectItem value="march">March</SelectItem>
                        <SelectItem value="april">April</SelectItem>
                        <SelectItem value="may">May</SelectItem>
                        <SelectItem value="june">June</SelectItem>
                        <SelectItem value="july">July</SelectItem>
                        <SelectItem value="august">August</SelectItem>
                        <SelectItem value="september">September</SelectItem>
                        <SelectItem value="october">October</SelectItem>
                        <SelectItem value="november">November</SelectItem>
                        <SelectItem value="december">December</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="minQuantity">Minimum Quantity</Label>
                    <Input
                      id="minQuantity"
                      type="number"
                      placeholder="Enter minimum quantity"
                      value={filters.minQuantity}
                      onChange={(e) => setFilters(prev => ({ ...prev, minQuantity: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="minAmount">Minimum Amount (₹)</Label>
                    <Input
                      id="minAmount"
                      type="number"
                      placeholder="Enter minimum amount"
                      value={filters.minAmount}
                      onChange={(e) => setFilters(prev => ({ ...prev, minAmount: e.target.value }))}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" size="sm" onClick={clearFilters}>
                      Clear
                    </Button>
                    <Button size="sm" onClick={applyFilters}>
                      Apply
                    </Button>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <Popover open={isDatePopoverOpen} onOpenChange={setIsDatePopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className={cn(!selectedDate && "text-black")}>
                  <CalendarIcon className="w-4 h-4" />
                  <span className="ml-2">
                    {selectedDate ? format(selectedDate, "dd MMM yyyy") : "Date"}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    handleDateFilter(date);
                    setIsDatePopoverOpen(false);
                  }}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>

            {/* Import Dropdown */}
            <DropdownMenu >
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 p-4 bg-white text-black">
                <div className="space-y-4">
                  <h4 className="font-medium">Import Sales Data</h4>

                  <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <div className="space-y-2">
                      <p className="text-sm text-card-foreground">
                        {selectedFile ? selectedFile.name : "Click to select a CSV file"}
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Select File
                      </Button>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    <p>Supported formats: CSV, Excel (.xlsx, .xls)</p>
                    <p>Expected columns: Invoice Number, Customer Name, Product, Quantity, Unit Price, Total Amount, Date of Sale, Payment Status</p>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button size="sm" onClick={handleImport} disabled={!selectedFile}>
                      Import Data
                    </Button>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Export Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white text-black">
                <DropdownMenuItem onClick={() => exportToCSV(false)}>
                  Export All Records
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportToCSV(true)}>
                  Export Filtered Records
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setIsSalesFormOn(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add New Sales
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
                  <h4 className="font-medium">Filter Sales Data</h4>

                  <div className="space-y-2">
                    <Label htmlFor="paymentStatus">Payment Status</Label>
                    <Select
                      value={filters.paymentStatus}
                      onValueChange={(value) => setFilters(prev => ({ ...prev, paymentStatus: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="Paid">Paid</SelectItem>
                        <SelectItem value="Unpaid">Unpaid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="monthBefore">Month</Label>
                    <Select
                      value={filters.monthBefore}
                      onValueChange={(value) => setFilters(prev => ({ ...prev, monthBefore: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="All months" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="january">January</SelectItem>
                        <SelectItem value="february">February</SelectItem>
                        <SelectItem value="march">March</SelectItem>
                        <SelectItem value="april">April</SelectItem>
                        <SelectItem value="may">May</SelectItem>
                        <SelectItem value="june">June</SelectItem>
                        <SelectItem value="july">July</SelectItem>
                        <SelectItem value="august">August</SelectItem>
                        <SelectItem value="september">September</SelectItem>
                        <SelectItem value="october">October</SelectItem>
                        <SelectItem value="november">November</SelectItem>
                        <SelectItem value="december">December</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="minQuantity">Minimum Quantity</Label>
                    <Input
                      id="minQuantity"
                      type="number"
                      placeholder="Enter minimum quantity"
                      value={filters.minQuantity}
                      onChange={(e) => setFilters(prev => ({ ...prev, minQuantity: e.target.value }))} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="minAmount">Minimum Amount (₹)</Label>
                    <Input
                      id="minAmount"
                      type="number"
                      placeholder="Enter minimum amount"
                      value={filters.minAmount}
                      onChange={(e) => setFilters(prev => ({ ...prev, minAmount: e.target.value }))} />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" size="sm" onClick={clearFilters}>
                      Clear
                    </Button>
                    <Button size="sm" onClick={applyFilters}>
                      Apply
                    </Button>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Date Icon Button */}
            <Popover open={isDatePopoverOpen} onOpenChange={setIsDatePopoverOpen}>
              <PopoverTrigger asChild>
                <Button size="icon" variant="outline">
                  <CalendarIcon className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    handleDateFilter(date);
                    setIsDatePopoverOpen(false);
                  }}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>

            {/* Import Icon Button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="outline">
                  <Upload className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 p-4 bg-white text-black">
                <div className="space-y-4">
                  <h4 className="font-medium">Import Sales Data</h4>

                  <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <div className="space-y-2">
                      <p className="text-sm text-card-foreground">
                        {selectedFile ? selectedFile.name : "Click to select a CSV file"}
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Select File
                      </Button>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    <p>Supported formats: CSV, Excel (.xlsx, .xls)</p>
                    <p>Expected columns: Invoice Number, Customer Name, Product, Quantity, Unit Price, Total Amount, Date of Sale, Payment Status</p>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button size="sm" onClick={handleImport} disabled={!selectedFile}>
                      Import Data
                    </Button>
                  </div>
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
                <DropdownMenuItem onClick={() => exportToCSV(false)}>
                  Export All Records
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportToCSV(true)}>
                  Export Filtered Records
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="icon" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setIsSalesFormOn(true)}>
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border">
                <TableHead className="text-card-foreground font-medium text-xs sm:text-sm whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    Invoices Number
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-1"
                      onClick={() => handleSort('invoiceNumber')}
                    >
                      <ArrowUpDown className="w-3 h-3" />
                    </Button>
                  </div>
                </TableHead>
                <TableHead className="text-card-foreground font-medium text-xs sm:text-sm whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    Customer Name
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-1"
                      onClick={() => handleSort('customerName')}
                    >
                      <ArrowUpDown className="w-3 h-3" />
                    </Button>
                  </div>
                </TableHead>
                <TableHead className="text-card-foreground font-medium text-xs sm:text-sm whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    Product
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-1"
                      onClick={() => handleSort('product')}
                    >
                      <ArrowUpDown className="w-3 h-3" />
                    </Button>
                  </div>
                </TableHead>
                <TableHead className="text-card-foreground font-medium text-xs sm:text-sm whitespace-nowrap">Quantity</TableHead>
                <TableHead className="text-card-foreground font-medium text-xs sm:text-sm whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    Unit Price
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-1"
                      onClick={() => handleSort('unitPrice')}
                    >
                      <ArrowUpDown className="w-3 h-3" />
                    </Button>
                  </div>
                </TableHead>
                <TableHead className="text-card-foreground font-medium text-xs sm:text-sm whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    Total Amount
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-1"
                      onClick={() => handleSort('totalAmount')}
                    >
                      <ArrowUpDown className="w-3 h-3" />
                    </Button>
                  </div>
                </TableHead>
                <TableHead className="text-card-foreground font-medium text-xs sm:text-sm whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    Date of Sale
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-1"
                      onClick={() => handleSort('dateOfSale')}
                    >
                      <ArrowUpDown className="w-3 h-3" />
                    </Button>
                  </div>
                </TableHead>
                <TableHead className="text-card-foreground font-medium text-xs sm:text-sm whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    Payment Status
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-1"
                      onClick={() => handleSort('paymentStatus')}
                    >
                      <ArrowUpDown className="w-3 h-3" />
                    </Button>
                  </div>
                </TableHead>
                <TableHead className="text-card-foreground font-medium text-xs sm:text-sm whitespace-nowrap">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((row) => (
                <TableRow key={row.id} className="border-b border-border/50">
                  <TableCell className="text-card-foreground text-xs sm:text-sm whitespace-nowrap">{row.invoiceNumber}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-muted rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium">
                          {row.customerName.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <span className="text-card-foreground text-xs sm:text-sm">{row.customerName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-card-foreground text-xs sm:text-sm whitespace-nowrap">{row.product}</TableCell>
                  <TableCell className="text-card-foreground text-xs sm:text-sm whitespace-nowrap">{row.quantity.toLocaleString()}</TableCell>
                  <TableCell className="text-card-foreground text-xs sm:text-sm whitespace-nowrap">₹{row.unitPrice.toLocaleString()}</TableCell>
                  <TableCell className="text-card-foreground text-xs sm:text-sm whitespace-nowrap">₹{row.totalAmount.toLocaleString()}</TableCell>
                  <TableCell className="text-card-foreground text-xs sm:text-sm whitespace-nowrap">{row.dateOfSale}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Badge
                      variant={row.paymentStatus === 'Paid' ? 'default' : 'destructive'}
                      className={`text-xs ${row.paymentStatus === 'Paid'
                        ? 'bg-green-100 text-green-800 hover:bg-green-100'
                        : 'bg-red-100 text-red-800 hover:bg-red-100'
                        }`}
                    >
                      {row.paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleActionClick('edit', row)}
                        className="h-6 w-6 sm:h-8 sm:w-8 p-0"
                      >
                        <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 sm:h-8 sm:w-8 p-0">
                            <MoreHorizontal className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-white text-black">
                          <DropdownMenuItem onClick={() => handleActionClick('download', row)} className="text-black cursor-pointer hover:bg-muted hover:text-white">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleActionClick('print', row)} className="text-black cursor-pointer hover:bg-muted hover:text-black">
                            <Printer className="w-4 h-4 mr-2" />
                            Print
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleActionClick('send', row)} className="text-black cursor-pointer hover:bg-muted hover:text-black">
                            <Send className="w-4 h-4 mr-2" />
                            Send
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleActionClick('delete', row)} className="cursor-pointer hover:bg-muted text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {/* <div className="flex items-center justify-between px-6 py-4 border-t border-border">
          <Button variant="outline" size="sm" disabled>
            ← Previous
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="default" size="sm">1</Button>
            <Button variant="outline" size="sm">2</Button>
            <Button variant="outline" size="sm">3</Button>
            <span className="text-muted-foreground">...</span>
            <Button variant="outline" size="sm">67</Button>
            <Button variant="outline" size="sm">68</Button>
          </div>
          <Button variant="outline" size="sm">
            Next →
          </Button>
        </div> */}
      </div>
    </div>
  );
};
