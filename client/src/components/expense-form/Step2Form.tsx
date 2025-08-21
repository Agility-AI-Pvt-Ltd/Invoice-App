import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown } from "lucide-react";

type Step2Props = {
  data: {
    vendorName?: string;
    businessName?: string;
    billingAddress?: string;
    shippingAddress?: string;
    email?: string;
    country?: string;
    phoneNumber?: string;
    state?: string;
    gstin?: string;
    panNumber?: string;
  };
  onChange: (partial: Partial<any>) => void;
};

export default function Step2Form({ data = {}, onChange }: Step2Props) {
  return (
    <div className="w-full">
      <h3 className="font-semibold text-lg mb-8">Vendor Details</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

        {/* Vendor Name */}
        <div className="relative flex flex-col">
          <Label
            htmlFor="vendorName"
            className="mb-2 text-sm font-medium text-gray-700"
          >
            Vendor Name
          </Label>
          <Input
            id="vendorName"
            placeholder="Name"
            className="h-11 px-4 pr-10 text-sm placeholder:text-gray-400"
            value={data.vendorName || ""}
            onChange={(e) => onChange({ vendorName: e.target.value })}
          />
          <ChevronDown
            className="absolute right-3 top-[60%] -translate-y-1/2 text-muted-foreground pointer-events-none"
            size={18}
          />
        </div>

        {/* Business Name */}
        <div className="relative flex flex-col">
          <Label
            htmlFor="businessName"
            className="mb-2 text-sm font-medium text-gray-700"
          >
            Business Name
          </Label>
          <Input
            id="businessName"
            placeholder="Select"
            className="h-11 px-4 pr-10 text-sm placeholder:text-gray-400"
            value={data.businessName || ""}
            onChange={(e) => onChange({ businessName: e.target.value })}
          />
          <ChevronDown
            className="absolute right-3 top-[60%] -translate-y-1/2 text-muted-foreground pointer-events-none"
            size={18}
          />
        </div>

        {/* Billing Address */}
        <div className="flex flex-col">
          <Label
            htmlFor="billingAddress"
            className="mb-2 text-sm font-medium text-gray-700"
          >
            Billing Address
          </Label>
          <Input
            id="billingAddress"
            placeholder="Billing Address"
            className="h-11 px-4 text-sm placeholder:text-gray-400"
            value={data.billingAddress || ""}
            onChange={(e) => onChange({ billingAddress: e.target.value })}
          />
        </div>

        {/* Shipping Address */}
        <div className="flex flex-col">
          <Label
            htmlFor="shippingAddress"
            className="mb-2 text-sm font-medium text-gray-700"
          >
            Shipping Address
          </Label>
          <Input
            id="shippingAddress"
            placeholder="Shipping Address"
            className="h-11 px-4 text-sm placeholder:text-gray-400"
            value={data.shippingAddress || ""}
            onChange={(e) => onChange({ shippingAddress: e.target.value })}
          />
        </div>

        {/* Email */}
        <div className="flex flex-col">
          <Label
            htmlFor="email"
            className="mb-2 text-sm font-medium text-gray-700"
          >
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="Email Address"
            className="h-11 px-4 text-sm placeholder:text-gray-400"
            value={data.email || ""}
            onChange={(e) => onChange({ email: e.target.value })}
          />
        </div>

        {/* Country */}
        <div className="flex flex-col">
          <Label
            htmlFor="country"
            className="mb-2 text-sm font-medium text-gray-700"
          >
            Country
          </Label>
          <Input
            id="country"
            placeholder="India"
            className="h-11 px-4 text-sm placeholder:text-gray-400"
            value={data.country || ""}
            onChange={(e) => onChange({ country: e.target.value })}
          />
        </div>

        {/* Phone Number */}
        <div className="flex flex-col">
          <Label
            htmlFor="phoneNumber"
            className="mb-2 text-sm font-medium text-gray-700"
          >
            Phone Number
          </Label>
          <Input
            id="phoneNumber"
            placeholder="Phone no."
            className="h-11 px-4 text-sm placeholder:text-gray-400"
            value={data.phoneNumber || ""}
            onChange={(e) => onChange({ phoneNumber: e.target.value })}
          />
        </div>

        {/* State */}
        <div className="flex flex-col ">
          <Label
            htmlFor="state"
            className="mb-2 text-sm font-medium text-gray-700"
          >
            State
          </Label>
          <Select
            value={data.state || ""}
            onValueChange={(value) => onChange({ state: value })}
          >
            <SelectTrigger className="h-11 px-4 text-sm placeholder:text-gray-400 w-full">
              <SelectValue placeholder="Select a state" />
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

        {/* GSTIN / Tax ID */}
        <div className="flex flex-col">
          <Label
            htmlFor="gstin"
            className="mb-2 text-sm font-medium text-gray-700"
          >
            GSTRIN/ Tax ID
          </Label>
          <Input
            id="gstin"
            placeholder="XXXX"
            className="h-11 px-4 text-sm placeholder:text-gray-400"
            value={data.gstin || ""}
            onChange={(e) => onChange({ gstin: e.target.value })}
          />
        </div>

        {/* PAN Number */}
        <div className="flex flex-col">
          <Label
            htmlFor="panNumber"
            className="mb-2 text-sm font-medium text-gray-700"
          >
            PAN Number
          </Label>
          <Input
            id="panNumber"
            placeholder="XXXX"
            className="h-11 px-4 text-sm placeholder:text-gray-400"
            value={data.panNumber || ""}
            onChange={(e) => onChange({ panNumber: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
