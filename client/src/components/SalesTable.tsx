import { useState, useCallback } from "react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { salesData } from "@/lib/mock/salesData";
import type { SalesRecord } from "@/lib/mock/salesData.ts";
import { AddSalesDialog } from "./AddSalesDialog";
import { ImportDialog } from "./ImportDialog";
import { FilterDialog } from "./FilterDialog";

export const SalesTable = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState<SalesRecord[]>(salesData);
  const [allData, setAllData] = useState<SalesRecord[]>(salesData);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [sortField, setSortField] = useState<keyof SalesRecord | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

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

  const handleAddSales = (newSales: Omit<SalesRecord, 'id'>) => {
    const newRecord: SalesRecord = {
      ...newSales,
      id: Date.now().toString(),
    };
    const updatedData = [...allData, newRecord];
    setAllData(updatedData);
    setFilteredData(updatedData);
    toast({
      title: "Sales Record Added",
      description: "New sales record has been successfully added.",
    });
  };

  const handleImportData = (importedData: SalesRecord[]) => {
    const updatedData = [...allData, ...importedData];
    setAllData(updatedData);
    setFilteredData(updatedData);
    toast({
      title: "Data Imported",
      description: `${importedData.length} records have been imported successfully.`,
    });

  };

  const handleActionClick = (action: string, record: SalesRecord) => {
    switch (action) {
      case 'edit':
        toast({
          title: "Edit Record",
          description: `Editing record for ${record.customerName}`,
        });
        break;
      case 'download':
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
      case 'print':
        toast({
          title: "Print Record",
          description: `Printing record for ${record.customerName}`,
        });
        break;
      case 'send':
        toast({
          title: "Send Record",
          description: `Sending record for ${record.customerName}`,
        });
        break;
      case 'delete':
        const updatedData = allData.filter(item => item.id !== record.id);
        setAllData(updatedData);
        setFilteredData(filteredData.filter(item => item.id !== record.id));
        toast({
          title: "Record Deleted",
          description: `Record for ${record.customerName} has been deleted.`,
        });
        break;
    }
  };

  const exportToCSV = (filtered = false) => {
    const dataToExport = filtered ? filteredData : salesData;
    const headers = ["Invoice Number", "Customer Name", "Product", "Quantity", "Unit Price", "Total Amount", "Date of Sale", "Payment Status"];
    const csvContent = [
      headers.join(","),
      ...dataToExport.map(row => [
        row.invoiceNumber,
        row.customerName,
        row.product,
        row.quantity,
        row.unitPrice,
        row.totalAmount,
        row.dateOfSale,
        row.paymentStatus
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sales-data-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-card-foreground">Total Sales</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search Client, Invoice ID & more..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 w-72"
            />
          </div>
          
          <FilterDialog 
            isOpen={isFilterDialogOpen}
            onOpenChange={setIsFilterDialogOpen}
            onFilter={(data) => setFilteredData(data)}
          />
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className={cn(!selectedDate && "text-black")}>
                <CalendarIcon className="w-4 h-4 mr-2" />
                {selectedDate ? format(selectedDate, "dd MMM yyyy") : "Date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateFilter}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          
          <ImportDialog 
            isOpen={isImportDialogOpen}
            onOpenChange={setIsImportDialogOpen}
            onImportData={handleImportData}
          />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => exportToCSV(false)}>
                Export All Records
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToCSV(true)}>
                Export Filtered Records
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <AddSalesDialog 
            isOpen={isAddDialogOpen}
            onOpenChange={setIsAddDialogOpen}
            onAddSales={handleAddSales}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border">
              <TableHead className="text-card-foreground font-medium">
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
              <TableHead className="text-card-foreground font-medium">
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
              <TableHead className="text-card-foreground font-medium">
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
              <TableHead className="text-card-foreground font-medium">Quantity</TableHead>
              <TableHead className="text-card-foreground font-medium">
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
              <TableHead className="text-card-foreground font-medium">
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
              <TableHead className="text-card-foreground font-medium">
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
              <TableHead className="text-card-foreground font-medium">
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
              <TableHead className="text-card-foreground font-medium">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((row) => (
              <TableRow key={row.id} className="border-b border-border/50">
                <TableCell className="text-card-foreground">{row.invoiceNumber}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium">
                        {row.customerName.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <span className="text-card-foreground">{row.customerName}</span>
                  </div>
                </TableCell>
                <TableCell className="text-card-foreground">{row.product}</TableCell>
                <TableCell className="text-card-foreground">{row.quantity.toLocaleString()}</TableCell>
                <TableCell className="text-card-foreground">₹{row.unitPrice.toLocaleString()}</TableCell>
                <TableCell className="text-card-foreground">₹{row.totalAmount.toLocaleString()}</TableCell>
                <TableCell className="text-card-foreground">{row.dateOfSale}</TableCell>
                <TableCell>
                  <Badge 
                    variant={row.paymentStatus === 'Paid' ? 'default' : 'destructive'}
                    className={row.paymentStatus === 'Paid' 
                      ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                      : 'bg-red-100 text-red-800 hover:bg-red-100'
                    }
                  >
                    {row.paymentStatus}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleActionClick('edit', row)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      {/* <DropdownMenuContent align="end" className="bg-white">
                      <DropdownMenuItem onClick={() => handleAction("Download", expense.expenseId)} className="text-black cursor-pointer hover:bg-muted hover:text-white">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction("Print", expense.expenseId)} className="text-black cursor-pointer hover:bg-muted hover:text-black">
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction("Send", expense.expenseId)} className=" text-black cursor-pointer hover:bg-muted hover:text-black">
                        <Send className="h-4 w-4 mr-2" />
                        Send
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction("Delete", expense.id)} className="cursor-pointer hover:bg-muted text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent> */}


































                      <DropdownMenuContent className="bg-white">
                        <DropdownMenuItem onClick={() => handleActionClick('download', row)}className=" text-black cursor-pointer hover:bg-muted hover:text-white">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleActionClick('print', row)}className=" text-black cursor-pointer hover:bg-muted hover:text-white">
                          <Printer className="w-4 h-4 mr-2" />
                          Print
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleActionClick('send', row)}className=" text-black cursor-pointer hover:bg-muted hover:text-white">
                          <Send className="w-4 h-4 mr-2" />
                          Send
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleActionClick('delete', row)}
                          className="text-destructive cursor-pointer focus:text-destructive"
                        >
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
        
        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border">
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
        </div>
      </div>
    </div>
  );
};