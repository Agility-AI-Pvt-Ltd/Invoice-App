import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "../ui/Checkbox.tsx";

export default function Step2Form() {
  const [billingAddress, setBillingAddress] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [sameAsBilling, setSameAsBilling] = useState(false);

  // When checkbox toggled
  function handleSameAsBillingChange(checked: boolean) {
    setSameAsBilling(checked);
    if (checked) {
      setShippingAddress(billingAddress);
    } else {
      setShippingAddress("");
    }
  }



  // When billing address changes, update shipping address if sameAsBilling is true
  function handleBillingAddressChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setBillingAddress(value);
    if (sameAsBilling) {
      setShippingAddress(value);
    }
  }

  return (
    <div className="p-6">
      <h3 className="font-semibold text-lg mb-6">Buyer (Bill To)</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Left Column */}
        <div className="space-y-8">
          <div>
            <Label htmlFor="customerName" className="mb-2 block">
              Customer Name
            </Label>
            <Input id="customerName" placeholder="Name" className="p-3" />
          </div>

          <div>
            <Label htmlFor="billingAddress" className="mb-2 block">
              Billing Address
            </Label>
            <Input
              id="billingAddress"
              placeholder="Billing Address"
              value={billingAddress}
              onChange={handleBillingAddressChange}
              className="p-3"
            />
          </div>

          <div>
            <Label htmlFor="email" className="mb-2 block">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Email Address"
              className="p-3"
            />
          </div>

          <div>
            <Label htmlFor="phone" className="mb-2 block">
              Phone Number
            </Label>
            <Input id="phone" placeholder="Phone no." className="p-3" />
          </div>

          <div>
            <Label htmlFor="gstin" className="mb-2 block">
              GSTRIN/Tax ID
            </Label>
            <Input id="gstin" placeholder="XXXX" className="p-3" />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <div>
            <Label htmlFor="customerType" className="mb-2 block">
              Customer Type
            </Label>
            <Select>
              <SelectTrigger id="customerType" className="w-full py-3 px-4">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="wholesale">Wholesale</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label
              htmlFor="shippingAddress"
              className="mb-2  flex items-center gap-3"
            >
              Shipping Address
              <Checkbox
                id="sameAsBilling"
                checked={sameAsBilling}
                onCheckedChange={handleSameAsBillingChange}
              />

              <span className="text-sm select-none">Same as Billing Address</span>
            </Label>
            <Input
              id="shippingAddress"
              placeholder="Shipping Address"
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              disabled={sameAsBilling}
              className={`p-3 ${sameAsBilling ? "bg-gray-100 cursor-not-allowed" : ""}`}
            />
          </div>

          <div>
            <Label htmlFor="country" className="mb-2 block">
              Country
            </Label>
            <Input
              id="country"
              placeholder="India"
            />
          </div>

          <div>
            <Label htmlFor="state" className="mb-2 block">
              State
            </Label>
            <Select>
              <SelectTrigger id="state" className="w-full py-3 px-4">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="maharashtra">Maharashtra</SelectItem>
                  <SelectItem value="gujarat">Gujarat</SelectItem>
                  <SelectItem value="karnataka">Karnataka</SelectItem>
                  {/* Add more states as needed */}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="pan" className="mb-2 block">
              PAN Number
            </Label>
            <Input id="pan" placeholder="XXXX" className="p-3" />
          </div>
        </div>
      </div>
    </div>
  );
}
