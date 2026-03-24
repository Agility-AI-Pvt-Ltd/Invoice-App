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

import { useContext, useEffect, useState, useCallback, useRef } from "react";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { ChevronDown, Search, Loader2 } from "lucide-react";
import { InvoiceContext } from "@/contexts/InvoiceContext";
import { useProfile } from "@/contexts/ProfileContext";
import { searchCustomers } from "@/services/api/lookup";

// Enhanced customer type based on the API response
interface EnhancedCustomer {
  _id?: string;
  customerType?: string;
  fullName?: string;
  name?: string;
  email?: string;
  phone?: string;
  companyName?: string;
  website?: string;
  billingAddress?: string;
  billingCity?: string;
  billingState?: string;
  billingZip?: string;
  billingCountry?: string;
  billingAddressLine1?: string;
  billingAddressLine2?: string;
  shippingAddress?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingZip?: string;
  shippingCountry?: string;
  shippingAddressLine1?: string;
  shippingAddressLine2?: string;
  pan?: string;
  gstRegistered?: string;
  gstNumber?: string;
  supplyPlace?: string;
  currency?: string;
  paymentTerms?: string;
  status?: string;
  balance?: number;
}

export default function Step2Form() {
  const ctx = useContext(InvoiceContext) as any | undefined;
  const invoice = ctx?.invoice ?? {};
  const fieldErrors = ctx?.fieldErrors ?? {};
  const { profile } = useProfile();

  // Customer search state
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [customerSuggestions, setCustomerSuggestions] = useState<EnhancedCustomer[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Enhanced customer search with debouncing
  const performCustomerSearch = useCallback(async (searchTerm: string) => {
    if (!searchTerm || searchTerm.trim().length < 2) {
      setCustomerSuggestions([]);
      return;
    }

    setIsSearching(true);
    try {
      const customers = await searchCustomers(searchTerm);
      setCustomerSuggestions(customers);
    } catch (error) {
      console.error("Customer search error:", error);
      setCustomerSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounced search effect
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (customerSearchTerm.trim().length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        performCustomerSearch(customerSearchTerm);
      }, 300); // 300ms debounce
    } else {
      setCustomerSuggestions([]);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [customerSearchTerm, performCustomerSearch]);

  // Handle customer selection and autofill
  // ⚠️ Backend returns: city, state, zipCode, address, billingAddress, shippingAddress
  const handleCustomerSelect = (customer: any) => {
    if (!ctx) return;

    console.log('🔍 Customer selected for auto-fill:', customer);

    // ⚠️ Backend provides direct fields: city, state, zipCode (not billingCity, billingState, billingZip)
    const city = customer.city || customer.billingCity || "";
    const state = customer.state || customer.billingState || "";
    const zipCode = customer.zipCode || customer.zip || customer.billingZip || "";
    const country = customer.country || customer.billingCountry || "India";

    // Use billingAddress if provided, otherwise use address
    const addressLine = customer.billingAddress || customer.address || customer.billingAddressLine1 || "";

    ctx.setInvoice((prev: any) => ({
      ...prev,
      // Store customerId for auto-fetching payment terms
      customerId: customer._id || customer.id || null,
      billTo: {
        ...(prev.billTo || {}),
        name: customer.name || customer.fullName || "",
        companyName: customer.company || customer.companyName || "",
        email: customer.email || "",
        phone: customer.phone || "",
        address: addressLine,
        city: city, // ⚠️ Backend uses city (not billingCity)
        state: state, // ⚠️ Backend uses state (not billingState)
        zip: zipCode, // ⚠️ Backend uses zipCode (not billingZip)
        zipCode: zipCode,
        country: country,
        gst: customer.gstNumber || customer.gst || "",
        gstNumber: customer.gstNumber || customer.gst || "",
        pan: customer.panNumber || customer.pan || "",
        panNumber: customer.panNumber || customer.pan || "",
      },
    }));

    console.log('✅ Invoice billTo updated with customer data and customerId stored');

    // Clear search and suggestions
    setCustomerSearchTerm(customer.name || customer.fullName || "");
    setCustomerSuggestions([]);
    setShowSuggestions(false);
  };

  // Handle customer name input change
  const handleCustomerNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomerSearchTerm(value);
    setBillToField("name", value);
    
    // Show suggestions if there are any
    if (customerSuggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  // Handle customer name input focus
  const handleCustomerNameFocus = () => {
    if (customerSuggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.customer-search-container')) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Prefill seller (billFrom) with logged-in profile
  useEffect(() => {
    if (!ctx) return;
    // profile in context is stored as raw object per ProfileProvider
    const p: any = (profile as any) || null;
    const data = (p && (p.data || p)) || null;
    if (!data) return;
    
    console.log('🔄 Auto-filling seller details from profile:', data);
    
    ctx.setInvoice((prev: any) => ({
      ...prev,
      billFrom: {
        ...(prev.billFrom || {}),
        businessName: prev.billFrom?.businessName || data.businessName || data.company || data.name || "",
        address: prev.billFrom?.address || data.address || "",
        city: prev.billFrom?.city || data.city || "", // ⚠️ NEW - Auto-fill city
        state: prev.billFrom?.state || data.state || "",
        country: prev.billFrom?.country || data.country || "India", // ⚠️ NEW - Auto-fill country
        email: prev.billFrom?.email || data.email || "",
        phone: prev.billFrom?.phone || data.phone || "",
        gst: prev.billFrom?.gst || data.gst || data.gstNumber || "",
      },
    }));
    
    console.log('✅ Seller details auto-filled');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

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

          {/* Business City */}
          <div className="flex flex-col space-y-1">
            <Label htmlFor="businessCity">City</Label>
            <Input
              id="businessCity"
              placeholder="City"
              className="h-11 px-3 text-sm"
              value={invoice.billFrom?.city ?? ""}
              onChange={(e) => setBillFromField("city", e.target.value)}
              aria-invalid={!!fieldErrors["billFrom.city"]}
            />
            {fieldErrors["billFrom.city"] && (
              <p className="text-sm text-red-600 mt-1">{fieldErrors["billFrom.city"]}</p>
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

          {/* Business Country */}
          <div className="flex flex-col space-y-1">
            <Label htmlFor="businessCountry">Country</Label>
            <Input
              id="businessCountry"
              placeholder="Country"
              className="h-11 px-3 text-sm"
              value={invoice.billFrom?.country ?? "India"}
              onChange={(e) => setBillFromField("country", e.target.value)}
              aria-invalid={!!fieldErrors["billFrom.country"]}
            />
            {fieldErrors["billFrom.country"] && (
              <p className="text-sm text-red-600 mt-1">{fieldErrors["billFrom.country"]}</p>
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

          {/* Customer Name with Search */}
          <div className="relative flex flex-col space-y-1 customer-search-container">
            <Label htmlFor="customerName">
              Customer Name <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="customerName"
                placeholder="Start typing to search customers..."
                className="h-11 px-3 pr-10 text-sm"
                value={customerSearchTerm}
                onChange={handleCustomerNameChange}
                onFocus={handleCustomerNameFocus}
                required
                aria-invalid={!!fieldErrors["billTo.name"]}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                {isSearching && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
                <Search className="h-4 w-4 text-gray-400" />
              </div>
            </div>
            
            {/* Customer Suggestions Dropdown */}
            {showSuggestions && customerSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {customerSuggestions.map((customer, index) => (
                  <div
                    key={customer._id || index}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                    onClick={() => handleCustomerSelect(customer)}
                  >
                    <div className="font-medium text-sm">
                      {customer.fullName || customer.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {customer.companyName && `${customer.companyName} • `}
                      {customer.email && `${customer.email} • `}
                      {customer.phone && `${customer.phone}`}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {fieldErrors["billTo.name"] && (
              <p className="text-sm text-red-600 mt-1">{fieldErrors["billTo.name"]}</p>
            )}
          </div>

          {/* Company Name */}
          <div className="flex flex-col space-y-1">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              placeholder="Company Name"
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
              placeholder="Billing Address"
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

          {/* City */}
          <div className="flex flex-col space-y-1">
            <Label htmlFor="customerCity">City</Label>
            <Input
              id="customerCity"
              placeholder="City"
              className="h-11 px-3 text-sm"
              value={invoice.billTo?.city ?? ""}
              onChange={(e) => setBillToField("city", e.target.value)}
              aria-invalid={!!fieldErrors["billTo.city"]}
            />
            {fieldErrors["billTo.city"] && (
              <p className="text-sm text-red-600 mt-1">{fieldErrors["billTo.city"]}</p>
            )}
          </div>

          {/* State */}
          <div className="flex flex-col space-y-1">
            <Label htmlFor="customerState">State</Label>
            <Input
              id="customerState"
              placeholder="State"
              className="h-11 px-3 text-sm"
              value={invoice.billTo?.state ?? ""}
              onChange={(e) => setBillToField("state", e.target.value)}
              aria-invalid={!!fieldErrors["billTo.state"]}
            />
            {fieldErrors["billTo.state"] && (
              <p className="text-sm text-red-600 mt-1">{fieldErrors["billTo.state"]}</p>
            )}
          </div>

          {/* Zip Code */}
          <div className="flex flex-col space-y-1">
            <Label htmlFor="customerZip">Zip Code</Label>
            <Input
              id="customerZip"
              placeholder="Zip Code"
              className="h-11 px-3 text-sm"
              value={invoice.billTo?.zip ?? invoice.billTo?.zipCode ?? ""}
              onChange={(e) => {
                const value = e.target.value;
                // Set both zip and zipCode for compatibility
                if (!ctx) return;
                ctx.setInvoice((prev: any) => ({
                  ...prev,
                  billTo: { 
                    ...(prev.billTo || {}), 
                    zip: value,
                    zipCode: value
                  },
                }));
                clearField("billTo.zip");
              }}
              aria-invalid={!!fieldErrors["billTo.zip"]}
            />
            {fieldErrors["billTo.zip"] && (
              <p className="text-sm text-red-600 mt-1">{fieldErrors["billTo.zip"]}</p>
            )}
          </div>

          {/* Country */}
          <div className="flex flex-col space-y-1">
            <Label htmlFor="customerCountry">Country</Label>
            <Input
              id="customerCountry"
              placeholder="Country"
              className="h-11 px-3 text-sm"
              value={invoice.billTo?.country ?? "India"}
              onChange={(e) => setBillToField("country", e.target.value)}
              aria-invalid={!!fieldErrors["billTo.country"]}
            />
            {fieldErrors["billTo.country"] && (
              <p className="text-sm text-red-600 mt-1">{fieldErrors["billTo.country"]}</p>
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
              placeholder="Email Address"
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
              placeholder="PAN Number"
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
