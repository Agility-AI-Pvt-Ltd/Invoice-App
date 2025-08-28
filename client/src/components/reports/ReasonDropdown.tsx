import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import Cookies from "js-cookie";

interface ReasonDropdownProps {
  currentReason: string;
  noteId: string;
  noteType: "credit-notes" | "debit-notes";
  onReasonUpdate: (newReason: string) => void;
}

const reasonOptions = {
  "credit-notes": ["Returned Goods", "Discount", "Overpayment", "Other"],
  "debit-notes": ["Damaged Goods", "Overcharged", "Quantity Mismatch", "Other"],
};

export default function ReasonDropdown({
  currentReason,
  noteId,
  noteType,
  onReasonUpdate,
}: ReasonDropdownProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const API_BASE = "https://invoice-backend-604217703209.asia-south1.run.app";

  const handleReasonUpdate = async (newReason: string) => {
    if (newReason === currentReason) return;
    
    try {
      setLoading(true);
      const token = Cookies.get("authToken");
      
      const response = await fetch(`${API_BASE}/api/${noteType}/${noteId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ reason: newReason }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update reason (${response.status})`);
      }

      onReasonUpdate(newReason);
      toast({
        title: "Success",
        description: "Reason updated successfully!",
      });
    } catch (error) {
      console.error("Error updating reason:", error);
      toast({
        title: "Error",
        description: "Failed to update reason. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          className="h-8 px-3 text-xs font-medium bg-white text-slate-700 hover:bg-slate-50 rounded"
          disabled={loading}
        >
          {currentReason}
          <ChevronDown className="ml-1 h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {reasonOptions[noteType].map((reason) => (
          <DropdownMenuItem
            key={reason}
            onClick={() => handleReasonUpdate(reason)}
            className={`cursor-pointer ${
              reason === currentReason
                ? "bg-[#8066FF] text-white"
                : "bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {reason}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
