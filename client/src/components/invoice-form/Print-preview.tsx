// client/src/components/invoice-form/Print-preview.tsx

import { useRef } from "react";
import { X, Download, Printer } from "lucide-react";
import type { InvoiceModel } from "@/contexts/InvoiceContext";

type Props = {
  invoice: Partial<InvoiceModel> & Record<string, any>;
  onClose: () => void;
};

export default function PrintPreview({ invoice, onClose }: Props) {
  const printRef = useRef<HTMLDivElement | null>(null);

  const fmtDate = (d?: string) => {
    if (!d) return "N/A";
    try {
      const date = new Date(d);
      if (isNaN(date.getTime())) return d;
      return date.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
    } catch {
      return d;
    }
  };

  const safe = (v: any) => (v === null || v === undefined ? "" : String(v));

  // === per-row calculation (canonical) ===
  const calcRow = (it: any) => {
    const qty = Number(it.quantity || 0);
    const rate = Number(it.unitPrice ?? it.rate ?? 0);
    const gst = Number(it.gst ?? 0);
    const disc = Number(it.discount ?? 0);

    const base = +(qty * rate); // raw base
    const discountAmount = disc > 0 && disc <= 100 ? +(base * disc) / 100 : +disc; // percent or absolute
    const taxable = +(base - (discountAmount || 0));
    const gstAmount = +(taxable * gst) / 100;
    const net = +(taxable + gstAmount);

    return {
      qty,
      rate: +rate,
      gst: +gst,
      discountAmount: +discountAmount,
      taxable: +taxable,
      gstAmount: +gstAmount,
      net: +net,
    };
  };

  // === totals ===
  const computeTotals = (inv: any) => {
    const items = Array.isArray(inv.items) ? inv.items : [];
    let taxableTotal = 0;
    let totalGst = 0;
    let subtotal = 0; // sum of nets (taxable + gst)
    items.forEach((it: any) => {
      const r = calcRow(it);
      taxableTotal += r.taxable;
      totalGst += r.gstAmount;
      subtotal += r.net;
    });

    const cgst = +(totalGst / 2).toFixed(2);
    const sgst = +(totalGst / 2).toFixed(2);

    const shipping = Number(inv.shipping || 0);

    // Subtotal for roundoff calculation should include shipping (if any)
    const rawTotalBeforeRound = +(subtotal + shipping);

    // Round off to nearest rupee (businessy behavior).
    const roundedTotal = Math.round(rawTotalBeforeRound);
    const roundOff = +(roundedTotal - rawTotalBeforeRound).toFixed(2);

    const total = +(rawTotalBeforeRound + roundOff).toFixed(2);

    return {
      taxableTotal: +taxableTotal.toFixed(2),
      totalGst: +totalGst.toFixed(2),
      cgst,
      sgst,
      subtotal: +subtotal.toFixed(2),
      shipping: +shipping.toFixed(2),
      roundOff,
      total,
    };
  };

  const totals = computeTotals(invoice);

  // === number to words (simple INR) ===
  const numberToWords = (num: number) => {
    if (!isFinite(num)) return "";
    if (num === 0) return "Zero Rupees Only";
    const a = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    const inWords = (n: number): string => {
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
      if (n < 1000) return a[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + inWords(n % 100) : "");
      if (n < 100000) return inWords(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + inWords(n % 1000) : "");
      if (n < 10000000) return inWords(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + inWords(n % 100000) : "");
      return inWords(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + inWords(n % 10000000) : "");
    };
    const whole = Math.floor(Math.abs(num));
    const fraction = Math.round((Math.abs(num) - whole) * 100);
    let words = inWords(whole) + " Rupees";
    if (fraction > 0) words += " and " + inWords(fraction) + " Paise";
    words += " Only";
    if (num < 0) words = "Minus " + words;
    return words;
  };

  // === HSN summary builder ===
  const buildHsnSummary = (items: any[]) => {
    const map: Record<string, { taxable: number; cgst: number; sgst: number }> = {};
    items.forEach((it) => {
      const code = safe(it.hsn || it.hsn_sac || "-");
      const r = calcRow(it);
      if (!map[code]) map[code] = { taxable: 0, cgst: 0, sgst: 0 };
      map[code].taxable += r.taxable;
      map[code].cgst += r.gstAmount / 2;
      map[code].sgst += r.gstAmount / 2;
    });
    return map;
  };

  // Precompute hsnMap for on-screen rendering
  const hsnMap = buildHsnSummary(Array.isArray(invoice.items) ? invoice.items : []);

  // === printable HTML generator (keeps same calculations) ===
  const generatePrintableHTML = (inv: any) => {
    const t = computeTotals(inv);
    const itemsHtml = (Array.isArray(inv.items) ? inv.items : []).map((it: any, idx: number) => {
      const r = calcRow(it);
      return `<tr style="page-break-inside:avoid">
        <td style="padding:8px;border:1px solid #ddd;text-align:center">${idx + 1}</td>
        <td style="padding:8px;border:1px solid #ddd">${safe(it.description) || "-"}</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:center">${safe(it.hsn || it.hsn_sac || "-")}</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:right">${r.qty}</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:right">₹${r.rate.toFixed(2)}</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:right">${r.gst}%</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:right">₹${r.taxable.toFixed(2)}</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:right">₹${r.net.toFixed(2)}</td>
      </tr>`;
    }).join("\n");

    const hsnHtml = Object.keys(hsnMap).map((h) => {
      const v = hsnMap[h];
      return `<tr>
        <td style="padding:6px;border:1px solid #eee;text-align:left">${h}</td>
        <td style="padding:6px;border:1px solid #eee;text-align:right">₹${v.taxable.toFixed(2)}</td>
        <td style="padding:6px;border:1px solid #eee;text-align:right">₹${v.cgst.toFixed(2)}</td>
        <td style="padding:6px;border:1px solid #eee;text-align:right">₹${v.sgst.toFixed(2)}</td>
        <td style="padding:6px;border:1px solid #eee;text-align:right">₹${(v.cgst + v.sgst).toFixed(2)}</td>
      </tr>`;
    }).join("\n");

    const style = `
      html,body{margin:0;padding:0;background:#f7fafc;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial;color:#111827}
      .sheet{max-width:900px;margin:18px auto;background:#fff;padding:20px;border-radius:6px;border:1px solid #e6eef5}
      .header{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap}
      .seller{font-weight:700;color:#0b5cf3}
      .muted{color:#6b7280;font-size:13px}
      table{width:100%;border-collapse:collapse;margin-top:10px}
      th{background:#f3f4f6;padding:8px;border:1px solid #e6e6e6;text-align:left;font-weight:700}
      td{padding:8px;border:1px solid #e6e6e6;font-size:13px}
      .right{text-align:right}
      .no-print{display:block}
      @media print {
        .no-print{display:none}
        .sheet{box-shadow:none;border-radius:0;margin:0;padding:12px}
      }
      tr{page-break-inside:avoid}
      @media (max-width:640px){
        .header{flex-direction:column}
      }
    `;

    const html = `<!doctype html>
      <html>
      <head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Invoice ${safe(inv.invoiceNumber)}</title><style>${style}</style></head>
      <body>
        <div class="sheet">
          <div class="header">
            <div style="flex:1">
              <div class="seller">${safe(inv.billFrom?.businessName || inv.billFrom?.name || "Seller Name")}</div>
              <div class="muted">${safe(inv.billFrom?.address || "")}</div>
              <div class="muted">Phone: ${safe(inv.billFrom?.phone || "")} • Email: ${safe(inv.billFrom?.email || "")}</div>
              <div class="muted">GSTIN: ${safe(inv.billFrom?.gst || inv.billFrom?.gstin || "")}</div>
            </div>
            <div style="width:340px;text-align:right">
              <div style="font-size:18px;font-weight:800">INVOICE</div>
              <div style="margin-top:8px" class="muted">Invoice No: <strong>${safe(inv.invoiceNumber)}</strong></div>
              <div class="muted">Invoice Date: ${fmtDate(inv.date)}</div>
              <div class="muted">Due Date: ${fmtDate(inv.dueDate)}</div>
            </div>
          </div>

          <div style="display:flex;gap:12px;margin-top:12px;flex-wrap:wrap">
            <div style="flex:1;border:1px solid #eef2f6;padding:10px">
              <div style="font-weight:700">Customer Name & Billing Address</div>
              <div style="margin-top:6px">${safe(inv.billTo?.name || inv.customerName || "")}</div>
              <div class="muted">${safe(inv.billTo?.address || "")}</div>
              <div class="muted">GSTIN: ${safe(inv.billTo?.gst || inv.billTo?.gstin || "")}</div>
              <div class="muted">Phone: ${safe(inv.billTo?.phone || "")}</div>
            </div>

            <div style="width:320px;border:1px solid #eef2f6;padding:10px">
              <div style="font-weight:700">Shipping Address</div>
              <div style="margin-top:6px">${safe(inv.shipTo?.name || "")}</div>
              <div class="muted">${safe(inv.shipTo?.address || inv.shippingAddress || inv.billTo?.address || "")}</div>
            </div>
          </div>

          <div style="margin-top:12px">
            <table>
              <thead>
                <tr>
                  <th style="width:40px;text-align:center">S No</th>
                  <th>Description</th>
                  <th style="width:100px;text-align:center">HSN / SAC</th>
                  <th style="width:60px;text-align:right">Qty</th>
                  <th style="width:100px;text-align:right">Item Rate</th>
                  <th style="width:70px;text-align:right">Tax %</th>
                  <th style="width:110px;text-align:right">Taxable Value</th>
                  <th style="width:120px;text-align:right">Net Amount</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>

          <div style="display:flex;gap:12px;margin-top:12px;align-items:flex-start;flex-wrap:wrap">
            <div style="flex:1">
              <div style="font-weight:700;margin-bottom:6px">Declaration</div>
              <div class="muted" style="white-space:pre-wrap;margin-top:6px">${safe(inv.declaration || "We declare that this invoice shows the actual price of the goods / services described and that all particulars are true and correct.")}</div>
            </div>

            <div style="width:340px">
              <div style="border:1px solid #eef2f6;padding:10px;background:#fcfeff">
                <div style="display:flex;justify-content:space-between;margin-bottom:6px"><div class="muted">Taxable Amount</div><div class="right">₹${t.taxableTotal.toFixed(2)}</div></div>
                <div style="display:flex;justify-content:space-between;margin-bottom:6px"><div class="muted">CGST</div><div class="right">₹${t.cgst.toFixed(2)}</div></div>
                <div style="display:flex;justify-content:space-between;margin-bottom:6px"><div class="muted">SGST</div><div class="right">₹${t.sgst.toFixed(2)}</div></div>
                <div style="display:flex;justify-content:space-between;margin-bottom:6px"><div class="muted">Sub Total</div><div class="right">₹${t.subtotal.toFixed(2)}</div></div>
                <div style="display:flex;justify-content:space-between;margin-bottom:6px"><div class="muted">Round Off</div><div class="right">₹${t.roundOff.toFixed(2)}</div></div>
                <div style="border-top:1px dashed #e6e6e6;padding-top:8px;margin-top:8px;font-weight:800;display:flex;justify-content:space-between">
                  <div>Total</div><div class="right">₹${t.total.toFixed(2)}</div>
                </div>
                <div style="margin-top:8px;font-size:12px;color:#6b7280"><strong>In Words:</strong> ${numberToWords(t.total)}</div>
              </div>
            </div>
          </div>

          <div style="margin-top:12px">
            <div style="font-weight:700;margin-bottom:6px">HSN / SAC Summary</div>
            <table>
              <thead>
                <tr>
                  <th style="width:220px">HSN / SAC</th>
                  <th style="text-align:right">Taxable Value</th>
                  <th style="text-align:right">CGST Amount</th>
                  <th style="text-align:right">SGST Amount</th>
                  <th style="text-align:right">Total Tax</th>
                </tr>
              </thead>
              <tbody>
                ${hsnHtml || `<tr><td colspan="5" style="padding:8px;text-align:center;color:#6b7280">No HSN summary available</td></tr>`}
              </tbody>
            </table>
          </div>

          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-top:14px;gap:12px;flex-wrap:wrap">
            <div style="flex:1"></div>
            <div style="width:260px;text-align:center">
              <div style="height:48px"></div>
              <div style="margin-top:6px;font-weight:700">For ${safe(inv.billFrom?.businessName || inv.billFrom?.name || "Seller")}</div>
              <div style="height:56px"></div>
              <div style="border-top:1px solid #e6e6e6;margin-top:6px;padding-top:6px" class="muted">Authorised Signatory</div>
            </div>
          </div>

          <div style="margin-top:12px;text-align:center;font-size:12px;color:#6b7280">Original For Recipient</div>
        </div>
      </body>
      </html>`;

    return html;
  };

  // fallback open+print
  const fallbackOpenAndPrint = (html: string) => {
    try {
      const w = window.open("", "_blank", "noopener,noreferrer");
      if (!w) {
        alert("Unable to open print window. Please allow popups for this site.");
        return;
      }
      w.document.open();
      w.document.write(html);
      w.document.close();
      const run = () => {
        try {
          w.focus();
          w.print();
        } catch (e) {
          console.error(e);
        }
      };
      if (w.document.readyState === "complete") run();
      else w.onload = run;
    } catch (e) {
      console.error(e);
      alert("Unable to open print window. Please allow popups for this site.");
    }
  };

  const handlePrint = () => {
    try {
      const html = generatePrintableHTML(invoice);
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      iframe.setAttribute("aria-hidden", "true");
      document.body.appendChild(iframe);

      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) {
        fallbackOpenAndPrint(html);
        return;
      }
      doc.open();
      doc.write(html);
      doc.close();

      const tryPrint = () => {
        try {
          const w = iframe.contentWindow;
          if (!w) throw new Error("No iframe window available");
          w.focus();
          setTimeout(() => {
            try {
              w.print();
            } catch (err) {
              console.error("iframe print failed", err);
              fallbackOpenAndPrint(html);
            } finally {
              setTimeout(() => {
                try {
                  document.body.removeChild(iframe);
                } catch {}
              }, 1200);
            }
          }, 250);
        } catch (err) {
          console.error(err);
          fallbackOpenAndPrint(html);
          try {
            document.body.removeChild(iframe);
          } catch {}
        }
      };

      if (iframe.contentWindow?.document.readyState === "complete") tryPrint();
      else {
        iframe.onload = tryPrint;
        setTimeout(tryPrint, 800);
      }
    } catch (err) {
      console.error("print error", err);
      try {
        fallbackOpenAndPrint(generatePrintableHTML(invoice));
      } catch {
        alert("Could not open print dialog. Try download instead.");
      }
    }
  };

  const handleDownload = () => {
    try {
      const html = generatePrintableHTML(invoice);
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const safeName = (invoice.invoiceNumber || "invoice").replace(/[^\w\-]/g, "_");
      a.download = `${safeName}.html`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (err) {
      console.error("download error", err);
      alert("Could not download invoice. See console for details.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, backgroundColor: "rgba(255,255,255,0.7)", backdropFilter: "blur(6px)" }}
      />
      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col rounded-lg">
        <div className="flex justify-between items-center p-4 border-b bg-white no-print">
          <h2 className="text-lg font-semibold">Invoice Preview</h2>
          <div className="flex gap-2">
            <button onClick={handlePrint} className="px-4 py-2 bg-blue-600 text-white rounded flex items-center gap-2">
              <Printer size={16} /> Print
            </button>
            <button onClick={handleDownload} className="px-4 py-2 bg-green-600 text-white rounded flex items-center gap-2">
              <Download size={16} /> Download
            </button>
            <button onClick={onClose} className="p-2 rounded hover:bg-gray-100">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6 bg-transparent">
          <div ref={printRef} className="bg-white rounded p-6" style={{ boxShadow: "0 8px 28px rgba(2,6,23,0.06)" }}>
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div className="flex-1">
                <div className="text-xl font-bold text-blue-700">{invoice.billFrom?.businessName || invoice.billFrom?.name || "Seller Name"}</div>
                <div className="text-sm text-gray-600">{invoice.billFrom?.address}</div>
                <div className="text-sm text-gray-500">Phone: {invoice.billFrom?.phone || ""} • Email: {invoice.billFrom?.email || ""}</div>
                <div className="text-sm text-gray-500">GSTIN: {invoice.billFrom?.gst || invoice.billFrom?.gstin || ""}</div>
              </div>

              <div className="w-full md:w-80 text-left md:text-right">
                <div className="text-2xl font-extrabold">TAX INVOICE</div>
                <div className="text-sm text-gray-600 mt-1">Invoice No: <strong>{invoice.invoiceNumber}</strong></div>
                <div className="text-sm text-gray-600">Invoice Date: {fmtDate(invoice.date)}</div>
                <div className="text-sm text-gray-600">Due Date: {fmtDate(invoice.dueDate)}</div>
              </div>
            </div>

            {/* Bill / Ship */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 border rounded bg-gray-50">
                <div className="font-semibold">Customer Name & Billing Address</div>
                <div className="text-sm">{invoice.billTo?.name || invoice.customerName}</div>
                <div className="text-xs text-gray-500">{invoice.billTo?.address}</div>
                <div className="text-xs text-gray-500">GSTIN: {invoice.billTo?.gst || invoice.billTo?.gstin || ""}</div>
                <div className="text-xs text-gray-500">Phone: {invoice.billTo?.phone || ""}</div>
              </div>

              <div className="p-3 border rounded bg-gray-50">
                <div className="font-semibold">Shipping Address</div>
                <div className="text-sm">{invoice.shipTo?.name || ""}</div>
                <div className="text-xs text-gray-500">{invoice.shipTo?.address || invoice.shippingAddress || invoice.billTo?.address}</div>
              </div>
            </div>

            {/* Items: table for md+, stacked cards for small */}
            <div className="mt-4">
              {/* Desktop / tablet table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border px-2 py-2 text-center" style={{ width: 40 }}>S No</th>
                      <th className="border px-2 py-2 text-left">Description</th>
                      <th className="border px-2 py-2 text-center" style={{ width: 110 }}>HSN / SAC</th>
                      <th className="border px-2 py-2 text-right" style={{ width: 60 }}>Qty</th>
                      <th className="border px-2 py-2 text-right" style={{ width: 100 }}>Item Rate</th>
                      <th className="border px-2 py-2 text-right" style={{ width: 70 }}>Tax %</th>
                      <th className="border px-2 py-2 text-right" style={{ width: 110 }}>Taxable Value</th>
                      <th className="border px-2 py-2 text-right" style={{ width: 120 }}>Net Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(invoice.items || []).map((it: any, idx: number) => {
                      const r = calcRow(it);
                      return (
                        <tr key={idx} style={{ pageBreakInside: "avoid" }} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                          <td className="border px-2 py-2 text-center">{idx + 1}</td>
                          <td className="border px-2 py-2">{it.description || "-"}</td>
                          <td className="border px-2 py-2 text-center">{it.hsn || it.hsn_sac || "-"}</td>
                          <td className="border px-2 py-2 text-right">{r.qty}</td>
                          <td className="border px-2 py-2 text-right">₹{r.rate.toFixed(2)}</td>
                          <td className="border px-2 py-2 text-right">{r.gst}%</td>
                          <td className="border px-2 py-2 text-right">₹{r.taxable.toFixed(2)}</td>
                          <td className="border px-2 py-2 text-right font-semibold">₹{r.net.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile stacked cards */}
              <div className="block md:hidden space-y-3">
                {(invoice.items || []).map((it: any, idx: number) => {
                  const r = calcRow(it);
                  return (
                    <div key={idx} className="border rounded p-3 bg-white shadow-sm">
                      <div className="flex justify-between items-start gap-2">
                        <div className="font-semibold">#{idx + 1} — {it.description || "-"}</div>
                        <div className="text-sm text-gray-600">₹{r.net.toFixed(2)}</div>
                      </div>
                      <div className="mt-2 text-xs text-gray-500 grid grid-cols-2 gap-2">
                        <div><strong>HSN:</strong> {it.hsn || it.hsn_sac || "-"}</div>
                        <div className="text-right"><strong>Qty:</strong> {r.qty}</div>
                        <div><strong>Rate:</strong> ₹{r.rate.toFixed(2)}</div>
                        <div className="text-right"><strong>Tax %:</strong> {r.gst}%</div>
                        <div><strong>Taxable:</strong> ₹{r.taxable.toFixed(2)}</div>
                        <div className="text-right"><strong>GST:</strong> ₹{r.gstAmount.toFixed(2)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Totals */}
            <div className="mt-4 flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="text-sm font-semibold mb-2">Declaration</div>
                <div className="text-xs text-gray-600 mt-1 whitespace-pre-wrap">{invoice.declaration || "We declare that this invoice shows the actual price of the goods / services described and that all particulars are true and correct."}</div>
              </div>

              <div className="w-full md:w-80 border rounded p-3 bg-gray-50">
                <div className="flex justify-between text-sm mb-1"><div>Taxable Amount</div><div>₹{totals.taxableTotal.toFixed(2)}</div></div>
                <div className="flex justify-between text-sm mb-1"><div>CGST</div><div>₹{totals.cgst.toFixed(2)}</div></div>
                <div className="flex justify-between text-sm mb-1"><div>SGST</div><div>₹{totals.sgst.toFixed(2)}</div></div>
                <div className="flex justify-between text-sm mb-1"><div>Sub Total</div><div>₹{totals.subtotal.toFixed(2)}</div></div>
                <div className="flex justify-between text-sm mb-1"><div>Round Off</div><div>₹{totals.roundOff.toFixed(2)}</div></div>
                <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg"><div>Total</div><div>₹{totals.total.toFixed(2)}</div></div>
                <div className="mt-2 text-xs text-gray-500"><strong>In words:</strong> {numberToWords(totals.total)}</div>
              </div>
            </div>

            {/* HSN summary */}
            <div className="mt-4">
              <div className="font-semibold text-sm mb-2">HSN / SAC Summary</div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border px-2 py-2 text-left">HSN / SAC</th>
                      <th className="border px-2 py-2 text-right">Taxable Value</th>
                      <th className="border px-2 py-2 text-right">CGST Amount</th>
                      <th className="border px-2 py-2 text-right">SGST Amount</th>
                      <th className="border px-2 py-2 text-right">Total Tax</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(hsnMap).length ? Object.keys(hsnMap).map(k => (
                      <tr key={k}>
                        <td className="border px-2 py-2">{k}</td>
                        <td className="border px-2 py-2 text-right">₹{hsnMap[k].taxable.toFixed(2)}</td>
                        <td className="border px-2 py-2 text-right">₹{hsnMap[k].cgst.toFixed(2)}</td>
                        <td className="border px-2 py-2 text-right">₹{hsnMap[k].sgst.toFixed(2)}</td>
                        <td className="border px-2 py-2 text-right">₹{(hsnMap[k].cgst + hsnMap[k].sgst).toFixed(2)}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan={5} className="border px-2 py-2 text-center text-gray-500">No HSN summary available</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer bank & sign */}
            <div className="mt-4 flex justify-between items-start gap-4">
              <div style={{ width: 260, textAlign: "center" }}>
                <div style={{ height: 44 }} />
                <div className="font-semibold">For {invoice.billFrom?.businessName || invoice.billFrom?.name || "Seller"}</div>
                <div style={{ height: 56 }} />
                <div className="text-xs text-gray-500 border-t pt-1">Authorised Signatory</div>
              </div>
            </div>

            <div className="mt-4 text-center text-xs text-gray-500">Original For Recipient</div>
          </div>
        </div>
      </div>
    </div>
  );
}
