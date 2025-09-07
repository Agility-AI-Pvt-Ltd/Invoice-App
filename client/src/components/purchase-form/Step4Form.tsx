
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AddItem } from "./Step3Form"
import { Input } from "../ui/Input"

export default function InvoiceSummaryForm() {
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
          />
        </div>

        {/* Summary Fields */}
        <div className="space-y-4 flex-1 border rounded-lg p-4 shadow-sm bg-white">
          <div className="flex items-center justify-between">
            <Label htmlFor="subtotal">Subtotal:</Label>
            <Input id="subtotal" type="number" className="w-40 h-8" />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="discount">Discount:</Label>
            <Input id="discount" type="number" className="w-40 h-8" />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="cgst">CGST:</Label>
            <Input id="cgst" type="number" className="w-40 h-8" />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="sgst">SGST:</Label>
            <Input id="sgst" type="number" className="w-40 h-8" />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="igst">IGST:</Label>
            <Input id="igst" type="number" className="w-40 h-8" />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="shipping">Shipping/Other Fees:</Label>
            <Input id="shipping" type="number" className="w-40 h-8" />
          </div>

          <div className="flex items-center justify-between font-semibold">
            <Label htmlFor="total">Total:</Label>
            <Input id="total" type="number" className="w-40 h-8" />
          </div>
        </div>
      </div>
    </div>
  )
}
