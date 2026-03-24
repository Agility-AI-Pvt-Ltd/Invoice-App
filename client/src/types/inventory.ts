// Legacy inventory interface (frontend only)
export interface InventoryItem {
    id: string
    productName: string
    category: string
    unitPrice: number
    inStock: number
    discount: number
    totalValue: number
    status: "In Stock" | "Out of Stock" | "Low in Stock"
    // Enhanced fields from backend
    defaultTaxRate?: number
    hsnCode?: string
    subCategory?: string
    brandName?: string
    taxCategory?: 'GOODS' | 'SERVICES'
}

// Complete Inventory interface matching backend /api/inventory response (11 fields)
export interface InventoryProduct {
    // Primary ID
    id: number;
    
    // Product Info (4 fields)
    name: string;
    description?: string;
    sku?: string;
    category?: string;
    
    // Pricing & Stock (2 fields)
    unitPrice: number;
    quantity: number;
    
    // Tax & Compliance (4 fields)
    hsnCode?: string; // For goods
    sacCode?: string; // For services
    defaultTaxRate?: number; // GST rate
    taxCategory?: 'GOODS' | 'SERVICES';
    
    // Status
    isActive?: boolean;
    
    // Metadata
    createdAt?: string;
    updatedAt?: string;
}

// Service interface matching backend /api/services response (8 fields)
export interface ServiceItem {
    // Primary ID
    id: number;
    
    // Service Info (5 fields)
    name: string;
    description?: string;
    serviceCode?: string;
    category?: string;
    duration?: string; // e.g., "1 hour"
    
    // Pricing
    unitPrice: number;
    
    // Status
    isActive?: boolean;
    
    // Metadata
    createdAt?: string;
    updatedAt?: string;
}

export interface PaginatedResponse<T> {
    data: T[]
    pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
    }
}

export interface InventoryFilters {
    search?: string
    category?: string
    status?: string
    sortBy?: string
    sortOrder?: "asc" | "desc"
}
