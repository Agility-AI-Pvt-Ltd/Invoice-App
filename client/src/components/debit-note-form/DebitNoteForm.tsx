import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/Checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";
import Cookies from "js-cookie";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API_BASE = "https://invoice-backend-604217703209.asia-south1.run.app";

interface DebitNoteFormProps {
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

interface FormData {
  debitNoteNumber: string;
  debitNoteDate: string;
  againstInvoiceNumber: string;
  againstInvoiceDate: string;
  reason: string;
  vendorName: string;
  businessName: string;
  address: string;
  contactNumber: string;
  isGstRegistered: boolean;
  gstNumber: string;
  items: Array<{
    serialNo: number;
    itemName: string;
    hsnCode: string;
    quantity: number;
    unitPrice: number;
    gstPercentage: number;
    taxableValue: number;
    grossTotal: number;
  }>;
  termsAndConditions: string;
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
  applyToNextInvoice: boolean;
  refund: boolean;
  uploadedDocument?: File;
  remark: string;
}

export default function DebitNoteForm({ onClose, onSuccess, initialData }: DebitNoteFormProps) {
  const [formData, setFormData] = useState<FormData>({
    debitNoteNumber: "",
    debitNoteDate: new Date().toISOString().split('T')[0],
    againstInvoiceNumber: "",
    againstInvoiceDate: "",
    reason: "",
    vendorName: "",
    businessName: "",
    address: "",
    contactNumber: "",
    isGstRegistered: true,
    gstNumber: "",
    items: [],
    termsAndConditions: "",
    subtotal: 0,
    cgst: 0,
    sgst: 0,
    igst: 0,
    total: 0,
    applyToNextInvoice: false,
    refund: false,
    remark: "",
  });

  const [loading, setLoading] = useState(false);
  const [vendors, setVendors] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [purchaseInvoices, setPurchaseInvoices] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any
  const { toast } = useToast();

  // Fetch vendors and purchase invoices on component mount
  useEffect(() => {
    fetchVendors();
    fetchPurchaseInvoices();
  }, []);

  // Populate form with initial data if provided
  useEffect(() => {
    if (initialData) {
      console.log("DebitNoteForm initialData:", initialData); // Debug log
      setFormData({
        debitNoteNumber: initialData.debitNoteNumber || initialData.noteNo || initialData.debitNoteId || "",
        debitNoteDate: initialData.debitNoteDate || initialData.dateIssued || initialData.date || new Date().toISOString().split('T')[0],
        againstInvoiceNumber: initialData.againstInvoiceNumber || initialData.invoiceNo || initialData.againstInvoice || "",
        againstInvoiceDate: initialData.againstInvoiceDate || initialData.invoiceDate || "",
        reason: initialData.reason || initialData.noteReason || "",
        vendorName: initialData.vendorName || initialData.supplierName || initialData.businessName || "",
        businessName: initialData.businessName || initialData.companyName || "",
        address: initialData.address || initialData.vendorAddress || "",
        contactNumber: initialData.contactNumber || initialData.phone || initialData.mobile || "",
        isGstRegistered: initialData.isGstRegistered !== undefined ? initialData.isGstRegistered : true,
        gstNumber: initialData.gstNumber || initialData.gstin || "",
        items: initialData.items || initialData.itemDetails || [],
        termsAndConditions: initialData.termsAndConditions || initialData.terms || "",
        subtotal: initialData.subtotal || initialData.amount || 0,
        cgst: initialData.cgst || 0,
        sgst: initialData.sgst || 0,
        igst: initialData.igst || 0,
        total: initialData.total || initialData.amount || 0,
        applyToNextInvoice: initialData.applyToNextInvoice || false,
        refund: initialData.refund || false,
        remark: initialData.remark || initialData.notes || "",
      });
    }
  }, [initialData]);

  const fetchVendors = async () => {
    try {
      const token = Cookies.get("authToken");
      const response = await fetch(`${API_BASE}/api/vendors`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (response.ok) {
        const data = await response.json();
        setVendors(Array.isArray(data) ? data : data.data || []);
      }
    } catch (error) {
      console.error("Error fetching vendors:", error);
    }
  };

  const fetchPurchaseInvoices = async () => {
    try {
      const token = Cookies.get("authToken");
      const response = await fetch(`${API_BASE}/api/purchase-invoices`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (response.ok) {
        const data = await response.json();
        setPurchaseInvoices(Array.isArray(data) ? data : data.data || []);
      }
    } catch (error) {
      console.error("Error fetching purchase invoices:", error);
    }
  };

  const handleInputChange = (field: keyof FormData, value: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleItemChange = (index: number, field: string, value: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };

    // Recalculate totals
    if (field === 'quantity' || field === 'unitPrice' || field === 'gstPercentage') {
      const item = updatedItems[index];
      const taxableValue = item.quantity * item.unitPrice;
      const gstAmount = (taxableValue * item.gstPercentage) / 100;
      const grossTotal = taxableValue + gstAmount;

      updatedItems[index] = {
        ...item,
        taxableValue,
        grossTotal
      };
    }

    setFormData(prev => ({
      ...prev,
      items: updatedItems
    }));

    calculateTotals(updatedItems);
  };

  const addItem = () => {
    const newItem = {
      serialNo: formData.items.length + 1,
      itemName: "",
      hsnCode: "",
      quantity: 1,
      unitPrice: 0,
      gstPercentage: 18,
      taxableValue: 0,
      grossTotal: 0,
    };

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const removeItem = (index: number) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    // Reorder serial numbers
    const reorderedItems = updatedItems.map((item, i) => ({
      ...item,
      serialNo: i + 1
    }));

    setFormData(prev => ({
      ...prev,
      items: reorderedItems
    }));

    calculateTotals(reorderedItems);
  };

  const calculateTotals = (items: FormData['items']) => {
    const subtotal = items.reduce((sum, item) => sum + item.taxableValue, 0);
    const totalGst = items.reduce((sum, item) => sum + (item.grossTotal - item.taxableValue), 0);
    
    // For simplicity, assuming CGST and SGST are equal (9% each for 18% GST)
    const cgst = totalGst / 2;
    const sgst = totalGst / 2;
    const igst = 0; // IGST is 0 for intra-state transactions
    const total = subtotal + totalGst;

    setFormData(prev => ({
      ...prev,
      subtotal,
      cgst,
      sgst,
      igst,
      total
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        uploadedDocument: file
      }));
    }
  };

  const handlePrint = () => {
    const doc = new jsPDF();
    
    // Add company header
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("DEBIT NOTE", 105, 20, { align: "center" });
    
    // Add debit note details
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Debit Note Number: ${formData.debitNoteNumber}`, 20, 40);
    doc.text(`Debit Note Date: ${formData.debitNoteDate}`, 20, 50);
    doc.text(`Against Invoice: ${formData.againstInvoiceNumber}`, 20, 60);
    doc.text(`Against Invoice Date: ${formData.againstInvoiceDate}`, 20, 70);
    doc.text(`Reason: ${formData.reason}`, 20, 80);
    
    // Add party information
    doc.setFont("helvetica", "bold");
    doc.text("Party Information", 20, 100);
    doc.setFont("helvetica", "normal");
    doc.text(`Vendor Name: ${formData.vendorName}`, 20, 110);
    doc.text(`Business Name: ${formData.businessName}`, 20, 120);
    doc.text(`Address: ${formData.address}`, 20, 130);
    doc.text(`Contact: ${formData.contactNumber}`, 20, 140);
    doc.text(`GST Number: ${formData.gstNumber}`, 20, 150);
    
    // Add items table
    if (formData.items.length > 0) {
      const tableData = formData.items.map(item => [
        item.serialNo,
        item.itemName,
        item.hsnCode,
        item.quantity,
        `₹${item.unitPrice.toFixed(2)}`,
        `${item.gstPercentage}%`,
        `₹${item.taxableValue.toFixed(2)}`,
        `₹${item.grossTotal.toFixed(2)}`
      ]);
      
      autoTable(doc, {
        startY: 170,
        head: [['S.No', 'Item Name', 'HSN Code', 'Qty', 'Unit Price', 'GST%', 'Taxable Value', 'Gross Total']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [101, 75, 205] },
        styles: { fontSize: 8 }
      });
    }
    
    // Add summary
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFont("helvetica", "bold");
    doc.text("Summary", 20, finalY);
    doc.setFont("helvetica", "normal");
    doc.text(`Subtotal: ₹${formData.subtotal.toFixed(2)}`, 120, finalY);
    doc.text(`CGST: ₹${formData.cgst.toFixed(2)}`, 120, finalY + 10);
    doc.text(`SGST: ₹${formData.sgst.toFixed(2)}`, 120, finalY + 20);
    doc.text(`IGST: ₹${formData.igst.toFixed(2)}`, 120, finalY + 30);
    doc.setFont("helvetica", "bold");
    doc.text(`Total: ₹${formData.total.toFixed(2)}`, 120, finalY + 40);
    
    // Add additional information
    doc.setFont("helvetica", "normal");
    doc.text(`Apply to Next Invoice: ${formData.applyToNextInvoice ? 'Yes' : 'No'}`, 20, finalY + 60);
    doc.text(`Refund: ${formData.refund ? 'Yes' : 'No'}`, 20, finalY + 70);
    doc.text(`Remark: ${formData.remark}`, 20, finalY + 80);
    
    // Add terms and conditions
    if (formData.termsAndConditions) {
      doc.setFont("helvetica", "bold");
      doc.text("Terms & Conditions", 20, finalY + 100);
      doc.setFont("helvetica", "normal");
      const splitTerms = doc.splitTextToSize(formData.termsAndConditions, 170);
      doc.text(splitTerms, 20, finalY + 110);
    }
    
    // Save the PDF
    const filename = `DebitNote_${formData.debitNoteNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
    
    toast({
      title: "Success",
      description: "Debit note PDF generated successfully!",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = Cookies.get("authToken");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const formDataToSend = new FormData();
      
      // Append all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'items') {
          formDataToSend.append(key, JSON.stringify(value));
        } else if (key === 'uploadedDocument' && value instanceof File) {
          formDataToSend.append(key, value);
        } else if (key !== 'uploadedDocument') {
          formDataToSend.append(key, String(value));
        }
      });

      // Determine if this is a create or update operation
      const isUpdate = initialData && initialData._id;
      const method = isUpdate ? 'PUT' : 'POST';
      const url = isUpdate ? `${API_BASE}/api/debit-notes/${initialData._id}` : `${API_BASE}/api/debit-notes`;

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      await response.json();
      toast({
        title: "Success",
        description: isUpdate ? "Debit note updated successfully!" : "Debit note created successfully!",
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving debit note:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save debit note",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Debit Note Details */}
      <div className="bg-white rounded-lg p-6">
        <div className="flex items-center justify-between mb-8 bg-[#e8e5f5] w-full rounded-[8px] py-3 px-4">
          <h3 className="text-lg font-semibold text-gray-900">Debit Note Details</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Debit Note Number
            </label>
            <Input
              placeholder="XXXXX"
              value={formData.debitNoteNumber}
              onChange={(e) => handleInputChange('debitNoteNumber', e.target.value)}
              required
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Debit Note Date
            </label>
            <Input
              type="date"
              value={formData.debitNoteDate}
              onChange={(e) => handleInputChange('debitNoteDate', e.target.value)}
              required
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Against Invoice Number
            </label>
            <div className="relative">
              <Select
                value={formData.againstInvoiceNumber}
                onValueChange={(value) => handleInputChange('againstInvoiceNumber', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="INXXXXX (Searchable from purchase invoice)" />
                </SelectTrigger>
                <SelectContent>
                  {purchaseInvoices.map((invoice) => (
                    <SelectItem key={invoice._id} value={invoice.invoiceNumber}>
                      {invoice.invoiceNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Against Invoice Date
            </label>
            <Input
              type="date"
              value={formData.againstInvoiceDate}
              onChange={(e) => handleInputChange('againstInvoiceDate', e.target.value)}
              required
              className="w-full"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason
            </label>
            <div className="relative">
              <Input
                placeholder="Return/Overcharged/Discount/ Others"
                value={formData.reason}
                onChange={(e) => handleInputChange('reason', e.target.value)}
                required
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Party Information */}
      <div className="bg-white rounded-lg p-6">
        <div className="flex items-center justify-between mb-6 bg-[#e8e5f5] w-full rounded-[8px] py-3 px-4">
          <h3 className="text-lg font-semibold text-gray-900">Party Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vendor Name
            </label>
            <div className="relative">
              <Select
                value={formData.vendorName}
                onValueChange={(value) => handleInputChange('vendorName', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Name (Searchable from vendor list)" />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor._id} value={vendor.name}>
                      {vendor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Name
            </label>
            <Input
              placeholder="Name"
              value={formData.businessName}
              onChange={(e) => handleInputChange('businessName', e.target.value)}
              required
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <Input
              type="text"
              placeholder="Address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              required
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Number
            </label>
            <Input
              placeholder="XXXXX"
              value={formData.contactNumber}
              onChange={(e) => handleInputChange('contactNumber', e.target.value)}
              required
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              If GST is registered?
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="gstRegistered"
                  checked={formData.isGstRegistered}
                  onChange={() => handleInputChange('isGstRegistered', true)}
                  className="text-purple-600"
                />
                <span>Yes</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="gstRegistered"
                  checked={!formData.isGstRegistered}
                  onChange={() => handleInputChange('isGstRegistered', false)}
                  className="text-purple-600"
                />
                <span>No</span>
              </label>
            </div>
          </div>
          {formData.isGstRegistered && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GST Number
              </label>
              <Input
                placeholder="XXXXX"
                value={formData.gstNumber}
                onChange={(e) => handleInputChange('gstNumber', e.target.value)}
                required
                className="w-full"
              />
            </div>
          )}
        </div>
      </div>

      {/* Items Details */}
      <div className="bg-white rounded-lg p-6">
        <div className="flex items-center justify-between mb-8 bg-[#e8e5f5] w-full rounded-[8px] py-3 px-4">
          <h3 className="text-lg font-semibold text-gray-900">Item Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">Serial No.</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">Item Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">HSN Code</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">Qty</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">Unit Price</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">GST%</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">Taxable Value</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">Gross Total</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">Action</th>
              </tr>
            </thead>
            <tbody>
              {formData.items.map((item, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="px-4 py-3">
                    <Input
                      value={item.serialNo}
                      onChange={(e) => handleItemChange(index, 'serialNo', parseInt(e.target.value))}
                      className="w-16"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      value={item.itemName}
                      onChange={(e) => handleItemChange(index, 'itemName', e.target.value)}
                      placeholder="Item name"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      value={item.hsnCode}
                      onChange={(e) => handleItemChange(index, 'hsnCode', e.target.value)}
                      placeholder="HSN code"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                      className="w-20"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value))}
                      className="w-24"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      type="number"
                      value={item.gstPercentage}
                      onChange={(e) => handleItemChange(index, 'gstPercentage', parseFloat(e.target.value))}
                      className="w-20"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm">₹{item.taxableValue.toFixed(2)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm">₹{item.grossTotal.toFixed(2)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex gap-2">
          <Button type="button" onClick={addItem} className="text-white bg-gradient-to-b from-[#B5A3FF] via-[#785FDA] to-[#9F91D8] cursor-pointer">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
          <Button type="button" variant="outline" className="text-white bg-gradient-to-b from-[#B5A3FF] via-[#785FDA] to-[#9F91D8] cursor-pointer">
            <Plus className="h-4 w-4 mr-2" />
            Add from Inventory
          </Button>
        </div>
      </div>

      {/* Terms & Conditions and Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Terms & Conditions</h3>
          <Textarea
            placeholder="Enter Terms & Conditions"
            value={formData.termsAndConditions}
            onChange={(e) => handleInputChange('termsAndConditions', e.target.value)}
            className="h-32 w-full"
          />
        </div>
        <div className="bg-purple-50 rounded-lg border border-purple-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Subtotal :</span>
              <span className="text-sm font-medium">₹{formData.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">CGST :</span>
              <span className="text-sm font-medium">₹{formData.cgst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">SGST :</span>
              <span className="text-sm font-medium">₹{formData.sgst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">IGST :</span>
              <span className="text-sm font-medium">₹{formData.igst.toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-200 pt-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Total :</span>
                <span className="text-sm font-bold">₹{formData.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="bg-white rounded-lg p-6">
        <div className="flex items-center justify-between mb-8 bg-[#e8e5f5] w-full rounded-[8px] py-3 px-4">
          <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={formData.applyToNextInvoice}
                onCheckedChange={(checked) => handleInputChange('applyToNextInvoice', checked)}
              />
              <span className="text-sm">Apply to Next Invoice</span>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={formData.refund}
                onCheckedChange={(checked) => handleInputChange('refund', checked)}
              />
              <span className="text-sm">Refund</span>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Document
              </label>
              <div className="flex items-center space-x-2">
                <Input
                  type="text"
                  placeholder="Upload field - PDF, JPG, PNG"
                  className="flex-1"
                  readOnly
                />
                <Button type="button" className="bg-white border-2 border-slate-200 text-black hover:bg-white cursor-pointer hover:text-black" onClick={() => document.getElementById('file-upload')?.click()}>
                  Choose File
                </Button>
              </div>
              <input
                id="file-upload"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Remark
              </label>
              <Textarea
                placeholder="Remark"
                value={formData.remark}
                onChange={(e) => handleInputChange('remark', e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="flex justify-between pt-6">
        <Button type="button" onClick={onClose} className="bg-white text-[#654BCD] hover:text-white hover:bg-gradient-to-b hover:from-[#B5A3FF] via-[#785FDA] hover:to-[#9F91D8] cursor-pointer">
          Back
        </Button>
        <div className="flex gap-2">
          <Button type="submit" disabled={loading} className="border-2 border-[#654BCD] text-[#654BCD] bg-white hover:bg-white cursor-pointer">
            Save as Draft
          </Button>
          <Button type="button" onClick={handlePrint} className="border-2 border-[#654BCD] text-[#654BCD] bg-white hover:bg-white cursor-pointer">
            Print
          </Button>
          <Button type="submit" disabled={loading} className="text-white bg-gradient-to-b from-[#B5A3FF] via-[#785FDA] to-[#9F91D8] cursor-pointer">
            Issue Note
          </Button>
        </div>
      </div>
    </form>
  );
}
