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
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddSalesDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddSales?: (newSales: {
    invoiceNumber: string;
    customerName: string;
    product: string;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
    dateOfSale: string;
    paymentStatus: 'Paid' | 'Unpaid';
  }) => void;
}

export const AddSalesDialog = ({ isOpen, onOpenChange, onAddSales }: AddSalesDialogProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    invoiceNumber: "",
    customerName: "",
    product: "",
    quantity: "",
    unitPrice: "",
    dateOfSale: "",
    paymentStatus: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.invoiceNumber || !formData.customerName || !formData.product || 
        !formData.quantity || !formData.unitPrice || !formData.dateOfSale || 
        !formData.paymentStatus) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const quantity = parseInt(formData.quantity);
    const unitPrice = parseFloat(formData.unitPrice);
    const totalAmount = quantity * unitPrice;
    
    const formattedDate = new Date(formData.dateOfSale).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    const newSales = {
      invoiceNumber: formData.invoiceNumber,
      customerName: formData.customerName,
      product: formData.product,
      quantity,
      unitPrice,
      totalAmount,
      dateOfSale: formattedDate,
      paymentStatus: formData.paymentStatus as 'Paid' | 'Unpaid',
    };

    onAddSales?.(newSales);
    onOpenChange(false);
    setFormData({
      invoiceNumber: "",
      customerName: "",
      product: "",
      quantity: "",
      unitPrice: "",
      dateOfSale: "",
      paymentStatus: ""
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 hidden sm:flex">
          <Plus className="w-4 h-4 mr-2" />
          Add New Sales
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">Add New Sales Record</DialogTitle>
          <DialogDescription>
            Enter the details for the new sales record.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invoiceNumber">Invoice Number</Label>
            <Input
              id="invoiceNumber"
              value={formData.invoiceNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
              placeholder="INV-2024/001"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="customerName">Customer Name</Label>
            <Input
              id="customerName"
              value={formData.customerName}
              onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="product">Product</Label>
            <Input
              id="product"
              value={formData.product}
              onChange={(e) => setFormData(prev => ({ ...prev, product: e.target.value }))}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="unitPrice">Unit Price</Label>
              <Input
                id="unitPrice"
                type="number"
                value={formData.unitPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, unitPrice: e.target.value }))}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dateOfSale">Date of Sale</Label>
            <Input
              id="dateOfSale"
              type="date"
              value={formData.dateOfSale}
              onChange={(e) => setFormData(prev => ({ ...prev, dateOfSale: e.target.value }))}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="paymentStatus">Payment Status</Label>
            <Select value={formData.paymentStatus} onValueChange={(value) => setFormData(prev => ({ ...prev, paymentStatus: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Unpaid">Unpaid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Record</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};