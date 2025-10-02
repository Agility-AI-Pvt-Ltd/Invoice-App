import { useState, useEffect, useCallback, useRef } from "react";
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
import { Plus, Trash2, Search, Loader2 } from "lucide-react";
import Cookies from "js-cookie";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useProfile } from "@/contexts/ProfileContext";
import { searchCustomers, searchInventory } from "@/services/api/lookup";
import { getApiBaseUrl } from "@/lib/api-config";
import { useFormPersistence } from "@/hooks/useFormPersistence";

const API_BASE = getApiBaseUrl();

interface CreditNoteFormProps {
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

interface FormData {
  creditNoteNumber: string;
  creditNoteDate: string;
  againstInvoiceNumber: string;
  againstInvoiceDate: string;
  reason: string;
  customerName: string;
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

export default function CreditNoteForm({ onClose, onSuccess, initialData }: CreditNoteFormProps) {
  // Generate unique form ID for draft persistence
  const formId = `credit-note-form-${initialData?.id ? `edit-${initialData.id}` : 'new'}`;

  // Default form data structure
  const defaultFormData: FormData = {
    creditNoteNumber: "",
    creditNoteDate: new Date().toISOString().split('T')[0],
    againstInvoiceNumber: "",
    againstInvoiceDate: "",
    reason: "",
    customerName: "",
    businessName: "",
    address: "",
    contactNumber: "",
    isGstRegistered: true,
    gstNumber: "",
    items: [{
      serialNo: 1,
      itemName: "",
      hsnCode: "",
      quantity: 1,
      unitPrice: 0,
      gstPercentage: 18,
      taxableValue: 0,
      grossTotal: 0,
    }],
    termsAndConditions: "",
    subtotal: 0,
    cgst: 0,
    sgst: 0,
    igst: 0,
    total: 0,
    applyToNextInvoice: false,
    refund: false,
    remark: "",
  };

  // 🔹 Use form persistence hook for draft functionality
  const {
    formData,
    setFormData,
    hasSavedState,
    clearSavedState
  } = useFormPersistence({
    formId,
    initialData: defaultFormData,
    autoSave: true,
    autoSaveDelay: 1000,
    onRestore: (restoredData) => {
      console.log('📂 Credit note form draft restored:', restoredData);
    }
  });

  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any
  const { toast } = useToast();
  const { loading: profileLoading } = useProfile();

  // Handle cancel with draft cleanup
  const handleClose = () => {
    clearSavedState(); // Clear the draft when user cancels
    onClose();
  };

  // Handle success with draft cleanup
  const handleSuccess = () => {
    clearSavedState(); // Clear the draft when form is successfully saved
    onSuccess();
  };

  // Customer search state
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [customerSuggestions, setCustomerSuggestions] = useState<any[]>([]);
  const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);
  const customerSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Product search state
  const [productSearchTerms, setProductSearchTerms] = useState<{ [key: number]: string }>({});
  const [productSuggestions, setProductSuggestions] = useState<{ [key: number]: any[] }>({});
  const [isSearchingProduct, setIsSearchingProduct] = useState<{ [key: number]: boolean }>({});
  const [showProductSuggestions, setShowProductSuggestions] = useState<{ [key: number]: boolean }>({});
  const productSearchTimeoutRefs = useRef<{ [key: number]: NodeJS.Timeout | null }>({});

  // Enhanced customer search with debouncing
  const performCustomerSearch = useCallback(async (searchTerm: string) => {
    if (!searchTerm || searchTerm.trim().length < 2) {
      setCustomerSuggestions([]);
      return;
    }

    setIsSearchingCustomer(true);
    try {
      const customers = await searchCustomers(searchTerm);
      setCustomerSuggestions(customers);
    } catch (error) {
      console.error("Customer search error:", error);
      setCustomerSuggestions([]);
    } finally {
      setIsSearchingCustomer(false);
    }
  }, []);

  // Debounced search effect
  useEffect(() => {
    if (customerSearchTimeoutRef.current) {
      clearTimeout(customerSearchTimeoutRef.current);
    }

    if (customerSearchTerm.trim().length >= 2) {
      customerSearchTimeoutRef.current = setTimeout(() => {
        performCustomerSearch(customerSearchTerm);
      }, 300); // 300ms debounce
    } else {
      setCustomerSuggestions([]);
    }

    return () => {
      if (customerSearchTimeoutRef.current) {
        clearTimeout(customerSearchTimeoutRef.current);
      }
    };
  }, [customerSearchTerm, performCustomerSearch]);

  // Enhanced product search with debouncing
  const performProductSearch = useCallback(async (searchTerm: string, rowIndex: number) => {
    if (!searchTerm || searchTerm.trim().length < 2) {
      setProductSuggestions(prev => ({ ...prev, [rowIndex]: [] }));
      return;
    }

    setIsSearchingProduct(prev => ({ ...prev, [rowIndex]: true }));
    try {
      const products = await searchInventory(searchTerm);
      setProductSuggestions(prev => ({ ...prev, [rowIndex]: products }));
    } catch (error) {
      console.error("Product search error:", error);
      setProductSuggestions(prev => ({ ...prev, [rowIndex]: [] }));
    } finally {
      setIsSearchingProduct(prev => ({ ...prev, [rowIndex]: false }));
    }
  }, []);

