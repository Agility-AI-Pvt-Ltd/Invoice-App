// FILE: client\src\pages\inventory.tsx

import InventorySummary from "@/components/InventorySummary"
import InventoryTable from "@/components/InventoryTable"
import AddProductForm from "@/components/product-form/productForm";
import AddServiceForm from "@/components/service-form/service-form";
import { NavbarButton } from "@/components/ui/resizable-navbar"
import { useState } from "react";

const Inventory = () => {
    // Controls whether the product form page/view is shown (same as original behavior)
    const [showAddProductForm, setShowAddProductForm] = useState(false);
    const [showAddServiceForm, setShowAddServiceForm] = useState(false);

    // New: a simple refresh signal (increment to force child re-fetch)
    const [refreshSignal, setRefreshSignal] = useState(0);

    // New: store item when editing so we can pass as `initial` to AddProductForm
    const [editingItem, setEditingItem] = useState<any | null>(null);
    const [editingServiceItem, setEditingServiceItem] = useState<any | null>(null);



    // Called when product created/updated or when table delete successful — triggers children to refresh
    const triggerRefresh = () => setRefreshSignal(s => s + 1);

    // Open add form (clear editing state)
    const openAddForm = () => {
        setEditingItem(null);
        setShowAddProductForm(true);
    };

    // Open edit form with initial data (called by InventoryTable.onEdit)
    const openEditForm = (item: any) => {
        setEditingItem(item);
        setShowAddProductForm(true);
    };

    // Called after product form saves successfully
    const handleProductSaved = () => {
        setShowAddProductForm(false);
        setEditingItem(null);
        triggerRefresh();
    };

    // Called if form closed without saving
    const handleFormClose = () => {
        setShowAddProductForm(false);
        setEditingItem(null);
    };

    // Called when InventoryTable reports a successful delete
    const handleDeleteSuccess = () => {
        triggerRefresh();
    };


    // Add these new handler functions
    const openAddServiceForm = () => {
        setEditingServiceItem(null);
        setShowAddServiceForm(true);
    };

    //@ts-ignore
    const openEditServiceForm = (item: any) => {
        setEditingServiceItem(item);
        setShowAddServiceForm(true);
    };

    const handleServiceSaved = () => {
        setShowAddServiceForm(false);
        setEditingServiceItem(null);
        triggerRefresh();
    };

    const handleServiceFormClose = () => {
        setShowAddServiceForm(false);
        setEditingServiceItem(null);
    };

    if (showAddProductForm) {
        return <div className="w-full h-full">
            {/* Pass initial (for edit), onSuccess (to refresh + close) and onClose (to just close) */}
            <AddProductForm initial={editingItem} onSuccess={handleProductSaved} onClose={handleFormClose} />
        </div>
    }
    if (showAddServiceForm) {
        return <div className="w-full h-full">
            <AddServiceForm initial={editingServiceItem} onSuccess={handleServiceSaved} onClose={handleServiceFormClose} />
        </div>
    }
    return (
        <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <span className="text-lg sm:text-xl font-bold text-gray-800">
                    Items Summary
                </span>

                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <NavbarButton className="w-full sm:w-auto bg-gradient-to-b from-[#B5A3FF] via-[#785FDA] to-[#9F91D8] text-white px-4 py-2 rounded-lg"
                        onClick={openAddServiceForm}  // Change from setShowAddServiceForm(true)
                    >
                        Add Service
                    </NavbarButton>
                    <NavbarButton
                        className="w-full sm:w-auto bg-gradient-to-b from-[#B5A3FF] via-[#785FDA] to-[#9F91D8] text-white px-4 py-2 rounded-lg"
                        onClick={openAddForm}
                    >
                        Add Products
                    </NavbarButton>
                </div>
            </div>

            <InventorySummary refreshSignal={refreshSignal} />

            <InventoryTable
                refreshSignal={refreshSignal}
                onEdit={openEditForm}
                onDeleteSuccess={handleDeleteSuccess}
            />
        </div>
    );

}

export default Inventory
