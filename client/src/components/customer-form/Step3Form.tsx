import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "../ui/Input";

type Step3FormProps = {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
};

export default function Step3Form({ formData, setFormData }: Step3FormProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => file.size <= 10 * 1024 * 1024); // max 10MB
    setFormData((prev: any) => ({
      ...prev,
      documents: validFiles.slice(0, 3), // max 3 files
    }));
  };

  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-6 ">
      {/* PAN Number */}
      <div className="space-y-2">
        <Label htmlFor="pan">PAN Number</Label>
        <Input
          id="pan"
          value={formData.pan || ""}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, pan: e.target.value }))}
        />
      </div>

      {/* Documents */}
      <div className="space-y-2">
        <Label>Documents</Label>
        <div className="relative">
          <input
            id="documents"
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileChange}
          />
          <div className="h-20 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100">
            <span className="text-sm font-medium text-blue-600">Upload Documents</span>
            <span className="text-xs text-gray-500 mt-1">
              Max 3 files, 10 MB each
            </span>
          </div>
        </div>
      </div>

      {/* Is GST Registered? */}
      <div className="space-y-2">
        <Label htmlFor="gstRegistered">Is GST Registered?</Label>
        <Select
          value={formData.gstRegistered || ""}
          onValueChange={(value) =>
            setFormData((prev: any) => ({ ...prev, gstRegistered: value }))
          }
        >
          <SelectTrigger id="gstRegistered">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="yes">Yes</SelectItem>
            <SelectItem value="no">No</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* GST Number */}
      <div className="space-y-2">
        <Label htmlFor="gstNumber">GST Number</Label>
        <Input
          id="gstNumber"
          value={formData.gstNumber || ""}
          onChange={(e) =>
            setFormData((prev: any) => ({ ...prev, gstNumber: e.target.value }))
          }
        />
      </div>

      {/* Place of Supply */}
      <div className="space-y-2">
        <Label htmlFor="supplyPlace">Place of Supply</Label>
        <Select
          value={formData.supplyPlace || ""}
          onValueChange={(value) =>
            setFormData((prev: any) => ({ ...prev, supplyPlace: value }))
          }
        >
          <SelectTrigger id="supplyPlace">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Maharashtra">Maharashtra</SelectItem>
            <SelectItem value="Delhi">Delhi</SelectItem>
            <SelectItem value="Karnataka">Karnataka</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Currency */}
      <div className="space-y-2">
        <Label htmlFor="currency">Currency</Label>
        <Select
          value={formData.currency || "INR"}
          onValueChange={(value) =>
            setFormData((prev: any) => ({ ...prev, currency: value }))
          }
        >
          <SelectTrigger id="currency">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="INR">INR</SelectItem>
            <SelectItem value="USD">USD</SelectItem>
            <SelectItem value="EUR">EUR</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Payment Terms */}
      <div className="space-y-2">
        <Label htmlFor="paymentTerms">Payment Terms</Label>
        <Select
          value={formData.paymentTerms || ""}
          onValueChange={(value) =>
            setFormData((prev: any) => ({ ...prev, paymentTerms: value }))
          }
        >
          <SelectTrigger id="paymentTerms">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Net 15">Net 15</SelectItem>
            <SelectItem value="Net 30">Net 30</SelectItem>
            <SelectItem value="Net 45">Net 45</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
