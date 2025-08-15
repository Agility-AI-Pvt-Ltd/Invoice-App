//@ts-nocheck
import { useState, useEffect } from "react"
import { Search, Calendar, Download, Upload, Plus, Edit, MoreVertical, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/Input"
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
// import type { PurchaseItem, PaginatedResponse, PurchaseTableFilters } from "@/types/purchase"
import { getPurchaseItems } from "@/services/api/purchase";
import { NavbarButton } from "./ui/resizable-navbar"
import Cookies from "js-cookie"
import type { PurchaseItem, PurchaseTableFilters } from "@/types/purchase"

const PaymentStatusBadge = ({ status }: { status: PurchaseItem["paymentStatus"] }) => {
    const variants = {
        Paid: "bg-green-100 text-green-800 border-green-200",
        "Overdue (14d)": "bg-red-100 text-red-800 border-red-200",
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

export default function PurchaseTable({ setIsPurchaseFormOn }: { setIsPurchaseFormOn: (val: boolean) => void }) {
    const [data, setData] = useState<{
        items: PurchaseItem[];
        total: number;
        page: number;
        totalPages: number;
    } | null>(null);

    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [filters, setFilters] = useState<PurchaseTableFilters>({})


    const fetchData = async () => {
        setLoading(true);
        try {
            const token = Cookies.get("authToken");
            const result = await getPurchaseItems(token || "", currentPage, itemsPerPage, filters);
            setData(result);
        } catch (error) {
            console.error("Failed to fetch purchase items:", error);
        } finally {
            setLoading(false);
        }
    };



    useEffect(() => {
        fetchData()
    }, [currentPage, itemsPerPage, filters])

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

    const renderPaginationItems = () => {
        if (!data) return null
        const { page, totalPages } = data;

        const items = []

        // Previous button
        items.push(
            <PaginationItem key="prev">
                <PaginationPrevious
                    onClick={() => setCurrentPage(Math.max(1, page - 1))}
                    className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
            </PaginationItem>,
        )

        // Page numbers (simplified for brevity, can be expanded for more complex pagination)
        const startPage = Math.max(1, page - 2)
        const endPage = Math.min(totalPages, page + 2)

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
                    <PaginationLink onClick={() => setCurrentPage(i)} isActive={page === i} className="cursor-pointer">
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
                    onClick={() => setCurrentPage(Math.min(totalPages, page + 1))}
                    className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
            </PaginationItem>,
        )

        return items
    }

    if (loading) {
        return (
            <Card className="w-full">
                <CardContent className="p-6">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-gray-500">Loading...</div>
                    </div>
                </CardContent>
            </Card>
        )
    }




    return (
        <Card className="w-full shadow-sm bg-white">
            <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h2 className="text-lg font-semibold text-gray-900">Total Purchase</h2>

                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <div className="relative flex-grow sm:flex-grow-0">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                placeholder="Search..."
                                className="pl-10 w-full sm:w-64"
                                onChange={(e) => handleSearch(e.target.value)}
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
                                    <DropdownMenuItem className="hover:bg-gray-100 cursor-pointer">Export as CSV</DropdownMenuItem>
                                    <DropdownMenuItem className="hover:bg-gray-100 cursor-pointer">Export as Excel</DropdownMenuItem>
                                    <DropdownMenuItem className="hover:bg-gray-100 cursor-pointer">Export as PDF</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <Button variant="outline" size="sm" className="flex-shrink-0 bg-transparent">
                                <Upload className="h-4 w-4 mr-2" />
                                Import
                            </Button>

                            <NavbarButton className="bg-gradient-to-b from-[#B5A3FF] via-[#785FDA] to-[#9F91D8] text-white px-4 py-2 rounded-lg flex"
                                onClick={() => {
                                    setIsPurchaseFormOn(true);
                                }}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add New Purchase
                            </NavbarButton>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50">
                                <TableHead className="w-12"></TableHead> {/* Empty for checkbox/avatar */}
                                <TableHead className="cursor-pointer hover:bg-gray-100" onClick={() => handleSort("purchaseId")}>
                                    <div className="flex items-center gap-1">
                                        Purchase ID
                                        <ChevronDown className="h-4 w-4" />
                                    </div>
                                </TableHead>
                                <TableHead className="cursor-pointer hover:bg-gray-100" onClick={() => handleSort("supplierName")}>
                                    <div className="flex items-center gap-1">
                                        Supplier Name
                                        <ChevronDown className="h-4 w-4" />
                                    </div>
                                </TableHead>
                                <TableHead className="cursor-pointer hover:bg-gray-100" onClick={() => handleSort("product")}>
                                    <div className="flex items-center gap-1">
                                        Product
                                        <ChevronDown className="h-4 w-4" />
                                    </div>
                                </TableHead>
                                <TableHead className="cursor-pointer hover:bg-gray-100" onClick={() => handleSort("quantity")}>
                                    <div className="flex items-center gap-1">
                                        Quantity
                                        <ChevronDown className="h-4 w-4" />
                                    </div>
                                </TableHead>
                                <TableHead className="cursor-pointer hover:bg-gray-100" onClick={() => handleSort("balance")}>
                                    <div className="flex items-center gap-1">
                                        Balance
                                        <ChevronDown className="h-4 w-4" />
                                    </div>
                                </TableHead>
                                <TableHead className="cursor-pointer hover:bg-gray-100" onClick={() => handleSort("purchaseDate")}>
                                    <div className="flex items-center gap-1">
                                        Purchase Date
                                        <ChevronDown className="h-4 w-4" />
                                    </div>
                                </TableHead>
                                <TableHead className="cursor-pointer hover:bg-gray-100" onClick={() => handleSort("totalAmount")}>
                                    <div className="flex items-center gap-1">
                                        Total Amount
                                        <ChevronDown className="h-4 w-4" />
                                    </div>
                                </TableHead>
                                <TableHead className="cursor-pointer hover:bg-gray-100" onClick={() => handleSort("paymentStatus")}>
                                    <div className="flex items-center gap-1">
                                        Payment Status
                                        <ChevronDown className="h-4 w-4" />
                                    </div>
                                </TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data?.items.map((item) => (
                                <TableRow key={item.id} className="hover:bg-gray-50">
                                    <TableCell>
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={item.supplierAvatar || "/placeholder.svg"} alt={item.supplierName} />
                                            <AvatarFallback>{item.supplierName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                    </TableCell>
                                    <TableCell className="font-medium text-gray-900">{item.purchaseId}</TableCell>
                                    <TableCell className="text-gray-700">{item.supplierName}</TableCell>
                                    <TableCell className="text-gray-700">{item.product}</TableCell>
                                    <TableCell className="text-gray-700">{item.quantity}</TableCell>
                                    <TableCell className="text-gray-700">{formatCurrency(item.balance)}</TableCell>
                                    <TableCell className="text-gray-700">{item.purchaseDate}</TableCell>
                                    <TableCell className="text-gray-700">{formatCurrency(item.totalAmount)}</TableCell>
                                    <TableCell>
                                        <PaymentStatusBadge status={item.paymentStatus} />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <Edit className="h-4 w-4 text-gray-600" />
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger >
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreVertical className="h-4 w-4 text-gray-600" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent
                                                    align="end"
                                                    sideOffset={4}
                                                    className="z-50 bg-white border border-gray-200 shadow-lg text-black"
                                                >
                                                    <DropdownMenuItem className="hover:bg-slate-500 cursor-pointer">View Details</DropdownMenuItem>
                                                    <DropdownMenuItem className="hover:bg-gray-100 cursor-pointer">Delete</DropdownMenuItem>
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
                            {data
                                ? `${(data.page - 1) * itemsPerPage + 1}-${Math.min(data.page * itemsPerPage, data.total)} of ${data.total} items`
                                : ""}

                        </span>
                    </div>

                    <Pagination>
                        <PaginationContent>{renderPaginationItems()}</PaginationContent>
                    </Pagination>
                </div>
            </CardContent>
        </Card>
    )
}
