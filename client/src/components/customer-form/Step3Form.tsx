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
  // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const files = Array.from(e.target.files || []);
  //   const validFiles = files.filter((file) => file.size <= 10 * 1024 * 1024); // max 10MB
  //   setFormData((prev: any) => ({
  //     ...prev,
  //     documents: validFiles.slice(0, 3), // max 3 files
  //   }));
  // };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 w-full">
      {/* PAN Number */}
      <div className="space-y-2 w-full">
        <Label htmlFor="pan">PAN Number</Label>
        <Input
          id="pan"
          className="w-full"
          value={formData.pan || ""}
          onChange={(e) =>
            setFormData((prev: any) => ({ ...prev, pan: e.target.value }))
          }
        />
      </div>

      {/* Is GST Registered? */}
      <div className="space-y-2 w-full">
        <Label htmlFor="gstRegistered">Is GST Registered?</Label>
        <Select
          value={formData.gstRegistered || ""}
          onValueChange={(value) =>
            setFormData((prev: any) => ({ ...prev, gstRegistered: value }))
          }
        >
          <SelectTrigger id="gstRegistered" className="w-full">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="yes">Yes</SelectItem>
            <SelectItem value="no">No</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* GST Number */}
      <div className="space-y-2 w-full">
        <Label htmlFor="gstNumber">GST Number</Label>
        <Input
          id="gstNumber"
          className="w-full"
          value={formData.gstNumber || ""}
          onChange={(e) =>
            setFormData((prev: any) => ({ ...prev, gstNumber: e.target.value }))
          }
        />
      </div>

      {/* Place of Supply */}
      <div className="space-y-2 w-full">
        <Label htmlFor="supplyPlace">Place of Supply</Label>
        <Select
          value={formData.supplyPlace || ""}
          onValueChange={(value) =>
            setFormData((prev: any) => ({ ...prev, supplyPlace: value }))
          }
        >
          <SelectTrigger id="supplyPlace" className="w-full">
            <SelectValue placeholder="Select" />
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

      {/* Currency */}
      <div className="space-y-2 w-full">
        <Label htmlFor="currency">Currency</Label>
        <Select
          value={formData.currency || "INR"}
          onValueChange={(value) =>
            setFormData((prev: any) => ({ ...prev, currency: value }))
          }
        >
          <SelectTrigger id="currency" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="INR">INR</SelectItem>
            <SelectItem value="USD">USD</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Payment Terms */}
      <div className="space-y-2 w-full">
        <Label htmlFor="paymentTerms">Payment Terms</Label>
        <Select
          value={formData.paymentTerms || ""}
          onValueChange={(value) =>
            setFormData((prev: any) => ({ ...prev, paymentTerms: value }))
          }
        >
          <SelectTrigger id="paymentTerms" className="w-full">
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
