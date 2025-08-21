// import { useContext } from "react";
// import { Input } from "@/components/ui/Input";
// import { Label } from "@/components/ui/label";
// import { ChevronDown } from "lucide-react";
// import { InvoiceContext } from "./InvoiceForm";

// export default function Step2Form() {
//   const ctx = useContext(InvoiceContext) as any | undefined;
//   const invoice = ctx?.invoice ?? {};

//   const setBillFromField = (key: string, value: any) => {
//     if (!ctx) return;
//     ctx.setInvoice((prev: any) => ({
//       ...prev,
//       billFrom: { ...(prev.billFrom || {}), [key]: value },
//     }));
//   };

//   const setBillToField = (key: string, value: any) => {
//     if (!ctx) return;
//     ctx.setInvoice((prev: any) => ({
//       ...prev,
//       billTo: { ...(prev.billTo || {}), [key]: value },
//     }));
//   };

//   return (
//     <div className="w-full">
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//         {/* Seller Details */}
//         <div className="space-y-6">
//           <h3 className="font-semibold text-lg">Seller Details (Bill From)</h3>

//           {/* Business Name */}
//           <div className="relative flex flex-col space-y-1">
//             <Label htmlFor="businessName">Business Name</Label>
//             <Input
//               id="businessName"
//               placeholder="ABZ Pvt. Ltd."
//               className="h-11 px-3 pr-10 text-sm"
//               value={invoice.billFrom?.businessName ?? ""}
//               onChange={(e) => setBillFromField("businessName", e.target.value)}
//             />
//             <ChevronDown
//               className="absolute right-3 top-[55%] -translate-y-1/2 text-muted-foreground pointer-events-none"
//               size={18}
//             />
//           </div>

//           {/* Business Address */}
//           <div className="flex flex-col space-y-1">
//             <Label htmlFor="businessAddress">Business Address</Label>
//             <Input
//               id="businessAddress"
//               placeholder="Address"
//               className="h-11 px-3 text-sm"
//               value={invoice.billFrom?.address ?? ""}
//               onChange={(e) => setBillFromField("address", e.target.value)}
//             />
//           </div>

//           {/* State */}
//           <div className="relative flex flex-col space-y-1">
//             <Label htmlFor="state">State</Label>
//             <Input
//               id="state"
//               placeholder="State"
//               className="h-11 px-3 pr-10 text-sm"
//               value={invoice.billFrom?.state ?? ""}
//               onChange={(e) => setBillFromField("state", e.target.value)}
//             />
//             <ChevronDown
//               className="absolute right-3 top-[55%] -translate-y-1/2 text-muted-foreground pointer-events-none"
//               size={18}
//             />
//           </div>

//           {/* Email */}
//           <div className="flex flex-col space-y-1">
//             <Label htmlFor="sellerEmail">Email</Label>
//             <Input
//               id="sellerEmail"
//               type="email"
//               placeholder="Email"
//               className="h-11 px-3 text-sm"
//               value={invoice.billFrom?.email ?? ""}
//               onChange={(e) => setBillFromField("email", e.target.value)}
//             />
//           </div>

//           {/* Phone Number */}
//           <div className="flex flex-col space-y-1">
//             <Label htmlFor="sellerPhone">Phone Number</Label>
//             <Input
//               id="sellerPhone"
//               placeholder="+91 xxx"
//               className="h-11 px-3 text-sm"
//               value={invoice.billFrom?.phone ?? ""}
//               onChange={(e) => setBillFromField("phone", e.target.value)}
//             />
//           </div>

//           {/* GSTIN / Tax ID */}
//           <div className="flex flex-col space-y-1">
//             <Label htmlFor="gstin">GSTIN/Tax ID</Label>
//             <Input
//               id="gstin"
//               placeholder="XXX"
//               className="h-11 px-3 text-sm"
//               value={invoice.billFrom?.gst ?? ""}
//               onChange={(e) => setBillFromField("gst", e.target.value)}
//             />
//           </div>
//         </div>

//         {/* Customer Details */}
//         <div className="space-y-6">
//           <h3 className="font-semibold text-lg">Customer Details (Bill To)</h3>

//           {/* Customer Name */}
//           <div className="relative flex flex-col space-y-1">
//             <Label htmlFor="customerName">Customer Name</Label>
//             <Input
//               id="customerName"
//               placeholder="Name"
//               className="h-11 px-3 pr-10 text-sm"
//               value={invoice.billTo?.name ?? ""}
//               onChange={(e) => setBillToField("name", e.target.value)}
//             />
//             <ChevronDown
//               className="absolute right-3 top-[55%] -translate-y-1/2 text-muted-foreground pointer-events-none"
//               size={18}
//             />
//           </div>

