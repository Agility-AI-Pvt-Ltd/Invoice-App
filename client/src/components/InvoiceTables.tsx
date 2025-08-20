import { useState, useEffect } from "react";
import { invoicesAPI } from "@/services/api/dashboard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Trash,
  MoreVertical,
  Edit,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  ScanLine,
  Filter,
  DownloadCloud,
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { CameraScanner } from "./CameraScanner";
import Cookies from "js-cookie";
import { getSalesData, type SalesRecord } from "@/services/api/sales";
import autoTable from "jspdf-autotable";
import jsPDF from "jspdf";

interface InvoiceTableProps {
  selectedDate: Date;
  setIsInvoiceFormOpen: (val: boolean) => void;
  refreshFlag?: number;
}

export function InvoiceTable({ selectedDate, setIsInvoiceFormOpen, refreshFlag = 0 }: InvoiceTableProps) {
  const [invoices, setInvoices] = useState<SalesRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeStatusFilter, setActiveStatusFilter] = useState<"all" | "pending" | "paid" | "overdue">("all");

  // Camera scanner states
  const [isCameraScannerOpen, setIsCameraScannerOpen] = useState(false);
  const [isProcessingScannedImage, setIsProcessingScannedImage] = useState(false);

  const itemsPerPage = 10;

  const fetchInvoices = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getSalesData()
      setInvoices(res);
    } catch (err: any) {
      setError(err.message || "Failed to fetch invoices");
    } finally {
      setLoading(false);
    }
  };

  const handleScanInvoice = () => {
    setIsCameraScannerOpen(true);
  };

  const handleImageCapture = async (imageFile: File) => {
    console.log("Image captured:", imageFile.name, imageFile.size);
    setIsProcessingScannedImage(true);
    setIsCameraScannerOpen(false); // Close the scanner

    try {
      // Create FormData to send the image file
      const formData = new FormData();
      formData.append('file', imageFile); // Note: parameter name is 'file' not 'image'

      // Get auth token (adjust this based on how you store auth tokens)
      const authToken = Cookies.get('authToken');

      if (!authToken) {
        throw new Error('Authentication token not found. Please login again.');
      }

      // Call your scan invoice API
      const response = await fetch('https://invoice-backend-604217703209.asia-south1.run.app/api/scan-invoice', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          // Don't set Content-Type for FormData, let browser set it automatically
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // Success notification
        alert(`${result.message}\nInvoice ID: ${result.invoiceId}\nType: ${result.invoiceType}`);

        // Refresh the invoice list to show the new invoice
        fetchInvoices();
      } else {
        throw new Error('Failed to process invoice');
      }

    } catch (err: any) {
      console.error('Error processing scanned invoice:', err);
      alert(err.message || 'Failed to process the scanned invoice. Please try again.');
    } finally {
      setIsProcessingScannedImage(false);
    }
  };


  useEffect(() => {
    fetchInvoices();
    // 👇 whenever refreshFlag changes -> re-fetch
  }, [selectedDate, currentPage, activeStatusFilter, refreshFlag]);

  const totalPages = Math.ceil(invoices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentInvoices = Array.isArray(invoices) ? invoices.slice(startIndex, endIndex) : [];

  const goToPage = (page: number) => setCurrentPage(Math.max(1, Math.min(page, totalPages)));

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-50 text-green-600 border-green-200">Paid</Badge>;
      case "pending":
        return <Badge className="bg-yellow-50 text-yellow-600 border-yellow-200">Due in 5 days</Badge>;
      case "overdue":
        return <Badge className="bg-red-50 text-red-600 border-red-200">Waiting for Funds</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const downloadCSV = (data: SalesRecord[], filename: string) => {
    const csvRows = [
      [
        "Invoice Number",
        "Customer Name",
        "Product",
        "Quantity",
        "Unit Price",
        "Total Amount",
        "Date of Sale",
        "Payment Status",
      ],
      ...data.map((sale) => [
        sale.invoiceNumber,
        sale.customerName,
        sale.product,
        sale.quantity,
        sale.unitPrice,
        sale.totalAmount,
        sale.dateOfSale,
        sale.paymentStatus,
      ]),
    ];

    const csvContent = csvRows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const handleDelete = async (invoiceId: string) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return;
    try {
      await invoicesAPI.delete(invoiceId);
      setInvoices(prev => prev.filter(inv => inv.id !== invoiceId));
    } catch (err: any) {
      alert(err.message || "Failed to delete invoice");
    }
  };

  // const handleDownload = async (invoiceId: string, invoiceNumber: string) => {
  //   try {
  //     const blob = await invoicesAPI.download(invoiceId);
  //     const url = URL.createObjectURL(blob);
  //     const link = document.createElement("a");
  //     link.href = url;
  //     link.setAttribute("download", `${invoiceNumber}.pdf`);
  //     document.body.appendChild(link);
  //     link.click();
  //     document.body.removeChild(link);
  //   } catch (err: any) {
  //     alert(err.message || "Failed to download invoice");
  //   }
  // };

  const handleDownload = (invoice: SalesRecord) => {
    try {
      const doc = new jsPDF();

      // Title
      doc.setFontSize(16);
      doc.text("Invoice", 14, 20);

      // Invoice details
      doc.setFontSize(12);
      doc.text(`Invoice Number: ${invoice.invoiceNumber}`, 14, 35);
      doc.text(`Customer: ${invoice.customerName}`, 14, 45);
      doc.text(`Date of Sale: ${invoice.dateOfSale}`, 14, 55);
      doc.text(`Status: ${invoice.paymentStatus}`, 14, 65);

      // Product Table
      autoTable(doc, {
        startY: 80,
        head: [["Product", "Quantity", "Unit Price", "Total"]],
        body: [
          [
            invoice.product,
            invoice.quantity,
            `₹${invoice.unitPrice}`,
            `₹${invoice.totalAmount}`,
          ],
        ],
      });

      // Footer / total
      doc.setFontSize(12);
      //@ts-ignore
      doc.text(`Total Amount: ₹${invoice.totalAmount}`, 14, doc.lastAutoTable.finalY + 20);

      // Save the file
      doc.save(`${invoice.invoiceNumber}.pdf`);
    } catch (err: any) {
      alert(err.message || "Failed to generate invoice PDF");
    }
  };


  if (loading) return <Card className="p-6">Loading invoices...</Card>;
  if (error) return <Card className="p-6 text-red-500">Error: {error}</Card>;

  const filterButtons: { label: string; value: "all" | "pending" | "paid" | "overdue" }[] = [
    { label: "All", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Paid", value: "paid" },
    { label: "Overdue", value: "overdue" },
  ];

  return (
    <>
      <Card className="p-6 bg-white">
        <div className="space-y-8">
          {/* Header with Filters and Actions */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h3 className="text-lg font-semibold text-foreground">
              All Invoices - {format(selectedDate, "MMM yyyy")}
            </h3>

            <div className="flex items-center flex-wrap gap-2">
              {filterButtons.map(btn => (
                <Button
                  key={btn.value}
                  variant={activeStatusFilter === btn.value ? "default" : "ghost"}
                  size="sm"
                  onClick={() => {
                    setActiveStatusFilter(btn.value);
                    setCurrentPage(1);
                  }}
                >
                  {btn.label}
                </Button>
              ))}

              <Button size="sm" variant="ghost" onClick={() => setIsInvoiceFormOpen(true)}>
                <PlusCircle className="h-4 w-4 mr-2" /> New Invoice
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleScanInvoice}
                disabled={isProcessingScannedImage}
              >
                <ScanLine className="h-4 w-4 mr-2" />
                {isProcessingScannedImage ? "Processing..." : "Scan Invoice"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  const filename = `invoices-${activeStatusFilter}-${format(selectedDate, "MMM-yyyy")}.csv`;
                  downloadCSV(invoices, filename);
                }}
              >
                <DownloadCloud className="h-4 w-4 mr-2" /> Export CSV
              </Button>
              <Button size="sm" variant="ghost">
                <Filter className="h-4 w-4 mr-2" /> Filter
              </Button>
            </div>
          </div>

          {/* Processing Banner */}
          {isProcessingScannedImage && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                <p className="text-blue-800">Processing scanned invoice...</p>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Invoice Number</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Customer Name</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Product</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Quantity</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Unit Price</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Total Amount</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Date of Sale</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Payment Status</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>

              <tbody>
                {currentInvoices && currentInvoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-border hover:bg-muted/20">
                    <td className="py-3 px-2 text-sm text-foreground">{invoice.invoiceNumber}</td>
                    <td className="py-3 px-2">{invoice.customerName}</td>
                    <td className="py-3 px-2">{invoice.product}</td>
                    <td className="py-3 px-2">{invoice.quantity}</td>
                    <td className="py-3 px-2">₹{invoice.unitPrice}</td>
                    <td className="py-3 px-2">₹{invoice.totalAmount}</td>
                    <td className="py-3 px-2">{invoice.dateOfSale}</td>
                    <td className="py-3 px-2">{getStatusBadge(invoice.paymentStatus)}</td>
                    <td className="py-3 px-2 flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-gray-900 text-white" align="end">
                          <DropdownMenuItem onClick={() => handleDownload(invoice)}>
                            <Download className="mr-2 h-4 w-4" /> Download
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-500" onClick={() => handleDelete(invoice.id)}>
                            <Trash className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>

                ))}
                {currentInvoices && currentInvoices.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-4 text-center text-muted-foreground">
                      No invoices found for selected filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-muted-foreground">
              Showing {startIndex + 1}-{Math.min(endIndex, invoices.length)} of {invoices.length} results
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => goToPage(page)}
                    className="w-8 h-8 p-0"
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Camera Scanner Modal */}
      <CameraScanner
        isOpen={isCameraScannerOpen}
        onClose={() => setIsCameraScannerOpen(false)}
        onImageCapture={handleImageCapture}
      />
    </>
  );
}