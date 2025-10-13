// FILE: client/src/components/invoice-form/Step3Form.tsx

import { useState, useEffect, useContext, useCallback, useMemo } from "react";
import { Input } from "@/components/ui/Input";
// import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, Search, Loader2, X } from "lucide-react";
import { NavbarButton } from "../ui/resizable-navbar";
import { InvoiceContext } from "@/contexts/InvoiceContext";
import { BASE_URL } from "@/lib/api-config";
import axios from "axios";
import Cookies from "js-cookie";
import type { InventoryItem } from "@/types/inventory";
import { getInventoryItemForAutoFill } from "@/services/api/inventory";

type Item = {
  id?: number | string;
  inventoryItemId?: number | null; // ⚠️ NEW: Link to inventory for automatic stock reduction
  // use same field names as InvoiceModel validation expects:
  description: string;
  hsn: string;
  // numeric fields allowed as string while editing so we can keep user input like "" or "0."
  quantity: number | string;
  unitPrice: number | string;
  gst: number | string;
  discount: number | string;
};

type Props = {
  items?: Item[];
  setItems?: (items: Item[]) => void;
};

// Row-specific inventory search component
interface RowInventorySearchProps {
  rowIndex: number;
  onInventorySelect: (inventory: InventoryItem, rowIndex: number) => void;
  onSearchResults: (results: InventoryItem[], rowIndex: number) => void;
  onSearchClear: (rowIndex: number) => void;
  onLoadingChange: (loading: boolean, rowIndex: number) => void;
  placeholder?: string;
  currentValue: string;
  onValueChange: (value: string) => void;
  fieldError?: string;
}

