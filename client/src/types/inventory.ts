export interface InventoryItem {
    id: string
    productName: string
    category: string
    unitPrice: number
    inStock: number
    discount: number
    totalValue: number
    status: "In Stock" | "Out of Stock" | "Low in Stock"
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
