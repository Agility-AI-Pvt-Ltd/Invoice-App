import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

export default function BusinessForm() {
  const [logo, setLogo] = useState<File | null>(null);

  return (
    <div className="w-full max-w-md  space-y-6 ">
      {/* Add Business Logo */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Add Business Logo</Label>
        <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
          <label className="cursor-pointer text-sm font-medium text-gray-600 flex flex-col items-center gap-1">
            <input
              type="file"
              accept=".png,.jpg,.jpeg,.pdf,.webp"
              className="hidden"
              onChange={(e) => setLogo(e.target.files?.[0] || null)}
            />
            <span className="text-gray-700">Upload</span>
            <span className="text-xs text-slate-400">
              Only PNG, JPG, PDF, WEBP <br /> files are supported
            </span>
          </label>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes" className="text-sm font-medium">
          Notes
        </Label>
        <Textarea
          id="notes"
          placeholder="Write a Note."
          className="resize-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none placeholder:text-slate-400"
        />
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label htmlFor="tags" className="text-sm font-medium">
          Tags
        </Label>
        <Select>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tag1">Tag 1</SelectItem>
            <SelectItem value="tag2">Tag 2</SelectItem>
            <SelectItem value="tag3">Tag 3</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}