  // Debounced search effect for each row
  useEffect(() => {
    Object.entries(productSearchTerms).forEach(([rowIndexStr, searchTerm]) => {
      const rowIndex = parseInt(rowIndexStr);
      
      if (productSearchTimeoutRefs.current[rowIndex]) {
        clearTimeout(productSearchTimeoutRefs.current[rowIndex]);
      }

      if (searchTerm.trim().length >= 2) {
        productSearchTimeoutRefs.current[rowIndex] = setTimeout(() => {
          performProductSearch(searchTerm, rowIndex);
        }, 300); // 300ms debounce
      } else {
        setProductSuggestions(prev => ({ ...prev, [rowIndex]: [] }));
      }
    });

    return () => {
      Object.values(productSearchTimeoutRefs.current).forEach(timeout => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, [productSearchTerms, performProductSearch]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.customer-search-container')) {
        setShowCustomerSuggestions(false);
      }
      if (!target.closest('.product-search-container')) {
        setShowProductSuggestions({});
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch invoices on component mount
  useEffect(() => {
    fetchInvoices();
  }, []);

  // Populate form with initial data if provided
  useEffect(() => {
    if (initialData) {

      setFormData({
        creditNoteNumber: initialData.creditNoteNumber || initialData.noteNo || initialData.creditNoteId || "",
        creditNoteDate: initialData.creditNoteDate || initialData.dateIssued || initialData.date || new Date().toISOString().split('T')[0],
        againstInvoiceNumber: initialData.againstInvoiceNumber || initialData.invoiceNo || initialData.againstInvoice || "",
        againstInvoiceDate: initialData.againstInvoiceDate || initialData.invoiceDate || "",
        reason: initialData.reason || initialData.noteReason || "",
        customerName: initialData.customerName || initialData.businessName || initialData.clientName || "",
        businessName: initialData.businessName || initialData.companyName || "",
        address: initialData.address || initialData.customerAddress || "",
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

  // Handle customer selection and autofill
  const handleCustomerSelect = (customer: any) => {
    setFormData(prev => ({
      ...prev,
      customerName: customer.fullName || customer.name || "",
      businessName: customer.companyName || "",
      address: customer.billingAddress || customer.address || "",
      contactNumber: customer.phone || "",
      gstNumber: customer.gstNumber || customer.gst || "",
      isGstRegistered: customer.gstRegistered === "Yes" || customer.isGstRegistered || true,
    }));

    // Clear search and suggestions
    setCustomerSearchTerm(customer.fullName || customer.name || "");
    setCustomerSuggestions([]);
    setShowCustomerSuggestions(false);
  };

  // Handle customer name input change
  const handleCustomerNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomerSearchTerm(value);
    setFormData(prev => ({ ...prev, customerName: value }));
    
    // Show suggestions if there are any
    if (customerSuggestions.length > 0) {
      setShowCustomerSuggestions(true);
    }
  };

  // Handle product selection and autofill
  const handleProductSelect = (product: any, rowIndex: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, index) => 
        index === rowIndex 
          ? {
              ...item,
              itemName: product.name || product.description || "",
              hsnCode: product.hsn_code || product.hsn || "",
              unitPrice: product.unit_price || product.price || 0,
              gstPercentage: product.gst_rate || product.gst || 0,
            }
          : item
      )
    }));

    // Clear search and suggestions for this row
    setProductSearchTerms(prev => ({ ...prev, [rowIndex]: product.name || product.description || "" }));
    setProductSuggestions(prev => ({ ...prev, [rowIndex]: [] }));
    setShowProductSuggestions(prev => ({ ...prev, [rowIndex]: false }));
  };

  // Handle product HSN input change
  const handleProductHsnChange = (rowIndex: number, value: string) => {
    setProductSearchTerms(prev => ({ ...prev, [rowIndex]: value }));
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, index) => 
        index === rowIndex ? { ...item, hsnCode: value } : item
      )
    }));
    
