import api from "@/lib/api";
import type { InventoryProduct, ServiceItem } from "@/types/inventory";

export const INVENTORY_API = {
    ITEMS: `/api/inventory/items`,
    SUMMARY: `/api/inventory/summary`,
    EXPORT: `/api/inventory/export`,
    IMPORT: `/api/inventory/import`,
    CATEGORIES: `/api/inventory/categories`,
    // Backend routes for auto-fill
    GET_ALL: `/api/inventory`, // GET all inventory items
    GET_BY_ID: `/api/inventory`, // GET /api/inventory/:id
    SERVICES: `/api/services`, // GET all services
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

// ========== NEW BACKEND AUTO-FILL ROUTES ==========

/**
 * Get all inventory products (for invoice line item auto-fill)
 * Backend: GET /api/inventory
 * Returns: Complete product data with HSN, tax rates, pricing
 */
export const getAllInventoryProducts = async (
    page: number = 1,
    limit: number = 100
): Promise<{ success: boolean; data: InventoryProduct[] }> => {
    try {
        console.log('🔍 Fetching all inventory products for auto-fill');
        const response = await api.get(INVENTORY_API.GET_ALL, {
            params: { page, limit }
        });
        console.log('✅ Inventory products received:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Error fetching inventory products:', error);
        throw error;
    }
};

/**
 * Get single inventory product by ID (for edit form auto-fill)
 * Backend: GET /api/inventory/:id
 * Returns: Complete product with all 11 fields (name, sku, HSN, tax, price, etc.)
 */
export const getInventoryProductById = async (id: number): Promise<InventoryProduct> => {
    try {
        console.log(`🔍 Fetching inventory product ID: ${id}`);
        const response = await api.get(`${INVENTORY_API.GET_BY_ID}/${id}`);
        const product = response.data.data || response.data;
        console.log('✅ Inventory product received:', product);
        return product as InventoryProduct;
    } catch (error) {
        console.error('❌ Error fetching inventory product:', error);
        throw error;
    }
};

/**
 * Get all services (for invoice line item auto-fill)
 * Backend: GET /api/services
 * Returns: Complete service data with SAC codes, pricing, duration
 */
export const getAllServices = async (): Promise<{ success: boolean; data: ServiceItem[] }> => {
    try {
        console.log('🔍 Fetching all services for auto-fill');
        const response = await api.get(INVENTORY_API.SERVICES);
        console.log('✅ Services received:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Error fetching services:', error);
        throw error;
    }
};
