// File: client/src/components/sales-form/Step3Form.tsx

"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/Input";
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

type StepProps = {
  data?: Record<string, any>;
  onChange?: (partial: Record<string, any>) => void;
};

type Item = {
  id: number;
  description: string; // item name/description
  hsn: string;
  quantity: number;
  unitPrice: number;
  gst: number; // percent
  discount: number; // percent
};

export default function Step3ItemTable({ data = {}, onChange }: StepProps) {
  // Map incoming data to items
  const mapIncomingItems = (incoming: any[] | undefined): Item[] => {
    if (!incoming || !Array.isArray(incoming) || incoming.length === 0) {
      return [
        { id: Date.now(), description: "", hsn: "", quantity: 0, unitPrice: 0, gst: 0, discount: 0 },
      ];
    }
    return incoming.map((it: any, idx: number) => ({
      id: it.id ?? Date.now() + idx,
      description: it.description ?? it.name ?? "",
      hsn: it.hsn ?? "",
      quantity: Number(it.quantity ?? it.qty ?? 0),
      unitPrice: Number(it.unitPrice ?? it.price ?? 0),
      gst: Number(it.gst ?? 0),
      discount: Number(it.discount ?? 0),
    }));
  };

  const [items, setItems] = useState<Item[]>(mapIncomingItems(data?.items));

  // ✅ Sync only if data actually changed (fix for infinite loop)
  useEffect(() => {
    if (data?.items) {
      const mapped = mapIncomingItems(data.items);
      const isDifferent =
        mapped.length !== items.length ||
        mapped.some((m, i) => JSON.stringify(m) !== JSON.stringify(items[i]));

      if (isDifferent) {
        setItems(mapped);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.items]);

  // ✅ Notify parent whenever items change
  useEffect(() => {
    if (onChange) {
      const payload = items.map((it) => ({
        id: it.id,
        description: it.description,
        hsn: it.hsn,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        gst: it.gst,
        discount: it.discount,
      }));
      onChange({ items: payload });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const handleChange = (index: number, field: keyof Item | string, value: any) => {
    setItems((prev) => {
      const updated = [...prev];
      const raw = updated[index] || ({} as Item);

      if (["quantity", "unitPrice", "gst", "discount"].includes(field)) {
        const num = Number(value) || 0;
        updated[index] = { ...raw, [field]: num };
      } else {
        updated[index] = { ...raw, [field]: value };
      }
      return updated;
    });
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { id: Date.now(), description: "", hsn: "", quantity: 0, unitPrice: 0, gst: 0, discount: 0 },
    ]);
  };

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const calculateTotal = (item: Item) => {
    const base = Number(item.quantity || 0) * Number(item.unitPrice || 0);
    const gstAmt = (base * (Number(item.gst || 0))) / 100;
    const discountAmt = (base * (Number(item.discount || 0))) / 100;
    return (base + gstAmt - discountAmt).toFixed(2);
  };

  return (
    <div className="mt-6 space-y-4">
      <h3 className="rounded-md text-lg font-semibold bg-indigo-100 text-indigo-700 px-4 py-2 ">
        Add Item Details
      </h3>

      {/* Table */}
      <div className="w-full overflow-x-auto rounded-md border">
        <Table className="min-w-[900px]">
          <TableHeader>
            <TableRow>
              <TableHead>Serial No.</TableHead>
              <TableHead>Item Name</TableHead>
              <TableHead>HSN Code</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>GST (%)</TableHead>
              <TableHead>Discount (%)</TableHead>
              <TableHead className="text-right">Gross Total</TableHead>
              <TableHead className="text-center">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {items.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  <Input
                    className="w-full"
                    value={item.description}
                    onChange={(e) => handleChange(index, "description", e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    className="w-full"
                    value={item.hsn}
                    onChange={(e) => handleChange(index, "hsn", e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    className="w-full"
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleChange(index, "quantity", e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    className="w-full"
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) => handleChange(index, "unitPrice", e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    className="w-full"
                    type="number"
                    value={item.gst}
                    onChange={(e) => handleChange(index, "gst", e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    className="w-full"
                    type="number"
                    value={item.discount}
                    onChange={(e) => handleChange(index, "discount", e.target.value)}
                  />
                </TableCell>
                <TableCell className="text-right">₹{calculateTotal(item)}</TableCell>
                <TableCell className="text-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.id)}
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

      {/* Buttons */}
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
    </div>
  );
}
