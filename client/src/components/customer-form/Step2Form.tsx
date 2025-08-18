// File: client\src\components\customer-form\Step2Form.tsx

import { Label } from "@/components/ui/label";
import { Input } from "../ui/Input";

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
            <Input
              id="billingState"
              placeholder="State"
              value={formData.billingState || ""}
              onChange={(e) =>
                setFormData((prev: any) => ({ ...prev, billingState: e.target.value }))
              }
            />
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
            <Input
              id="shippingState"
              placeholder="State"
              value={formData.shippingState || ""}
              onChange={(e) =>
                setFormData((prev: any) => ({ ...prev, shippingState: e.target.value }))
              }
            />
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
