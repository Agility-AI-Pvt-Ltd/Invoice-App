import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "../ui/Input";
import axios from "axios";
import Cookies from "js-cookie";
import { getApiBaseUrl } from "@/lib/api-config";

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
    // Removed unused variables

    const [remark, setRemark] = useState<string>(initial?.remark || "");

    // UI state
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const API_URL = `${getApiBaseUrl()}/api`;

    // calculate profit/loss - removed unused function

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
            // Removed unused setServiceImageName call
            setRemark(initial.remark || initial.note || "");
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
            const token = Cookies.get("authToken") || "";
            // Build payload with expected backend fields - using productName for service since API remains same
            const payload: any = {
                productName: serviceName || "Untitled Service",
                category: category || undefined,
                unitPrice: resolveUnitPrice(),
                inStock: 0, // Services don't have stock
                discount: discount !== "" && discount !== null && discount !== undefined ? Number(discount) : 0,
                image: serviceImage || undefined, // base64 or URL
                vendor: vendorName || undefined,
                vendorProductCode: vendorServiceCode || undefined,
                note: remark || undefined,
            };

            console.log("Saving service with payload:", payload);

            // Optionally include a status field for draft (backend can ignore if not supported)
            if (asDraft) payload.status = "draft";

            // If this is edit mode (initial provided), call PUT
            const itemId = initial?.id || initial?._id || null;
            if (itemId) {
                await axios.put(`${API_URL}/inventory/items/${itemId}`, payload, {
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

            // Create new item via POST
            const res = await axios.post(`${API_URL}/inventory/items`, payload, {
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
            const msg =
                err?.response?.data?.detail ||
                err?.response?.data?.message ||
                err?.message ||
                "Failed to save service";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    // File handling removed - unused

    // File handling functions removed - unused

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
                        <Label htmlFor="service-name">Service Name</Label>
                        <Input id="service-name" value={serviceName} onChange={(e: any) => setServiceName(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="service-code">Service Code</Label>
                        <Input id="service-code" value={serviceCode} onChange={(e: any) => setServiceCode(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="category">Category</Label>
                        <Input id="category" value={category} onChange={(e: any) => setCategory(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="sub-category">Sub Category</Label>
                        <Input id="sub-category" value={subCategory} onChange={(e: any) => setSubCategory(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="brand-name">Brand Name</Label>
                        <Input id="brand-name" value={brandName} onChange={(e: any) => setBrandName(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Input id="description" value={description} onChange={(e: any) => setDescription(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="tax-rate">Tax Rate</Label>
                        <Input id="tax-rate" value={taxRate as any} onChange={(e: any) => setTaxRate(e.target.value)} />
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