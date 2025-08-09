import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter } from "lucide-react";
import { salesData } from "@/lib/mock/salesData";
import type { SalesRecord } from "@/lib/mock/salesData";

interface FilterDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onFilter: (data: SalesRecord[]) => void;
}

export const FilterDialog = ({ isOpen, onOpenChange, onFilter }: FilterDialogProps) => {
  const [filters, setFilters] = useState({
    paymentStatus: "all",
    monthBefore: "all",
    minQuantity: "",
    minAmount: ""
  });

  const applyFilters = () => {
    let filtered = [...salesData];

    if (filters.paymentStatus && filters.paymentStatus !== "all") {
      filtered = filtered.filter(item => item.paymentStatus === filters.paymentStatus);
    }

    if (filters.minQuantity) {
      filtered = filtered.filter(item => item.quantity >= parseInt(filters.minQuantity));
    }

    if (filters.minAmount) {
      filtered = filtered.filter(item => item.totalAmount >= parseInt(filters.minAmount));
    }

    // Month filter would require parsing the date format
    if (filters.monthBefore) {
      // Implementation for month filtering would go here
    }

    onFilter(filtered);
    onOpenChange(false);
  };

  const clearFilters = () => {
    setFilters({
      paymentStatus: "all",
      monthBefore: "all",
      minQuantity: "",
      minAmount: ""
    });
    onFilter(salesData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="hidden sm:flex">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">Filter Sales Data</DialogTitle>
          <DialogDescription>
            Apply filters to narrow down the sales records.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="paymentStatus">Payment Status</Label>
            <Select 
              value={filters.paymentStatus} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, paymentStatus: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Unpaid">Unpaid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="monthBefore">Month</Label>
            <Select 
              value={filters.monthBefore} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, monthBefore: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="All months" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="january">January</SelectItem>
                <SelectItem value="february">February</SelectItem>
                <SelectItem value="march">March</SelectItem>
                <SelectItem value="april">April</SelectItem>
                <SelectItem value="may">May</SelectItem>
                <SelectItem value="june">June</SelectItem>
                <SelectItem value="july">July</SelectItem>
                <SelectItem value="august">August</SelectItem>
                <SelectItem value="september">September</SelectItem>
                <SelectItem value="october">October</SelectItem>
                <SelectItem value="november">November</SelectItem>
                <SelectItem value="december">December</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="minQuantity">Minimum Quantity</Label>
            <Input
              id="minQuantity"
              type="number"
              placeholder="Enter minimum quantity"
              value={filters.minQuantity}
              onChange={(e) => setFilters(prev => ({ ...prev, minQuantity: e.target.value }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="minAmount">Minimum Amount (₹)</Label>
            <Input
              id="minAmount"
              type="number"
              placeholder="Enter minimum amount"
              value={filters.minAmount}
              onChange={(e) => setFilters(prev => ({ ...prev, minAmount: e.target.value }))}
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={applyFilters}>
              Apply Filters
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};