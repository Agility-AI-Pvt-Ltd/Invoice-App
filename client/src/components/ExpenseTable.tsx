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
import { Edit, MoreHorizontal, ChevronLeft, ChevronRight, Download, Printer, Send, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

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
  const itemsPerPage = 8;
  const { toast } = useToast();
  
  // Apply filters
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = searchTerm === "" || 
      expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.expenseId.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
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

  return (
    <div className="space-y-4 bg-white">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead className="text-muted-foreground font-medium text-xs sm:text-sm whitespace-nowrap">Date</TableHead>
              <TableHead className="text-muted-foreground font-medium text-xs sm:text-sm whitespace-nowrap">Expense ID</TableHead>
              <TableHead className="text-muted-foreground font-medium text-xs sm:text-sm whitespace-nowrap">Expense Title</TableHead>
              <TableHead className="text-muted-foreground font-medium text-xs sm:text-sm whitespace-nowrap">Vendor Name</TableHead>
              <TableHead className="text-muted-foreground font-medium text-xs sm:text-sm whitespace-nowrap">Payment Method</TableHead>
              <TableHead className="text-muted-foreground font-medium text-xs sm:text-sm whitespace-nowrap">Amount</TableHead>
              <TableHead className="text-muted-foreground font-medium text-xs sm:text-sm whitespace-nowrap">Status</TableHead>
              <TableHead className="text-muted-foreground font-medium text-xs sm:text-sm whitespace-nowrap">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentExpenses.map((expense) => (
              <TableRow key={expense.id} className="border-border hover:bg-muted/5">
                <TableCell className="text-foreground text-xs sm:text-sm whitespace-nowrap">{expense.date}</TableCell>
                <TableCell className="text-foreground text-xs sm:text-sm whitespace-nowrap">{expense.expenseId}</TableCell>
                <TableCell className="text-foreground text-xs sm:text-sm whitespace-nowrap">{expense.title}</TableCell>
                <TableCell className="whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {expense.vendorAvatar}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-foreground text-xs sm:text-sm">{expense.vendorName}</span>
                  </div>
                </TableCell>
                <TableCell className="text-foreground text-xs sm:text-sm whitespace-nowrap">{expense.paymentMethod}</TableCell>
                <TableCell className="text-foreground font-medium text-xs sm:text-sm whitespace-nowrap">₹{expense.amount.toLocaleString()}</TableCell>
                <TableCell className="whitespace-nowrap">{getStatusBadge(expense.status)}</TableCell>
                <TableCell className="whitespace-nowrap">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Button variant="ghost" size="icon" className="h-6 w-6 sm:h-8 sm:w-8">
                      <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 sm:h-8 sm:w-8">
                          <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
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
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="text-muted-foreground w-full sm:w-auto"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        
        <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center">
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(page)}
              className={`text-xs sm:text-sm ${currentPage === page ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            >
              {page}
            </Button>
          ))}
          {totalPages > 5 && (
            <>
              <span className="text-muted-foreground text-xs sm:text-sm">...</span>
              <Button variant="outline" size="sm" className="text-muted-foreground text-xs sm:text-sm">
                {totalPages - 1}
              </Button>
              <Button variant="outline" size="sm" className="text-muted-foreground text-xs sm:text-sm">
                {totalPages}
              </Button>
            </>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="text-muted-foreground w-full sm:w-auto"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}