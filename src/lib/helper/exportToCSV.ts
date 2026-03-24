import type { InventoryItem } from "@/types/inventory"

export const exportToCSV = (data: InventoryItem[]) => {
    const headers = ["Product Name", "Category", "Unit Price", "In Stock", "Discount", "Total Value", "Status"]
    const rows = data.map(item => [
        item.productName,
        item.category,
        item.unitPrice,
        item.inStock,
        item.discount,
        item.totalValue,
        item.status,
    ])

    const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers, ...rows].map(row => row.join(",")).join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "inventory_data.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}
