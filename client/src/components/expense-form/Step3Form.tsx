import { useState, useEffect } from "react";
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

type Item = {
  id?: number | string;
  name: string;
  hsn: string;
  // numeric fields allowed as string while editing so we can keep user input like "" or "0."
  qty: number | string;
  price: number | string;
  gst: number | string;
  discount: number | string;
};

type Props = {
  items?: Item[];
  setItems?: (items: Item[]) => void;
};

export default function Step3ItemTable({ items, setItems }: Props) {
    return (
        <div className="mt-6 space-y-4">
            <h3 className="rounded-md text-lg font-semibold bg-indigo-100 text-indigo-700 px-4 py-2 ">
                Add Item Details
            </h3>
            <AddItem items={items} setItems={setItems} />
        </div>
    );
}



export function AddItem({ items: externalItems, setItems: externalSetItems }: Props) {
    // If parent provided items & setItems, use them. Otherwise fallback to local state for compatibility.
    const [localItems, setLocalItems] = useState<Item[]>([
        { id: Date.now(), name: "", hsn: "", qty: 0, price: 0, gst: 0, discount: 0 },
    ]);

    const usingExternal = !!(externalItems && externalSetItems);

    const items = usingExternal ? (externalItems as Item[]) : localItems;
    const setItems = usingExternal ? (externalSetItems as (items: Item[]) => void) : setLocalItems;

    useEffect(() => {
      // ensure there's always at least one row
      if (!items || items.length === 0) {
        setItems([{ id: Date.now(), name: "", hsn: "", qty: 0, price: 0, gst: 0, discount: 0 }]);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleChange = (index: number, field: string, value: string) => {
        const updatedItems = [...items];

        if (field === "name" || field === "hsn") {
          updatedItems[index] = {
            ...updatedItems[index],
            [field]: value,
          };
        } else {
          // numeric fields: allow empty string while typing, block plain "-" by converting to ""
          let newValue = value;

          if (newValue === "-") {
            // user typed just '-' — treat as empty so they can continue typing, but don't keep '-' as value
            newValue = "";
          } else {
            // try parse
            const parsed = parseFloat(newValue);
            if (!isNaN(parsed) && parsed < 0) {
              // clamp negatives to 0 immediately
              newValue = "0";
            }
            // if parsed is NaN (like "00.", "0.", ""), we keep the raw string to allow typing
          }
          updatedItems[index] = {
            ...updatedItems[index],
            [field]: newValue,
          };
        }

        setItems(updatedItems);
    };

    const handleNumericFocus = (index: number, field: string) => {
      const current = items[index]?.[field as keyof Item] as any;
      if (current === 0 || current === "0") {
        const updated = [...items];
        updated[index] = { ...updated[index], [field]: "" };
        setItems(updated);
      }
    };

    const handleNumericBlur = (index: number, field: string) => {
      const current = items[index]?.[field as keyof Item] as any;
      // empty or invalid or negative -> set to "0"
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
      // else keep as entered (string representing valid >=0 number)
    };

    // prevent '-' key in numeric fields (extra safety)
    const handleNumericKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "-") {
        e.preventDefault();
      }
    };

    const addItem = () => {
        setItems([
            ...items,
            { id: Date.now(), name: "", hsn: "", qty: 0, price: 0, gst: 0, discount: 0 },
        ]);
    };

    const removeItem = (id: number | string) => {
        setItems(items.filter((item) => item.id !== id));
    };

    const toNumber = (val: number | string) => {
      // convert string/number to a safe number (empty or invalid -> 0)
      if (val === "" || val === null || typeof val === "undefined") return 0;
      const n = parseFloat(String(val));
      return isNaN(n) ? 0 : n;
    };

    const calculateTotal = (item: typeof items[0]) => {
        const qty = toNumber(item.qty);
        const price = toNumber(item.price);
        const gst = toNumber(item.gst);
        const discount = toNumber(item.discount);

        const base = qty * price;
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
                            <TableHead>Item Name</TableHead>
                            <TableHead>HSN Code</TableHead>
                            <TableHead>Qty</TableHead>
                            <TableHead>Price (₹)</TableHead>
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
                                <TableCell>
                                    <Input
                                        className="w-full"
                                        value={item.name as string}
                                        onChange={(e) => handleChange(index, "name", e.target.value)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Input
                                        className="w-full"
                                        value={item.hsn as string}
                                        onChange={(e) => handleChange(index, "hsn", e.target.value)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Input
                                        className="w-full"
                                        type="number"
                                        min={0}
                                        value={String(item.qty ?? "")}
                                        onChange={(e) => handleChange(index, "qty", e.target.value)}
                                        onFocus={() => handleNumericFocus(index, "qty")}
                                        onBlur={() => handleNumericBlur(index, "qty")}
                                        onKeyDown={handleNumericKeyDown}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Input
                                        className="w-full"
                                        type="number"
                                        min={0}
                                        value={String(item.price ?? "")}
                                        onChange={(e) => handleChange(index, "price", e.target.value)}
                                        onFocus={() => handleNumericFocus(index, "price")}
                                        onBlur={() => handleNumericBlur(index, "price")}
                                        onKeyDown={handleNumericKeyDown}
                                    />
                                </TableCell>
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
                                    />
                                </TableCell>
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
                                    />
                                </TableCell>
                                <TableCell className="text-right">
                                    ₹{calculateTotal(item)}
                                </TableCell>
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
