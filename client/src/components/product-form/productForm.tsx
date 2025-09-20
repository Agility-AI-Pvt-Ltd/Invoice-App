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

export default function AddProductForm({ initial = null, onSuccess, onClose }: Props) {
  // Form state (mapped from the existing inputs)
  const [productName, setProductName] = useState<string>(initial?.productName || "");
  const [productSKU, setProductSKU] = useState<string>(initial?.productSKU || "");
  const [category, setCategory] = useState<string>(initial?.category || "");
  const [subCategory, setSubCategory] = useState<string>(initial?.subCategory || "");
  const [brandName, setBrandName] = useState<string>(initial?.brandName || "");
  const [description, setDescription] = useState<string>(initial?.description || "");

  const [purchasePrice, setPurchasePrice] = useState<string | number>(initial?.purchasePrice ?? "");
  const [sellingPrice, setSellingPrice] = useState<string | number>(initial?.sellingPrice ?? "");
  const [discount, setDiscount] = useState<string | number>(initial?.discount ?? "");
  const [taxRate, setTaxRate] = useState<string | number>(initial?.taxRate ?? "");
  const [quantity, setQuantity] = useState<string | number>(initial?.quantity ?? initial?.inStock ?? "");

  // Removed unused state variables to clean up the code

  // UI state
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Temporary: Use direct URL until environment variable is properly loaded
  const API_URL = "https://api-gateway-914987176295.asia-south1.run.app/api";
  console.log("🔍 API_URL being used:", API_URL);
  console.log("🔍 BASE_URL from config:", BASE_URL);


  useEffect(() => {
    // If initial changes after mount, populate fields
    if (initial) {
      setProductName(initial.productName || initial.product_name || "");
      setProductSKU(initial.productSKU || initial.sku || "");
      setCategory(initial.category || "");
      setSubCategory(initial.subCategory || "");
      setBrandName(initial.brandName || "");
      setDescription(initial.description || "");
      setPurchasePrice(initial.purchasePrice ?? initial.purchase_price ?? "");
      setSellingPrice(initial.sellingPrice ?? initial.selling_price ?? "");
      setDiscount(initial.discount ?? 0);
      setTaxRate(initial.taxRate ?? "");
      setQuantity(initial.quantity ?? initial.inStock ?? "");
      setError(null);
    }
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

  // Helper: get quantity/stock value
  const resolveInStock = (): number => {
    const qty = typeof quantity === "string" ? quantity.trim() : quantity;
    const parsedQty = qty !== "" && qty !== null && qty !== undefined ? Number(qty) : NaN;
    if (!isNaN(parsedQty) && parsedQty >= 0) return parsedQty;
    return 0;
  };

  const handleSave = async (asDraft = false) => {
    setError(null);
    setLoading(true);

    try {
      // Get token from cookies or localStorage
      const token = Cookies.get("authToken") || localStorage.getItem("authToken") || "";

      if (!token) {
        setError("Authentication token not found. Please login again.");
        setLoading(false);
        return;
      }

      // Validate required fields
      if (!productName.trim()) {
        setError("Product name is required");
        setLoading(false);
        return;
      }
      if (!category.trim()) {
        setError("Category is required");
        setLoading(false);
        return;
      }
      if (resolveUnitPrice() <= 0) {
        setError("Unit price is required and must be greater than 0");
        setLoading(false);
        return;
      }
      if (resolveInStock() < 0) {
        setError("Quantity must be 0 or greater");
        setLoading(false);
        return;
      }

      // Build payload with only the fields visible in the form
      const payload: any = {
        // Product Details Section
        name: productName || "Untitled Product",
        sku: productSKU || `PRD-${Date.now()}`,
        category: category || "Product",
        subCategory: subCategory || undefined,
        brandName: brandName || undefined,
        description: description || undefined,
        taxRate: taxRate !== "" && taxRate !== null && taxRate !== undefined ? Number(taxRate) : 0,

        // Pricing Details Section
        purchasePrice: purchasePrice !== "" && purchasePrice !== null && purchasePrice !== undefined ? Number(purchasePrice) : 0,
        sellingPrice: sellingPrice !== "" && sellingPrice !== null && sellingPrice !== undefined ? Number(sellingPrice) : 0,
        discount: discount !== "" && discount !== null && discount !== undefined ? Number(discount) : 0,

        // Stock Details Section
        quantity: resolveInStock() || 0,

        // Computed field for unitPrice (prefer selling price, fallback to purchase price)
        unitPrice: resolveUnitPrice() || 0,
      };

      console.log("Saving product with payload:", payload);
      console.log("🔍 Full payload JSON:", JSON.stringify(payload, null, 2));
      console.log("🔍 Request URL:", `${API_URL}/inventory/items`);
      console.log("🔍 Auth token:", token ? `${token.substring(0, 20)}...` : "No token");

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

      // Create new item via POST - using the correct inventory service endpoint
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
      console.error("Save product error:", err);
      console.error("Error response data:", err?.response?.data);
      console.error("Error response status:", err?.response?.status);
      console.error("Error response headers:", err?.response?.headers);
      console.error("Full error object:", err);

      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to save product";
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
        {/* Product Details Section */}
        <FormSection title="Product Details">
          <div className="grid gap-2">
            <Label htmlFor="product-name">Product Name *</Label>
            <Input id="product-name" value={productName} onChange={(e: any) => setProductName(e.target.value)} placeholder="Enter product name" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="product-sku">Product Code/SKU *</Label>
            <Input id="product-sku" value={productSKU} onChange={(e: any) => setProductSKU(e.target.value)} placeholder="Enter product SKU" />
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
        </FormSection>

        {/* Pricing Section */}
        <FormSection title="Pricing Details">
          <div className="grid gap-2">
            <Label htmlFor="purchase-price">Purchase Price</Label>
            <Input
              id="purchase-price"
              type="number"
              value={purchasePrice}
              onChange={(e: any) => setPurchasePrice(e.target.value)}
              placeholder="Enter purchase price"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="selling-price">Selling Price *</Label>
            <Input
              id="selling-price"
              type="number"
              value={sellingPrice}
              onChange={(e: any) => setSellingPrice(e.target.value)}
              placeholder="Enter selling price"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="discount">Discount (%)</Label>
            <Input
              id="discount"
              type="number"
              value={discount}
              onChange={(e: any) => setDiscount(e.target.value)}
              placeholder="Enter discount percentage"
            />
          </div>
        </FormSection>

        {/* Stock Section */}
        <FormSection title="Stock Details">
          <div className="grid gap-2">
            <Label htmlFor="quantity">Quantity/Stock *</Label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e: any) => setQuantity(e.target.value)}
              placeholder="Enter quantity in stock"
            />
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