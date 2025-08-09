import type { InventoryItem } from "@/types/inventory"
import * as XLSX from "xlsx"

export const exportToExcel = (data: InventoryItem[]) => {
  const worksheetData = data.map(item => ({
    "Product Name": item.productName,
    Category: item.category,
    "Unit Price": item.unitPrice,
    "In Stock": item.inStock,
    Discount: item.discount,
    "Total Value": item.totalValue,
    Status: item.status,
  }))
  const worksheet = XLSX.utils.json_to_sheet(worksheetData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory")
  XLSX.writeFile(workbook, "inventory_data.xlsx")
}
