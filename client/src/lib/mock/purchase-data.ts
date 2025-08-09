import type { SummaryCardData, PurchaseItem, PaginatedResponse, PurchaseTableFilters } from "@/types/purchase"

// Dummy data for summary cards
export const getSummaryCardsData = (): SummaryCardData[] => [
  {
    title: "Total Purchase",
    value: 23345,
    percentageChange: 3.46,
    isPositive: true,
    unit: "₹",
    borderColor: "border-blue-500",
  },
  {
    title: "Current Month Purchase",
    value: 23345,
    percentageChange: 3.46,
    isPositive: false,
    unit: "₹",
  },
  {
    title: "Total Purchase Orders",
    value: 150,
    percentageChange: 3.46,
    isPositive: true,
    extraInfo: {
      label: "This Month Orders",
      value: 50,
      progressBar: {
        current: 50,
        total: 150,
      },
    },
  },
]

// Dummy data for purchase items
const allPurchaseItems: PurchaseItem[] = [
  {
    id: "1",
    purchaseId: "PUR-2024/001",
    supplierName: "Supplier Name",
    supplierAvatar: "/placeholder.svg?height=32&width=32",
    product: "Product 1",
    quantity: 1000,
    balance: 2000,
    purchaseDate: "29 July 2024",
    totalAmount: 5000,
    paymentStatus: "Paid",
  },
  {
    id: "2",
    purchaseId: "PUR-2024/001",
    supplierName: "Supplier Name",
    supplierAvatar: "/placeholder.svg?height=32&width=32",
    product: "Product 1",
    quantity: 12000,
    balance: 2000,
    purchaseDate: "29 July 2024",
    totalAmount: 5000,
    paymentStatus: "Paid",
  },
  {
    id: "3",
    purchaseId: "PUR-2024/001",
    supplierName: "Supplier Name",
    supplierAvatar: "/placeholder.svg?height=32&width=32",
    product: "Product 1",
    quantity: 12000,
    balance: 2000,
    purchaseDate: "29 July 2024",
    totalAmount: 5000,
    paymentStatus: "Overdue (14d)",
  },
  {
    id: "4",
    purchaseId: "PUR-2024/001",
    supplierName: "Supplier Name",
    supplierAvatar: "/placeholder.svg?height=32&width=32",
    product: "Product 1",
    quantity: 12000,
    balance: 2000,
    purchaseDate: "29 July 2024",
    totalAmount: 5000,
    paymentStatus: "Paid",
  },
  {
    id: "5",
    purchaseId: "PUR-2024/001",
    supplierName: "Supplier Name",
    supplierAvatar: "/placeholder.svg?height=32&width=32",
    product: "Product 1",
    quantity: 12000,
    balance: 2000,
    purchaseDate: "29 July 2024",
    totalAmount: 5000,
    paymentStatus: "Paid",
  },
  {
    id: "6",
    purchaseId: "PUR-2024/001",
    supplierName: "Supplier Name",
    supplierAvatar: "/placeholder.svg?height=32&width=32",
    product: "Product 1",
    quantity: 12000,
    balance: 2000,
    purchaseDate: "29 July 2024",
    totalAmount: 5000,
    paymentStatus: "Paid",
  },
  {
    id: "7",
    purchaseId: "PUR-2024/001",
    supplierName: "Supplier Name",
    supplierAvatar: "/placeholder.svg?height=32&width=32",
    product: "Product 1",
    quantity: 12000,
    balance: 2000,
    purchaseDate: "29 July 2024",
    totalAmount: 5000,
    paymentStatus: "Unpaid",
  },
  {
    id: "8",
    purchaseId: "PUR-2024/001",
    supplierName: "Supplier Name",
    supplierAvatar: "/placeholder.svg?height=32&width=32",
    product: "Product 1",
    quantity: 12000,
    balance: 2000,
    purchaseDate: "29 July 2024",
    totalAmount: 5000,
    paymentStatus: "Paid",
  },
  {
    id: "9",
    purchaseId: "PUR-2024/001",
    supplierName: "Supplier Name",
    supplierAvatar: "/placeholder.svg?height=32&width=32",
    product: "Product 1",
    quantity: 12000,
    balance: 2000,
    purchaseDate: "29 July 2024",
    totalAmount: 5000,
    paymentStatus: "Paid",
  },
  {
    id: "10",
    purchaseId: "PUR-2024/001",
    supplierName: "Supplier Name",
    supplierAvatar: "/placeholder.svg?height=32&width=32",
    product: "Product 1",
    quantity: 12000,
    balance: 2000,
    purchaseDate: "29 July 2024",
    totalAmount: 5000,
    paymentStatus: "Overdue (14d)",
  },
  {
    id: "11",
    purchaseId: "PUR-2024/002",
    supplierName: "Supplier Name",
    supplierAvatar: "/placeholder.svg?height=32&width=32",
    product: "Product 2",
    quantity: 500,
    balance: 1000,
    purchaseDate: "28 July 2024",
    totalAmount: 2500,
    paymentStatus: "Paid",
  },
  {
    id: "12",
    purchaseId: "PUR-2024/003",
    supplierName: "Supplier Name",
    supplierAvatar: "/placeholder.svg?height=32&width=32",
    product: "Product 3",
    quantity: 200,
    balance: 500,
    purchaseDate: "27 July 2024",
    totalAmount: 1000,
    paymentStatus: "Unpaid",
  },
  {
    id: "13",
    purchaseId: "PUR-2024/004",
    supplierName: "Supplier Name",
    supplierAvatar: "/placeholder.svg?height=32&width=32",
    product: "Product 4",
    quantity: 1500,
    balance: 3000,
    purchaseDate: "26 July 2024",
    totalAmount: 7500,
    paymentStatus: "Paid",
  },
  {
    id: "14",
    purchaseId: "PUR-2024/005",
    supplierName: "Supplier Name",
    supplierAvatar: "/placeholder.svg?height=32&width=32",
    product: "Product 5",
    quantity: 700,
    balance: 1500,
    purchaseDate: "25 July 2024",
    totalAmount: 4000,
    paymentStatus: "Overdue (14d)",
  },
  {
    id: "15",
    purchaseId: "PUR-2024/006",
    supplierName: "Supplier Name",
    supplierAvatar: "/placeholder.svg?height=32&width=32",
    product: "Product 6",
    quantity: 300,
    balance: 800,
    purchaseDate: "24 July 2024",
    totalAmount: 1800,
    paymentStatus: "Paid",
  },
  {
    id: "16",
    purchaseId: "PUR-2024/007",
    supplierName: "Supplier Name",
    supplierAvatar: "/placeholder.svg?height=32&width=32",
    product: "Product 7",
    quantity: 900,
    balance: 1800,
    purchaseDate: "23 July 2024",
    totalAmount: 4500,
    paymentStatus: "Paid",
  },
  {
    id: "17",
    purchaseId: "PUR-2024/008",
    supplierName: "Supplier Name",
    supplierAvatar: "/placeholder.svg?height=32&width=32",
    product: "Product 8",
    quantity: 400,
    balance: 900,
    purchaseDate: "22 July 2024",
    totalAmount: 2200,
    paymentStatus: "Unpaid",
  },
  {
    id: "18",
    purchaseId: "PUR-2024/009",
    supplierName: "Supplier Name",
    supplierAvatar: "/placeholder.svg?height=32&width=32",
    product: "Product 9",
    quantity: 1100,
    balance: 2200,
    purchaseDate: "21 July 2024",
    totalAmount: 5500,
    paymentStatus: "Paid",
  },
  {
    id: "19",
    purchaseId: "PUR-2024/010",
    supplierName: "Supplier Name",
    supplierAvatar: "/placeholder.svg?height=32&width=32",
    product: "Product 10",
    quantity: 600,
    balance: 1300,
    purchaseDate: "20 July 2024",
    totalAmount: 3200,
    paymentStatus: "Overdue (14d)",
  },
  {
    id: "20",
    purchaseId: "PUR-2024/011",
    supplierName: "Supplier Name",
    supplierAvatar: "/placeholder.svg?height=32&width=32",
    product: "Product 11",
    quantity: 800,
    balance: 1700,
    purchaseDate: "19 July 2024",
    totalAmount: 4200,
    paymentStatus: "Paid",
  },
]

// Simulate API call with pagination and filtering
export const getPurchaseItems = async (
  page = 1,
  limit = 10,
  filters: PurchaseTableFilters = {},
): Promise<PaginatedResponse<PurchaseItem>> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  let filteredItems = [...allPurchaseItems]

  // Apply search filter
  if (filters.search) {
    filteredItems = filteredItems.filter(
      (item) =>
        item.purchaseId.toLowerCase().includes(filters.search!.toLowerCase()) ||
        item.supplierName.toLowerCase().includes(filters.search!.toLowerCase()) ||
        item.product.toLowerCase().includes(filters.search!.toLowerCase()),
    )
  }

  // Apply sorting
  if (filters.sortBy) {
    filteredItems.sort((a, b) => {
      const aValue = a[filters.sortBy as keyof PurchaseItem]
      const bValue = b[filters.sortBy as keyof PurchaseItem]

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
