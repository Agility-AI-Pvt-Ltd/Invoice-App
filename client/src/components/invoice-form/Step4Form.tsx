// FILE : client/src/components/invoice-form/Step4Form.tsx

import { useContext, useEffect, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calculator, Loader2 } from "lucide-react";
import { AddItem } from "./Step3Form";
import { InvoiceContext } from "@/contexts/InvoiceContext";
import { calculateGST } from "@/services/api/invoice";
import { calculateGstAndDiscount } from "@/services/api/inventory";

export default function InvoiceSummaryForm() {
  const ctx = useContext(InvoiceContext) as any | undefined;
  const invoice = ctx?.invoice ?? {};
  const fieldErrors: Record<string, string> = ctx?.fieldErrors ?? {};
  const [isCalculatingGST, setIsCalculatingGST] = useState(false);

  const setField = (key: string, value: any) => {
    if (!ctx) return;
    ctx.setInvoice((prev: any) => ({ ...prev, [key]: value }));
    // clear total-related validation when user edits summary fields
    if (typeof ctx.clearFieldError === "function") {
      ctx.clearFieldError("total");
      // also clear generic step-level message if present
      ctx.clearFieldError("_step_4");
    }
  };

  const setNumberField = (key: string, raw: any) => {
    const v = raw === "" ? "" : Number(raw);
    if (!ctx) return;
    ctx.setInvoice((prev: any) => ({ ...prev, [key]: v }));
    // editing numeric summary fields can address a zero-total error; clear it
    if (typeof ctx.clearFieldError === "function") {
      ctx.clearFieldError("total");
      ctx.clearFieldError("_step_4");
    }
  };

  // Auto-calculate GST when states change
  useEffect(() => {
    const billingState = invoice.billFrom?.state || "";
    // ✅ CRITICAL FIX: Define shippingState correctly with proper fallback
    const customerBillToState = invoice.billTo?.state || "";
    const shippingState = invoice.shipTo?.state || customerBillToState;
    const totalTax = (invoice.cgst || 0) + (invoice.sgst || 0) + (invoice.igst || 0);

    if (billingState && shippingState && totalTax > 0) {
      handleCalculateGST();
    }
  }, [invoice.billFrom?.state, invoice.shipTo?.state, invoice.billTo?.state, invoice.subtotal]);

  // Function to calculate GST based on states and items
  const handleCalculateGST = async () => {
    try {
      setIsCalculatingGST(true);
      
      const billingState = invoice.billFrom?.state || "";
      
      // ✅ CRITICAL FIX: Define shippingState correctly.
      // 1. Check invoice.shipTo?.state first (primary shipping address)
      // 2. Fallback to invoice.billTo?.state (default customer state)
      // Note: Backend's GST logic is now robust against case/whitespace.
      const customerBillToState = invoice.billTo?.state || "";
      const shippingState = invoice.shipTo?.state || customerBillToState;
      
      const items = invoice.items || [];

      // Check for mandatory states
      if (!billingState || !shippingState) {
        console.warn("❌ Cannot calculate GST: Billing State or Shipping State is missing.");
        setIsCalculatingGST(false);
        return;
      }

      // 🛑 DEBUG LOG: Final verification of states being sent
      const isInterstateCheck = billingState.toLowerCase().trim() !== shippingState.toLowerCase().trim();
      console.log('--- 📤 GST CALC INPUTS ------------------');
      console.log('  -> Billing State (Seller - BillFrom):', `"${billingState}"`);
      console.log('  -> Shipping State (Customer/Ship To):', `"${shippingState}"`);
      console.log('  -> EXPECTED SPLIT TYPE (Frontend Check):', isInterstateCheck ? 'IGST (INTERSTATE)' : 'CGST+SGST (INTRASTATE)');
      console.log('------------------------------------------');

      if (!items || items.length === 0) {
        return;
      }

      // Calculating GST with states and items
      
      // Prepare items data for GST calculation
      const itemsForCalculation = items.map((item: any) => ({
        id: item.id,
        inventoryItemId: item.inventoryItemId,
        description: item.description || "",
        quantity: Number(item.quantity) || 0,
        unitPrice: Number(item.unitPrice) || 0,
        gstRate: Number(item.gst) || 0,
        discount: Number(item.discount) || 0,
      }));

      // 🛑 DEBUG LOG: Items being sent to backend
      console.log('--- 📦 ITEMS SENT TO BACKEND ------------');
      console.log('  -> Items Count:', itemsForCalculation.length);
      itemsForCalculation.forEach((item, index) => {
        console.log(`  -> Item ${index + 1}:`, {
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          gstRate: item.gstRate,
          discount: item.discount
        });
      });
      console.log('------------------------------------------');

      // Use the new GST calculation API
      const gstResult = await calculateGstAndDiscount({
        items: itemsForCalculation,
        billingState,
        shippingState // Use the verified shippingState variable
      });
      
      // 🛑 DEBUG LOG: Check raw response from backend
      console.log('--- 📥 GST CALC RESPONSE ----------------');
      console.log('  -> Success:', gstResult.success);
      if (gstResult.data && gstResult.data.totals) {
          console.log('  -> BACKEND REPORTED TAX TYPE:', gstResult.data.totals.taxType);
          console.log('  -> BACKEND REPORTED INTERSTATE:', gstResult.data.totals.isInterstate);
          console.log('  -> CGST:', gstResult.data.totals.cgst);
          console.log('  -> SGST:', gstResult.data.totals.sgst);
          console.log('  -> IGST:', gstResult.data.totals.igst);
          console.log('  -> Subtotal:', gstResult.data.totals.subtotal);
          console.log('  -> Total:', gstResult.data.totals.total);
      }
      console.log('------------------------------------------');
      
      // Update GST values from the calculation result
      if (gstResult.success && gstResult.data) {
        const { totals, items: calculatedItems } = gstResult.data;
        
        setNumberField("cgst", totals.cgst);
        setNumberField("sgst", totals.sgst);
        setNumberField("igst", totals.igst);
        setNumberField("subtotal", totals.subtotal);
        setNumberField("total", totals.total);
        
        // Update individual items with backend calculations
        if (calculatedItems && calculatedItems.length > 0) {
          const updatedItems = invoice.items.map((item: any, index: number) => {
            const calculatedItem = calculatedItems[index];
            if (calculatedItem) {
              // CRITICAL FIX: Ensure we preserve all original item data (like description, hsn, quantity, unitPrice, gst, discount) 
              // while overriding/adding the calculated tax fields.
              const mergedItem = {
                ...item, // Preserve existing user-entered fields and original ID
                // Override with backend calculated values:
                taxableAmount: calculatedItem.taxableAmount,
                cgst: calculatedItem.cgst,
                sgst: calculatedItem.sgst,
                igst: calculatedItem.igst,
                totalTax: calculatedItem.totalTax,
                total: calculatedItem.total
              };
              
              console.log(`🔄 Step4: Merged item ${index + 1} (${item.description}):`, {
                original: { id: item.id, description: item.description, quantity: item.quantity, unitPrice: item.unitPrice },
                calculated: { taxableAmount: calculatedItem.taxableAmount, cgst: calculatedItem.cgst, sgst: calculatedItem.sgst, igst: calculatedItem.igst, total: calculatedItem.total },
                merged: { id: mergedItem.id, description: mergedItem.description, taxableAmount: mergedItem.taxableAmount, cgst: mergedItem.cgst, sgst: mergedItem.sgst, igst: mergedItem.igst }
              });
              
              return mergedItem;
            }
            return item;
          });
          
          // Update the items in the invoice context
          ctx.setInvoice((prev: any) => ({
            ...prev,
            items: updatedItems
          }));
        }
      }
    } catch (error) {
      // Fallback to old GST calculation if new API fails
      try {
        const totalTax = (invoice.cgst || 0) + (invoice.sgst || 0) + (invoice.igst || 0);
        const gstResult = await calculateGST(billingState, shippingState, totalTax);
        
        setNumberField("cgst", gstResult.cgst);
        setNumberField("sgst", gstResult.sgst);
        setNumberField("igst", gstResult.igst);
        
      } catch (fallbackError) {
        console.log('❌ GST calculation failed:', fallbackError);
      }
    } finally {
      setIsCalculatingGST(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Top - AddItem Table */}
      <div className="mb-4">
        <AddItem />
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
            value={invoice.termsAndConditions ?? ""}
            onChange={(e) => setField("termsAndConditions", e.target.value)}
            aria-invalid={!!fieldErrors["termsAndConditions"]}
          />
          {fieldErrors["termsAndConditions"] && (
            <p className="text-sm text-red-600 mt-1">{fieldErrors["termsAndConditions"]}</p>
          )}
        </div>

        {/* Summary Fields */}
        <div className="space-y-4 flex-1 border rounded-lg p-4 shadow-sm bg-white">
          <div className="flex items-center justify-between">
            <Label htmlFor="subtotal">Subtotal:</Label>
            <Input
              id="subtotal"
              type="number"
              className="w-40 h-8"
              value={invoice.subtotal ?? ""}
              onChange={(e) => setNumberField("subtotal", e.target.value)}
              aria-invalid={!!fieldErrors["subtotal"]}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="discount">Discount:</Label>
            <Input
              id="discount"
              type="number"
              className="w-40 h-8"
              value={invoice.discount ?? ""}
              onChange={(e) => setNumberField("discount", e.target.value)}
              aria-invalid={!!fieldErrors["discount"]}
            />
          </div>

          {/* GST Calculation Button */}
          <div className="flex items-center justify-between">
            <Label>GST Calculation:</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCalculateGST}
              disabled={isCalculatingGST || !invoice.billFrom?.state || !invoice.billTo?.state}
              className="w-40 h-8 text-xs"
            >
              {isCalculatingGST ? (
                <Loader2 size={14} className="animate-spin mr-1" />
              ) : (
                <Calculator size={14} className="mr-1" />
              )}
              {isCalculatingGST ? "Calculating..." : "Calculate GST"}
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="cgst">CGST:</Label>
            <Input
              id="cgst"
              type="number"
              className="w-40 h-8"
              value={invoice.cgst ?? ""}
              onChange={(e) => setNumberField("cgst", e.target.value)}
              aria-invalid={!!fieldErrors["cgst"]}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="sgst">SGST:</Label>
            <Input
              id="sgst"
              type="number"
              className="w-40 h-8"
              value={invoice.sgst ?? ""}
              onChange={(e) => setNumberField("sgst", e.target.value)}
              aria-invalid={!!fieldErrors["sgst"]}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="igst">IGST:</Label>
            <Input
              id="igst"
              type="number"
              className="w-40 h-8"
              value={invoice.igst ?? ""}
              onChange={(e) => setNumberField("igst", e.target.value)}
              aria-invalid={!!fieldErrors["igst"]}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="shipping">Shipping/Other Fees:</Label>
            <Input
              id="shipping"
              type="number"
              className="w-40 h-8"
              value={invoice.shipping ?? ""}
              onChange={(e) => setNumberField("shipping", e.target.value)}
              aria-invalid={!!fieldErrors["shipping"]}
            />
          </div>

          <div className="flex items-center justify-between font-semibold">
            <Label htmlFor="total">
              Total:
              <span className="text-red-600 ml-1 text-sm" aria-hidden>
                *
              </span>
            </Label>
            <div className="flex flex-col items-end">
              <Input
                id="total"
                type="number"
                className="w-40 h-8"
                value={invoice.total ?? ""}
                onChange={(e) => setNumberField("total", e.target.value)}
                aria-invalid={!!fieldErrors["total"]}
              />
              {fieldErrors["total"] && (
                <p className="text-sm text-red-600 mt-1">{fieldErrors["total"]}</p>
              )}
              {/* also show any step-level message for step 4 */}
              {fieldErrors["_step_4"] && (
                <p className="text-sm text-red-600 mt-1">{fieldErrors["_step_4"]}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
