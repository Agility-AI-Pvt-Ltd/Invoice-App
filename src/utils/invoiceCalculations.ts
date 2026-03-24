// client/src/utils/invoiceCalculations.ts
// ============================================================
// SINGLE SOURCE OF TRUTH for all invoice calculation logic.
//
// Canonical formula (GST-compliant):
//   base         = qty × unitPrice
//   discountAmt  = base × (discount% / 100)
//   taxable      = base − discountAmt
//   gstAmount    = taxable × (gst% / 100)
//   net          = taxable + gstAmount
//
// ⚠️  discount is ALWAYS a percentage (0-100), never an absolute ₹ amount.
// ⚠️  GST is ALWAYS applied on the POST-DISCOUNT taxable value.
// ============================================================

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RawItem {
  quantity?: number | string;
  unitPrice?: number | string;
  rate?: number | string;        // alias accepted in preview
  gst?: number | string;
  discount?: number | string;    // always a percentage
  // optional backend-calculated fields (used as fallback in preview)
  taxableAmount?: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  total?: number;
}

export interface CalcRowResult {
  qty: number;
  rate: number;
  gst: number;
  discountPct: number;
  discountAmount: number;
  taxable: number;
  gstAmount: number;
  net: number;
}

export interface InvoiceTotalsInput {
  items?: RawItem[];
  shipping?: number | string;
  // states needed for intra/inter-state GST split
  billFrom?: { state?: string };
  shipTo?: { state?: string };
  billTo?: { state?: string };
}

export interface InvoiceTotalsResult {
  taxableTotal: number;
  totalGst: number;
  cgst: number;
  sgst: number;
  igst: number;
  subtotal: number;      // taxableTotal + totalGst (before shipping)
  shipping: number;
  roundOff: number;
  total: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Cast any value to a finite number, defaulting to 0. */
const toNum = (v: unknown): number => {
  if (v === "" || v === null || v === undefined) return 0;
  const n = parseFloat(String(v));
  return isFinite(n) ? n : 0;
};

/** Round to exactly 2 decimal places. */
const r2 = (n: number): number => Math.round(n * 100) / 100;

// ---------------------------------------------------------------------------
// 1. Per-row calculation — canonical formula
// ---------------------------------------------------------------------------

/**
 * Calculate all financial values for a single invoice line item.
 *
 * @example
 *   calcRowItem({ quantity: 1, unitPrice: 90000, gst: 10, discount: 5 })
 *   // → { taxable: 85500, gstAmount: 8550, net: 94050, ... }
 */
export function calcRowItem(item: RawItem): CalcRowResult {
  const qty = toNum(item.quantity);
  const rate = toNum(item.unitPrice ?? (item as any).rate);
  const gst = toNum(item.gst);
  const discountPct = toNum(item.discount); // always a %

  const base = qty * rate;
  const discountAmount = r2(base * discountPct / 100);
  const taxable = r2(base - discountAmount);
  const gstAmount = r2(taxable * gst / 100);
  const net = r2(taxable + gstAmount);

  return {
    qty,
    rate,
    gst,
    discountPct,
    discountAmount,
    taxable,
    gstAmount,
    net,
  };
}

// ---------------------------------------------------------------------------
// 2. Determine intra vs inter-state
// ---------------------------------------------------------------------------

export function isInterState(billingState?: string, shippingState?: string): boolean {
  if (!billingState || !shippingState) return false;
  return billingState.trim().toLowerCase() !== shippingState.trim().toLowerCase();
}

// ---------------------------------------------------------------------------
// 3. Full invoice totals — used by Step4 summary, Print Preview, recalcTotals
// ---------------------------------------------------------------------------

/**
 * Aggregate all items into invoice-level totals, computing taxable amount,
 * CGST/SGST/IGST split based on billing vs shipping state, subtotal, shipping,
 * round-off, and final total.
 *
 * Priority order for item tax values:
 *   1. Backend-calculated fields (it.taxableAmount / it.cgst / it.sgst / it.igst)
 *   2. calcRowItem() fallback (used when backend values are not yet available)
 */
export function computeInvoiceTotals(inv: InvoiceTotalsInput): InvoiceTotalsResult {
  const items: RawItem[] = Array.isArray(inv.items) ? inv.items : [];
  const shipping = toNum(inv.shipping);

  // Resolve states
  const billingState = inv.billFrom?.state ?? "";
  const shippingState = inv.shipTo?.state || inv.billTo?.state || "";
  const interState = isInterState(billingState, shippingState);

  let taxableTotal = 0;
  let totalCgst = 0;
  let totalSgst = 0;
  let totalIgst = 0;

  items.forEach((it) => {
    const r = calcRowItem(it);

    // --- Taxable amount ---
    // Use backend field if explicitly set (even if 0 is a valid value)
    const hasBkTaxable = it.taxableAmount !== undefined && it.taxableAmount !== null;
    const itemTaxable = hasBkTaxable ? toNum(it.taxableAmount) : r.taxable;
    taxableTotal += itemTaxable;

    // --- GST breakdown ---
    const hasBkTax =
      it.cgst !== undefined || it.sgst !== undefined || it.igst !== undefined;

    if (hasBkTax) {
      // Use explicit backend tax values
      totalCgst += toNum(it.cgst);
      totalSgst += toNum(it.sgst);
      totalIgst += toNum(it.igst);
    } else {
      // Fall back to client-side calculation based on state comparison
      if (interState) {
        totalIgst += r.gstAmount;
      } else {
        totalCgst += r.gstAmount / 2;
        totalSgst += r.gstAmount / 2;
      }
    }
  });

  // Round aggregated tax values to 2 dp to eliminate floating-point drift
  taxableTotal = r2(taxableTotal);
  totalCgst = r2(totalCgst);
  totalSgst = r2(totalSgst);
  totalIgst = r2(totalIgst);

  const totalGst = r2(totalCgst + totalSgst + totalIgst);
  const subtotal = r2(taxableTotal + totalGst);        // gross subtotal before shipping
  const rawTotal = subtotal + shipping;
  const roundedTotal = Math.round(rawTotal);
  const roundOff = r2(roundedTotal - rawTotal);
  const total = r2(rawTotal + roundOff);

  return {
    taxableTotal,
    totalGst,
    cgst: totalCgst,
    sgst: totalSgst,
    igst: totalIgst,
    subtotal,
    shipping: r2(shipping),
    roundOff,
    total,
  };
}

// ---------------------------------------------------------------------------
// 4. Thin wrapper matching the legacy InvoiceForm shape
//    (subtotal, cgst, sgst, igst, total — no shipping/roundOff at that level)
// ---------------------------------------------------------------------------

/**
 * Returns the same shape that InvoiceForm.computeTotals() returned,
 * so the call-site change is minimal.
 */
export function computeFormTotals(inv: {
  items?: RawItem[];
  billFrom?: { state?: string };
  shipTo?: { state?: string };
  billTo?: { state?: string };
}): {
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
} {
  // Without shipping at this stage (Step4 form shows shipping separately)
  const t = computeInvoiceTotals({ ...inv, shipping: 0 });
  return {
    subtotal: t.taxableTotal, // subtotal = taxable (before tax) in Step4 semantics
    cgst: t.cgst,
    sgst: t.sgst,
    igst: t.igst,
    total: t.total,
  };
}
