// src/components/invoice-form/Print-preview.tsx

import { useRef } from "react";
import { X, Download, Printer } from "lucide-react";
import type { InvoiceModel } from "@/contexts/InvoiceContext";

type Props = {
  invoice: InvoiceModel;
  onClose: () => void;
};

export default function PrintPreview({ invoice, onClose }: Props) {
  const printRef = useRef<HTMLDivElement>(null);

  const formatDate = (date: string | undefined) => {
    if (!date) return "N/A";
    try {
      return new Date(date).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return date;
    }
  };

  // local totals calculation so UI doesn't depend on invoice.subtotal being already updated
  const computeTotals = (inv: InvoiceModel) => {
    // cast to any for fields that may not be in the InvoiceModel type
    const i: any = inv as any;
    const items = i.items || [];
    let subtotal = 0;
    let totalGst = 0;
    let totalDiscount = 0;
    const shipping = Number(i.shipping || 0);

    items.forEach((it: any) => {
      const qty = Number(it.quantity || 0);
      const up = Number(it.unitPrice || 0);
      const gst = Number(it.gst || 0);
      const discount = Number(it.discount || 0);

      const base = qty * up;
      // discount could be percent (<=100) or absolute
      const discountAmount = discount > 0 && discount <= 100 ? (base * discount) / 100 : discount;
      const gstAmount = (base * gst) / 100;

      subtotal += base - (discountAmount || 0);
      totalGst += gstAmount;
      totalDiscount += discountAmount || 0;
    });

    const cgst = +(totalGst / 2).toFixed(2);
    const sgst = +(totalGst / 2).toFixed(2);
    const igst = 0;
    const total = +(subtotal + totalGst + shipping).toFixed(2);

    return {
      subtotal: +subtotal.toFixed(2),
      totalGst: +totalGst.toFixed(2),
      cgst,
      sgst,
      igst,
      total,
      totalDiscount: +totalDiscount.toFixed(2),
      shipping: +shipping.toFixed(2),
    };
  };

  const calculateItemTotal = (item: any) => {
    const quantity = Number(item.quantity || 0);
    const unitPrice = Number(item.unitPrice || 0);
    const gst = Number(item.gst || 0);
    const discount = Number(item.discount || 0);
    const base = quantity * unitPrice;
    const discountAmount = discount > 0 && discount <= 100 ? (base * discount) / 100 : Number(discount || 0);
    const gstAmount = (base * gst) / 100;
    const total = base + gstAmount - discountAmount;
    return total.toFixed(2);
  };

  // Build printable HTML, but always compute totals locally from items to avoid stale fields
  const generatePrintableHTML = (inv: InvoiceModel) => {
    const i: any = inv as any; // use alias to avoid TS complaints about extra properties
    const totals = computeTotals(i);
    const safe = (v: any) =>
      v === null || v === undefined ? "" : String(v).replace(/</g, "&lt;").replace(/>/g, "&gt;");

    const itemsHtml = (i.items || [])
      .map((it: any, idx: number) => {
        return `<tr style="page-break-inside: avoid;">
            <td style="padding:10px;border:1px solid #e5e7eb;text-align:left">${idx + 1}</td>
            <td style="padding:10px;border:1px solid #e5e7eb;text-align:left">${safe(it.description) || "-"}</td>
            <td style="padding:10px;border:1px solid #e5e7eb;text-align:left">${safe(it.hsn) || "-"}</td>
            <td style="padding:10px;border:1px solid #e5e7eb;text-align:right">${Number(it.quantity || 0)}</td>
            <td style="padding:10px;border:1px solid #e5e7eb;text-align:right">₹${Number(it.unitPrice || 0).toFixed(2)}</td>
            <td style="padding:10px;border:1px solid #e5e7eb;text-align:right">${Number(it.gst || 0)}%</td>
            <td style="padding:10px;border:1px solid #e5e7eb;text-align:right">${Number(it.discount || 0)}${Number(it.discount || 0) <= 100 ? "%" : ""}</td>
            <td style="padding:10px;border:1px solid #e5e7eb;text-align:right;font-weight:600">₹${calculateItemTotal(it)}</td>
          </tr>`;
      })
      .join("\n");

    const style = `
      html,body{margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial;color:#111827}
      .invoice-root{max-width:900px;margin:20px auto;background:#fff;padding:28px;border-radius:8px;box-shadow:0 6px 18px rgba(15,23,42,0.06)}
      .header{display:flex;justify-content:space-between;align-items:center}
      .title{font-size:28px;font-weight:700}
      .muted{color:#6b7280;font-size:13px}
      .two-col{display:flex;gap:20px;margin-top:18px;flex-wrap:wrap}
      .col{flex:1;min-width:220px;background:#fafafa;padding:12px;border-radius:6px;border:1px solid #f1f5f9}
      table{width:100%;border-collapse:collapse;margin-top:12px}
      thead th{background:#f3f4f6;padding:12px;border:1px solid #e5e7eb;text-align:left;font-weight:600}
      td,th{font-size:13px}
      .summary{width:320px;margin-left:auto;margin-top:12px;border-radius:6px;border:1px solid #f1f5f9;padding:12px;background:#fafafa}
      .summary .row{display:flex;justify-content:space-between;margin-bottom:8px;color:#374151}
      .total{font-size:18px;font-weight:700;margin-top:6px;border-top:1px dashed #e5e7eb;padding-top:10px}
      .notes{margin-top:14px;font-size:13px;color:#374151;white-space:pre-wrap}
      footer{text-align:center;margin-top:22px;color:#6b7280;font-size:13px}
      /* avoid breaking table rows and summary across pages */
      tr{page-break-inside:avoid}
      .summary, .invoice-root { -webkit-print-color-adjust: exact; }
      @media print {
        body{background:#fff;padding:0}
        .invoice-root{box-shadow:none;border-radius:0;padding:20px;margin:0;width:100%}
      }
    `;

    const html = `<!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Invoice ${safe(i.invoiceNumber)}</title>
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <style>${style}</style>
        </head>
        <body>
          <div class="invoice-root">
            <div class="header">
              <div>
                <div class="title">INVOICE</div>
                <div class="muted" style="margin-top:6px">Invoice #: ${safe(i.invoiceNumber)}</div>
              </div>
              <div style="text-align:right">
                <div style="font-weight:700">${safe(i.billFrom?.businessName || i.billFrom?.name || "")}</div>
                <div class="muted">${safe(i.billFrom?.address || "")}</div>
                ${i.billFrom?.gst ? `<div class="muted">GSTIN: ${safe(i.billFrom.gst)}</div>` : ""}
              </div>
            </div>

            <div class="two-col" style="margin-top:18px">
              <div class="col">
                <div style="font-weight:700">Bill To</div>
                <div style="margin-top:6px">${safe(i.billTo?.name || "")}</div>
                ${i.billTo?.companyName ? `<div class="muted">${safe(i.billTo.companyName)}</div>` : ""}
                <div class="muted">${safe(i.billTo?.address || "")}</div>
                <div style="margin-top:6px" class="muted">Email: ${safe(i.billTo?.email || "")} ${i.billTo?.phone ? ` • Phone: ${safe(i.billTo?.phone)}` : ""}</div>
              </div>

              <div class="col" style="min-width:200px">
                <div style="font-weight:700">Invoice Details</div>
                <div style="margin-top:8px" class="muted">Date: ${formatDate(i.date)}</div>
                <div class="muted">Due: ${formatDate(i.dueDate)}</div>
                <div class="muted">Currency: ${safe(i.currency || "INR")}</div>
                <div class="muted">Status: ${safe(i.status || "draft")}</div>
              </div>
            </div>

            <div style="margin-top:20px">
              <div style="font-weight:700;margin-bottom:8px">Items</div>
              <table>
                <thead>
                  <tr>
                    <th style="width:40px">#</th>
                    <th>Description</th>
                    <th style="width:100px">HSN</th>
                    <th style="width:70px;text-align:right">Qty</th>
                    <th style="width:110px;text-align:right">Unit Price</th>
                    <th style="width:90px;text-align:right">GST %</th>
                    <th style="width:110px;text-align:right">Discount</th>
                    <th style="width:120px;text-align:right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
            </div>

            <div style="display:flex;justify-content:flex-end;">
              <div class="summary">
                <div class="row"><span>Subtotal</span><span>₹${Number(totals.subtotal).toFixed(2)}</span></div>
                ${totals.totalDiscount ? `<div class="row"><span>Discount</span><span>₹${Number(totals.totalDiscount).toFixed(2)}</span></div>` : ""}
                ${totals.cgst ? `<div class="row"><span>CGST</span><span>₹${Number(totals.cgst).toFixed(2)}</span></div>` : ""}
                ${totals.sgst ? `<div class="row"><span>SGST</span><span>₹${Number(totals.sgst).toFixed(2)}</span></div>` : ""}
                ${totals.igst ? `<div class="row"><span>IGST</span><span>₹${Number(totals.igst).toFixed(2)}</span></div>` : ""}
                ${totals.shipping ? `<div class="row"><span>Shipping</span><span>₹${Number(totals.shipping).toFixed(2)}</span></div>` : ""}
                <div class="total"><span>Total</span><span>₹${Number(totals.total).toFixed(2)}</span></div>
              </div>
            </div>

            ${i.termsAndConditions ? `<div style="margin-top:18px"><div style="font-weight:700">Terms & Conditions</div><div class="notes">${safe(i.termsAndConditions)}</div></div>` : ""}
            ${i.notes ? `<div style="margin-top:10px"><div style="font-weight:700">Notes</div><div class="notes">${safe(i.notes)}</div></div>` : ""}

            <footer>Thank you for your business!</footer>
          </div>
        </body>
      </html>`;

    return html;
  };

  // fallback that uses window.open (kept for rare cases)
  const fallbackOpenAndPrint = (html: string) => {
    try {
      const newWin = window.open("", "_blank", "noopener,noreferrer");
      if (!newWin) {
        alert("Unable to open print window. Please allow popups for this site.");
        return;
      }
      newWin.document.open();
      newWin.document.write(html);
      newWin.document.close();
      const run = () => {
        try {
          newWin.focus();
          newWin.print();
        } catch (e) {
          console.error("fallback print failed", e);
        }
      };
      if (newWin.document.readyState === "complete") run();
      else newWin.onload = run;
    } catch (e) {
      console.error("fallbackOpenAndPrint error:", e);
      alert("Unable to open print window. Please allow popups for this site.");
    }
  };

  // NEW: Use a hidden iframe to print (avoids popup blocking in most browsers)
  const handlePrint = () => {
    try {
      const html = generatePrintableHTML(invoice);

      // create hidden iframe
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      iframe.setAttribute("aria-hidden", "true");

      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) {
        // fallback to popup
        fallbackOpenAndPrint(html);
        return;
      }

      iframeDoc.open();
      iframeDoc.write(html);
      iframeDoc.close();

      const tryPrint = () => {
        try {
          const win = iframe.contentWindow;
          if (!win) throw new Error("No iframe window available for printing");
          win.focus();
          // small delay ensures rendering
          setTimeout(() => {
            try {
              win.print();
            } catch (err) {
              console.error("iframe print failed, falling back to popup:", err);
              fallbackOpenAndPrint(html);
            } finally {
              // cleanup the iframe after giving print dialog time to open
              setTimeout(() => {
                try {
                  document.body.removeChild(iframe);
                } catch {}
              }, 1200);
            }
          }, 250);
        } catch (err) {
          console.error("tryPrint error:", err);
          fallbackOpenAndPrint(html);
          try {
            document.body.removeChild(iframe);
          } catch {}
        }
      };

      // When iframe doc is ready, print
      if (iframe.contentWindow?.document.readyState === "complete") {
        tryPrint();
      } else {
        iframe.onload = tryPrint;
        // safety fallback
        setTimeout(tryPrint, 800);
      }
    } catch (err) {
      console.error("Print error:", err);
      // final fallback to open in new window
      try {
        const html = generatePrintableHTML(invoice);
        fallbackOpenAndPrint(html);
      } catch {
        alert("Could not open print dialog. Please allow popups or try Download -> Open -> Print.");
      }
    }
  };

  // Download: create self-contained HTML blob and download. Do NOT rely on window.open (avoids popup)
  const handleDownload = () => {
    try {
      const html = generatePrintableHTML(invoice);
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);

      // create anchor to download file (this does not open popup)
      const a = document.createElement("a");
      a.href = url;
      const safeName = (invoice.invoiceNumber || "invoice").replace(/[^\w\-]/g, "_");
      a.download = `${safeName}.html`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      // optionally open in new tab if allowed (this may be blocked, but we try)
      try {
        const newWin = window.open(url, "_blank");
        if (newWin) newWin.focus();
      } catch {
        // ignore popup-block
      }

      // cleanup
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (err) {
      console.error("Download error:", err);
      alert("Could not download invoice. See console for details.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      {/* overlay: inline style to avoid theme overrides and ensure it's not harsh black */}
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(255,255,255,0.65)",
          backdropFilter: "blur(6px)",
        }}
      />

      {/* modal */}
      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col rounded-lg">
        <div className="flex justify-between items-center p-4 border-b bg-white no-print">
          <h2 className="text-xl font-semibold">Invoice Preview</h2>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
            >
              <Printer size={16} />
              Print
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
            >
              <Download size={16} />
              Download
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-transparent">
          <div
            ref={printRef}
            className="print-content bg-white rounded-md p-6 shadow-sm"
            style={{ boxShadow: "0 6px 18px rgba(15,23,42,0.04)" }}
          >
            {/* Invoice Header */}
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-1">INVOICE</h1>
              <div className="text-gray-500">
                <span className="font-semibold">Invoice Number:</span> {invoice.invoiceNumber}
              </div>
            </div>

            {/* Details */}
            <div className="flex flex-col md:flex-row justify-between gap-6 mb-6">
              <div className="flex-1 bg-gray-50 p-4 rounded">
                <div className="font-semibold mb-1">Bill To</div>
                <div className="text-sm text-gray-700">
                  <div>{invoice.billTo?.name || "N/A"}</div>
                  {(invoice.billTo as any)?.companyName && <div>{(invoice.billTo as any).companyName}</div>}
                  {invoice.billTo?.address && <div>{invoice.billTo.address}</div>}
                  <div className="text-xs text-gray-500 mt-1">
                    {invoice.billTo?.email && <span>Email: {invoice.billTo.email} </span>}
                    {invoice.billTo?.phone && <span> • Phone: {invoice.billTo.phone}</span>}
                  </div>
                </div>
              </div>

              <div className="w-full md:w-64 bg-gray-50 p-4 rounded">
                <div className="font-semibold mb-1">Invoice Details</div>
                <div className="text-sm text-gray-700">
                  <div>Date: {formatDate(invoice.date)}</div>
                  <div>Due: {formatDate(invoice.dueDate)}</div>
                  <div>Currency: {invoice.currency || "INR"}</div>
                  <div>Status: {invoice.status || "draft"}</div>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-6">
              <div className="font-semibold mb-2 text-gray-700">Items</div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2 text-left">#</th>
                      <th className="border p-2 text-left">Description</th>
                      <th className="border p-2 text-left">HSN</th>
                      <th className="border p-2 text-right">Qty</th>
                      <th className="border p-2 text-right">Unit Price</th>
                      <th className="border p-2 text-right">GST %</th>
                      <th className="border p-2 text-right">Discount</th>
                      <th className="border p-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items?.map((item, index) => (
                      <tr key={index} style={{ pageBreakInside: "avoid" }}>
                        <td className="border p-2">{index + 1}</td>
                        <td className="border p-2">{item.description || "N/A"}</td>
                        <td className="border p-2">{item.hsn || "-"}</td>
                        <td className="border p-2 text-right">{item.quantity || 0}</td>
                        <td className="border p-2 text-right">₹{Number(item.unitPrice || 0).toFixed(2)}</td>
                        <td className="border p-2 text-right">{item.gst || 0}%</td>
                        <td className="border p-2 text-right">
                          {item.discount || 0}
                          {Number(item.discount || 0) <= 100 ? "%" : ""}
                        </td>
                        <td className="border p-2 text-right font-semibold">₹{calculateItemTotal(item)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary */}
            <div className="flex justify-end mb-6">
              <div className="w-full md:w-80 border rounded p-4 bg-gray-50">
                {/* compute display totals from our local computeTotals to ensure accuracy */}
                {(() => {
                  const t = computeTotals(invoice);
                  return (
                    <>
                      <div className="flex justify-between mb-2">
                        <span>Subtotal:</span>
                        <span>₹{Number(t.subtotal).toFixed(2)}</span>
                      </div>
                      {t.totalDiscount > 0 && (
                        <div className="flex justify-between mb-2">
                          <span>Discount:</span>
                          <span>₹{Number(t.totalDiscount).toFixed(2)}</span>
                        </div>
                      )}
                      {t.cgst > 0 && (
                        <div className="flex justify-between mb-2">
                          <span>CGST:</span>
                          <span>₹{Number(t.cgst).toFixed(2)}</span>
                        </div>
                      )}
                      {t.sgst > 0 && (
                        <div className="flex justify-between mb-2">
                          <span>SGST:</span>
                          <span>₹{Number(t.sgst).toFixed(2)}</span>
                        </div>
                      )}
                      {t.igst > 0 && (
                        <div className="flex justify-between mb-2">
                          <span>IGST:</span>
                          <span>₹{Number(t.igst).toFixed(2)}</span>
                        </div>
                      )}
                      {t.shipping > 0 && (
                        <div className="flex justify-between mb-2">
                          <span>Shipping/Other:</span>
                          <span>₹{Number(t.shipping).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>Total:</span>
                        <span>₹{Number(t.total).toFixed(2)}</span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Terms and Notes */}
            {invoice.termsAndConditions && (
              <div className="mb-4">
                <h3 className="font-bold text-lg mb-2 text-gray-700">Terms and Conditions</h3>
                <p className="text-sm whitespace-pre-wrap">{invoice.termsAndConditions}</p>
              </div>
            )}

            {invoice.notes && (
              <div className="mb-4">
                <h3 className="font-bold text-lg mb-2 text-gray-700">Notes</h3>
                <p className="text-sm whitespace-pre-wrap">{invoice.notes}</p>
              </div>
            )}

            {/* Footer */}
            <div className="mt-6 pt-4 border-t text-center text-sm text-gray-600">
              <p>Thank you for your business!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
