import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AddItem } from "./Step3Form";

type Item = {
  id?: number | string;
  name: string;
  hsn: string;
  // <- MATCH Step3Form: allow string while editing, or number when normalized
  qty: number | string;
  price: number | string;
  gst: number | string;
  discount: number | string;
};

type Props = {
  items: Item[];
  setItems: (items: Item[]) => void;
  data: {
    terms?: string;
    subtotal?: number;
    discount?: number;
    cgst?: number;
    sgst?: number;
    igst?: number;
    shipping?: number;
    total?: number;
  };
  onChange: (partial: Partial<any>) => void;
};

export default function InvoiceSummaryForm({ items, setItems, data = {}, onChange }: Props) {
  // compute subtotal / total locally (simple calculation)
  const subtotal = (items || []).reduce((acc, it) => {
    const base = (Number(it.qty) || 0) * (Number(it.price) || 0);
    const gstAmt = (base * (Number(it.gst) || 0)) / 100;
    const discountAmt = (base * (Number(it.discount) || 0)) / 100;
    return acc + base + gstAmt - discountAmt;
  }, 0);

  const shipping = Number(data.shipping || 0);
  const discount = Number(data.discount || 0);
  const cgst = Number(data.cgst || 0);
  const sgst = Number(data.sgst || 0);
  const igst = Number(data.igst || 0);

  const total = (() => {
    // naive aggregation: subtotal + taxes + shipping - discount
    return subtotal + shipping - discount + ((subtotal * (cgst + sgst + igst)) / 100);
  })();

  // whenever totals change we notify parent (so parent formData.step4 stays updated if needed)
  // but we won't override parent fields blindly; parent controls state via onChange
  // If you want auto-sync, uncomment line below:
  // onChange({ subtotal, total });

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Top - AddItem Table */}
      <div className="mb-4">
        <AddItem items={items} setItems={setItems} />
      </div>

      {/* Bottom - Flex Wrap for Terms and Summary */}
      <div className="w-full flex flex-col md:flex-row gap-6">
        {/* Terms and Conditions */}
        <div className="space-y-2 flex-1">
          <Label htmlFor="terms">Terms and Conditions</Label>
          <Textarea
            id="terms"
            placeholder="Enter Terms and Conditions"
            className="h-24"
            value={data.terms || ""}
            onChange={(e) => onChange({ terms: e.target.value })}
          />
        </div>

        {/* Summary Fields */}
        <div className="space-y-4 flex-1 border rounded-lg p-4 shadow-sm bg-white">
          <div className="flex items-center justify-between">
            <Label htmlFor="subtotal">Subtotal:</Label>
            <Input id="subtotal" type="number" className="w-40 h-8" value={subtotal.toFixed(2)} readOnly />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="discount">Discount:</Label>
            <Input id="discount" type="number" className="w-40 h-8" value={data.discount || 0} onChange={(e) => onChange({ discount: Number(e.target.value) })} />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="cgst">CGST:</Label>
            <Input id="cgst" type="number" className="w-40 h-8" value={data.cgst || 0} onChange={(e) => onChange({ cgst: Number(e.target.value) })} />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="sgst">SGST:</Label>
            <Input id="sgst" type="number" className="w-40 h-8" value={data.sgst || 0} onChange={(e) => onChange({ sgst: Number(e.target.value) })} />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="igst">IGST:</Label>
            <Input id="igst" type="number" className="w-40 h-8" value={data.igst || 0} onChange={(e) => onChange({ igst: Number(e.target.value) })} />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="shipping">Shipping/Other Fees:</Label>
            <Input id="shipping" type="number" className="w-40 h-8" value={data.shipping || 0} onChange={(e) => onChange({ shipping: Number(e.target.value) })} />
          </div>

          <div className="flex items-center justify-between font-semibold">
            <Label htmlFor="total">Total:</Label>
            <Input id="total" type="number" className="w-40 h-8" value={total.toFixed(2)} readOnly />
          </div>
        </div>
      </div>
    </div>
  )
}
