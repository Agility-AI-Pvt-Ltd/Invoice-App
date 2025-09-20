import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "../ui/Input";
import axios from "axios";
import Cookies from "js-cookie";
import { BASE_URL } from "@/lib/api-config";

interface FormSectionProps {
    title: string;
    children: React.ReactNode;
}

function FormSection({ title, children }: FormSectionProps) {
    return (
        <div className="border border-gray-200 rounded-lg mb-6">
            {/* Heading Area with BG */}
            <div className="flex justify-between items-center px-6 py-3 bg-[#F4F0FF] rounded-t-lg">
                <h2 className="text-base font-semibold text-gray-800">{title}</h2>
                <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
                    {/* <span className="sr-only">Add new section</span> */}
                </Button>
            </div>

            {/* Body */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {children}
            </div>
        </div>
    );
}

/**
 * Props:
 * - initial: optional object to prefill form for edit (may contain id or _id and existing fields)
 * - onSuccess: callback when save/create succeeds (frontend should refresh list/summary)
 * - onClose: optional callback to close modal / drawer after success
 *
 * NOTE: UI markup is unchanged; only logic/control added.
 */
type Props = {
    initial?: any;
    onSuccess?: () => void;
    onClose?: () => void;
};

export default function AddServiceForm({ initial = null, onSuccess, onClose }: Props) {
    // Form state (mapped from the existing inputs)
    const [serviceName, setServiceName] = useState<string>(initial?.serviceName || initial?.productName || "");
    const [serviceCode, setServiceCode] = useState<string>(initial?.serviceCode || initial?.productSKU || "");
    const [category, setCategory] = useState<string>(initial?.category || "");
    const [subCategory, setSubCategory] = useState<string>(initial?.subCategory || "");
    const [brandName, setBrandName] = useState<string>(initial?.brandName || "");
    const [description, setDescription] = useState<string>(initial?.description || "");

    const [purchasePrice, setPurchasePrice] = useState<string | number>(initial?.purchasePrice ?? "");
    const [sellingPrice, setSellingPrice] = useState<string | number>(initial?.sellingPrice ?? "");
    const [discount, setDiscount] = useState<string | number>(initial?.discount ?? "");
    const [taxRate, setTaxRate] = useState<string | number>(initial?.taxRate ?? "");

    // Supplier/vendor
    const [vendorName, setVendorName] = useState<string>(initial?.vendorName || "");
    const [vendorServiceCode, setVendorServiceCode] = useState<string>(initial?.vendorServiceCode || initial?.vendorProductCode || "");

    // Images/attachments
    // serviceImage will hold base64 dataURL (if file chosen) or a URL/string if provided by initial
    const [serviceImage, setServiceImage] = useState<string>(initial?.serviceImage || initial?.productImage || "");

    const [remark, setRemark] = useState<string>(initial?.remark || "");
    const [duration, setDuration] = useState<string>(initial?.duration ? String(initial.duration) : "1");

    // UI state
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);


    const API_URL = `${BASE_URL}/api`;

    useEffect(() => {
        // If initial changes after mount, populate fields
        if (initial) {
            setServiceName(initial.serviceName || initial.productName || initial.product_name || "");
            setServiceCode(initial.serviceCode || initial.productSKU || initial.sku || "");
            setCategory(initial.category || "");
            setSubCategory(initial.subCategory || "");
            setBrandName(initial.brandName || "");
            setDescription(initial.description || "");
            setPurchasePrice(initial.purchasePrice ?? initial.purchase_price ?? "");
            setSellingPrice(initial.sellingPrice ?? initial.selling_price ?? "");
            setDiscount(initial.discount ?? 0);
            setTaxRate(initial.taxRate ?? "");
            setVendorName(initial.vendorName || "");
            setVendorServiceCode(initial.vendorServiceCode || initial.vendorProductCode || "");
            setServiceImage(initial.serviceImage || initial.productImage || initial.image || "");
            setRemark(initial.remark || initial.note || "");
            setDuration(initial.duration ? String(initial.duration) : "1");
            setError(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initial]);

    // Helper: pick unitPrice: prefer sellingPrice, else purchasePrice, else 0
    const resolveUnitPrice = (): number => {
        const sp = typeof sellingPrice === "string" ? sellingPrice.trim() : sellingPrice;
        const pp = typeof purchasePrice === "string" ? purchasePrice.trim() : purchasePrice;
        const parsedSp = sp !== "" && sp !== null && sp !== undefined ? Number(sp) : NaN;
        const parsedPp = pp !== "" && pp !== null && pp !== undefined ? Number(pp) : NaN;
        if (!isNaN(parsedSp) && parsedSp > 0) return parsedSp;
        if (!isNaN(parsedPp) && parsedPp > 0) return parsedPp;
        return 0;
    };

    const handleSave = async (asDraft = false) => {
        setError(null);
        setLoading(true);

        try {
            // Validate required fields
            if (!serviceName.trim()) {
                setError("Service name is required");
                setLoading(false);
                return;
            }
            if (!serviceCode.trim()) {
                setError("Service code/SKU is required");
                setLoading(false);
                return;
            }
            if (!category.trim()) {
                setError("Category is required");
                setLoading(false);
                return;
            }
            if (resolveUnitPrice() <= 0) {
                setError("Selling price or purchase price is required and must be greater than 0");
                setLoading(false);
                return;
            }

            const token = Cookies.get("authToken") || "";
            // Build payload with expected Service model fields
            const payload: any = {
                // Core Service model fields
                name: serviceName || "Untitled Service",
                description: description || "",
                serviceCode: serviceCode || `SVC-${Date.now()}`,
                unitPrice: resolveUnitPrice() || 0,
                category: category || "Service",
                duration: duration || "1",

                // Additional optional fields that might be supported
                subCategory: subCategory || undefined,
                brandName: brandName || undefined,
                discount: discount !== "" && discount !== null && discount !== undefined ? Number(discount) : 0,
                taxRate: taxRate !== "" && taxRate !== null && taxRate !== undefined ? Number(taxRate) : 0,
                image: serviceImage || undefined,
                vendor: vendorName || undefined,
                vendorProductCode: vendorServiceCode || undefined,
                note: remark || undefined,
            };

            // Get item ID for edit mode
            const itemId = initial?.id || initial?._id || null;

            console.log("Saving service with payload:", payload);
            console.log("Using API endpoint:", itemId ? `${API_URL}/services/items/${itemId}` : `${API_URL}/services/items`);
            console.log("Payload JSON string:", JSON.stringify(payload, null, 2));

            // Optionally include a status field for draft (backend can ignore if not supported)
            if (asDraft) payload.status = "draft";

            // If this is edit mode (initial provided), call PUT
            if (itemId) {
                await axios.put(`${API_URL}/services/items/${itemId}`, payload, {
                    headers: {
                        Authorization: token ? `Bearer ${token}` : "",
                        "Content-Type": "application/json",
                    },
                    withCredentials: true,
                });
                onSuccess?.();
                onClose?.();
                setLoading(false);
                return;
            }

            // Create new service via POST
            const res = await axios.post(`${API_URL}/services/items`, payload, {
                headers: {
                    Authorization: token ? `Bearer ${token}` : "",
                    "Content-Type": "application/json",
                },
                withCredentials: true,
            });

            if (res?.data?.success) {
                onSuccess?.();
                onClose?.();
            } else {
                setError(res?.data?.message || "Unexpected server response");
            }
        } catch (err: any) {
            console.error("Save service error:", err);
            console.error("Error response data:", err?.response?.data);
            console.error("Error response status:", err?.response?.status);
            console.error("Error response headers:", err?.response?.headers);
            console.error("Full error object:", err);

            const msg =
                err?.response?.data?.detail ||
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                err?.message ||
                "Failed to save service";
            setError(`Server Error (${err?.response?.status || 'Unknown'}): ${msg}`);
        } finally {
            setLoading(false);
        }
    };


    const handleCancel = () => {
        onClose?.();
    };

    // Attach handlers to UI inputs while leaving markup intact
    return (
        <div className="min-h-screen bg-white p-6 md:p-10 overflow-y-auto">
            <div className=" mx-auto">
                {/* Service Details Section */}
                <FormSection title="Service Details">
                    <div className="grid gap-2">
                        <Label htmlFor="service-name">Service Name *</Label>
                        <Input id="service-name" value={serviceName} onChange={(e: any) => setServiceName(e.target.value)} placeholder="Enter service name" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="service-code">Service Code/SKU *</Label>
                        <Input id="service-code" value={serviceCode} onChange={(e: any) => setServiceCode(e.target.value)} placeholder="Enter service code" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="category">Category *</Label>
                        <Input id="category" value={category} onChange={(e: any) => setCategory(e.target.value)} placeholder="Enter category" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="sub-category">Sub Category</Label>
                        <Input id="sub-category" value={subCategory} onChange={(e: any) => setSubCategory(e.target.value)} placeholder="Enter sub category" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="brand-name">Brand Name</Label>
                        <Input id="brand-name" value={brandName} onChange={(e: any) => setBrandName(e.target.value)} placeholder="Enter brand name" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Input id="description" value={description} onChange={(e: any) => setDescription(e.target.value)} placeholder="Enter description" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                        <Input id="tax-rate" type="number" value={taxRate as any} onChange={(e: any) => setTaxRate(e.target.value)} placeholder="Enter tax rate" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="duration">Duration (hours)</Label>
                        <Input id="duration" type="number" value={duration} onChange={(e: any) => setDuration(e.target.value)} placeholder="Enter duration in hours" />
                    </div>
                </FormSection>

                {/* Pricing Section */}
                <FormSection title="Pricing Details">
                    <div className="grid gap-2">
                        <Label htmlFor="purchase-price">Purchase Price</Label>
                        <Input id="purchase-price" type="number" value={purchasePrice} onChange={(e: any) => setPurchasePrice(e.target.value)} placeholder="Enter purchase price" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="selling-price">Selling Price *</Label>
                        <Input id="selling-price" type="number" value={sellingPrice} onChange={(e: any) => setSellingPrice(e.target.value)} placeholder="Enter selling price" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="discount">Discount (%)</Label>
                        <Input id="discount" type="number" value={discount} onChange={(e: any) => setDiscount(e.target.value)} placeholder="Enter discount percentage" />
                    </div>
                </FormSection>

                {/* Vendor Details Section */}
                <FormSection title="Vendor Details">
                    <div className="grid gap-2">
                        <Label htmlFor="vendor-name">Vendor Name</Label>
                        <Input id="vendor-name" value={vendorName} onChange={(e: any) => setVendorName(e.target.value)} placeholder="Enter vendor name" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="vendor-service-code">Vendor Service Code</Label>
                        <Input id="vendor-service-code" value={vendorServiceCode} onChange={(e: any) => setVendorServiceCode(e.target.value)} placeholder="Enter vendor service code" />
                    </div>
                </FormSection>

                {/* Additional Details Section */}
                <FormSection title="Additional Details">
                    <div className="grid gap-2">
                        <Label htmlFor="remark">Remarks/Notes</Label>
                        <Input id="remark" value={remark} onChange={(e: any) => setRemark(e.target.value)} placeholder="Enter any additional notes" />
                    </div>
                </FormSection>

                {/* Error message */}
                {error && <div className="text-sm text-red-600 mb-4">{error}</div>}

                {/* Action Buttons */}
                <div className="flex justify-end items-center gap-4 mt-8">
                    <Button
                        variant="outline"
                        className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-2 rounded-md hover:text-black"
                        onClick={handleCancel}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        className="bg-gradient-to-b from-[#B5A3FF] via-[#785FDA] to-[#9F91D8] hover:opacity-90 text-white px-8 py-2 rounded-md"
                        onClick={() => handleSave(false)}
                        disabled={loading}
                    >
                        {loading ? "Saving..." : "Save"}
                    </Button>
                </div>
            </div>
        </div>
    );
}