
// FILE: client/src/components/product-form/productForm.tsx

import React, { useEffect, useRef, useState } from "react";



import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "../ui/Input";
import axios from "axios";
import Cookies from "js-cookie";

// added Select imports (uses your existing UI Select component)
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
          <Plus className="h-5 w-5" />
          <span className="sr-only">Add new section</span>
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

  // Stock/payment-related (UI labels were payment oriented; we keep them but also track general values)
  const [paymentStatus, setPaymentStatus] = useState<string>(initial?.paymentStatus || "Unpaid");
  const [amountReceived, setAmountReceived] = useState<string | number>(initial?.amountReceived ?? "");
  const [paymentMethod, setPaymentMethod] = useState<string>(initial?.paymentMethod || "Online");
  const [dueAmount, setDueAmount] = useState<string | number>(initial?.dueAmount ?? "");

  // Supplier/vendor
  const [vendorName, setVendorName] = useState<string>(initial?.vendorName || "");
  const [vendorProductCode, setVendorProductCode] = useState<string>(initial?.vendorProductCode || "");

  // Images/attachments
  // productImage will hold base64 dataURL (if file chosen) or a URL/string if provided by initial
  const [productImage, setProductImage] = useState<string>(initial?.productImage || "");
  const [productImageName, setProductImageName] = useState<string>(initial?.productImageName || (initial?.imageName ?? ""));
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [remark, setRemark] = useState<string>(initial?.remark || "");

  // UI state
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = "https://invoice-backend-604217703209.asia-south1.run.app/api";

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
      setPaymentStatus(initial.paymentStatus || "Unpaid");
      setAmountReceived(initial.amountReceived ?? "");
      setPaymentMethod(initial.paymentMethod || "Online");
      setDueAmount(initial.dueAmount ?? "");
      setVendorName(initial.vendorName || "");
      setVendorProductCode(initial.vendorProductCode || "");
      setProductImage(initial.productImage || initial.image || "");
      setProductImageName(initial.productImageName || initial.imageName || "");
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

  // NOTE: There is no explicit 'inStock' field in this UI. Backend expects 'inStock' (int).
  // We send safe default 0. If your product form actually has a field representing stock/quantity,
  // replace this to return that value (for example: Number(quantityField)).
  const resolveInStock = (): number => {
    // try to infer from amountReceived or dueAmount? Not reliable. Default to 0.
    return 0;
  };

  const handleSave = async (asDraft = false) => {
    setError(null);
    setLoading(true);

    try {
      const token = Cookies.get("authToken") || "";
      // Build payload with expected backend fields
      const payload: any = {
        productName: productName || "Untitled Product",
        category: category || undefined,
        unitPrice: resolveUnitPrice(),
        inStock: resolveInStock(),
        discount: discount !== "" && discount !== null && discount !== undefined ? Number(discount) : 0,
        image: productImage || undefined, // base64 or URL
        // include payment metadata if needed
        paymentStatus: paymentStatus || undefined,
        paymentMethod: paymentMethod || undefined,
        amountReceived: amountReceived !== "" ? Number(amountReceived) : undefined,
        dueAmount: dueAmount !== "" ? Number(dueAmount) : undefined,
        vendor: vendorName || undefined,
        vendorProductCode: vendorProductCode || undefined,
        note: remark || undefined,
      };

      console.log("Saving product with payload:", payload);

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
      console.error("Save product error:", err);
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to save product";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // File handling: read chosen image as base64 and set name
  const handleFileSelect = (file?: File | null) => {
    if (!file) return;
    setProductImageName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setProductImage(result); // base64 data URL
    };
    reader.readAsDataURL(file);
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    handleFileSelect(f);
  };

  const triggerFilePicker = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  // Attach handlers to UI inputs while leaving markup intact
  return (
    <div className="min-h-screen bg-white p-6 md:p-10 overflow-y-auto">
      <div className=" mx-auto">
        {/* Product Details Section */}
        <FormSection title="Product Details">
          <div className="grid gap-2">
            <Label htmlFor="product-name">Product Name</Label>
            <Input id="product-name" value={productName} onChange={(e: any) => setProductName(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="product-sku">Product Code/ SKU</Label>
            <Input id="product-sku" value={productSKU} onChange={(e: any) => setProductSKU(e.target.value)} />
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
        </FormSection>

        {/* Pricing & Tax Section */}
        <FormSection title="Pricing & Tax">
          <div className="grid gap-2">
            <Label htmlFor="purchase-price">Purchase Price</Label>
            <Input
              id="purchase-price"
              value={purchasePrice as any}
              onChange={(e: any) => setPurchasePrice(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="selling-price">Selling Price</Label>
            <Input
              id="selling-price"
              value={sellingPrice as any}
              onChange={(e: any) => setSellingPrice(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="discount">Discount (if applicable) (% or amount)</Label>
            <Input id="discount" value={discount as any} onChange={(e: any) => setDiscount(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tax-rate">Tax Rate</Label>
            <Input id="tax-rate" value={taxRate as any} onChange={(e: any) => setTaxRate(e.target.value)} />
          </div>
        </FormSection>

        {/* Stock and Quantity Details Section */}
        <FormSection title="Stock and Quantity Details">
          <div className="grid gap-2">
            <Label htmlFor="payment-status">Payment Status</Label>

            {/* Payment Status Select (Paid / Unpaid) */}
            <Select onValueChange={(v) => setPaymentStatus(v)} defaultValue={paymentStatus || "Unpaid"}>
              <SelectTrigger aria-label="Payment Status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Unpaid">Unpaid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="amount-received">Amount Received</Label>
            <Input id="amount-received" value={amountReceived as any} onChange={(e: any) => setAmountReceived(e.target.value)} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="payment-method">Payment Method</Label>

            {/* Payment Method Select (Online / POS / Cash) */}
            <Select onValueChange={(v) => setPaymentMethod(v)} defaultValue={paymentMethod || "Online"}>
              <SelectTrigger aria-label="Payment Method">
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Online">Online</SelectItem>
                <SelectItem value="POS">POS</SelectItem>
                <SelectItem value="Cash">Cash</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="due-amount">Due Amount</Label>
            <Input id="due-amount" value={dueAmount as any} onChange={(e: any) => setDueAmount(e.target.value)} />
          </div>
        </FormSection>

        {/* Supplier/ Vendor Information Section */}
        <FormSection title="Supplier/ Vendor Information">
          <div className="grid gap-2">
            <Label htmlFor="vendor-name">Vendor Name</Label>
            <Input id="vendor-name" value={vendorName} onChange={(e: any) => setVendorName(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="vendor-product-code">Vendor Product Code</Label>
            <Input id="vendor-product-code" value={vendorProductCode} onChange={(e: any) => setVendorProductCode(e.target.value)} />
          </div>
        </FormSection>

        {/* Images and Attachments Section */}
        <FormSection title="Images and Attachments">
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="product-image">Product Image</Label>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={onFileInputChange}
            />

            {/* Display a readonly Input showing filename (click opens file dialog) */}
            <Input
              id="product-image"
              value={productImageName || (productImage ? "Image selected" : "")}
              placeholder="Choose image"
              readOnly
              onClick={triggerFilePicker}
            />

            {/* optional: small preview below (keeps layout, minimal visual change) */}
            {productImage ? (
              <div className="mt-2">
                <img src={productImage} alt="product preview" className="max-h-28 object-contain rounded-md" />
              </div>
            ) : null}
          </div>

          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="remark">Remark</Label>
            <Textarea id="remark" placeholder="Remark" className="min-h-[100px]" value={remark} onChange={(e: any) => setRemark(e.target.value)} />
          </div>
        </FormSection>

        {/* Error message */}
        {error && <div className="text-sm text-red-600 mb-4">{error}</div>}

        {/* Action Buttons */}
        <div className="flex justify-end items-center gap-4 mt-8">
          <Button
            variant="link"
            className="text-[#B5A3FF] hover:text-[#9F91D8] font-medium"
            onClick={() => handleSave(true)}
            disabled={loading}
          >
            Save as Draft
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