    // Show suggestions if there are any
    if (productSuggestions[rowIndex] && productSuggestions[rowIndex].length > 0) {
      setShowProductSuggestions(prev => ({ ...prev, [rowIndex]: true }));
    }
  };



  const fetchInvoices = async () => {
    try {
      const token = Cookies.get("authToken");
      const response = await fetch(`${API_BASE}/api/invoices`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (response.ok) {
        const data = await response.json();
        setInvoices(Array.isArray(data) ? data : data.data || []);
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
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
    doc.text("CREDIT NOTE", 105, 20, { align: "center" });
    
    // Add credit note details
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Credit Note Number: ${formData.creditNoteNumber}`, 20, 40);
    doc.text(`Credit Note Date: ${formData.creditNoteDate}`, 20, 50);
    doc.text(`Against Invoice: ${formData.againstInvoiceNumber}`, 20, 60);
    doc.text(`Against Invoice Date: ${formData.againstInvoiceDate}`, 20, 70);
    doc.text(`Reason: ${formData.reason}`, 20, 80);
    
    // Add party information
    doc.setFont("helvetica", "bold");
    doc.text("Party Information", 20, 100);
    doc.setFont("helvetica", "normal");
    doc.text(`Customer Name: ${formData.customerName}`, 20, 110);
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
    const filename = `CreditNote_${formData.creditNoteNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
    
    toast({
      title: "Success",
      description: "Credit note PDF generated successfully!",
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
      const url = isUpdate ? `${API_BASE}/api/credit-notes/${initialData._id}` : `${API_BASE}/api/credit-notes`;

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
        description: isUpdate ? "Credit note updated successfully!" : "Credit note created successfully!",
      });

      handleSuccess();
      handleClose();
    } catch (error) {
      console.error("Error saving credit note:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save credit note",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while profile is being fetched
  if (profileLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading form...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Draft indicator */}
      {hasSavedState && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-700">
            💾 Draft saved automatically. Your changes will be preserved if you navigate away.
          </p>
        </div>
      )}
      
      {/* Credit Note Details */}
      <div className="bg-white rounded-lg p-6">
        <div className="flex items-center justify-between mb-8 bg-[#e8e5f5] w-full rounded-[8px] py-2 px-4">
          <h3 className="text-lg font-semibold text-gray-900">Credit Note Details</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Credit Note Number
            </label>
            <Input
              placeholder="XXXXX"
              value={formData.creditNoteNumber}
              onChange={(e) => handleInputChange('creditNoteNumber', e.target.value)}
              required
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Credit Note Date
            </label>
            <Input
              type="date"
              value={formData.creditNoteDate}
              onChange={(e) => handleInputChange('creditNoteDate', e.target.value)}
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
                  <SelectValue placeholder="INXXXXX (Searchable from sales invoice)" />
                </SelectTrigger>
                <SelectContent>
                  {invoices.map((invoice) => (
                    <SelectItem key={invoice._id} value={invoice.invoiceNumber}>
                      {invoice.invoiceNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                placeholder="Return/ Overcharged/ Discount/ Others"
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
        <div className="flex items-center justify-between mb-6 bg-[#e8e5f5] w-full rounded-[8px] py-2 px-4">
          <h3 className="text-lg font-semibold text-gray-900">Party Information</h3>
          {/* <Button 
            type="button" 
            className="text-white bg-gradient-to-b from-[#B5A3FF] via-[#785FDA] to-[#9F91D8] cursor-pointer"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button> */}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative customer-search-container">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer Name
            </label>
            <div className="relative">
              <Input
                type="text"
                placeholder="Search customer..."
                value={customerSearchTerm}
                onChange={handleCustomerNameChange}
                className="pr-10"
              />
              {isSearchingCustomer && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
              )}
              {!isSearchingCustomer && customerSearchTerm && (
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              )}
            </div>
            
            {/* Customer Suggestions Dropdown */}
            {showCustomerSuggestions && customerSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                {customerSuggestions.map((customer) => (
                  <div
                    key={customer._id}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0"
                    onClick={() => handleCustomerSelect(customer)}
                  >
                    <div className="font-medium">{customer.fullName || customer.name}</div>
                    {customer.companyName && (
                      <div className="text-sm text-gray-600">{customer.companyName}</div>
                    )}
                    {customer.email && (
                      <div className="text-sm text-gray-500">{customer.email}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
            

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
                  <td className="px-4 py-3 relative product-search-container">
                    <Input
                      value={item.hsnCode}
                      onChange={(e) => handleProductHsnChange(index, e.target.value)}
                      placeholder="HSN code"
                      className="pr-10"
                    />
                    {isSearchingProduct[index] && (
                      <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
                    )}
                    {!isSearchingProduct[index] && productSearchTerms[index] && (
                      <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    )}
                    
                    {/* Product Suggestions Dropdown */}
                    {showProductSuggestions[index] && productSuggestions[index] && productSuggestions[index].length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                        {productSuggestions[index].map((product) => (
                          <div
                            key={product._id}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0"
                            onClick={() => handleProductSelect(product, index)}
                          >
                            <div className="font-medium">{product.name || product.description}</div>
                            <div className="text-sm text-gray-600">HSN: {product.hsn_code || product.hsn}</div>
                            <div className="text-sm text-gray-500">₹{product.unit_price || product.price}</div>
                          </div>
                        ))}
                      </div>
                    )}
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
          {/* <Button type="button" variant="outline" className="text-white bg-gradient-to-b from-[#B5A3FF] via-[#785FDA] to-[#9F91D8] cursor-pointer">
            <Plus className="h-4 w-4 mr-2" />
            Add from Inventory
          </Button> */}
        </div>
      </div>

      {/* Terms & Conditions and Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Terms & Conditions</h3>
          <Textarea
            placeholder="Enter Terms & Conditions"
            style={{"resize": "none"}}
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
                style={{"resize": "none"}}
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
        <Button type="button" onClick={handleClose} className="bg-white text-[#654BCD] hover:text-white hover:bg-gradient-to-b hover:from-[#B5A3FF] via-[#785FDA] hover:to-[#9F91D8] cursor-pointer">
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
