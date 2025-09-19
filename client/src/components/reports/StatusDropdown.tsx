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
import { getApiBaseUrl } from "@/lib/api-config";
import Cookies from "js-cookie";

interface StatusDropdownProps {
  currentStatus: string;
  noteId: string;
  noteType: "credit-notes" | "debit-notes";
  onStatusUpdate: (newStatus: string) => void;
}

const statusOptions = {
  "credit-notes": ["Open", "Adjusted", "Refunded"],
  "debit-notes": ["Open", "Accepted", "Rejected", "Settled"],
};

const statusColors: Record<string, string> = {
  Open: "border-blue-200 bg-blue-100 text-blue-700",
  Refunded: "border-emerald-200 bg-emerald-100 text-emerald-700",
  Adjusted: "border-amber-200 bg-amber-100 text-amber-700",
  Accepted: "border-indigo-200 bg-indigo-100 text-indigo-700",
  Settled: "border-emerald-200 bg-emerald-100 text-emerald-700",
  Rejected: "border-red-200 bg-red-100 text-red-700",
};

export default function StatusDropdown({
  currentStatus,
  noteId,
  noteType,
  onStatusUpdate,
}: StatusDropdownProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const API_BASE = getApiBaseUrl();

  const handleStatusUpdate = async (newStatus: string) => {
    if (newStatus === currentStatus) return;
    
    try {
      setLoading(true);
      const token = Cookies.get("authToken");
      
      const response = await fetch(`${API_BASE}/api/${noteType}/${noteId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update status (${response.status})`);
      }

      onStatusUpdate(newStatus);
      toast({
        title: "Success",
        description: "Status updated successfully!",
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
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
          variant="ghost"
          className={`h-8 px-3 text-xs font-medium border rounded-full ${statusColors[currentStatus]}`}
          disabled={loading}
        >
          {currentStatus}
          <ChevronDown className="ml-1 h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32">
        {statusOptions[noteType].map((status) => (
          <DropdownMenuItem
            key={status}
            onClick={() => handleStatusUpdate(status)}
            className={`cursor-pointer ${
              status === currentStatus
                ? "bg-[#8066FF] text-white"
                : "bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {status}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
