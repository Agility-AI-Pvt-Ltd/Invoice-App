import api from "@/lib/api";

export const INVENTORY_API = {
    ITEMS: `/api/inventory/items`,
    SUMMARY: `/api/inventory/summary`,
    EXPORT: `/api/inventory/export`,
    IMPORT: `/api/inventory/import`,
    CATEGORIES: `/api/inventory/categories`,
};

// Types
export interface InventorySegment {
    label: string;
    value: number;
    color: string;
}

export interface InventoryStockDistribution {
    count: number;
    percentage: number;
    segments: InventorySegment[];
}

export interface InventorySummary {
    success: boolean;
    data: {
        totals: {
            allProducts: number;
            activeProducts: number;
            totalInventoryValue: number;
        };
        stockDistribution: {
            inStock: InventoryStockDistribution;
            outOfStock: InventoryStockDistribution;
            lowStock: InventoryStockDistribution;
        };
    };
}

/**
 * Fetch inventory summary
 */
export const getInventorySummary = async (): Promise<InventorySummary> => {
    try {
        const response = await api.get(`${INVENTORY_API.SUMMARY}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching inventory summary:', error);
        throw error;
    }
};




// Types
export interface InventoryItem {
    id: string;
    name: string;
    category?: string;
    description?: string;
    inStock: number;
    discount?: number;
    unit_price: number;
    hsn_code?: string;
    gst_rate?: number;
    user_id: string;
    inProgress?: boolean;
}

export interface InventoryPagination {
    total: number;
    perPage: number;
    currentPage: number;
    totalPages: number;
}

export interface InventoryItemsResponse {
    items: InventoryItem[];
    pagination: InventoryPagination;
}

export interface InventoryFilters {
    search?: string;
    category?: string;
    status?: "inStock" | "lowStock" | "outOfStock";
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

/**
 * Fetch inventory items
 * @param page Page number
 * @param limit Items per page
 * @param filters Optional filters
 */
export const getInventoryItems = async (
    page: number = 1,
    limit: number = 10,
    filters: InventoryFilters = {}
): Promise<InventoryItemsResponse> => {
    try {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...(filters.search ? { search: filters.search } : {}),
            ...(filters.category ? { category: filters.category } : {}),
            ...(filters.status ? { status: filters.status } : {}),
            ...(filters.sortBy ? { sortBy: filters.sortBy } : {}),
            ...(filters.sortOrder ? { sortOrder: filters.sortOrder } : {}),
        });

        const response = await api.get(
            `${INVENTORY_API.ITEMS}?${params.toString()}`
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching inventory items:", error);
        throw error;
    }
};
