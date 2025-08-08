import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";

export default function Step2Form() {
  return (
    <div className="">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Buyer Section */}
        <div>
          <h3 className="font-semibold text-xl mb-6">Buyer (Bill To)</h3>
          <div className="space-y-6">
            <div>
              <Label htmlFor="customerName" className="mb-1 block">Customer Name</Label>
              <Input id="customerName" placeholder="Name" />
            </div>

            <div>
              <Label htmlFor="buyerCompany" className="mb-1 block">Company Name</Label>
              <Input id="buyerCompany" placeholder="Company" />
            </div>

            <div>
              <Label htmlFor="buyerAddress" className="mb-1 block">Billing Address</Label>
              <Input id="buyerAddress" placeholder="Address" />
            </div>

            <div>
              <Label htmlFor="buyerEmail" className="mb-1 block">Email</Label>
              <Input id="buyerEmail" type="email" placeholder="Email" />
            </div>

            <div>
              <Label htmlFor="buyerPhone" className="mb-1 block">Phone Number</Label>
              <Input id="buyerPhone" placeholder="+91 XXX" />
            </div>

            <div>
              <Label htmlFor="buyerGST" className="mb-1 block">GST Number</Label>
              <Input id="buyerGST" placeholder="GST Number" />
            </div>

            <div>
              <Label htmlFor="buyerPAN" className="mb-1 block">PAN Number</Label>
              <Input id="buyerPAN" placeholder="XXXX" />
            </div>
          </div>
        </div>

        {/* Seller Section */}
        <div>
          <h3 className="font-semibold text-xl mb-6">Seller Details (Bill From)</h3>
          <div className="space-y-6">
            <div>
              <Label htmlFor="sellerBusiness" className="mb-1 block">Business Name</Label>
              <Input id="sellerBusiness" placeholder="ABZ Pvt. Ltd." />
            </div>

            <div>
              <Label htmlFor="sellerAddress" className="mb-1 block">Business Address</Label>
              <Input id="sellerAddress" placeholder="Address" />
            </div>

            <div>
              <Label htmlFor="sellerState" className="mb-1 block">State</Label>
              <Input id="sellerState" placeholder="State" />
            </div>

            <div>
              <Label htmlFor="sellerEmail" className="mb-1 block">Email</Label>
              <Input id="sellerEmail" type="email" placeholder="Email" />
            </div>

            <div>
              <Label htmlFor="sellerPhone" className="mb-1 block">Phone Number</Label>
              <Input id="sellerPhone" placeholder="+91 XXX" />
            </div>

            <div>
              <Label htmlFor="sellerGST" className="mb-1 block">GSTIN / Tax ID</Label>
              <Input id="sellerGST" placeholder="GSTIN / Tax ID" />
            </div>

            <div>
              <Label htmlFor="sellerPAN" className="mb-1 block">PAN Number</Label>
              <Input id="sellerPAN" placeholder="XXXX" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
