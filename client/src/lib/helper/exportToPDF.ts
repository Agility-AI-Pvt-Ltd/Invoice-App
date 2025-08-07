import type { InventoryItem } from "@/types/inventory"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export const exportToPDF = (data: InventoryItem[]) => {
    const doc = new jsPDF()
    const tableData = data.map(item => [
        item.productName,
        item.category,
        item.unitPrice,
        item.inStock,
        item.discount,
        item.totalValue,
        item.status,
    ])

    autoTable(doc, {
        head: [["Product Name", "Category", "Unit Price", "In Stock", "Discount", "Total Value", "Status"]],
        body: tableData,
    })

    doc.save("inventory_data.pdf")
}
