// File: client/src/components/sales-form/Step4Form.tsx

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
// Use default export Step3 table from Step3Form so summary can edit items
import Step3Table from "./Step3Form";

type StepProps = {
  data?: Record<string, any>; // step4 data (terms, subtotal, etc.)
  onChange?: (partial: Record<string, any>) => void; // updates step4
  step3Data?: Record<string, any>; // optional: current items from step3
  onStep3Change?: (partial: Record<string, any>) => void; // optional: update items in parent step3
};

function toNumber(v: any) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export default function InvoiceSummaryForm({ data = {}, onChange, step3Data, onStep3Change }: StepProps) {
  // local state for summary fields (keeps UI identical but allows parent sync)
  const [terms, setTerms] = useState<string>(data?.terms ?? data?.termsAndConditions ?? "");
  const [subtotal, setSubtotal] = useState<number>(toNumber(data?.subtotal ?? 0));
  const [discount, setDiscount] = useState<number>(toNumber(data?.discount ?? 0)); // amount (not percent)
  const [cgst, setCgst] = useState<number>(toNumber(data?.cgst ?? 0));
  const [sgst, setSgst] = useState<number>(toNumber(data?.sgst ?? 0));
  const [igst, setIgst] = useState<number>(toNumber(data?.igst ?? 0));
  const [shipping, setShipping] = useState<number>(toNumber(data?.shipping ?? data?.shippingFee ?? 0));
  const [total, setTotal] = useState<number>(toNumber(data?.total ?? 0));

  // keep local state synced with incoming `data`
  useEffect(() => {
    setTerms(data?.terms ?? data?.termsAndConditions ?? "");
    setSubtotal(toNumber(data?.subtotal ?? 0));
    setDiscount(toNumber(data?.discount ?? 0));
    setCgst(toNumber(data?.cgst ?? 0));
    setSgst(toNumber(data?.sgst ?? 0));
    setIgst(toNumber(data?.igst ?? 0));
    setShipping(toNumber(data?.shipping ?? data?.shippingFee ?? 0));
    setTotal(toNumber(data?.total ?? 0));
  }, [data]);

  // helper to notify parent about step4 changes
  const notifyParent = (patch: Record<string, any>) => {
    onChange?.(patch);
  };

  // Compute totals from items if parent passed items (preferred)
  const computedFromItems = useMemo(() => {
    const items: any[] = (step3Data?.items ?? []) as any[];
    if (!Array.isArray(items) || items.length === 0) return null;

    // subtotal = sum(quantity * unitPrice - itemDiscountAmount)
    let s = 0;
    let totalTax = 0;
    for (const it of items) {
      const qty = toNumber(it.quantity ?? it.qty ?? 0);
      const unitPrice = toNumber(it.unitPrice ?? it.price ?? 0);
      const discountPct = toNumber(it.discount ?? 0); // item-level discount %
      const base = qty * unitPrice;
      const discountAmt = (base * discountPct) / 100;
      const taxable = base - discountAmt;
      const gstPct = toNumber(it.gst ?? 0);
      const gstAmt = (taxable * gstPct) / 100;
      s += taxable;
      totalTax += gstAmt;
    }

    const computedCgst = Number((totalTax / 2).toFixed(2));
    const computedSgst = Number((totalTax / 2).toFixed(2));
    const computedIgst = 0;
    const computedSubtotal = Number(s.toFixed(2));
    const computedTotal = Number((computedSubtotal + totalTax + toNumber(shipping) - toNumber(discount)).toFixed(2));

    return {
      subtotal: computedSubtotal,
      totalTax,
      cgst: computedCgst,
      sgst: computedSgst,
      igst: computedIgst,
      total: computedTotal,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step3Data?.items, shipping, discount]);

  // When items change, update summary fields (but only if they are different)
  useEffect(() => {
    if (!computedFromItems) return;
    const { subtotal: cs, cgst: cc, sgst: cs2, igst: ci, total: ct } = computedFromItems;
    // update local state (do not overwrite user-manual edits blindly if user changed something)
    setSubtotal((prev) => {
      if (Math.abs(prev - cs) > 0.009) {
        return cs;
      }
      return prev;
    });
    setCgst((prev) => (Math.abs(prev - cc) > 0.009 ? cc : prev));
    setSgst((prev) => (Math.abs(prev - cs2) > 0.009 ? cs2 : prev));
    setIgst((prev) => (Math.abs(prev - ci) > 0.009 ? ci : prev));
    setTotal((prev) => (Math.abs(prev - ct) > 0.009 ? ct : prev));

    // inform parent step4 that these fields were updated by items
    notifyParent({
      subtotal: cs,
      cgst: cc,
      sgst: cs2,
      igst: ci,
      total: ct,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [computedFromItems]);

  // handlers for inputs — update local state + notify parent
  const handleTermsChange = (v: string) => {
    setTerms(v);
    notifyParent({ terms: v });
  };
  const handleSubtotalChange = (v: number) => {
    setSubtotal(v);
    notifyParent({ subtotal: v });
    // recompute total
    const newTotal = Number((v + toNumber(cgst) + toNumber(sgst) + toNumber(igst) + toNumber(shipping) - toNumber(discount)).toFixed(2));
    setTotal(newTotal);
    notifyParent({ total: newTotal });
  };
  const handleDiscountChange = (v: number) => {
    setDiscount(v);
    notifyParent({ discount: v });
    const newTotal = Number((toNumber(subtotal) + toNumber(cgst) + toNumber(sgst) + toNumber(igst) + toNumber(shipping) - v).toFixed(2));
    setTotal(newTotal);
    notifyParent({ total: newTotal });
  };
  const handleCgstChange = (v: number) => {
    setCgst(v);
    notifyParent({ cgst: v });
    const newTotal = Number((toNumber(subtotal) + v + toNumber(sgst) + toNumber(igst) + toNumber(shipping) - toNumber(discount)).toFixed(2));
    setTotal(newTotal);
    notifyParent({ total: newTotal });
  };
  const handleSgstChange = (v: number) => {
    setSgst(v);
    notifyParent({ sgst: v });
    const newTotal = Number((toNumber(subtotal) + toNumber(cgst) + v + toNumber(igst) + toNumber(shipping) - toNumber(discount)).toFixed(2));
    setTotal(newTotal);
    notifyParent({ total: newTotal });
  };
  const handleIgstChange = (v: number) => {
    setIgst(v);
    notifyParent({ igst: v });
    const newTotal = Number((toNumber(subtotal) + toNumber(cgst) + toNumber(sgst) + v + toNumber(shipping) - toNumber(discount)).toFixed(2));
    setTotal(newTotal);
    notifyParent({ total: newTotal });
  };
  const handleShippingChange = (v: number) => {
    setShipping(v);
    notifyParent({ shipping: v });
    const newTotal = Number((toNumber(subtotal) + toNumber(cgst) + toNumber(sgst) + toNumber(igst) + v - toNumber(discount)).toFixed(2));
    setTotal(newTotal);
    notifyParent({ total: newTotal });
  };

  // If Step3Table exists, we render it and let the user edit items here (it will call onStep3Change)
  // If caller didn't pass step3Data/onStep3Change, Step3Table will still render from its own state.
  return (
    <div className="w-full flex flex-col gap-6">
      {/* Top - Items table (reuse Step3 table component) */}
      <div className="mb-4">
        {/* Pass item data and handler through so editing in this summary updates the parent step3 state */}
        {/* If parent didn't provide handlers, Step3Table still works with its own internal state (no props). */}
        {/* @ts-ignore - some Step3 implementations might not expect props but our Step3 form accepts data/onChange */}
        <Step3Table data={step3Data} onChange={(p: any) => onStep3Change?.(p)} />
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
            value={terms}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleTermsChange(e.target.value)}
          />
        </div>

        {/* Summary Fields */}
        <div className="space-y-4 flex-1 border rounded-lg p-4 shadow-sm bg-white">
          <div className="flex items-center justify-between">
            <Label htmlFor="subtotal">Subtotal:</Label>
            <Input id="subtotal" type="number" className="w-40 h-8" value={subtotal} onChange={(e) => handleSubtotalChange(toNumber(e.target.value))} />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="discount">Discount:</Label>
            <Input id="discount" type="number" className="w-40 h-8" value={discount} onChange={(e) => handleDiscountChange(toNumber(e.target.value))} />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="cgst">CGST:</Label>
            <Input id="cgst" type="number" className="w-40 h-8" value={cgst} onChange={(e) => handleCgstChange(toNumber(e.target.value))} />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="sgst">SGST:</Label>
            <Input id="sgst" type="number" className="w-40 h-8" value={sgst} onChange={(e) => handleSgstChange(toNumber(e.target.value))} />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="igst">IGST:</Label>
            <Input id="igst" type="number" className="w-40 h-8" value={igst} onChange={(e) => handleIgstChange(toNumber(e.target.value))} />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="shipping">Shipping/Other Fees:</Label>
            <Input id="shipping" type="number" className="w-40 h-8" value={shipping} onChange={(e) => handleShippingChange(toNumber(e.target.value))} />
          </div>

          <div className="flex items-center justify-between font-semibold">
            <Label htmlFor="total">Total:</Label>
            <Input id="total" type="number" className="w-40 h-8" value={total} onChange={(e) => { const v = toNumber(e.target.value); setTotal(v); notifyParent({ total: v }); }} />
          </div>
        </div>
      </div>
    </div>
  );
}
