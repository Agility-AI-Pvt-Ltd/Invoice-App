import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit, MoreHorizontal, ChevronLeft, ChevronRight, Download, Printer, Send, Trash2, Filter, CalendarIcon } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

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

interface ExpenseTableProps {
  expenses: Expense[];
  searchTerm: string;
  onDeleteExpense: (expenseId: string) => void;
}


const getStatusBadge = (status: Expense["status"]) => {
  switch (status) {
    case "Paid":
      return <Badge className="bg-success/10 text-success border-success/20 hover:bg-success/20">Paid</Badge>;
    case "Unpaid":
      return <Badge className="bg-warning/10 text-warning border-warning/20 hover:bg-warning/20">Unpaid</Badge>;
    case "Overdue":
      return <Badge className="bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20">Overdue (14d)</Badge>;
    default:
      return null;
  }
};

export function ExpenseTable({ expenses, searchTerm, onDeleteExpense }: ExpenseTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [statusFilter, setStatusFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [amountFilter, setAmountFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const itemsPerPage = 8;
  const { toast } = useToast();
  
  // Apply filters
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = searchTerm === "" || 
      expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.expenseId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || expense.status === statusFilter;
    
    const matchesAmount = amountFilter === "" || expense.amount >= parseInt(amountFilter);
    
    return matchesSearch && matchesStatus && matchesAmount;
  });
  
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentExpenses = filteredExpenses.slice(startIndex, endIndex);

  const handleAction = (action: string, expenseId: string) => {
    if (action === "Delete") {
      onDeleteExpense(expenseId);
    } else {
      toast({
        title: `${action} Action`,
        description: `${action} action performed for expense ${expenseId}`
      });
    }
  };

  const clearFilters = () => {
    setSelectedDate(undefined);
    setStatusFilter("all");
    setMonthFilter("all");
    setAmountFilter("");
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow className="border-border">
            <TableHead className="text-muted-foreground font-medium">Date</TableHead>
            <TableHead className="text-muted-foreground font-medium">Expense ID</TableHead>
            <TableHead className="text-muted-foreground font-medium">Expense Title</TableHead>
            <TableHead className="text-muted-foreground font-medium">Vendor Name</TableHead>
            <TableHead className="text-muted-foreground font-medium">Payment Method</TableHead>
            <TableHead className="text-muted-foreground font-medium">Amount</TableHead>
            <TableHead className="text-muted-foreground font-medium">Status</TableHead>
            <TableHead className="text-muted-foreground font-medium">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentExpenses.map((expense) => (
            <TableRow key={expense.id} className="border-border hover:bg-muted/5">
              <TableCell className="text-foreground">{expense.date}</TableCell>
              <TableCell className="text-foreground">{expense.expenseId}</TableCell>
              <TableCell className="text-foreground">{expense.title}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {expense.vendorAvatar}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-foreground">{expense.vendorName}</span>
                </div>
              </TableCell>
              <TableCell className="text-foreground">{expense.paymentMethod}</TableCell>
              <TableCell className="text-foreground font-medium">₹{expense.amount.toLocaleString()}</TableCell>
              <TableCell>{getStatusBadge(expense.status)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white">
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
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="text-muted-foreground"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        
        <div className="flex items-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(page)}
              className={currentPage === page ? "bg-primary text-primary-foreground" : "text-muted-foreground"}
            >
              {page}
            </Button>
          ))}
          <span className="text-muted-foreground">...</span>
          <Button variant="outline" size="sm" className="text-muted-foreground">
            67
          </Button>
          <Button variant="outline" size="sm" className="text-muted-foreground">
            68
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="text-muted-foreground"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}