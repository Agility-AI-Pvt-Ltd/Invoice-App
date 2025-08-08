import { useState } from "react";
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
    const [items, setItems] = useState([
        { id: 1, name: "", hsn: "", qty: 0, price: 0, gst: 0, discount: 0 },
    ]);

    const handleChange = (index: number, field: string, value: any) => {
        const updatedItems = [...items];
        updatedItems[index] = {
            ...updatedItems[index],
            [field]:
                field === "name" || field === "hsn" ? value : parseFloat(value) || 0,
        };
        setItems(updatedItems);
    };

    const addItem = () => {
        setItems([
            ...items,
            { id: Date.now(), name: "", hsn: "", qty: 0, price: 0, gst: 0, discount: 0 },
        ]);
    };

    const removeItem = (id: number) => {
        setItems(items.filter((item) => item.id !== id));
    };

    const calculateTotal = (item: typeof items[0]) => {
        const base = item.qty * item.price;
        const gstAmt = (base * item.gst) / 100;
        const discountAmt = (base * item.discount) / 100;
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
                                        value={item.name}
                                        onChange={(e) => handleChange(index, "name", e.target.value)}
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
                                        value={item.qty}
                                        onChange={(e) => handleChange(index, "qty", e.target.value)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Input
                                        className="w-full"
                                        type="number"
                                        value={item.price}
                                        onChange={(e) => handleChange(index, "price", e.target.value)}
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
