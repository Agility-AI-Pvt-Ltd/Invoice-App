import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImportDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onImportData?: (data: any[]) => void;
}

export const ImportDialog = ({ isOpen, onOpenChange, onImportData }: ImportDialogProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const parseCSV = (csvText: string) => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const rows = lines.slice(1);

    const columnMapping = {
      'invoice number': 'invoiceNumber',
      'invoicenumber': 'invoiceNumber',
      'invoice': 'invoiceNumber',
      'customer name': 'customerName',
      'customername': 'customerName',
      'customer': 'customerName',
      'name': 'customerName',
      'product': 'product',
      'quantity': 'quantity',
      'qty': 'quantity',
      'unit price': 'unitPrice',
      'unitprice': 'unitPrice',
      'price': 'unitPrice',
      'total amount': 'totalAmount',
      'totalamount': 'totalAmount',
      'total': 'totalAmount',
      'amount': 'totalAmount',
      'date of sale': 'dateOfSale',
      'dateofsale': 'dateOfSale',
      'date': 'dateOfSale',
      'payment status': 'paymentStatus',
      'paymentstatus': 'paymentStatus',
      'status': 'paymentStatus'
    };

    return rows.map((row, index) => {
      const values = row.split(',').map(v => v.trim());
      const record: any = {
        id: `imported-${Date.now()}-${index}`,
        invoiceNumber: '-',
        customerName: '-',
        product: '-',
        quantity: 0,
        unitPrice: 0,
        totalAmount: 0,
        dateOfSale: '-',
        paymentStatus: 'Unpaid'
      };

      headers.forEach((header, i) => {
        const mappedKey = columnMapping[header.replace(/['"]/g, '')];
        if (mappedKey && values[i]) {
          let value = values[i].replace(/['"]/g, '');
          
          if (mappedKey === 'quantity' || mappedKey === 'unitPrice' || mappedKey === 'totalAmount') {
            const numValue = parseFloat(value.replace(/[₹,]/g, ''));
            record[mappedKey] = isNaN(numValue) ? 0 : numValue;
          } else if (mappedKey === 'paymentStatus') {
            record[mappedKey] = value.toLowerCase().includes('paid') ? 'Paid' : 'Unpaid';
          } else {
            record[mappedKey] = value || '-';
          }
        }
      });

      // Calculate total amount if not provided
      if (record.totalAmount === 0 && record.quantity > 0 && record.unitPrice > 0) {
        record.totalAmount = record.quantity * record.unitPrice;
      }

      return record;
    });
  };

  const handleImport = () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a file to import.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvText = e.target?.result as string;
        const parsedData = parseCSV(csvText);
        
        if (parsedData.length === 0) {
          toast({
            title: "Error",
            description: "No valid data found in the file.",
            variant: "destructive",
          });
          return;
        }

        onImportData?.(parsedData);
        
        toast({
          title: "Import Successful",
          description: `${parsedData.length} records imported from "${selectedFile.name}". Missing columns are marked with "-".`,
        });
        
        onOpenChange(false);
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } catch (error) {
        toast({
          title: "Import Error",
          description: "Failed to parse the file. Please check the format.",
          variant: "destructive",
        });
      }
    };

    reader.readAsText(selectedFile);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="hidden sm:flex">
          <Upload className="w-4 h-4 mr-2" />
          Import
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">Import Sales Data</DialogTitle>
          <DialogDescription>
            Upload a CSV file to import sales data. Missing columns will be marked with "-".
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
            <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <div className="space-y-2">
              <p className="text-sm text-card-foreground">
                {selectedFile ? selectedFile.name : "Click to select a CSV file"}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                Select File
              </Button>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground">
            <p>Supported formats: CSV, Excel (.xlsx, .xls)</p>
            <p>Expected columns: Invoice Number, Customer Name, Product, Quantity, Unit Price, Total Amount, Date of Sale, Payment Status</p>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleImport} disabled={!selectedFile}>
              Import Data
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};