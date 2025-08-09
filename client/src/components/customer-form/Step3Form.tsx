import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

export default function Step3Form() {
    //@ts-expect-error - TSX file, no type definitions for React
    const [documents, setDocuments] = useState<File[]>([]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setDocuments(files.slice(0, 3));
    };

    return (
        <div className="grid grid-cols-2 gap-x-6 gap-y-6 ">
            {/* PAN Number */}
            <div className="space-y-2">
                <Label htmlFor="pan" className="text-sm font-medium text-gray-900">
                    PAN Number
                </Label>
                <Input 
                    id="pan" 
                    className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0" 
                />
            </div>

            {/* Documents */}
            <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-900">
                    Documents
                </Label>
                <div className="relative">
                    <input
                        id="documents"
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleFileChange}
                    />
                    <div className="h-20 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
                        <span className="text-sm font-medium text-blue-600">Upload Documents</span>
                        <span className="text-xs text-gray-500 mt-1">
                            You can upload a maximum of 3 files, 10 MB each
                        </span>
                    </div>
                </div>
            </div>

            {/* Is GST Registered? */}
            <div className="space-y-2">
                <Label htmlFor="gst-registered" className="text-sm font-medium text-gray-900">
                    Is GST Registered?
                </Label>
                <Input 
                    id="gst-registered" 
                    className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0" 
                />
            </div>

            {/* GST Number */}
            <div className="space-y-2">
                <Label htmlFor="gst-number" className="text-sm font-medium text-gray-900">
                    GST Number
                </Label>
                <Input 
                    id="gst-number" 
                    className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0" 
                />
            </div>

            {/* Place of Supply */}
            <div className="space-y-2 ">
                <Label htmlFor="supply-place" className="text-sm font-medium text-gray-900 ">
                    Place of Supply
                </Label>
                <Select>
                    <SelectTrigger 
                        id="supply-place" 
                        className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0 w-full"
                    >
                        <SelectValue />
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
                <Label htmlFor="currency" className="text-sm font-medium text-gray-900">
                    Currency
                </Label>
                <Select defaultValue="INR">
                    <SelectTrigger 
                        id="currency" 
                        className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0 w-full"
                    >
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
                <Label htmlFor="payment-terms" className="text-sm font-medium text-gray-900">
                    Payment Terms
                </Label>
                <Select>
                    <SelectTrigger 
                        id="payment-terms" 
                        className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0 w-full"
                    >
                        <SelectValue />
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