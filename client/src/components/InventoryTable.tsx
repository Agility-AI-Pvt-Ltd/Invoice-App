"use client";

import { useState, useEffect } from "react";
import { Search, Edit, Trash2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import type {
    InventoryItem,
    PaginatedResponse,
    InventoryFilters,
} from "@/types/inventory";
import { Checkbox } from "../components/ui/Checkbox";
import { InventoryActionsBar } from "./InventoryActionBar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import axios from "axios";
import { INVENTORY_API } from "@/services/api/inventory";
import Cookies from "js-cookie";

const StatusBadge = ({ status }: { status: InventoryItem["status"] }) => {
    const variants: Record<string, string> = {
        "In Stock": "bg-green-100 text-green-800 border-green-200",
        "Out of Stock": "bg-red-100 text-red-800 border-red-200",
        "Low in Stock": "bg-orange-100 text-orange-800 border-orange-200",
    };
    return (
        <Badge variant="outline" className={variants[status]}>
            {status}
        </Badge>
    );
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
    }).format(amount);
};

export default function InventoryTable() {
    const [data, setData] = useState<PaginatedResponse<InventoryItem> | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [filters, setFilters] = useState<InventoryFilters>({});
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const token = Cookies.get("authToken") || "";
    const isAllSelected =
        data && selectedItems.length === data.data.length && data.data.length > 0;

    const toggleSelectAll = () => {
        if (!data) return;
        if (isAllSelected) {
            setSelectedItems([]);
        } else {
            setSelectedItems(data.data.map((item) => item.id));
        }
    };

    const toggleSelectItem = (id: string) => {
        setSelectedItems((prev) =>
            prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
        );
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: itemsPerPage.toString(),
                ...(filters.search ? { search: filters.search } : {}),
                ...(filters.category ? { category: filters.category } : {}),
                ...(filters.status ? { status: filters.status } : {}),
                ...(filters.sortBy ? { sortBy: filters.sortBy } : {}),
                ...(filters.sortOrder ? { sortOrder: filters.sortOrder } : {}),
            });

            const res = await axios.get<PaginatedResponse<InventoryItem>>(
                `${INVENTORY_API.ITEMS}?${params.toString()}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setData(res.data);
        } catch (error) {
            console.error("Failed to fetch inventory items:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchData();
        }
    }, [currentPage, itemsPerPage, filters, token]);

    const handleSort = (column: string) => {
        setFilters((prev) => ({
            ...prev,
            sortBy: column,
            sortOrder:
                prev.sortBy === column && prev.sortOrder === "asc" ? "desc" : "asc",
        }));
    };

    const renderPaginationItems = () => {
        if (!data) return null;
        const { page, totalPages } = data.pagination;
        const items = [];

        items.push(
            <PaginationItem key="prev">
                <PaginationPrevious
                    onClick={() => setCurrentPage(Math.max(1, page - 1))}
                    className={
                        page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"
                    }
                />
            </PaginationItem>
        );

        for (let i = 1; i <= Math.min(3, totalPages); i++) {
            items.push(
                <PaginationItem key={i}>
                    <PaginationLink
                        onClick={() => setCurrentPage(i)}
                        isActive={page === i}
                        className="cursor-pointer"
                    >
                        {i}
                    </PaginationLink>
                </PaginationItem>
            );
        }

        if (totalPages > 3) {
            items.push(
                <PaginationItem key="ellipsis">
                    <PaginationEllipsis />
                </PaginationItem>
            );
            items.push(
                <PaginationItem key={totalPages}>
                    <PaginationLink
                        onClick={() => setCurrentPage(totalPages)}
                        isActive={page === totalPages}
                        className="cursor-pointer"
                    >
                        {totalPages}
                    </PaginationLink>
                </PaginationItem>
            );
        }

        items.push(
            <PaginationItem key="next">
                <PaginationNext
                    onClick={() => setCurrentPage(Math.min(totalPages, page + 1))}
                    className={
                        page === totalPages
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                    }
                />
            </PaginationItem>
        );

        return items;
    };

    if (loading) {
        return (
            <Card className="w-full">
                <CardContent className="p-6">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-gray-500">Loading...</div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full bg-white">
            <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h2 className="text-lg font-semibold text-gray-900">Inventory Items</h2>
                    <div className="flex justify-between sm:flex-row gap-2">
                        <SearchBar
                            handleSearch={(query) =>
                                setFilters((prev) => ({ ...prev, search: query }))
                            }
                        />
                        <InventoryActionsBar
                            filters={filters}
                            setFilters={setFilters}
                            setCurrentPage={setCurrentPage}
                            data={data}
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50">
                                <TableHead className="w-12">
                                    <Checkbox
                                        checked={isAllSelected || false}
                                        onCheckedChange={toggleSelectAll}
                                        aria-label="Select all"
                                        className="items-center ml-3"
                                    />
                                </TableHead>
                                <TableHead
                                    className="cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort("productName")}
                                >
                                    <div className="flex items-center gap-1">
                                        Product Name
                                        <ChevronDown className="h-4 w-4" />
                                    </div>
                                </TableHead>
                                <TableHead
                                    className="cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort("category")}
                                >
                                    <div className="flex items-center gap-1">
                                        Category
                                        <ChevronDown className="h-4 w-4" />
                                    </div>
                                </TableHead>
                                <TableHead
                                    className="cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort("unitPrice")}
                                >
                                    <div className="flex items-center gap-1">
                                        Unit Price
                                        <ChevronDown className="h-4 w-4" />
                                    </div>
                                </TableHead>
                                <TableHead
                                    className="cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort("inStock")}
                                >
                                    <div className="flex items-center gap-1">
                                        In Stock
                                        <ChevronDown className="h-4 w-4" />
                                    </div>
                                </TableHead>
                                <TableHead
                                    className="cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort("discount")}
                                >
                                    <div className="flex items-center gap-1">
                                        Discount
                                        <ChevronDown className="h-4 w-4" />
                                    </div>
                                </TableHead>
                                <TableHead
                                    className="cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort("totalValue")}
                                >
                                    <div className="flex items-center gap-1">
                                        Total Value
                                        <ChevronDown className="h-4 w-4" />
                                    </div>
                                </TableHead>
                                <TableHead
                                    className="cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort("status")}
                                >
                                    <div className="flex items-center gap-1">
                                        Status
                                        <ChevronDown className="h-4 w-4" />
                                    </div>
                                </TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data?.data.map((item) => (
                                <TableRow key={item.id} className="hover:bg-gray-50">
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedItems.includes(item.id)}
                                            onCheckedChange={() => toggleSelectItem(item.id)}
                                            aria-label={`Select ${item.productName}`}
                                            className="items-center ml-3"
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={
                                                    item.image ||
                                                    "/placeholder.svg?height=40&width=40&query=product image"
                                                }
                                                alt={item.productName}
                                                className="w-10 h-10 rounded object-cover flex-shrink-0"
                                            />
                                            <div className="truncate max-w-[150px]">
                                                <span className="text-sm text-gray-900 truncate block">
                                                    {item.productName}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{item.category}</TableCell>
                                    <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                                    <TableCell>{item.inStock}</TableCell>
                                    <TableCell>{formatCurrency(item.discount)}</TableCell>
                                    <TableCell>{formatCurrency(item.totalValue)}</TableCell>
                                    <TableCell>
                                        <StatusBadge status={item.status} />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="sm">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>Items per page:</span>
                        <Select
                            value={itemsPerPage.toString()}
                            onValueChange={(value) => setItemsPerPage(Number(value))}
                        >
                            <SelectTrigger className="w-20">
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
                                ? `${(data.pagination.page - 1) * data.pagination.limit + 1}-${Math.min(
                                    data.pagination.page * data.pagination.limit,
                                    data.pagination.total
                                )} of ${data.pagination.total} items`
                                : ""}
                        </span>
                    </div>
                    <Pagination>
                        <PaginationContent>{renderPaginationItems()}</PaginationContent>
                    </Pagination>
                </div>
            </CardContent>
        </Card>
    );
}

function SearchBar({ handleSearch }: { handleSearch: (query: string) => void }) {
    return (
        <>
            <div className="sm:hidden">
                <Popover>
                    <PopoverTrigger>
                        <Button
                            size="icon"
                            variant="outline"
                            className="hover:bg-slate-200"
                            title="Search"
                        >
                            <Search className="h-4 w-4 text-gray-600" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-2">
                        <Input
                            placeholder="Search..."
                            className="w-full"
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </PopoverContent>
                </Popover>
            </div>
            <div className="hidden sm:block relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                    placeholder="Search..."
                    className="pl-10 w-full sm:w-64"
                    onChange={(e) => handleSearch(e.target.value)}
                />
            </div>
        </>
    );
}