function RowInventorySearch({
  rowIndex,
  onInventorySelect,
  onSearchResults,
  onSearchClear,
  onLoadingChange,
  placeholder = "Start typing item name...",
  currentValue,
  onValueChange,
  fieldError
}: RowInventorySearchProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<InventoryItem[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const token = Cookies.get("authToken") || "";

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      handleClearSearch();
      return;
    }

    setIsSearching(true);
    onLoadingChange(true, rowIndex);
    setHasSearched(true);

    try {

      const encodedName = encodeURIComponent(query.trim());
      const searchUrl = `${BASE_URL}/api/inventory/${encodedName}`;

      const response = await axios.get(searchUrl, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      // Handle different response formats
      let results: Record<string, unknown>[] = [];

      if (Array.isArray(response.data)) {
        results = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        results = response.data.data;
      } else if (response.data && typeof response.data === 'object' && (response.data.name || response.data.productName)) {
        // Single item result
        results = [response.data];
      }

      // Normalize the results to match the expected format (only required fields)
      const normalizedResults = results.map((item: Record<string, unknown>) => ({
        id: (item.id as string) || (item._id as string) || Math.random().toString(),
        productName: (item.name as string) || (item.productName as string) || (item.product_name as string) || 'Unknown Product',
        category: (item.category as string) || 'Uncategorized',
        unitPrice: Number(item.unitPrice || item.unit_price || item.price || 0),
        inStock: Number(item.quantity || item.inStock || item.in_stock || 0),
        discount: Number(item.defaultDiscount || item.discount || 0), // Use defaultDiscount from backend
        totalValue: Number(item.unitPrice || item.unit_price || 0) * Number(item.quantity || item.inStock || item.in_stock || 0),
        status: ((item.status as string) || (Number(item.quantity || item.inStock || item.in_stock || 0) > 0 ? 'In Stock' : 'Out of Stock')) as "In Stock" | "Out of Stock" | "Low in Stock",
        // Add new fields for enhanced display
        defaultTaxRate: Number(item.defaultTaxRate || item.taxRate || 0),
        hsnCode: (item.hsnCode as string) || '',
        subCategory: (item.subCategory as string) || '',
        brandName: (item.brandName as string) || '',
        taxCategory: (item.taxCategory as string) || 'GOODS'
      }));

      setSearchResults(normalizedResults);
      onSearchResults(normalizedResults, rowIndex);
      setShowSuggestions(true);

    } catch (error: unknown) {

      // Fallback: Try searching using the regular items endpoint with search parameter
      try {
        const fallbackUrl = `${BASE_URL}/api/inventory/items?search=${encodeURIComponent(query.trim())}`;

        const fallbackResponse = await axios.get(fallbackUrl, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        // Handle fallback response
        let fallbackResults: Record<string, unknown>[] = [];

        if (Array.isArray(fallbackResponse.data)) {
          fallbackResults = fallbackResponse.data;
        } else if (fallbackResponse.data && Array.isArray(fallbackResponse.data.data)) {
          fallbackResults = fallbackResponse.data.data;
        }

        // Normalize fallback results (only required fields)
        const normalizedFallbackResults = fallbackResults.map((item: Record<string, unknown>) => ({
          id: (item.id as string) || (item._id as string) || Math.random().toString(),
          productName: (item.name as string) || (item.productName as string) || (item.product_name as string) || 'Unknown Product',
          category: (item.category as string) || 'Uncategorized',
          unitPrice: Number(item.unitPrice || item.unit_price || item.price || 0),
          inStock: Number(item.quantity || item.inStock || item.in_stock || 0),
          discount: Number(item.defaultDiscount || item.discount || 0), // Use defaultDiscount from backend
          totalValue: Number(item.unitPrice || item.unit_price || 0) * Number(item.quantity || item.inStock || item.in_stock || 0),
          status: ((item.status as string) || (Number(item.quantity || item.inStock || item.in_stock || 0) > 0 ? 'In Stock' : 'Out of Stock')) as "In Stock" | "Out of Stock" | "Low in Stock",
          // Add new fields for enhanced display
          defaultTaxRate: Number(item.defaultTaxRate || item.taxRate || 0),
          hsnCode: (item.hsnCode as string) || '',
          subCategory: (item.subCategory as string) || '',
          brandName: (item.brandName as string) || '',
          taxCategory: (item.taxCategory as string) || 'GOODS'
        }));

        setSearchResults(normalizedFallbackResults);
        onSearchResults(normalizedFallbackResults, rowIndex);
        setShowSuggestions(true);

      } catch (fallbackError: unknown) {
        // If both searches fail, show empty results
        setSearchResults([]);
        onSearchResults([], rowIndex);
      }
    } finally {
      setIsSearching(false);
      onLoadingChange(false, rowIndex);
    }
  };

  const handleClearSearch = () => {
    setSearchResults([]);
    setHasSearched(false);
    setShowSuggestions(false);
    onSearchClear(rowIndex);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onValueChange(value);

    // Auto-search as user types (with debounce)
    if (value.trim()) {
      const timeoutId = setTimeout(() => {
        handleSearch(value);
      }, 500); // 500ms debounce

      return () => clearTimeout(timeoutId);
    } else {
      handleClearSearch();
    }
  };

  const handleInputFocus = () => {
    if (searchResults.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInventorySelect = (inventory: InventoryItem) => {
    onInventorySelect(inventory, rowIndex);
    setShowSuggestions(false);
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.row-inventory-search-container')) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative row-inventory-search-container">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder={isSearching ? "Searching..." : placeholder}
          value={currentValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          className="pl-10 pr-10 w-full"
          disabled={isSearching}
          aria-invalid={!!fieldError}
        />
        {isSearching && (
          <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          </div>
        )}
        {currentValue && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              onValueChange("");
              handleClearSearch();
            }}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
            disabled={isSearching}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Inventory Suggestions Dropdown */}
      {showSuggestions && searchResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {searchResults.map((inventory, invIndex) => (
            <div
              key={inventory.id || invIndex}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
              onClick={() => handleInventorySelect(inventory)}
            >
              <div className="font-medium text-sm text-gray-900">
                {inventory.productName}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                <div className="flex flex-wrap gap-2">
                  <span>Category: {inventory.category}</span>
                  <span>•</span>
                  <span>Price: ₹{inventory.unitPrice}</span>
                  <span>•</span>
                  <span>Stock: {inventory.inStock}</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-1">
                  <span>Status: {inventory.status}</span>
                  <span>•</span>
                  <span>Discount: {inventory.discount}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Search Results Summary */}
      {hasSearched && !isSearching && currentValue.trim() && (
        <div className="mt-1 text-xs text-gray-600">
          {searchResults.length > 0 ? (
            <span className="text-green-600">
              Found {searchResults.length} item{searchResults.length !== 1 ? 's' : ''} matching "{currentValue}"
            </span>
          ) : (
            <span className="text-red-600">
              No items found matching "{currentValue}"
            </span>
          )}
        </div>
      )}

      {/* Field Error Display */}
      {fieldError && (
        <p className="text-sm text-red-600 mt-1">{fieldError}</p>
      )}
    </div>
  );
}

export default function Step3ItemTable({ items: propItems, setItems: propSetItems }: Props) {
  return (
    <div className="mt-6 space-y-4">
      <h3 className="rounded-md text-lg font-semibold bg-indigo-100 text-indigo-700 px-4 py-2 ">
        Add Item Details
      </h3>
      <AddItem items={propItems} setItems={propSetItems} />
    </div>
  );
}

export function AddItem({ items: externalItems, setItems: externalSetItems }: Props) {
  const ctx = useContext(InvoiceContext) as unknown as {
    invoice?: { items?: Item[] };
    setInvoice?: (updater: (prev: Record<string, unknown>) => Record<string, unknown>) => void;
    fieldErrors?: Record<string, string>;
    clearFieldError?: (path: string) => void;
    setFieldErrors?: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  } | undefined;
  const fieldErrors: Record<string, string> = ctx?.fieldErrors ?? {};

  // local fallback state (kept for compatibility if parent doesn't pass items)
  const [localItems, setLocalItems] = useState<Item[]>([
    { id: Date.now(), inventoryItemId: null, description: "", hsn: "", quantity: 0, unitPrice: 0, gst: 0, discount: 0 },
  ]);


  // Determine whether we should use external props or context or local
  const usingExternal = !!(externalItems && externalSetItems);
  const usingContext = !!(ctx && !usingExternal);

  const items = useMemo(() => {
    return usingExternal
      ? (externalItems as Item[])
      : usingContext
        ? ((ctx.invoice?.items as Item[]) || [])
        : localItems;
  }, [usingExternal, externalItems, usingContext, ctx?.invoice?.items, localItems]);

  const setItems = useMemo(() => {
    return usingExternal
      ? (externalSetItems as (items: Item[]) => void)
      : usingContext
        ? ((updated: Item[]) =>
        (ctx?.setInvoice?.((prev: Record<string, unknown>) => ({
          ...(prev || {}),
          items: updated,
        })) as unknown))
        : setLocalItems;
  }, [usingExternal, externalSetItems, usingContext, ctx, setLocalItems]);

  // ensure at least one row exists (compatible with previous behavior)
  useEffect(() => {
    if (!items || items.length === 0) {
      setItems([
        { id: Date.now(), inventoryItemId: null, description: "", hsn: "", quantity: 0, unitPrice: 0, gst: 0, discount: 0 },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearField = (path: string) => {
    if (!ctx) return;
    if (typeof ctx.clearFieldError === "function") {
      ctx.clearFieldError(path);
    } else if (typeof ctx.setFieldErrors === "function") {
      // conservative fallback (if setFieldErrors exists)
      ctx.setFieldErrors((prev) => {
        const previous = (prev || {}) as Record<string, string>;
        const copy: Record<string, string> = { ...previous };
        delete copy[path];
        return copy;
      });
    }
  };

  // Row inventory search callbacks
  const handleRowInventorySelect = useCallback(async (inventory: InventoryItem, rowIndex: number) => {
    const updated = [...items];
    const existing = { ...(updated[rowIndex] as Item) } as Item;

    // Parse inventory ID (could be string or number)
    const inventoryId = typeof inventory.id === 'string' ? parseInt(inventory.id) : inventory.id;

    try {
      // Fetch enhanced inventory data for auto-fill
      const enhancedData = await getInventoryItemForAutoFill(inventoryId);
      
      // Map enhanced inventory fields to item fields with auto-fill
      updated[rowIndex] = {
        ...existing,
        inventoryItemId: inventoryId, // ⚠️ CRITICAL: Link to inventory for automatic stock reduction
        description: enhancedData.name || inventory.productName,
        hsn: enhancedData.hsnCode || "", // Auto-fill HSN code
        unitPrice: Number(enhancedData.unitPrice || inventory.unitPrice || 0),
        gst: Number(enhancedData.defaultTaxRate || enhancedData.taxRate || 0), // Auto-fill GST rate
        discount: Number(enhancedData.defaultDiscount || enhancedData.discount || inventory.discount || 0), // Auto-fill discount
      } as Item;

      setItems(updated);
    } catch (error) {
      // Fallback to basic inventory data if enhanced fetch fails
      updated[rowIndex] = {
        ...existing,
        inventoryItemId: inventoryId,
        description: inventory.productName,
        hsn: inventory.hsnCode || "", // Use HSN from inventory if available
        unitPrice: Number(inventory.unitPrice || 0),
        gst: Number(inventory.defaultTaxRate || 0), // Use defaultTaxRate from inventory
        discount: Number(inventory.defaultDiscount || inventory.discount || 0), // Use defaultDiscount from inventory
      } as Item;

      setItems(updated);
    }
  }, [items, setItems]);

  const handleRowSearchResults = useCallback((results: InventoryItem[], rowIndex: number) => {
    // Search results received
  }, []);

  const handleRowSearchClear = useCallback((rowIndex: number) => {
    // Search cleared
  }, []);

  const handleRowLoadingChange = useCallback((loading: boolean, rowIndex: number) => {
    // Loading state changed
  }, []);


  const handleChange = (index: number, field: keyof Item, value: string) => {
    const updatedItems = [...items];
    const current = { ...(updatedItems[index] as Item) } as Item;

    if (field === "description" || field === "hsn") {
      current[field] = value;
    } else {
      // numeric fields: allow empty strings while typing, block single '-' etc.
      let newValue: number | string = value;
      if (newValue === "-") {
        newValue = "";
      } else {
        const parsed = parseFloat(newValue);
        if (!isNaN(parsed) && parsed < 0) {
          newValue = "0";
        }
        // if parsed NaN we preserve string (so user can type "0.")
      }
      (current[field] as number | string) = newValue;
    }

    updatedItems[index] = current;
    setItems(updatedItems);

    // clear inline error for corresponding validation path if any
    // Validation keys in InvoiceForm are: items.{idx}.description, items.{idx}.quantity, items.{idx}.unitPrice
    if (field === "description") clearField(`items.${index}.description`);
    if (field === "quantity") clearField(`items.${index}.quantity`);
    if (field === "unitPrice") clearField(`items.${index}.unitPrice`);
  };



  const handleNumericFocus = (index: number, field: keyof Item) => {
    const current = items[index]?.[field as keyof Item] as unknown;
    if (current === 0 || current === "0") {
      const updated = [...items];
      updated[index] = { ...updated[index], [field]: "" };
      setItems(updated);
    }
  };

  const handleNumericBlur = (index: number, field: keyof Item) => {
    const current = items[index]?.[field as keyof Item] as unknown;
    if (current === "" || current === null || typeof current === "undefined") {
      const updated = [...items];
      updated[index] = { ...updated[index], [field]: "0" };
      setItems(updated);
      return;
    }
    const parsed = parseFloat(String(current));
    if (isNaN(parsed) || parsed < 0) {
      const updated = [...items];
      updated[index] = { ...updated[index], [field]: "0" };
      setItems(updated);
      return;
    }
    // keep entered valid value
  };

  const handleNumericKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "-") {
      e.preventDefault();
    }
  };

  const addItem = () => {
    setItems([
      ...items,
      { id: Date.now(), inventoryItemId: null, description: "", hsn: "", quantity: 0, unitPrice: 0, gst: 0, discount: 0 },
    ]);
  };

  const removeItem = (id: number | string) => {
    // if only one item remains, keep at least one (consistent behavior)
    const updated = items.filter((it) => it.id !== id);
    if (updated.length === 0) {
      setItems([
        { id: Date.now(), inventoryItemId: null, description: "", hsn: "", quantity: 0, unitPrice: 0, gst: 0, discount: 0 },
      ]);
    } else {
      setItems(updated);
    }
  };

  const toNumber = (val: number | string) => {
    if (val === "" || val === null || typeof val === "undefined") return 0;
    const n = parseFloat(String(val));
    return isNaN(n) ? 0 : n;
  };

  const calculateTotal = (item: Item) => {
    const qty = toNumber(item.quantity);
    const price = toNumber(item.unitPrice);
    const gst = toNumber(item.gst);
    const discount = toNumber(item.discount);

    const base = qty * price;
    // Apply discount first, then calculate GST on the discounted amount
    const discountAmt = (base * discount) / 100;
    const taxableAmount = base - discountAmt;
    const gstAmt = (taxableAmount * gst) / 100;
    const total = taxableAmount + gstAmt;
    
    // Comprehensive calculation logging
    console.log('🧮 ITEM CALCULATION:', {
      item: item.description || 'Unnamed Item',
      inputs: {
        quantity: qty,
        unitPrice: price,
        gstRate: gst,
        discountRate: discount
      },
      calculations: {
        baseAmount: base,
        discountAmount: discountAmt,
        taxableAmount: taxableAmount,
        gstAmount: gstAmt,
        finalTotal: total
      },
      breakdown: {
        step1: `${qty} × ₹${price} = ₹${base}`,
        step2: `Discount: ₹${base} × ${discount}% = ₹${discountAmt}`,
        step3: `Taxable: ₹${base} - ₹${discountAmt} = ₹${taxableAmount}`,
        step4: `GST: ₹${taxableAmount} × ${gst}% = ₹${gstAmt}`,
        step5: `Total: ₹${taxableAmount} + ₹${gstAmt} = ₹${total.toFixed(2)}`
      }
    });
    
    return total.toFixed(2);
  };

  return (
    <>
      {/* Responsive scroll container for table */}
      <div className="w-full overflow-x-auto rounded-md border">
        <Table className="min-w-[900px]">
          <TableHeader>
            <TableRow>
              <TableHead>Serial No.</TableHead>
              <TableHead>
                Item Name <span className="text-red-500 ml-1">*</span>
              </TableHead>
              <TableHead>HSN Code</TableHead>
              <TableHead>
                Qty <span className="text-red-500 ml-1">*</span>
              </TableHead>
              <TableHead>
                Price (₹) <span className="text-red-500 ml-1">*</span>
              </TableHead>
              <TableHead>GST (%)</TableHead>
              <TableHead>Discount (%)</TableHead>
              <TableHead className="text-right">Gross Total</TableHead>
              <TableHead className="text-center">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {items.map((item, index) => (
              <TableRow key={item.id ?? index}>
                <TableCell>{index + 1}</TableCell>

                {/* Item Name => description (mandatory) with inventory search */}
                <TableCell>
                  <RowInventorySearch
                    rowIndex={index}
                    onInventorySelect={handleRowInventorySelect}
                    onSearchResults={handleRowSearchResults}
                    onSearchClear={handleRowSearchClear}
                    onLoadingChange={handleRowLoadingChange}
                    placeholder="Start typing item name..."
                    currentValue={item.description as string}
                    onValueChange={(value) => handleChange(index, "description", value)}
                    fieldError={fieldErrors[`items.${index}.description`]}
                  />
                </TableCell>

                {/* HSN Code (manual input) */}
                <TableCell>
                  <Input
                    className="w-full"
                    value={item.hsn as string}
                    onChange={(e) => handleChange(index, "hsn", e.target.value)}
                    placeholder="Enter HSN code"
                    aria-invalid={!!fieldErrors[`items.${index}.hsn`]}
                  />
                  {fieldErrors[`items.${index}.hsn`] && (
                    <p className="text-sm text-red-600 mt-1">{fieldErrors[`items.${index}.hsn`]}</p>
                  )}
                </TableCell>

                {/* Quantity => quantity (mandatory) */}
                <TableCell>
                  <Input
                    className="w-full"
                    type="number"
                    min={0}
                    value={String(item.quantity ?? "")}
                    onChange={(e) => handleChange(index, "quantity", e.target.value)}
                    onFocus={() => handleNumericFocus(index, "quantity")}
                    onBlur={() => handleNumericBlur(index, "quantity")}
                    onKeyDown={handleNumericKeyDown}
                    aria-invalid={!!fieldErrors[`items.${index}.quantity`]}
                  />
                  {fieldErrors[`items.${index}.quantity`] && (
                    <p className="text-sm text-red-600 mt-1">{fieldErrors[`items.${index}.quantity`]}</p>
                  )}
                </TableCell>

                {/* Price => unitPrice (mandatory) */}
                <TableCell>
                  <Input
                    className="w-full"
                    type="number"
                    min={0}
                    value={String(item.unitPrice ?? "")}
                    onChange={(e) => handleChange(index, "unitPrice", e.target.value)}
                    onFocus={() => handleNumericFocus(index, "unitPrice")}
                    onBlur={() => handleNumericBlur(index, "unitPrice")}
                    onKeyDown={handleNumericKeyDown}
                    aria-invalid={!!fieldErrors[`items.${index}.unitPrice`]}
                  />
                  {fieldErrors[`items.${index}.unitPrice`] && (
                    <p className="text-sm text-red-600 mt-1">{fieldErrors[`items.${index}.unitPrice`]}</p>
                  )}
                </TableCell>

                {/* GST */}
                <TableCell>
                  <Input
                    className="w-full"
                    type="number"
                    min={0}
                    value={String(item.gst ?? "")}
                    onChange={(e) => handleChange(index, "gst", e.target.value)}
                    onFocus={() => handleNumericFocus(index, "gst")}
                    onBlur={() => handleNumericBlur(index, "gst")}
                    onKeyDown={handleNumericKeyDown}
                    aria-invalid={!!fieldErrors[`items.${index}.gst`]}
                  />
                  {fieldErrors[`items.${index}.gst`] && (
                    <p className="text-sm text-red-600 mt-1">{fieldErrors[`items.${index}.gst`]}</p>
                  )}
                </TableCell>

                {/* Discount */}
                <TableCell>
                  <Input
                    className="w-full"
                    type="number"
                    min={0}
                    value={String(item.discount ?? "")}
                    onChange={(e) => handleChange(index, "discount", e.target.value)}
                    onFocus={() => handleNumericFocus(index, "discount")}
                    onBlur={() => handleNumericBlur(index, "discount")}
                    onKeyDown={handleNumericKeyDown}
                    aria-invalid={!!fieldErrors[`items.${index}.discount`]}
                  />
                  {fieldErrors[`items.${index}.discount`] && (
                    <p className="text-sm text-red-600 mt-1">{fieldErrors[`items.${index}.discount`]}</p>
                  )}
                </TableCell>

                <TableCell className="text-right">₹{calculateTotal(item)}</TableCell>

                <TableCell className="text-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.id!)}
                    className="bg-gradient-to-b from-[#B5A3FF] via-[#785FDA] to-[#9F91D8] text-white rounded-lg"
                  >
                    <Trash2 size={18} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Responsive button group */}
      <div className="flex flex-col sm:flex-row gap-4 mt-4">
        <NavbarButton
          onClick={addItem}
          className="w-full sm:w-auto bg-gradient-to-b from-[#B5A3FF] via-[#785FDA] to-[#9F91D8] text-white px-4 py-2 rounded-lg"
        >
          Add Item +
        </NavbarButton>
      </div>
    </>
  );
}
