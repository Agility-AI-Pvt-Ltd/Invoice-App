import { useState, useEffect } from "react"
import { Search, Calendar, Download, Upload, Plus, Edit, MoreVertical, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/Input"
import { NavbarButton } from "./ui/resizable-navbar"

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

interface ExpenseTableFilters {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: string;
  dateRange?: { from?: Date; to?: Date };
}

const PaymentStatusBadge = ({ status }: { status: Expense["status"] }) => {
  const variants = {
    Paid: "bg-green-100 text-green-800 border-green-200",
    Overdue: "bg-red-100 text-red-800 border-red-200",
    Unpaid: "bg-orange-100 text-orange-800 border-orange-200",
  }
  return (
    <Badge variant="outline" className={variants[status]}>
      {status}
    </Badge>
  )
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

interface ExpenseTableProps {
  expenses: Expense[];
  searchTerm: string;
  onDeleteExpense: (id: string) => void;
  setIsExpenseFormOpen?: (val: boolean) => void;
}

export function ExpenseTable({
  expenses,
  searchTerm,
  onDeleteExpense,
  setIsExpenseFormOpen
}: ExpenseTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [filters, setFilters] = useState<ExpenseTableFilters>({})
  const [sortedExpenses, setSortedExpenses] = useState<Expense[]>([])

  // Apply sorting and filtering
  useEffect(() => {
    let filtered = [...expenses];

    // Apply search filter
    if (filters.search || searchTerm) {
      const search = (filters.search || searchTerm).toLowerCase();
      filtered = filtered.filter(expense =>
        expense.title.toLowerCase().includes(search) ||
        expense.vendorName.toLowerCase().includes(search) ||
        expense.expenseId.toLowerCase().includes(search) ||
        expense.paymentMethod.toLowerCase().includes(search)
      );
    }

    // Apply sorting
    if (filters.sortBy && filters.sortOrder) {
      filtered.sort((a, b) => {
        const aVal = a[filters.sortBy as keyof Expense];
        const bVal = b[filters.sortBy as keyof Expense];

        let comparison = 0;
        if (aVal < bVal) comparison = -1;
        if (aVal > bVal) comparison = 1;

        return filters.sortOrder === 'desc' ? -comparison : comparison;
      });
    }

    setSortedExpenses(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [expenses, filters, searchTerm]);

  // Calculate pagination
  const totalPages = Math.ceil(sortedExpenses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentExpenses = sortedExpenses.slice(startIndex, endIndex);

  const handleSearch = (search: string) => {
    setFilters((prev) => ({ ...prev, search }))
    setCurrentPage(1)
  }

  const handleSort = (column: string) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: column,
      sortOrder: prev.sortBy === column && prev.sortOrder === "asc" ? "desc" : "asc",
    }))
  }

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

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const csvText = e.target?.result as string;
          console.log('Imported CSV:', csvText);
          // Handle CSV parsing logic here
        } catch (error) {
          console.error('Import failed:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  const renderPaginationItems = () => {
    const items = []

    // Previous button
    items.push(
      <PaginationItem key="prev">
        <PaginationPrevious
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
        />
      </PaginationItem>,
    )

    // Page numbers
    const startPage = Math.max(1, currentPage - 2)
    const endPage = Math.min(totalPages, currentPage + 2)

    if (startPage > 1) {
      items.push(
        <PaginationItem key={1}>
          <PaginationLink onClick={() => setCurrentPage(1)} className="cursor-pointer">
            1
          </PaginationLink>
        </PaginationItem>,
      )
      if (startPage > 2) {
        items.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>,
        )
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
        </PaginationItem>,
      )
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>,
        )
      }
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink onClick={() => setCurrentPage(totalPages)} className="cursor-pointer">
            {totalPages}
          </PaginationLink>
        </PaginationItem>,
      )
    }

    // Next button
    items.push(
      <PaginationItem key="next">
        <PaginationNext
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
        />
      </PaginationItem>,
    )

    return items
  }

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
              <Button variant="outline" size="sm" className="flex-shrink-0 bg-transparent">
                <Calendar className="h-4 w-4 mr-2" />
                Date
              </Button>

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
                    onClick={() => downloadCSV(sortedExpenses, `expenses_all_${new Date().toISOString().split('T')[0]}.csv`)}
                  >
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="hover:bg-gray-100 cursor-pointer"
                    onClick={() => downloadCSV(currentExpenses, `expenses_current_page_${new Date().toISOString().split('T')[0]}.csv`)}
                  >
                    Export Current Page
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-gray-100 cursor-pointer">Export as PDF</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="relative">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleImport}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button variant="outline" size="sm" className="flex-shrink-0 bg-transparent">
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </Button>
              </div>

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
              {currentExpenses.map((expense) => (
                <TableRow key={expense.id} className="hover:bg-gray-50">
                  <TableCell>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={expense.vendorAvatar} alt={expense.vendorName} />
                      <AvatarFallback>{expense.vendorName.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium text-gray-900">{expense.expenseId}</TableCell>
                  <TableCell className="text-gray-700">{expense.title}</TableCell>
                  <TableCell className="text-gray-700">{expense.vendorName}</TableCell>
                  <TableCell className="text-gray-700">{expense.paymentMethod}</TableCell>
                  <TableCell className="text-gray-700">{expense.date}</TableCell>
                  <TableCell className="text-gray-700">{formatCurrency(expense.amount)}</TableCell>
                  <TableCell>
                    <PaymentStatusBadge status={expense.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
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
                          <DropdownMenuItem className="hover:bg-gray-100 cursor-pointer">
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="hover:bg-gray-100 cursor-pointer"
                            onClick={() => onDeleteExpense(expense.id)}
                          >
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Items per page:</span>
            <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
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
    </Card>
  )
}