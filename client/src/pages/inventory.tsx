import InventorySummary from "@/components/InventorySummary"
import InventoryTable from "@/components/InventoryTable"
import { NavbarButton } from "@/components/ui/resizable-navbar"

const Inventory = () => {
    return (
        <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <span className="text-lg sm:text-xl font-bold text-gray-800">
                    Inventory Summary
                </span>
                {/* TODO : phone responsive */}
                <NavbarButton className="w-full sm:w-auto bg-gradient-to-b from-[#B5A3FF] via-[#785FDA] to-[#9F91D8] text-white px-4 py-2 rounded-lg">
                    Add Products
                </NavbarButton>
            </div>
            <InventorySummary />
            <InventoryTable />
        </div>
    )
}

export default Inventory
