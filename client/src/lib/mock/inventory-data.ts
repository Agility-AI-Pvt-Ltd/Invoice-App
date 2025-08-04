import type { InventoryItem, PaginatedResponse, InventoryFilters } from "@/types/inventory"

// Dummy data that simulates backend response
const allInventoryItems: InventoryItem[] = [
    {
        id: "1",
        productName: "iPhone 13 Pro",
        category: "Gadgets",
        unitPrice: 1225000.0,
        inStock: 8,
        discount: 0.0,
        totalValue: 9800000.0,
        status: "In Stock",
        image: "https://m.media-amazon.com/images/I/71fVoqRC0wL._SL1500_.jpg",
    },
    {
        id: "2",
        productName: "iPhone 12 Pro",
        category: "Gadgets",
        unitPrice: 975000.0,
        inStock: 12,
        discount: 0.0,
        totalValue: 11700000.0,
        status: "In Stock",
        image: "https://m.media-amazon.com/images/I/71cQWYVtcBL._SL1500_.jpg",
    },
    {
        id: "3",
        productName: "Polo T-Shirt",
        category: "Fashion",
        unitPrice: 125000.0,
        inStock: 120,
        discount: 0.0,
        totalValue: 15000000.0,
        status: "In Stock",
        image: "https://m.media-amazon.com/images/I/61u9zNveEHL._UL1440_.jpg",
    },
    {
        id: "4",
        productName: "Polo T-Shirt",
        category: "Fashion",
        unitPrice: 125000.0,
        inStock: 0,
        discount: 0.0,
        totalValue: 0.0,
        status: "Out of Stock",
        image: "https://m.media-amazon.com/images/I/61u9zNveEHL._UL1440_.jpg",
    },
    {
        id: "5",
        productName: "Polo T-Shirt",
        category: "Fashion",
        unitPrice: 125000.0,
        inStock: 0,
        discount: 0.0,
        totalValue: 0.0,
        status: "Out of Stock",
        image: "https://m.media-amazon.com/images/I/61u9zNveEHL._UL1440_.jpg",
    },
    {
        id: "6",
        productName: "iPhone 14 Pro",
        category: "Gadgets",
        unitPrice: 1425000.0,
        inStock: 8,
        discount: 0.0,
        totalValue: 11400000.0,
        status: "Low in Stock",
        image: "https://m.media-amazon.com/images/I/71d7rfSl0wL._SL1500_.jpg",
    },
    {
        id: "7",
        productName: "iPhone 12 Pro",
        category: "Gadgets",
        unitPrice: 975000.0,
        inStock: 12,
        discount: 0.0,
        totalValue: 11700000.0,
        status: "In Stock",
        image: "https://m.media-amazon.com/images/I/71cQWYVtcBL._SL1500_.jpg",
    },
    {
        id: "8",
        productName: "iPhone 13 Pro",
        category: "Gadgets",
        unitPrice: 1225000.0,
        inStock: 8,
        discount: 0.0,
        totalValue: 9800000.0,
        status: "Low in Stock",
        image: "https://m.media-amazon.com/images/I/71fVoqRC0wL._SL1500_.jpg",
    },
    {
        id: "9",
        productName: "iPhone 12 Pro",
        category: "Gadgets",
        unitPrice: 975000.0,
        inStock: 12,
        discount: 0.0,
        totalValue: 11700000.0,
        status: "In Stock",
        image: "https://m.media-amazon.com/images/I/71cQWYVtcBL._SL1500_.jpg",
    },
    {
        id: "10",
        productName: "Polo T-Shirt",
        category: "Fashion",
        unitPrice: 125000.0,
        inStock: 120,
        discount: 0.0,
        totalValue: 15000000.0,
        status: "In Stock",
        image: "https://m.media-amazon.com/images/I/61u9zNveEHL._UL1440_.jpg",
    },
]


// Simulate API call with pagination and filtering
export const getInventoryItems = async (
    page = 1,
    limit = 10,
    filters: InventoryFilters = {},
): Promise<PaginatedResponse<InventoryItem>> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 100))

    let filteredItems = [...allInventoryItems]

    // Apply search filter
    if (filters.search) {
        filteredItems = filteredItems.filter(
            (item) =>
                item.productName.toLowerCase().includes(filters.search!.toLowerCase()) ||
                item.category.toLowerCase().includes(filters.search!.toLowerCase()),
        )
    }

    // Apply category filter
    if (filters.category && filters.category !== "all") {
        filteredItems = filteredItems.filter((item) => item.category === filters.category)
    }

    // Apply status filter
    if (filters.status && filters.status !== "all") {
        filteredItems = filteredItems.filter((item) => item.status === filters.status)
    }

    // Apply sorting
    if (filters.sortBy) {
        filteredItems.sort((a, b) => {
            const aValue = a[filters.sortBy as keyof InventoryItem]
            const bValue = b[filters.sortBy as keyof InventoryItem]

            if (typeof aValue === "string" && typeof bValue === "string") {
                return filters.sortOrder === "desc" ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue)
            }

            if (typeof aValue === "number" && typeof bValue === "number") {
                return filters.sortOrder === "desc" ? bValue - aValue : aValue - bValue
            }

            return 0
        })
    }

    const total = filteredItems.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedItems = filteredItems.slice(startIndex, endIndex)

    return {
        data: paginatedItems,
        pagination: {
            page,
            limit,
            total,
            totalPages,
        },
    }
}