//           {/* Company Name */}
//           <div className="flex flex-col space-y-1">
//             <Label htmlFor="companyName">Company Name</Label>
//             <Input
//               id="companyName"
//               placeholder="Name"
//               className="h-11 px-3 text-sm"
//               value={invoice.billTo?.companyName ?? ""}
//               onChange={(e) => setBillToField("companyName", e.target.value)}
//             />
//           </div>

//           {/* Billing Address */}
//           <div className="flex flex-col space-y-1">
//             <Label htmlFor="billingAddress">Billing Address</Label>
//             <Input
//               id="billingAddress"
//               placeholder="Address"
//               className="h-11 px-3 text-sm"
//               value={invoice.billTo?.address ?? ""}
//               onChange={(e) => setBillToField("address", e.target.value)}
//             />
//           </div>

//           {/* Email */}
//           <div className="flex flex-col space-y-1">
//             <Label htmlFor="customerEmail">Email</Label>
//             <Input
//               id="customerEmail"
//               type="email"
//               placeholder="Mail"
//               className="h-11 px-3 text-sm"
//               value={invoice.billTo?.email ?? ""}
//               onChange={(e) => setBillToField("email", e.target.value)}
//             />
//           </div>

//           {/* Phone Number */}
//           <div className="flex flex-col space-y-1">
//             <Label htmlFor="customerPhone">Phone Number</Label>
//             <Input
//               id="customerPhone"
//               placeholder="+91 XXX"
//               className="h-11 px-3 text-sm"
//               value={invoice.billTo?.phone ?? ""}
//               onChange={(e) => setBillToField("phone", e.target.value)}
//             />
//           </div>

//           {/* GST Number */}
//           <div className="flex flex-col space-y-1">
//             <Label htmlFor="gstNumber">GST Number</Label>
//             <Input
//               id="gstNumber"
//               placeholder="GST Number"
//               className="h-11 px-3 text-sm"
//               value={invoice.billTo?.gst ?? ""}
//               onChange={(e) => setBillToField("gst", e.target.value)}
//             />
//           </div>

//           {/* PAN Number */}
//           <div className="flex flex-col space-y-1">
//             <Label htmlFor="panNumber">PAN Number</Label>
//             <Input
//               id="panNumber"
//               placeholder="XXXX"
//               className="h-11 px-3 text-sm"
//               value={invoice.billTo?.pan ?? ""}
//               onChange={(e) => setBillToField("pan", e.target.value)}
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }




import { useContext } from "react";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { ChevronDown } from "lucide-react";
import { InvoiceContext } from "@/contexts/InvoiceContext";

