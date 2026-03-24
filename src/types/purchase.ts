export interface SummaryCardData {
    title: string
    value: number
    percentageChange: number
    isPositive: boolean
    unit?: string // e.g., "₹"
    extraInfo?: {
        label: string
        value: number
        progressBar?: {
            current: number
            total: number
        }
    }
    borderColor?: string // Tailwind border color class
}

export interface PurchaseItem {
    id: string
    purchaseId: string
    supplierName: string
    supplierAvatar: string
    product: string
    quantity: number
    balance: number
    purchaseDate: string
    totalAmount: number
    paymentStatus: "Paid" | "Overdue (14d)" | "Unpaid"
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

export interface PurchaseTableFilters {
    search?: string
    dateRange?: { from: Date; to: Date }
    sortBy?: string
    sortOrder?: "asc" | "desc"
}
