import { Label } from "@/components/ui/label";
import { Input } from "../ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Props = {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
};

export default function Step2Form({ formData, setFormData }: Props) {
  // Handle checkbox toggle
  const handleSameAsBilling = (checked: boolean) => {
    if (checked) {
      setFormData((prev: any) => ({
        ...prev,
        shippingAddressLine1: prev.billingAddressLine1,
        shippingAddressLine2: prev.billingAddressLine2,
        shippingCity: prev.billingCity,
        shippingState: prev.billingState,
        shippingZip: prev.billingZip,
        shippingCountry: prev.billingCountry,
      }));
    }
  };

  // Condition: enable checkbox only if all billing fields are filled
  const isBillingComplete =
    formData.billingAddressLine1 &&
    formData.billingCity &&
    formData.billingState &&
    formData.billingZip &&
    formData.billingCountry;

  return (
    <div className="p-8 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ---------------- Billing Address ---------------- */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Billing Address</h3>

          <div className="space-y-2 mb-4">
            <Label htmlFor="billingAddressLine1">Address Line 1</Label>
            <Input
              id="billingAddressLine1"
              placeholder="Address Line 1"
              value={formData.billingAddressLine1 || ""}
              onChange={(e) =>
                setFormData((prev: any) => ({ ...prev, billingAddressLine1: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2 mb-4">
            <Label htmlFor="billingAddressLine2">Address Line 2</Label>
            <Input
              id="billingAddressLine2"
              placeholder="Address Line 2"
              value={formData.billingAddressLine2 || ""}
              onChange={(e) =>
                setFormData((prev: any) => ({ ...prev, billingAddressLine2: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2 mb-4">
            <Label htmlFor="billingCity">City</Label>
            <Input
              id="billingCity"
              placeholder="City"
              value={formData.billingCity || ""}
              onChange={(e) =>
                setFormData((prev: any) => ({ ...prev, billingCity: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2 mb-4">
            <Label htmlFor="billingState">State</Label>
            <Select
              value={formData.billingState || ""}
              onValueChange={(value) =>
                setFormData((prev: any) => ({ ...prev, billingState: value }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select State" />
              </SelectTrigger>
              <SelectContent >
                <SelectItem value="jammu-and-kashmir">01 - JAMMU AND KASHMIR</SelectItem>
                <SelectItem value="himachal-pradesh">02 - HIMACHAL PRADESH</SelectItem>
                <SelectItem value="punjab">03 - PUNJAB</SelectItem>
                <SelectItem value="chandigarh">04 - CHANDIGARH</SelectItem>
                <SelectItem value="uttarakhand">05 - UTTARAKHAND</SelectItem>
                <SelectItem value="haryana">06 - HARYANA</SelectItem>
                <SelectItem value="delhi">07 - DELHI</SelectItem>
                <SelectItem value="rajasthan">08 - RAJASTHAN</SelectItem>
                <SelectItem value="uttar-pradesh">09 - UTTAR PRADESH</SelectItem>
                <SelectItem value="bihar">10 - BIHAR</SelectItem>
                <SelectItem value="sikkim">11 - SIKKIM</SelectItem>
                <SelectItem value="arunachal-pradesh">12 - ARUNACHAL PRADESH</SelectItem>
                <SelectItem value="nagaland">13 - NAGALAND</SelectItem>
                <SelectItem value="manipur">14 - MANIPUR</SelectItem>
                <SelectItem value="mizoram">15 - MIZORAM</SelectItem>
                <SelectItem value="tripura">16 - TRIPURA</SelectItem>
                <SelectItem value="meghalaya">17 - MEGHALAYA</SelectItem>
                <SelectItem value="assam">18 - ASSAM</SelectItem>
                <SelectItem value="west-bengal">19 - WEST BENGAL</SelectItem>
                <SelectItem value="jharkhand">20 - JHARKHAND</SelectItem>
                <SelectItem value="odisha">21 - ODISHA</SelectItem>
                <SelectItem value="chattisgarh">22 - CHATTISGARH</SelectItem>
                <SelectItem value="madhya-pradesh">23 - MADHYA PRADESH</SelectItem>
                <SelectItem value="gujarat">24 - GUJARAT</SelectItem>
                <SelectItem value="dadra-nagar-haveli-daman-diu">26* - DADRA AND NAGAR HAVELI AND DAMAN AND DIU NEWLY MERGED UT</SelectItem>
                <SelectItem value="maharashtra">27 - MAHARASHTRA</SelectItem>
                <SelectItem value="andhra-pradesh-before-division">28 - ANDHRA PRADESH BEFORE DIVISION</SelectItem>
                <SelectItem value="karnataka">29 - KARNATAKA</SelectItem>
                <SelectItem value="goa">30 - GOA</SelectItem>
                <SelectItem value="lakshadweep">31 - LAKSHADWEEP</SelectItem>
                <SelectItem value="kerala">32 - KERALA</SelectItem>
                <SelectItem value="tamil-nadu">33 - TAMIL NADU</SelectItem>
                <SelectItem value="puducherry">34 - PUDUCHERRY</SelectItem>
                <SelectItem value="andaman-nicobar">35 - ANDAMAN AND NICOBAR ISLANDS</SelectItem>
                <SelectItem value="telangana">36 - TELANGANA</SelectItem>
                <SelectItem value="andhra-pradesh-new">37 - ANDHRA PRADESH NEWLY ADDED</SelectItem>
                <SelectItem value="ladakh">38 - LADAKH NEWLY ADDED</SelectItem>
                <SelectItem value="outside-india">OUTSIDE INDIA</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 mb-4">
            <Label htmlFor="billingZip">Pincode</Label>
            <Input
              id="billingZip"
              placeholder="Pincode"
              value={formData.billingZip || ""}
              onChange={(e) =>
                setFormData((prev: any) => ({ ...prev, billingZip: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2 mb-4">
            <Label htmlFor="billingCountry">Country</Label>
            <Input
              id="billingCountry"
              placeholder="Country"
              value={formData.billingCountry || ""}
              onChange={(e) =>
                setFormData((prev: any) => ({ ...prev, billingCountry: e.target.value }))
              }
            />
          </div>
        </div>

        {/* ---------------- Shipping Address ---------------- */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Shipping Address</h3>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="sameAsBilling"
                disabled={!isBillingComplete} // disabled until billing is complete
                onChange={(e) => handleSameAsBilling(e.target.checked)}
              />
              <Label
                htmlFor="sameAsBilling"
                className={isBillingComplete ? "" : "text-gray-400"}
              >
                Same as Billing Address
              </Label>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <Label htmlFor="shippingAddressLine1">Address Line 1</Label>
            <Input
              id="shippingAddressLine1"
              placeholder="Address Line 1"
              value={formData.shippingAddressLine1 || ""}
              onChange={(e) =>
                setFormData((prev: any) => ({ ...prev, shippingAddressLine1: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2 mb-4">
            <Label htmlFor="shippingAddressLine2">Address Line 2</Label>
            <Input
              id="shippingAddressLine2"
              placeholder="Address Line 2"
              value={formData.shippingAddressLine2 || ""}
              onChange={(e) =>
                setFormData((prev: any) => ({ ...prev, shippingAddressLine2: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2 mb-4">
            <Label htmlFor="shippingCity">City</Label>
            <Input
              id="shippingCity"
              placeholder="City"
              value={formData.shippingCity || ""}
              onChange={(e) =>
                setFormData((prev: any) => ({ ...prev, shippingCity: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2 mb-4">
            <Label htmlFor="shippingState">State</Label>
            <Select
              value={formData.shippingState || ""}
              onValueChange={(value) =>
                setFormData((prev: any) => ({ ...prev, shippingState: value }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select State" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="jammu-and-kashmir">01 - JAMMU AND KASHMIR</SelectItem>
                <SelectItem value="himachal-pradesh">02 - HIMACHAL PRADESH</SelectItem>
                <SelectItem value="punjab">03 - PUNJAB</SelectItem>
                <SelectItem value="chandigarh">04 - CHANDIGARH</SelectItem>
                <SelectItem value="uttarakhand">05 - UTTARAKHAND</SelectItem>
                <SelectItem value="haryana">06 - HARYANA</SelectItem>
                <SelectItem value="delhi">07 - DELHI</SelectItem>
                <SelectItem value="rajasthan">08 - RAJASTHAN</SelectItem>
                <SelectItem value="uttar-pradesh">09 - UTTAR PRADESH</SelectItem>
                <SelectItem value="bihar">10 - BIHAR</SelectItem>
                <SelectItem value="sikkim">11 - SIKKIM</SelectItem>
                <SelectItem value="arunachal-pradesh">12 - ARUNACHAL PRADESH</SelectItem>
                <SelectItem value="nagaland">13 - NAGALAND</SelectItem>
                <SelectItem value="manipur">14 - MANIPUR</SelectItem>
                <SelectItem value="mizoram">15 - MIZORAM</SelectItem>
                <SelectItem value="tripura">16 - TRIPURA</SelectItem>
                <SelectItem value="meghalaya">17 - MEGHALAYA</SelectItem>
                <SelectItem value="assam">18 - ASSAM</SelectItem>
                <SelectItem value="west-bengal">19 - WEST BENGAL</SelectItem>
                <SelectItem value="jharkhand">20 - JHARKHAND</SelectItem>
                <SelectItem value="odisha">21 - ODISHA</SelectItem>
                <SelectItem value="chattisgarh">22 - CHATTISGARH</SelectItem>
                <SelectItem value="madhya-pradesh">23 - MADHYA PRADESH</SelectItem>
                <SelectItem value="gujarat">24 - GUJARAT</SelectItem>
                <SelectItem value="dadra-nagar-haveli-daman-diu">26* - DADRA AND NAGAR HAVELI AND DAMAN AND DIU NEWLY MERGED UT</SelectItem>
                <SelectItem value="maharashtra">27 - MAHARASHTRA</SelectItem>
                <SelectItem value="andhra-pradesh-before-division">28 - ANDHRA PRADESH BEFORE DIVISION</SelectItem>
                <SelectItem value="karnataka">29 - KARNATAKA</SelectItem>
                <SelectItem value="goa">30 - GOA</SelectItem>
                <SelectItem value="lakshadweep">31 - LAKSHADWEEP</SelectItem>
                <SelectItem value="kerala">32 - KERALA</SelectItem>
                <SelectItem value="tamil-nadu">33 - TAMIL NADU</SelectItem>
                <SelectItem value="puducherry">34 - PUDUCHERRY</SelectItem>
                <SelectItem value="andaman-nicobar">35 - ANDAMAN AND NICOBAR ISLANDS</SelectItem>
                <SelectItem value="telangana">36 - TELANGANA</SelectItem>
                <SelectItem value="andhra-pradesh-new">37 - ANDHRA PRADESH NEWLY ADDED</SelectItem>
                <SelectItem value="ladakh">38 - LADAKH NEWLY ADDED</SelectItem>
                <SelectItem value="outside-india">OUTSIDE INDIA</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 mb-4">
            <Label htmlFor="shippingZip">Pincode</Label>
            <Input
              id="shippingZip"
              placeholder="Pincode"
              value={formData.shippingZip || ""}
              onChange={(e) =>
                setFormData((prev: any) => ({ ...prev, shippingZip: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2 mb-4">
            <Label htmlFor="shippingCountry">Country</Label>
            <Input
              id="shippingCountry"
              placeholder="Country"
              value={formData.shippingCountry || ""}
              onChange={(e) =>
                setFormData((prev: any) => ({ ...prev, shippingCountry: e.target.value }))
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}