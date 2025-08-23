// FILE : client/src/components/expense-form/Step4Form.tsx

import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AddItem } from "./Step3Form";

type Item = {
  id?: number | string;
  name: string;
  hsn: string;
  // allow string while editing (matches Step3Form)
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
  // errors from parent (e.g. { total: "Total must be non-negative", "items": "...", "items[0].name": "..." })
  errors?: Record<string, string>;
};

export default function Step4Form({ items, setItems, data = {}, onChange, errors = {} }: Props) {
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

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Top - AddItem Table */}
      <div className="mb-4">
        <h3 className="rounded-md text-lg font-semibold bg-indigo-100 text-indigo-700 px-4 py-2 ">
          Add Item Details
        </h3>

        {/* Pass item-related errors to AddItem (it handles per-cell inline errors) */}
        <AddItem items={items} setItems={setItems} errors={errors} />
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
            aria-invalid={Boolean(errors?.terms)}
            aria-describedby={errors?.terms ? "terms-error" : undefined}
          />
          {errors?.terms && (
            <p id="terms-error" className="text-sm text-red-600 mt-1">
              {errors.terms}
            </p>
          )}
        </div>

        {/* Summary Fields */}
        <div className="space-y-4 flex-1 border rounded-lg p-4 shadow-sm bg-white">
          <div className="flex items-center justify-between">
            <Label htmlFor="subtotal">Subtotal:</Label>
            <div className="flex flex-col items-end">
              <Input id="subtotal" type="number" className="w-40 h-8" value={subtotal.toFixed(2)} readOnly />
              {errors?.subtotal && (
                <p id="subtotal-error" className="text-sm text-red-600 mt-1">
                  {errors.subtotal}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="discount">Discount:</Label>
            <div className="flex flex-col items-end">
              <Input
                id="discount"
                type="number"
                className="w-40 h-8"
                value={data.discount ?? 0}
                onChange={(e) => onChange({ discount: Number(e.target.value) })}
                aria-invalid={Boolean(errors?.discount)}
                aria-describedby={errors?.discount ? "discount-error" : undefined}
              />
              {errors?.discount && (
                <p id="discount-error" className="text-sm text-red-600 mt-1">
                  {errors.discount}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="cgst">CGST:</Label>
            <div className="flex flex-col items-end">
              <Input
                id="cgst"
                type="number"
                className="w-40 h-8"
                value={data.cgst ?? 0}
                onChange={(e) => onChange({ cgst: Number(e.target.value) })}
                aria-invalid={Boolean(errors?.cgst)}
                aria-describedby={errors?.cgst ? "cgst-error" : undefined}
              />
              {errors?.cgst && (
                <p id="cgst-error" className="text-sm text-red-600 mt-1">
                  {errors.cgst}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="sgst">SGST:</Label>
            <div className="flex flex-col items-end">
              <Input
                id="sgst"
                type="number"
                className="w-40 h-8"
                value={data.sgst ?? 0}
                onChange={(e) => onChange({ sgst: Number(e.target.value) })}
                aria-invalid={Boolean(errors?.sgst)}
                aria-describedby={errors?.sgst ? "sgst-error" : undefined}
              />
              {errors?.sgst && (
                <p id="sgst-error" className="text-sm text-red-600 mt-1">
                  {errors.sgst}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="igst">IGST:</Label>
            <div className="flex flex-col items-end">
              <Input
                id="igst"
                type="number"
                className="w-40 h-8"
                value={data.igst ?? 0}
                onChange={(e) => onChange({ igst: Number(e.target.value) })}
                aria-invalid={Boolean(errors?.igst)}
                aria-describedby={errors?.igst ? "igst-error" : undefined}
              />
              {errors?.igst && (
                <p id="igst-error" className="text-sm text-red-600 mt-1">
                  {errors.igst}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="shipping">Shipping/Other Fees:</Label>
            <div className="flex flex-col items-end">
              <Input
                id="shipping"
                type="number"
                className="w-40 h-8"
                value={data.shipping ?? 0}
                onChange={(e) => onChange({ shipping: Number(e.target.value) })}
                aria-invalid={Boolean(errors?.shipping)}
                aria-describedby={errors?.shipping ? "shipping-error" : undefined}
              />
              {errors?.shipping && (
                <p id="shipping-error" className="text-sm text-red-600 mt-1">
                  {errors.shipping}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between font-semibold">
            <Label htmlFor="total">Total:</Label>
            <div className="flex flex-col items-end">
              <Input id="total" type="number" className="w-40 h-8" value={total.toFixed(2)} readOnly />
              {errors?.total && (
                <p id="total-error" className="text-sm text-red-600 mt-1">
                  {errors.total}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
