// client/src/components/invoice-form/Step3Form.tsx
import { useContext } from "react";
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
import { InvoiceContext } from "./InvoiceForm";

// ✅ define proper type for an item
type InvoiceItem = {
  id: number;
  description: string;
  hsn: string;
  quantity: number;
  unitPrice: number;
  gst: number;
  discount: number;
};

export default function Step3ItemTable() {
  return (
    <div className="mt-6 space-y-4">
      <h3 className="rounded-md text-lg font-semibold bg-indigo-100 text-indigo-700 px-4 py-2 ">
        Add Item Details
      </h3>
      <AddItem />
    </div>
  );
}

export function AddItem() {
  const ctx = useContext(InvoiceContext) as any | undefined;
  const rawItems = (ctx?.invoice?.items as any[]) || [];

  const getStandardizedItems = (): InvoiceItem[] =>
    rawItems.length > 0
      ? rawItems.map((it: any) => ({
          id: it.id ?? Date.now(),
          description: it.description ?? it.name ?? "",
          hsn: it.hsn ?? "",
          quantity: Number(it.quantity ?? it.qty ?? 0),
          unitPrice: Number(it.unitPrice ?? it.price ?? 0),
          gst: Number(it.gst ?? 0),
          discount: Number(it.discount ?? 0),
        }))
      : [
          {
            id: Date.now(),
            description: "",
            hsn: "",
            quantity: 0,
            unitPrice: 0,
            gst: 0,
            discount: 0,
          },
        ];

  const items: InvoiceItem[] = getStandardizedItems();

  const pushItemsToContext = (updatedItems: InvoiceItem[]) => {
    if (!ctx) return;
    ctx.setInvoice((prev: any) => ({ ...prev, items: updatedItems }));
    ctx.recalcTotals?.();
  };

  // ✅ field is strictly typed to keys of InvoiceItem
  const handleChange = (
    index: number,
    field: keyof InvoiceItem,
    value: any
  ) => {
    const updated = [...items];
    if (field === "description" || field === "hsn") {
      updated[index][field] = value as string;
    } else {
      updated[index][field] = parseFloat(value) || 0;
    }
    pushItemsToContext(updated);
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now(),
      description: "",
      hsn: "",
      quantity: 0,
      unitPrice: 0,
      gst: 0,
      discount: 0,
    };
    pushItemsToContext([...items, newItem]);
  };

  const removeItem = (id: number) => {
    const updated = items.filter((it) => it.id !== id);
    pushItemsToContext(
      updated.length
        ? updated
        : [
            {
              id: Date.now(),
              description: "",
              hsn: "",
              quantity: 0,
              unitPrice: 0,
              gst: 0,
              discount: 0,
            },
          ]
    );
  };

  const calculateTotal = (item: InvoiceItem) => {
    const base = (item.quantity || 0) * (item.unitPrice || 0);
    const gstAmt = (base * (item.gst || 0)) / 100;
    const discountAmt = (base * (item.discount || 0)) / 100;
    return (base + gstAmt - discountAmt).toFixed(2);
  };

  return (
    <>
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
                    onChange={(e) =>
                      handleChange(index, "description", e.target.value)
                    }
                  />
                </TableCell>
                <TableCell>
                  <Input
                    className="w-full"
                    value={item.hsn}
                    onChange={(e) =>
                      handleChange(index, "hsn", e.target.value)
                    }
                  />
                </TableCell>
                <TableCell>
                  <Input
                    className="w-full"
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      handleChange(index, "quantity", e.target.value)
                    }
                  />
                </TableCell>
                <TableCell>
                  <Input
                    className="w-full"
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) =>
                      handleChange(index, "unitPrice", e.target.value)
                    }
                  />
                </TableCell>
                <TableCell>
                  <Input
                    className="w-full"
                    type="number"
                    value={item.gst}
                    onChange={(e) =>
                      handleChange(index, "gst", e.target.value)
                    }
                  />
                </TableCell>
                <TableCell>
                  <Input
                    className="w-full"
                    type="number"
                    value={item.discount}
                    onChange={(e) =>
                      handleChange(index, "discount", e.target.value)
                    }
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
