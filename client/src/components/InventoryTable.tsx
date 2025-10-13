// FILE: client\src\components\InventoryTable.tsx

"use client";

import { useState, useEffect } from "react";
import { Trash2, ChevronDown, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import axios from "axios";
import Cookies from "js-cookie";
import { BASE_URL } from "@/lib/api-config";
import InventorySearch from "./InventorySearch";


type Props = {
    // optional external signal to force refresh (incrementing number)
    refreshSignal?: number;
    // optional callback after successful delete
    onDeleteSuccess?: () => void;
    // optional callback when edit button is clicked
    onEdit?: (item: InventoryItem) => void;
    // optional callback to provide inventory items to parent
    onInventoryItemsUpdate?: (items: InventoryItem[]) => void;
};

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
    if (amount === null || amount === undefined || Number.isNaN(amount)) return "-";
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
    }).format(amount);
};

export default function InventoryTable({ refreshSignal, onDeleteSuccess, onEdit, onInventoryItemsUpdate }: Props) {
    const [data, setData] = useState<PaginatedResponse<InventoryItem> | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [filters, setFilters] = useState<InventoryFilters>({});
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [searchResults, setSearchResults] = useState<InventoryItem[]>([]);
    const [isSearchMode, setIsSearchMode] = useState(false);
    const token = Cookies.get("authToken") || "";

    // Use search results if in search mode, otherwise use regular data
    const displayData = isSearchMode ? searchResults : (data?.data || []);
    const isAllSelected = displayData && selectedItems.length === displayData.length && displayData.length > 0;

    // Debug logging
    console.log('🔍 Current state:', { isSearchMode, searchResultsLength: searchResults.length, displayDataLength: displayData.length });
    if (isSearchMode) {
        console.log('🔍 In search mode, displayData:', displayData);
    }

    const toggleSelectAll = () => {
        if (!displayData) return;
        if (isAllSelected) {
            setSelectedItems([]);
        } else {
            setSelectedItems(displayData.map((item) => item.id));
        }
    };

    const handleSearchResults = (results: InventoryItem[]) => {
        console.log('🔍 Received search results in InventoryTable:', results);
        console.log('🔍 Number of search results:', results.length);
        console.log('🔍 Sample search result:', results[0]);
        setSearchResults(results);
        setIsSearchMode(true);
        setSelectedItems([]);
    };

    const handleSearchClear = () => {
        setSearchResults([]);
        setIsSearchMode(false);
        setSelectedItems([]);
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

            const fullUrl = `${BASE_URL}/api/inventory/items?${params.toString()}`;
            console.log('🔍 Fetching inventory items from:', fullUrl);

            const res = await axios.get(fullUrl, {
                headers: {
                    Authorization: token ? `Bearer ${token}` : "",
                },
            });

            console.log('📦 Raw API response:', res.data);
            console.log('📦 Response status:', res.status);
            console.log('📦 Response headers:', res.headers);

            // Handle different response formats
            const responseData = res.data as any;
            let processedData: PaginatedResponse<InventoryItem>;

            if (responseData && typeof responseData === 'object') {
                if ('data' in responseData && 'pagination' in responseData) {
                    // Direct PaginatedResponse format
                    processedData = responseData;
                } else if ('success' in responseData && responseData.data) {
                    // Wrapped response format from backend
                    processedData = responseData.data;
                } else if (Array.isArray(responseData)) {
                    // Direct array response
                    processedData = {
                        data: responseData.map((item: any) => ({
                            id: item.id || item._id || Math.random().toString(),
                            productName: item.name || item.productName || item.product_name || 'Unknown Product',
                            category: item.category || 'Uncategorized',
                            unitPrice: Number(item.unitPrice || item.unit_price || item.price || 0),
                            inStock: Number(item.quantity || item.inStock || item.in_stock || 0),
                            discount: Number(item.defaultDiscount || item.discount || 0), // Use defaultDiscount from backend
                            totalValue: Number(item.unitPrice || item.unit_price || 0) * Number(item.quantity || item.inStock || item.in_stock || 0),
                            status: item.status || (Number(item.quantity || item.inStock || 0) > 0 ? 'In Stock' : 'Out of Stock'),
                            // Add new fields for enhanced display
                            defaultTaxRate: Number(item.defaultTaxRate || item.taxRate || 0),
                            hsnCode: item.hsnCode || '',
                            subCategory: item.subCategory || '',
                            brandName: item.brandName || '',
                            taxCategory: item.taxCategory || 'GOODS'
                        })),
                        pagination: {
                            page: currentPage,
                            limit: itemsPerPage,
                            total: responseData.length,
                            totalPages: Math.ceil(responseData.length / itemsPerPage)
                        }
                    };
                } else {
                    // Fallback: create empty response
                    processedData = {
                        data: [],
                        pagination: {
                            page: 1,
                            limit: 10,
                            total: 0,
                            totalPages: 0
                        }
                    };
                }
            } else {
                // Fallback: create empty response
                processedData = {
                    data: [],
                    pagination: {
                        page: 1,
                        limit: 10,
                        total: 0,
                        totalPages: 0
                    }
                };
            }

            console.log('✅ Processed inventory data:', processedData);
            setData(processedData);
            // reset selection when data changes
            setSelectedItems([]);
        } catch (error: any) {
            console.error("❌ Failed to fetch inventory items:", error);
            console.error("Error details:", error.response?.data);
            console.error("Error status:", error.response?.status);
            console.error("Error message:", error.message);
            // Set empty data on error to prevent crashes
            setData({
                data: [],
                pagination: {
                    page: 1,
                    limit: 10,
                    total: 0,
                    totalPages: 0
                }
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, itemsPerPage, filters, token]);

    // Listen to external refresh signal
    useEffect(() => {
        if (typeof refreshSignal !== "undefined") {
            fetchData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refreshSignal]);

    // Listen for inventory stock update events
    useEffect(() => {
        const handleStockUpdate = (event: CustomEvent) => {
            console.log('📦 Received inventory stock update event:', event.detail);
            // Refresh the inventory table to show updated stock
            fetchData();
        };

        window.addEventListener('inventory:stock-updated', handleStockUpdate as EventListener);
        
        return () => {
            window.removeEventListener('inventory:stock-updated', handleStockUpdate as EventListener);
        };
    }, []);

    // Notify parent component when inventory items are updated
    useEffect(() => {
        if (displayData && onInventoryItemsUpdate) {
            onInventoryItemsUpdate(displayData);
        }
    }, [displayData, onInventoryItemsUpdate]);

    const handleSort = (column: string) => {
        setFilters((prev) => ({
            ...prev,
            sortBy: column,
            sortOrder:
                prev.sortBy === column && prev.sortOrder === "asc" ? "desc" : "asc",
        }));
    };

    const deleteItem = async (id: string) => {
        if (!confirm("Are you sure you want to delete this item?")) return;
        try {
            setLoading(true);
            await axios.delete(`${BASE_URL}/api/inventory/items/${id}`, {
                headers: { Authorization: token ? `Bearer ${token}` : "" },
            });
            // refresh list
            await fetchData();
            if (onDeleteSuccess) onDeleteSuccess();
        } catch (err) {
            console.error("Delete failed", err);
            alert("Failed to delete item");
        } finally {
            setLoading(false);
        }
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
                        <InventorySearch
                            onSearchResults={handleSearchResults}
                            onSearchClear={handleSearchClear}
                            onLoadingChange={setLoading}
                        />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                                console.log('🧪 Testing API health first...');
                                try {
                                    const healthRes = await axios.get(`${BASE_URL}/api/inventory/health`);
                                    console.log('✅ API Health:', healthRes.data);
                                } catch (err) {
                                    console.log('❌ API Health failed:', err);
                                }
                                console.log('🔄 Fetching all inventory items...');
                                fetchData();
                            }}
                            disabled={loading}
                        >
                            {loading ? "Loading..." : "Test & Refresh"}
                        </Button>
                        <InventoryActionsBar
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
                            {displayData.map((item) => (
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
                                            {onEdit && (
                                                <Button variant="ghost" size="sm" onClick={() => onEdit(item)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <Button variant="ghost" size="sm" onClick={() => deleteItem(item.id)}>
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
                            {isSearchMode
                                ? `${displayData.length} search result${displayData.length !== 1 ? 's' : ''}`
                                : data
                                    ? `${(data.pagination.page - 1) * data.pagination.limit + 1}-${Math.min(
                                        data.pagination.page * data.pagination.limit,
                                        data.pagination.total
                                    )} of ${data.pagination.total} items`
                                    : ""
                            }
                        </span>
                    </div>
                    {!isSearchMode && (
                        <Pagination>
                            <PaginationContent>{renderPaginationItems()}</PaginationContent>
                        </Pagination>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

