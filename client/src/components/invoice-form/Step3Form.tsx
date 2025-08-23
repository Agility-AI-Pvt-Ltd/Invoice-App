// FILE: client/src/components/invoice-form/Step3Form.tsx

import { useState, useEffect, useContext } from "react";
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
import { Trash2 } from "lucide-react";
import { NavbarButton } from "../ui/resizable-navbar";
import { InvoiceContext } from "@/contexts/InvoiceContext";

type Item = {
  id?: number | string;
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
  const ctx = useContext(InvoiceContext) as any | undefined;
  const fieldErrors: Record<string, string> = ctx?.fieldErrors ?? {};

  // local fallback state (kept for compatibility if parent doesn't pass items)
  const [localItems, setLocalItems] = useState<Item[]>([
    { id: Date.now(), description: "", hsn: "", quantity: 0, unitPrice: 0, gst: 0, discount: 0 },
  ]);

  // Determine whether we should use external props or context or local
  const usingExternal = !!(externalItems && externalSetItems);
  const usingContext = !!(ctx && !usingExternal);

  const items = usingExternal
    ? (externalItems as Item[])
    : usingContext
    ? ((ctx.invoice?.items as Item[]) || [])
    : localItems;

  const setItems = usingExternal
    ? (externalSetItems as (items: Item[]) => void)
    : usingContext
    ? ((
        updated: Item[]
      ) =>
        ctx.setInvoice((prev: any) => ({
          ...prev,
          items: updated,
        })))
    : setLocalItems;

  // ensure at least one row exists (compatible with previous behavior)
  useEffect(() => {
    if (!items || items.length === 0) {
      setItems([
        { id: Date.now(), description: "", hsn: "", quantity: 0, unitPrice: 0, gst: 0, discount: 0 },
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
      ctx.setFieldErrors((prev: any) => {
        const copy = { ...(prev || {}) };
        delete copy[path];
        return copy;
      });
    }
  };

  const handleChange = (index: number, field: keyof Item, value: string) => {
    const updatedItems = [...items];
    const current = { ...(updatedItems[index] as any) };

    if (field === "description" || field === "hsn") {
      current[field] = value;
    } else {
      // numeric fields: allow empty strings while typing, block single '-' etc.
      let newValue = value;
      if (newValue === "-") {
        newValue = "";
      } else {
        const parsed = parseFloat(newValue);
        if (!isNaN(parsed) && parsed < 0) {
          newValue = "0";
        }
        // if parsed NaN we preserve string (so user can type "0.")
      }
      current[field] = newValue;
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
    const current = items[index]?.[field as keyof Item] as any;
    if (current === 0 || current === "0") {
      const updated = [...items];
      updated[index] = { ...updated[index], [field]: "" };
      setItems(updated);
    }
  };

  const handleNumericBlur = (index: number, field: keyof Item) => {
    const current = items[index]?.[field as keyof Item] as any;
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
      { id: Date.now(), description: "", hsn: "", quantity: 0, unitPrice: 0, gst: 0, discount: 0 },
    ]);
  };

  const removeItem = (id: number | string) => {
    // if only one item remains, keep at least one (consistent behavior)
    const updated = items.filter((it) => it.id !== id);
    if (updated.length === 0) {
      setItems([
        { id: Date.now(), description: "", hsn: "", quantity: 0, unitPrice: 0, gst: 0, discount: 0 },
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
    // preserve previous file's behaviour for discount/gst calculation:
    const gstAmt = (base * gst) / 100;
    const discountAmt = (base * discount) / 100;
    return (base + gstAmt - discountAmt).toFixed(2);
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

                {/* Item Name => description (mandatory) */}
                <TableCell>
                  <Input
                    className="w-full"
                    value={item.description as string}
                    onChange={(e) => handleChange(index, "description", e.target.value)}
                    aria-invalid={!!fieldErrors[`items.${index}.description`]}
                  />
                  {fieldErrors[`items.${index}.description`] && (
                    <p className="text-sm text-red-600 mt-1">{fieldErrors[`items.${index}.description`]}</p>
                  )}
                </TableCell>

                {/* HSN */}
                <TableCell>
                  <Input
                    className="w-full"
                    value={item.hsn as string}
                    onChange={(e) => handleChange(index, "hsn", e.target.value)}
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
        <NavbarButton
          variant="secondary"
          className="w-full sm:w-auto bg-gradient-to-b from-[#B5A3FF] via-[#785FDA] to-[#9F91D8] text-white px-4 py-2 rounded-lg"
        >
          Add from Inventory +
        </NavbarButton>
      </div>
    </>
  );
}