export default function Step2Form() {
  const ctx = useContext(InvoiceContext) as any | undefined;
  const invoice = ctx?.invoice ?? {};

  const setBillFromField = (key: string, value: any) => {
    if (!ctx) return;
    ctx.setInvoice((prev: any) => ({
      ...prev,
      billFrom: { ...(prev.billFrom || {}), [key]: value },
    }));
  };

  const setBillToField = (key: string, value: any) => {
    if (!ctx) return;
    ctx.setInvoice((prev: any) => ({
      ...prev,
      billTo: { ...(prev.billTo || {}), [key]: value },
    }));
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Seller Details */}
        <div className="space-y-6">
          <h3 className="font-semibold text-lg">Seller Details (Bill From)</h3>

          {/* Business Name */}
          <div className="relative flex flex-col space-y-1">
            <Label htmlFor="businessName">
              Business Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="businessName"
              placeholder="ABZ Pvt. Ltd."
              className="h-11 px-3 pr-10 text-sm"
              value={invoice.billFrom?.businessName ?? ""}
              onChange={(e) => setBillFromField("businessName", e.target.value)}
              required
            />
            <ChevronDown
              className="absolute right-3 top-[55%] -translate-y-1/2 text-muted-foreground pointer-events-none"
              size={18}
            />
          </div>

          {/* Business Address */}
          <div className="flex flex-col space-y-1">
            <Label htmlFor="businessAddress">
              Business Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="businessAddress"
              placeholder="Address"
              className="h-11 px-3 text-sm"
              value={invoice.billFrom?.address ?? ""}
              onChange={(e) => setBillFromField("address", e.target.value)}
              required
            />
          </div>

          {/* State */}
          <div className="relative flex flex-col space-y-1">
            <Label htmlFor="state">
              State <span className="text-red-500">*</span>
            </Label>
            <Input
              id="state"
              placeholder="State"
              className="h-11 px-3 pr-10 text-sm"
              value={invoice.billFrom?.state ?? ""}
              onChange={(e) => setBillFromField("state", e.target.value)}
              required
            />
            <ChevronDown
              className="absolute right-3 top-[55%] -translate-y-1/2 text-muted-foreground pointer-events-none"
              size={18}
            />
          </div>

          {/* Email */}
          <div className="flex flex-col space-y-1">
            <Label htmlFor="sellerEmail">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="sellerEmail"
              type="email"
              placeholder="Email"
              className="h-11 px-3 text-sm"
              value={invoice.billFrom?.email ?? ""}
              onChange={(e) => setBillFromField("email", e.target.value)}
              required
            />
          </div>

          {/* Phone Number */}
          <div className="flex flex-col space-y-1">
            <Label htmlFor="sellerPhone">
              Phone Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="sellerPhone"
              placeholder="+91 xxx"
              className="h-11 px-3 text-sm"
              value={invoice.billFrom?.phone ?? ""}
              onChange={(e) => setBillFromField("phone", e.target.value)}
              required
            />
          </div>

          {/* GSTIN / Tax ID */}
          <div className="flex flex-col space-y-1">
            <Label htmlFor="gstin">GSTIN/Tax ID</Label>
            <Input
              id="gstin"
              placeholder="XXX"
              className="h-11 px-3 text-sm"
              value={invoice.billFrom?.gst ?? ""}
              onChange={(e) => setBillFromField("gst", e.target.value)}
            />
          </div>
        </div>

        {/* Customer Details */}
        <div className="space-y-6">
          <h3 className="font-semibold text-lg">Customer Details (Bill To)</h3>

          {/* Customer Name */}
          <div className="relative flex flex-col space-y-1">
            <Label htmlFor="customerName">
              Customer Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="customerName"
              placeholder="Name"
              className="h-11 px-3 pr-10 text-sm"
              value={invoice.billTo?.name ?? ""}
              onChange={(e) => setBillToField("name", e.target.value)}
              required
            />
            <ChevronDown
              className="absolute right-3 top-[55%] -translate-y-1/2 text-muted-foreground pointer-events-none"
              size={18}
            />
          </div>

          {/* Company Name */}
          <div className="flex flex-col space-y-1">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              placeholder="Name"
              className="h-11 px-3 text-sm"
              value={invoice.billTo?.companyName ?? ""}
              onChange={(e) => setBillToField("companyName", e.target.value)}
            />
          </div>

          {/* Billing Address */}
          <div className="flex flex-col space-y-1">
            <Label htmlFor="billingAddress">
              Billing Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="billingAddress"
              placeholder="Address"
              className="h-11 px-3 text-sm"
              value={invoice.billTo?.address ?? ""}
              onChange={(e) => setBillToField("address", e.target.value)}
              required
            />
          </div>

          {/* Email */}
          <div className="flex flex-col space-y-1">
            <Label htmlFor="customerEmail">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="customerEmail"
              type="email"
              placeholder="Mail"
              className="h-11 px-3 text-sm"
              value={invoice.billTo?.email ?? ""}
              onChange={(e) => setBillToField("email", e.target.value)}
              required
            />
          </div>

          {/* Phone Number */}
          <div className="flex flex-col space-y-1">
            <Label htmlFor="customerPhone">
              Phone Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="customerPhone"
              placeholder="+91 XXX"
              className="h-11 px-3 text-sm"
              value={invoice.billTo?.phone ?? ""}
              onChange={(e) => setBillToField("phone", e.target.value)}
              required
            />
          </div>

          {/* GST Number */}
          <div className="flex flex-col space-y-1">
            <Label htmlFor="gstNumber">GST Number</Label>
            <Input
              id="gstNumber"
              placeholder="GST Number"
              className="h-11 px-3 text-sm"
              value={invoice.billTo?.gst ?? ""}
              onChange={(e) => setBillToField("gst", e.target.value)}
            />
          </div>

          {/* PAN Number */}
          <div className="flex flex-col space-y-1">
            <Label htmlFor="panNumber">PAN Number</Label>
            <Input
              id="panNumber"
              placeholder="XXXX"
              className="h-11 px-3 text-sm"
              value={invoice.billTo?.pan ?? ""}
              onChange={(e) => setBillToField("pan", e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

