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




// FILE : client/src/components/invoice-form/Step2Form.tsx

import { useContext, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { ChevronDown } from "lucide-react";
import { InvoiceContext } from "@/contexts/InvoiceContext";
import { useProfile } from "@/contexts/ProfileContext";
import { fetchCustomerByName } from "@/services/api/lookup";

export default function Step2Form() {
  const ctx = useContext(InvoiceContext) as any | undefined;
  const invoice = ctx?.invoice ?? {};
  const fieldErrors = ctx?.fieldErrors ?? {};
  const { profile } = useProfile();

  const clearField = (path: string) => {
    if (!ctx) return;
    if (typeof ctx.clearFieldError === "function") ctx.clearFieldError(path);
    else if (typeof ctx.setFieldErrors === "function")
      ctx.setFieldErrors((prev: any) => {
        const copy = { ...(prev || {}) };
        delete copy[path];
        return copy;
      });
  };

  const setBillFromField = (key: string, value: any) => {
    if (!ctx) return;
    ctx.setInvoice((prev: any) => ({
      ...prev,
      billFrom: { ...(prev.billFrom || {}), [key]: value },
    }));
    // clear inline error for this field path if present
    clearField(`billFrom.${key}`);
  };

  const setBillToField = (key: string, value: any) => {
    if (!ctx) return;
    ctx.setInvoice((prev: any) => ({
      ...prev,
      billTo: { ...(prev.billTo || {}), [key]: value },
    }));
    // clear inline error for this field path if present
    clearField(`billTo.${key}`);
  };

  // Prefill seller (billFrom) with logged-in profile
  useEffect(() => {
    if (!ctx) return;
    // profile in context is stored as raw object per ProfileProvider
    const p: any = (profile as any) || null;
    const data = (p && (p.data || p)) || null;
    if (!data) return;
    ctx.setInvoice((prev: any) => ({
      ...prev,
      billFrom: {
        ...(prev.billFrom || {}),
        businessName: prev.billFrom?.businessName || data.company || data.name || "",
        address: prev.billFrom?.address || data.address || "",
        state: prev.billFrom?.state || (data.state ?? ""),
        email: prev.billFrom?.email || data.email || "",
        phone: prev.billFrom?.phone || data.phone || "",
        gst: prev.billFrom?.gst || data.gstNumber || "",
      },
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  // Autofill customer (billTo) when full name entered -> fetch
  const handleCustomerNameBlur = async () => {
    const name = invoice.billTo?.name?.trim();
    if (!name) return;
    const cust = await fetchCustomerByName(name);
    if (!cust || !ctx) return;
    ctx.setInvoice((prev: any) => ({
      ...prev,
      billTo: {
        ...(prev.billTo || {}),
        name: prev.billTo?.name || cust.name || name,
        companyName: prev.billTo?.companyName || cust.companyName || "",
        email: prev.billTo?.email || cust.email || "",
        phone: prev.billTo?.phone || cust.phone || "",
        address: prev.billTo?.address || cust.address || "",
        state: prev.billTo?.state || (cust as any)?.state || "",
        gst: prev.billTo?.gst || (cust as any)?.gst || "",
        pan: prev.billTo?.pan || (cust as any)?.pan || "",
      },
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
              aria-invalid={!!fieldErrors["billFrom.businessName"]}
            />
            <ChevronDown
              className="absolute right-3 top-[55%] -translate-y-1/2 text-muted-foreground pointer-events-none"
              size={18}
            />
            {fieldErrors["billFrom.businessName"] && (
              <p className="text-sm text-red-600 mt-1">{fieldErrors["billFrom.businessName"]}</p>
            )}
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
              aria-invalid={!!fieldErrors["billFrom.address"]}
            />
            {fieldErrors["billFrom.address"] && (
              <p className="text-sm text-red-600 mt-1">{fieldErrors["billFrom.address"]}</p>
            )}
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
              aria-invalid={!!fieldErrors["billFrom.state"]}
            />
            <ChevronDown
              className="absolute right-3 top-[55%] -translate-y-1/2 text-muted-foreground pointer-events-none"
              size={18}
            />
            {fieldErrors["billFrom.state"] && (
              <p className="text-sm text-red-600 mt-1">{fieldErrors["billFrom.state"]}</p>
            )}
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
              aria-invalid={!!fieldErrors["billFrom.email"]}
            />
            {fieldErrors["billFrom.email"] && (
              <p className="text-sm text-red-600 mt-1">{fieldErrors["billFrom.email"]}</p>
            )}
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
              aria-invalid={!!fieldErrors["billFrom.phone"]}
            />
            {fieldErrors["billFrom.phone"] && (
              <p className="text-sm text-red-600 mt-1">{fieldErrors["billFrom.phone"]}</p>
            )}
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
              aria-invalid={!!fieldErrors["billFrom.gst"]}
            />
            {fieldErrors["billFrom.gst"] && (
              <p className="text-sm text-red-600 mt-1">{fieldErrors["billFrom.gst"]}</p>
            )}
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
              onBlur={handleCustomerNameBlur}
              required
              aria-invalid={!!fieldErrors["billTo.name"]}
            />
            <ChevronDown
              className="absolute right-3 top-[55%] -translate-y-1/2 text-muted-foreground pointer-events-none"
              size={18}
            />
            {fieldErrors["billTo.name"] && (
              <p className="text-sm text-red-600 mt-1">{fieldErrors["billTo.name"]}</p>
            )}
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
              aria-invalid={!!fieldErrors["billTo.companyName"]}
            />
            {fieldErrors["billTo.companyName"] && (
              <p className="text-sm text-red-600 mt-1">{fieldErrors["billTo.companyName"]}</p>
            )}
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
              aria-invalid={!!fieldErrors["billTo.address"]}
            />
            {fieldErrors["billTo.address"] && (
              <p className="text-sm text-red-600 mt-1">{fieldErrors["billTo.address"]}</p>
            )}
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
              aria-invalid={!!fieldErrors["billTo.email"]}
            />
            {fieldErrors["billTo.email"] && (
              <p className="text-sm text-red-600 mt-1">{fieldErrors["billTo.email"]}</p>
            )}
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
              aria-invalid={!!fieldErrors["billTo.phone"]}
            />
            {fieldErrors["billTo.phone"] && (
              <p className="text-sm text-red-600 mt-1">{fieldErrors["billTo.phone"]}</p>
            )}
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
              aria-invalid={!!fieldErrors["billTo.gst"]}
            />
            {fieldErrors["billTo.gst"] && (
              <p className="text-sm text-red-600 mt-1">{fieldErrors["billTo.gst"]}</p>
            )}
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
              aria-invalid={!!fieldErrors["billTo.pan"]}
            />
            {fieldErrors["billTo.pan"] && (
              <p className="text-sm text-red-600 mt-1">{fieldErrors["billTo.pan"]}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
