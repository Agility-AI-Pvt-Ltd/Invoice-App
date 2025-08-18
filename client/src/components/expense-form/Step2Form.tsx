import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
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
        <div className="relative flex flex-col">
          <Label
            htmlFor="state"
            className="mb-2 text-sm font-medium text-gray-700"
          >
            State
          </Label>
          <Input
            id="state"
            placeholder="Select"
            className="h-11 px-4 pr-10 text-sm placeholder:text-gray-400"
            value={data.state || ""}
            onChange={(e) => onChange({ state: e.target.value })}
          />
          <ChevronDown
            className="absolute right-3 top-[60%] -translate-y-1/2 text-muted-foreground pointer-events-none"
            size={18}
          />
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
