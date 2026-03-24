import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import Cookies from "js-cookie";

import { BASE_URL, getApiBaseUrl } from "@/lib/api-config";
import { getInventoryItemForInvoice } from "@/services/api/inventory";


// added Select imports (uses your existing UI Select component)

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
  const [hsnCode, setHsnCode] = useState<string>(initial?.hsnCode ?? "");
  const [sacCode, setSacCode] = useState<string>(initial?.sacCode ?? "");


  // Removed unused state variables to clean up the code

  // UI state
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // API URL configuration
  const API_URL = `${getApiBaseUrl()}/api`;

  // Debug logging
  console.log("🔍 API_URL being used:", API_URL);
  console.log("🔍 BASE_URL from config:", BASE_URL);
  // calculate profit/loss - removed unused function



  useEffect(() => {
    // If initial changes after mount, populate fields
    if (initial) {
      // Check if this is an edit operation with an ID
      const itemId = initial.id || initial._id;
      
      if (itemId) {
        // Fetch enhanced data for auto-fill when editing
        getInventoryItemForInvoice(itemId)
          .then((response) => {
            if (response.success && response.data) {
              const enhancedData = response.data;
              
              // Auto-populate all fields with enhanced data
              setProductName(enhancedData.name || "");
              setProductSKU(enhancedData.sku || "");
              setCategory(enhancedData.category || "");
              setSubCategory(enhancedData.subCategory || "");
              setBrandName(enhancedData.brandName || "");
              setDescription(enhancedData.description || "");
              setPurchasePrice(enhancedData.unitPrice || "");
              setSellingPrice(enhancedData.unitPrice || "");
              setDiscount(enhancedData.defaultDiscount || 0);
              setTaxRate(enhancedData.defaultTaxRate || "");
              setQuantity(enhancedData.quantity || "");
              setHsnCode(enhancedData.hsnCode || "");
              setSacCode(enhancedData.sacCode || "");
            }
          })
          .catch(() => {
            // Fallback to basic initial data if enhanced fetch fails
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
            setHsnCode(initial.hsnCode ?? "");
            setSacCode(initial.sacCode ?? "");
            
            // Form populated with basic data (enhanced fetch failed)
          });
      } else {
        // New item - use basic initial data
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
      }
      
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

      // Build payload with correct field names for backend
      const payload: any = {
        // Product Details Section - matching backend expected format
        name: productName || "Untitled Product",
        description: description || "A test product for debugging",
        sku: productSKU || `TEST-${Date.now()}`,
        quantity: resolveInStock() || 0,
        unitPrice: resolveUnitPrice() || 0,
        purchasePrice: purchasePrice !== "" && purchasePrice !== null && purchasePrice !== undefined ? Number(purchasePrice) : 0,
        sellingPrice: sellingPrice !== "" && sellingPrice !== null && sellingPrice !== undefined ? Number(sellingPrice) : 0,
        category: category || "Electronics",
        subCategory: subCategory || "Computers",
        brandName: brandName || "TestBrand",
        defaultTaxRate: taxRate !== "" && taxRate !== null && taxRate !== undefined ? Number(taxRate) : 18,
        defaultDiscount: discount !== "" && discount !== null && discount !== undefined ? Number(discount) : 5,
        hsnCode: hsnCode || "8471",
        sacCode: sacCode || "998314",
      };

      // Saving product with payload

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

  // File handling removed - unused

  // File handling functions removed - unused

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
          <div className="grid gap-2">
            <Label htmlFor="hsn-code">HSN Code</Label>
            <Input id="hsn-code" value={hsnCode} onChange={(e: any) => setHsnCode(e.target.value)} placeholder="Enter HSN code" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="sac-code">SAC Code</Label>
            <Input id="sac-code" value={sacCode} onChange={(e: any) => setSacCode(e.target.value)} placeholder="Enter SAC code" />
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