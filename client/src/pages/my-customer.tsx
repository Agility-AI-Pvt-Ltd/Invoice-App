// @ts-nocheck
import { useEffect, useRef, useState, useCallback } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Download, MoveLeft, MoveRight, Pencil, Trash2 } from "lucide-react";
import MultiStepForm from "./add-customer";

// 🔹 Added imports for dropdowns & menu (used for Filter and Export/Import)
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useLocation, useNavigate } from "react-router-dom";
import { SingleDatePicker } from "@/components/ui/SingleDatePicker";
import { Input } from "@/components/ui/Input";

const ITEMS_PER_PAGE = 10;

export default function CustomerDashboard() {
  const [page, setPage] = useState(1);
  const [customers, setCustomers] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddCustomerForm, setShowAddCustomerForm] = useState(false);

  const [editingCustomer, setEditingCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [allCustomers, setAllCustomers] = useState([]); // Store all customers when filtering


  // 🔹 Filter states
  const [statusFilter, setStatusFilter] = useState("__all");
  const [dateFilter, setDateFilter] = useState("__any");
  const [customDate, setCustomDate] = useState<Date | null>(null)
  const [balanceFilter, setBalanceFilter] = useState("__any")
  const [customBalance, setCustomBalance] = useState("")

  // file input ref for import
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const location = useLocation();
  const navigate = useNavigate();

  // ------------------ Fetch customers (extracted so we can call it from event handler) ------------------
  const fetchCustomers = useCallback(
    async (p = page) => {
      try {
        setLoading(true);
        setError(null);

        console.log("🚀 Starting to fetch customers for page:", p);

        const { getCustomers } = await import("@/services/api/customer");
        const response = await getCustomers(p, ITEMS_PER_PAGE);

        // Debug: Log the actual structure we're getting from backend
        console.log("🔍 Backend response structure:", response);
        console.log("🔍 Response data array:", response.data);
        console.log("🔍 First customer data:", response.data?.[0]);
        console.log("🔍 Number of customers:", response.data?.length || 0);

        if (!response.data || response.data.length === 0) {
          console.log("⚠️ No customers returned from API");
        }

        setCustomers(response.data || []);
        setTotalPages(response.pagination?.totalPages || 1);
      } catch (err) {
        console.error("❌ Failed to fetch customers:", err);
        setError(err.message || "Failed to fetch customers");
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ------------------ Fetch all customers for filtering ------------------
  const fetchAllCustomers = useCallback(
    async () => {
      try {
        const { getCustomers } = await import("@/services/api/customer");
        const response = await getCustomers(1, 1000); // Fetch large number to get all

        console.log("🔍 fetchAllCustomers response:", response);

        setAllCustomers(response.data || []);
        setPage(1); // Reset to first page
      } catch (err) {
        console.error("Failed to fetch all customers:", err);
      }
    },
    []
  );

  // Check if any filters are applied
  const hasActiveFilters = statusFilter !== "__all" || dateFilter !== "__any" || balanceFilter !== "__any";

  // Fetch all customers when filters are applied (only when filters change)
  useEffect(() => {
    if (hasActiveFilters) {
      fetchAllCustomers();
    }
  }, [statusFilter, dateFilter, balanceFilter, customDate, customBalance, hasActiveFilters, fetchAllCustomers]);

  // Fetch paginated customers when no filters and page changes
  useEffect(() => {
    if (!hasActiveFilters) {
      fetchCustomers(page);
    }
  }, [page, hasActiveFilters, fetchCustomers]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [statusFilter, dateFilter, balanceFilter, customDate, customBalance]);

  // Initial data fetch
  useEffect(() => {
    fetchCustomers(1);
  }, []);

  // If navigated here with state.openAddCustomerForm -> open the add-customer form and clear history state.
  useEffect(() => {
    try {
      const stateAny = (location && (location.state as { openAddCustomerForm?: boolean })) || {};
      if (stateAny && stateAny.openAddCustomerForm) {
        setShowAddCustomerForm(true);
        // Clear navigation state so it doesn't re-trigger on refresh/back
        navigate(location.pathname, { replace: true, state: {} });
      }
    } catch {
      // ignore
    }
    // run on mount only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen for "customer:added" and "customer:updated" events and refetch (non-invasive)
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      try {
        console.log("customer:added event received, refetching list", e?.detail);
        // If user is on page 1, optimistically show the new customer at top for instant feedback
        if (page === 1 && e?.detail) {
          setCustomers((prev) => {
            // avoid duplicate if already present by id (best-effort)
            try {
              const newId = e.detail?.id ?? e.detail?._id ?? null;
              if (newId && prev.some((c) => c.id === newId || c._id === newId)) {
                // already present, just return prev and trigger fetch
                fetchCustomers(page);
                return prev;
              }
            } catch {
              /* ignore id check errors */
            }
            // prepend created customer
            return [e.detail, ...prev];
          });
        }
        // always ensure we re-sync with server
        fetchCustomers(page);
      } catch (err) {
        console.error("Error handling customer:added event:", err);
      }
    };

    const updateHandler = (e: CustomEvent) => {
      try {
        console.log("customer:updated event received, refetching list", e?.detail);
        fetchCustomers(page);
      } catch (err) {
        console.error("Error handling customer:updated event:", err);
      }
    };

    window.addEventListener("customer:added", handler);
    window.addEventListener("customer:updated", updateHandler);
    return () => {
      window.removeEventListener("customer:added", handler);
      window.removeEventListener("customer:updated", updateHandler);
    };
  }, [page, fetchCustomers]);

  // ------------------ Export / Import Helpers ------------------
  const loadXLSX = async () => {
    try {
      const XLSX = await import("xlsx");
      return XLSX;
    } catch (err) {
      console.error("xlsx library is required for Excel import/export. Install with `npm i xlsx`", err);
      throw err;
    }
  };

  const loadJsPDF = async () => {
    try {
      // Import jsPDF first
      const jsPDFModule = await import("jspdf");
      const jsPDF = jsPDFModule.default || jsPDFModule.jsPDF || jsPDFModule;

      // Import autotable plugin - this extends jsPDF prototype
      await import("jspdf-autotable");

      // Return the jsPDF constructor (the plugin automatically extends it)
      return jsPDF;
    } catch (err) {
      console.error("jspdf or jspdf-autotable missing. Install with `npm i jspdf jspdf-autotable`", err);
      throw err;
    }
  };

  const handleDownloadCustomerPDF = async (customer: any) => {
    try {
      const jsPDF = await loadJsPDF();

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });

      // Debug: Log customer data structure
      console.log("🔍 Customer data for PDF:", customer);

      // Extract customer data with fallbacks
      const customerName = customer.customer?.name || customer.name || customer.fullName || "Unknown Customer";
      const companyName = customer.company?.name || customer.company || customer.companyName || "No Company";
      const companyEmail = customer.company?.email || customer.email || "No Email";
      const phone = customer.phone || "No Phone";
      const status = customer.status || "Unknown";
      const lastInvoice = customer.lastInvoice || customer.lastInvoiceDate || "No Invoices";
      const balance = customer.balance || customer.outstandingBalance || "0";
      const address = customer.address || customer.billingAddress || customer.billingAddressLine1 || "No Address";
      const city = customer.billingCity || customer.city || "";
      const state = customer.billingState || customer.state || "";
      const zip = customer.billingZip || customer.zip || customer.zipCode || customer.pincode || "";
      const gstNumber = customer.gstNumber || customer.gst || "";
      const panNumber = customer.panNumber || customer.pan || "";

      // Create professional header with gradient-like effect
      doc.setFillColor(41, 128, 185);
      doc.rect(0, 0, 595, 80, 'F');

      // Title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("CUSTOMER REPORT", 40, 35);

      // Subtitle
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("Detailed Customer Information", 40, 55);

      // Reset text color
      doc.setTextColor(0, 0, 0);

      // Company Information Section
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("COMPANY INFORMATION", 40, 120);

      // Company info box
      doc.setFillColor(248, 249, 250);
      doc.rect(40, 130, 515, 60, 'F');
      doc.setDrawColor(229, 231, 235);
      doc.rect(40, 130, 515, 60, 'S');

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Company Name: ${companyName}`, 50, 150);
      doc.text(`Email: ${companyEmail}`, 50, 170);

      // Customer Information Section
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("CUSTOMER DETAILS", 40, 220);

      // Customer info box
      doc.setFillColor(248, 249, 250);
      doc.rect(40, 230, 515, 100, 'F');
      doc.setDrawColor(229, 231, 235);
      doc.rect(40, 230, 515, 100, 'S');

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Customer Name: ${customerName}`, 50, 250);
      doc.text(`Phone Number: ${phone}`, 50, 270);
      doc.text(`Status: ${status}`, 50, 290);
      doc.text(`Address: ${address}`, 50, 310);

      // Additional Details Section
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("ADDITIONAL INFORMATION", 40, 360);

      // Additional info box
      doc.setFillColor(248, 249, 250);
      doc.rect(40, 370, 515, 80, 'F');
      doc.setDrawColor(229, 231, 235);
      doc.rect(40, 370, 515, 80, 'S');

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`City: ${city}`, 50, 390);
      doc.text(`State: ${state}`, 50, 410);
      doc.text(`ZIP Code: ${zip}`, 50, 430);

      // Financial Information Section
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("FINANCIAL INFORMATION", 40, 480);

      // Financial info table
      const financialData = [
        ["Last Invoice Date", lastInvoice],
        ["Outstanding Balance", `₹${balance}`],
        ["GST Number", gstNumber || "Not Available"],
        ["PAN Number", panNumber || "Not Available"]
      ];

      if (typeof doc.autoTable === 'function') {
        doc.autoTable({
          startY: 490,
          head: [["Field", "Value"]],
          body: financialData,
          theme: "grid",
          styles: {
            fontSize: 11,
            cellPadding: 8,
            halign: 'left'
          },
          headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
            fontStyle: "bold",
            halign: 'center'
          },
          alternateRowStyles: {
            fillColor: [248, 249, 250]
          },
          margin: { left: 40, right: 40 }
        });
      } else {
        // Fallback: add text manually
        let yPosition = 490;
        doc.setFontSize(11);
        financialData.forEach(([field, value]) => {
          doc.text(`${field}: ${value}`, 40, yPosition);
          yPosition += 20;
        });
      }

      // Footer
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 40, pageHeight - 30);
      doc.text("Invoice Management System", 40, pageHeight - 15);

      // Create filename with customer name and phone
      const safeCustomerName = customerName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
      const safePhone = phone.replace(/[^0-9]/g, '');
      const filename = `${safeCustomerName}_${safePhone}_report.pdf`;

      doc.save(filename);

    } catch (err) {
      console.error("Customer PDF download failed:", err);
      alert(`Could not generate PDF: ${err.message || 'Unknown error'}`);
    }
  };

  // const mapCustomersForExport = (arr) =>
  //   arr.map((c) => ({
  //     "Company Name": c.company?.name ?? "-",
  //     "Company Email": c.company?.email ?? "-",
  //     "Customer Name": c.customer?.name ?? "-",
  //     "Phone Number": c.phone ?? "-",
  //     "Status": c.status ?? "-",
  //     "Last Invoice Date": c.lastInvoice ?? "-",
  //     "Outstanding Balance": c.balance ?? "-",
  //   }));

  // const handleExportExcel = async () => {
  //   try {
  //     const XLSX = await loadXLSX();
  //     const ws = XLSX.utils.json_to_sheet(mapCustomersForExport(filteredCustomers));
  //     const wb = XLSX.utils.book_new();
  //     XLSX.utils.book_append_sheet(wb, ws, "Customers");
  //     XLSX.writeFile(wb, "customers.xlsx");
  //   } catch (err) {
  //     console.error("Excel export failed:", err);
  //     alert("Table is Empty");
  //   }
  // };

  // const handleExportCompanyWise = async () => {
  //   try {
  //     const XLSX = await loadXLSX();
  //     const byCompany: Record<string, any[]> = {};
  //     filteredCustomers.forEach((c) => {
  //       const name = (c.company?.name || "Unknown Company").toString();
  //       byCompany[name] = byCompany[name] || [];
  //       byCompany[name].push({
  //         "Customer Name": c.customer?.name ?? "-",
  //         "Phone Number": c.phone ?? "-",
  //         "Status": c.status ?? "-",
  //         "Last Invoice Date": c.lastInvoice ?? "-",
  //         "Outstanding Balance": c.balance ?? "-",
  //       });
  //     });

  //     const wb = XLSX.utils.book_new();
  //     Object.keys(byCompany).forEach((companyName) => {
  //       const ws = XLSX.utils.json_to_sheet(byCompany[companyName]);
  //       const safeName = companyName.substring(0, 30);
  //       XLSX.utils.book_append_sheet(wb, ws, safeName || "Company");
  //     });

  //     XLSX.writeFile(wb, "customers_by_company.xlsx");
  //   } catch (err) {
  //     console.error("Company-wise export failed:", err);
  //     alert("Table is Empty.");
  //   }
  // };

  // const handleExportPDF = async () => {
  //   try {
  //     const jsPDF = await loadJsPDF();

  //     const doc = new jsPDF({
  //       orientation: "landscape",
  //       unit: "pt",
  //       format: "a4",
  //     });

  //     const headers = [
  //       "Company Name",
  //       "Customer Name",
  //       "Phone Number",
  //       "Status",
  //       "Last Invoice Date",
  //       "Outstanding Balance",
  //     ];

  //     const body = filteredCustomers.map((c) => [
  //       c.company?.name ?? "-",
  //       c.customer?.name ?? "-",
  //       c.phone ?? "-",
  //       c.status ?? "-",
  //       c.lastInvoice ?? "-",
  //       c.balance ?? "-",
  //     ]);

  //     // Check if autoTable is available
  //     if (typeof doc.autoTable === 'function') {
  //       doc.autoTable({
  //         head: [headers],
  //         body,
  //         startY: 40,
  //         styles: { fontSize: 8 },
  //         headStyles: { fillColor: [230, 230, 230] },
  //       });
  //     } else {
  //       // Fallback: basic table layout
  //       let yPos = 40;
  //       doc.setFontSize(8);

  //       // Headers
  //       let xPos = 40;
  //       headers.forEach(header => {
  //         doc.text(header, xPos, yPos);
  //         xPos += 100;
  //       });

  //       yPos += 20;

  //       // Body rows
  //       body.forEach(row => {
  //         xPos = 40;
  //         row.forEach(cell => {
  //           doc.text(String(cell), xPos, yPos);
  //           xPos += 100;
  //         });
  //         yPos += 15;
  //       });
  //     }

  //     doc.save("customers.pdf");
  //   } catch (err) {
  //     console.error("PDF export failed:", err);
  //     alert(`PDF export failed: ${err.message || 'Unknown error'}`);
  //   }
  // };

  const getValueFromRow = (row, candidates = []) => {
    for (const key of Object.keys(row)) {
      const lk = key.toLowerCase().trim();
      for (const cand of candidates) {
        if (lk.includes(cand)) {
          return row[key];
        }
      }
    }
    return null;
  };

  const handleImportFile = async (file: File | null) => {
    if (!file) return;
    try {
      const XLSX = await loadXLSX();
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet, { defval: null });

      if (!Array.isArray(json) || json.length === 0) {
        alert("Imported file contains no rows.");
        return;
      }

      const mappedRows = json.map((row) => {
        const companyVal = getValueFromRow(row, ["company name", "company", "companyname"]) ?? getValueFromRow(row, ["company email"]) ?? null;
        const customerVal = getValueFromRow(row, ["customer name", "customer", "name", "client name"]);
        const phoneVal = getValueFromRow(row, ["phone", "phone number", "mobile", "contact"]);
        const statusVal = getValueFromRow(row, ["status", "state"]);
        const lastInvVal = getValueFromRow(row, ["last invoice date", "last invoice", "invoice date", "date"]);
        const balanceVal = getValueFromRow(row, ["outstanding balance", "balance", "amount", "due"]);

        return {
          company: {
            name: companyVal ?? "-",
            email: getValueFromRow(row, ["company email", "email"]) ?? "-",
          },
          customer: {
            name: customerVal ?? "-",
          },
          phone: phoneVal ?? "-",
          status: statusVal ?? "-",
          lastInvoice: lastInvVal ?? "-",
          balance: balanceVal ?? "-",
        };
      });

      setCustomers((prev) => [...mappedRows, ...prev]);

      alert(`Imported ${mappedRows.length} rows. Missing columns are filled with "-"`);
    } catch (err) {
      console.error("Import failed:", err);
      alert("Import failed..");
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Handle edit customer
  const handleEditCustomer = async (customer: any) => {
    try {
      // Fetch full customer details for editing
      const { getCustomerById } = await import("@/services/api/customer");
      console.log("🔍 Fetching customer details for ID:", customer.id || customer._id);
      const fullCustomerData = await getCustomerById(customer.id || customer._id);
      console.log("📥 Full customer data from getCustomerById API:", fullCustomerData);

      // Map the API response to form structure
      const mappedData = mapCustomerToFormData(fullCustomerData);

      setEditingCustomer(mappedData);
      setShowAddCustomerForm(true);
    } catch (err) {
      console.error("Failed to fetch customer details:", err);
      console.log("🔄 Using fallback data from customer list:", customer);
      // Fallback to basic data if API call fails
      const mappedData = mapCustomerToFormData(customer);
      setEditingCustomer(mappedData);
      setShowAddCustomerForm(true);
    }
  };

  // Map customer API response to form data structure
  const mapCustomerToFormData = (customer: any) => {
    console.log("🔍 Mapping customer for edit:", customer);
    console.log("🏠 Address fields in customer data:");
    console.log("  - address:", customer.address);
    console.log("  - billingAddress:", customer.billingAddress);
    console.log("  - billingAddressLine1:", customer.billingAddressLine1);
    console.log("  - billingAddressLine2:", customer.billingAddressLine2);
    console.log("  - billingCity:", customer.billingCity);
    console.log("  - billingState:", customer.billingState);
    console.log("  - billingZip:", customer.billingZip);
    console.log("  - billingCountry:", customer.billingCountry);

    const mappedData = {
      // Step 1 - Basic Information (handle both nested and flat structures)
      customerType: customer.customerType || "",
      name: customer.customer?.name || customer.name || customer.fullName || "",
      email: customer.company?.email || customer.email || "",
      phone: customer.phone || "",
      companyName: customer.company?.name || customer.company || customer.companyName || "",
      website: customer.website || "",

      // Step 2 - Address Details (handle both nested and flat structures)
      billingAddress: customer.address || customer.billingAddress || "",
      billingAddressLine1: customer.billingAddressLine1 || customer.billingAddress || customer.address || "",
      billingAddressLine2: customer.billingAddressLine2 || "",
      billingCity: customer.billingCity || customer.city || "",
      billingState: customer.billingState || customer.state || "",
      billingZip: customer.billingZip || customer.zip || customer.zipCode || customer.pincode || "",
      billingCountry: customer.billingCountry || customer.country || "India",
      shippingAddress: customer.shippingAddress || "",
      shippingAddressLine1: customer.shippingAddressLine1 || "",
      shippingAddressLine2: customer.shippingAddressLine2 || "",
      shippingCity: customer.shippingCity || "",
      shippingState: customer.shippingState || "",
      shippingZip: customer.shippingZip || "",
      shippingCountry: customer.shippingCountry || "India",

      // Step 3 - Tax and Other Details
      pan: customer.panNumber || customer.pan || "",
      gstRegistered: customer.gstRegistered || "",
      gstNumber: customer.gstNumber || "",
      supplyPlace: customer.supplyPlace || "",
      currency: customer.currency || "INR",
      paymentTerms: customer.paymentTerms || "",

      // Step 4 - Additional Info
      logo: null,
      notes: customer.notes || "",
      tags: customer.tags || "",

      // Keep original ID for updates
      id: customer.id || customer._id,
    };

    console.log("🔧 Mapped form data for editing:");
    console.log("  - billingAddress:", mappedData.billingAddress);
    console.log("  - billingAddressLine1:", mappedData.billingAddressLine1);
    console.log("  - billingCity:", mappedData.billingCity);
    console.log("  - billingState:", mappedData.billingState);

    return mappedData;
  };

  // Handle delete customer
  const handleDeleteCustomer = async (customerId: string | number) => {
    if (!confirm("Are you sure you want to delete this customer?")) {
      return;
    }

    try {
      const { deleteCustomer } = await import("@/services/api/customer");
      await deleteCustomer(Number(customerId));

      // Remove from local state immediately for better UX
      setCustomers((prev) => prev.filter((c) => c.id !== customerId && c._id !== customerId));

      alert("Customer deleted successfully!");

      // Refetch to ensure consistency
      fetchCustomers(page);
    } catch (err) {
      console.error("Failed to delete customer:", err);
      alert("Failed to delete customer. Please try again.");
    }
  };

  // const triggerFileSelect = () => {
  //   if (fileInputRef.current) fileInputRef.current.click();
  // };

  // ------------------ Apply filters (frontend)
  const applyFilters = (customerList) => {
    return customerList.filter((c) => {
      if (statusFilter && statusFilter !== "__all") {
        if (!c.status || c.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
      }

      if (dateFilter && dateFilter !== "__any") {
        if (!c.lastInvoice) return false;
        const today = new Date();
        const invoiceDate = new Date(c.lastInvoice);
        if (isNaN(invoiceDate.getTime())) return false;
        const daysDiff =
          (today.getTime() - invoiceDate.getTime()) / (1000 * 60 * 60 * 24);
        if (daysDiff > parseInt(dateFilter, 10)) return false;
      }

      if (balanceFilter && balanceFilter !== "__any") {
        const balance = parseFloat(c.balance || 0);
        if (balanceFilter === "low" && balance >= 10000) return false;
        if (balanceFilter === "medium" && (balance < 10000 || balance > 50000)) return false;
        if (balanceFilter === "high" && balance <= 50000) return false;
      }

      return true;
    });
  };

  // Get the appropriate customer list based on filtering state
  const customerList = hasActiveFilters ? allCustomers : customers;
  const allFilteredCustomers = applyFilters(customerList);

  // Calculate pagination for filtered results
  const totalFilteredPages = Math.ceil(allFilteredCustomers.length / ITEMS_PER_PAGE);
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const filteredCustomers = allFilteredCustomers.slice(startIndex, endIndex);

  // Use appropriate pagination based on filtering state
  const currentTotalPages = hasActiveFilters ? totalFilteredPages : totalPages;
  const currentTotalItems = hasActiveFilters ? allFilteredCustomers.length : (totalPages * ITEMS_PER_PAGE);
  const currentDisplayedItems = hasActiveFilters ? filteredCustomers : customers;

  // Debug logging
  console.log('Debug Info:', {
    hasActiveFilters,
    allCustomersLength: allCustomers.length,
    customersLength: customers.length,
    customerListLength: customerList.length,
    allFilteredCustomersLength: allFilteredCustomers.length,
    totalPages,
    totalFilteredPages,
    currentTotalPages,
    currentPage: page,
    startIndex,
    endIndex,
    filteredCustomersLength: filteredCustomers.length,
    currentDisplayedItemsLength: currentDisplayedItems.length
  });

  // Debug customer data structure
  if (currentDisplayedItems.length > 0) {
    console.log('Sample customer data:', currentDisplayedItems[0]);
    console.log('Available fields:', Object.keys(currentDisplayedItems[0]));
  }

  if (showAddCustomerForm) {
    return (
      <Card className="max-w-full p-4 sm:p-6 bg-white mx-2 sm:mx-4">
        <p className="font-semibold text-2xl ">
          {editingCustomer ? "Edit Customer" : "Add New Customer"}
        </p>
        <CardContent className="mt-2 ">
          <MultiStepForm
            onCancel={() => {
              setShowAddCustomerForm(false);
              setEditingCustomer(null);
            }}
            initialData={editingCustomer}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="bg-background min-h-screen p-2 sm:p-4 lg:p-8">
      <div className="max-w-8xl mx-auto space-y-4 sm:space-y-6">
        <Card className="bg-white">
          {/* Header */}
          <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">Customers List</h2>
                <p className="text-sm text-gray-500 mt-1">Total {hasActiveFilters ? allFilteredCustomers.length : (totalPages * ITEMS_PER_PAGE)} customers</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-blue-600 hover:text-blue-700 flex-1 sm:flex-none"
                    onClick={() => setShowAddCustomerForm(true)}
                  >
                    Add Customer
                  </Button>

                  {/* Filter Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                        Filter
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 p-4 space-y-3 bg-white text-black">
                      {/* Status */}
                      <div>
                        <p className="text-sm font-medium mb-1">Status</p>
                        <Select onValueChange={setStatusFilter} defaultValue="__all">
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__all">All</SelectItem>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Last Invoice Date */}
                      <div>
                        <p className="text-sm font-medium mb-1">Last Invoice Date</p>
                        <Select value={dateFilter} onValueChange={setDateFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select range">
                              {dateFilter === "custom" && customDate
                                ? customDate.toDateString()
                                : undefined}
                            </SelectValue>
                          </SelectTrigger>

                          <SelectContent>
                            <SelectItem value="__any">Any</SelectItem>
                            <SelectItem value="7">Last 7 days</SelectItem>
                            <SelectItem value="30">Last 30 days</SelectItem>
                            <SelectItem value="365">Last 1 year</SelectItem>

                            {/* Inline custom date picker */}
                            <div
                              className="p-2 border-t cursor-pointer"
                              onClick={() => setDateFilter("custom")}
                            >
                              <p className="text-sm mb-2">Custom Date</p>
                              {dateFilter === "custom" && (
                                <SingleDatePicker
                                  selectedDate={customDate ?? undefined}
                                  onDateChange={(date) => {
                                    setCustomDate(date)
                                    setDateFilter("custom")
                                  }}
                                />
                              )}
                            </div>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Outstanding Balance */}
                      <div>
                        <p className="text-sm font-medium mb-1">Outstanding Balance</p>

                        <Select value={balanceFilter} onValueChange={setBalanceFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select balance">
                              {balanceFilter === "custom" && customBalance
                                ? `₹${customBalance}`
                                : undefined}
                            </SelectValue>
                          </SelectTrigger>

                          <SelectContent>
                            <SelectItem value="__any">Any</SelectItem>
                            <SelectItem value="low">Less than 10k</SelectItem>
                            <SelectItem value="medium">10k - 50k</SelectItem>
                            <SelectItem value="high">More than 50k</SelectItem>

                            {/* Custom input field */}
                            <div
                              className="p-2 border-t space-y-2 cursor-pointer"
                              onClick={() => setBalanceFilter("custom")}
                            >
                              <p className="text-sm">Custom Amount</p>
                              {balanceFilter === "custom" && (
                                <Input
                                  type="number"
                                  placeholder="Enter balance"
                                  value={customBalance}
                                  onChange={(e) => setCustomBalance(e.target.value)}
                                />
                              )}
                            </div>
                          </SelectContent>
                        </Select>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* hidden file input for import */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  aria-label="Import customers from Excel or CSV file"
                  title="Import customers from Excel or CSV file"
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    handleImportFile(f);
                  }}
                />
              </div>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block w-full overflow-x-auto rounded-md border">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 min-w-[200px]">Company Name</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 min-w-[150px]">Customer Name</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 min-w-[120px]">Phone Number</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 min-w-[100px]">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 min-w-[120px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                        <p className="text-gray-500">Loading customers...</p>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <p className="text-red-500 mb-2">Error loading customers</p>
                        <p className="text-gray-500 text-sm">{error}</p>
                        <Button onClick={() => fetchCustomers()} className="mt-4" variant="outline">
                          Try Again
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : currentDisplayedItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <p className="text-gray-500 mb-2">No customers found</p>
                        <p className="text-gray-400 text-sm">Add your first customer to get started</p>
                      </div>
                    </td>
                  </tr>
                ) : currentDisplayedItems.map((c, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={c.company?.logo || c.logo} />
                          <AvatarFallback className="text-xs">
                            {(c.company?.name || c.company || "Company")?.[0] || "C"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900">{c.company?.name || c.company || "No Company"}</p>
                          <p className="text-sm text-gray-500">
                            {c.company?.email || c.email || "No Email"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={c.customer?.avatar || c.avatar} />
                          <AvatarFallback className="text-xs">
                            {(c.customer?.name || c.name || "User")?.[0] || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-gray-900">{c.customer?.name || c.name || "No Name"}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{c.phone}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${c.status?.toLowerCase() === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                          }`}
                      >
                        {c.status ? c.status.charAt(0).toUpperCase() + c.status.slice(1) : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-gray-100"
                          onClick={() => handleEditCustomer(c)}
                          title="Edit customer"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-red-100 text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteCustomer(c.id || c._id)}
                          title="Delete customer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-gray-100"
                          onClick={() => handleDownloadCustomerPDF(c)}
                          title="Download customer PDF report"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {currentDisplayedItems.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No customers found for selected filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4 p-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-500">Loading customers...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-red-500 mb-2">Error loading customers</p>
                <p className="text-gray-500 text-sm">{error}</p>
                <Button onClick={() => fetchCustomers()} className="mt-4" variant="outline">
                  Try Again
                </Button>
              </div>
            ) : currentDisplayedItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-gray-500 mb-2">No customers found</p>
                <p className="text-gray-400 text-sm">Add your first customer to get started</p>
              </div>
            ) : currentDisplayedItems.map((c, i) => (
              <Card key={i} className="p-4 hover:shadow-md transition-shadow">
                <div className="space-y-4">
                  {/* Company Name */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Company Name</h4>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={c.company?.logo || c.logo} />
                        <AvatarFallback className="text-xs">
                          {(c.company?.name || c.company || "Company")?.[0] || "C"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{c.company?.name || c.company || "No Company"}</p>
                        <p className="text-sm text-gray-500 truncate">
                          {c.company?.email || c.email || "No Email"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Customer Name */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Customer Name</h4>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={c.customer?.avatar || c.avatar} />
                        <AvatarFallback className="text-xs">
                          {(c.customer?.name || c.name || "User")?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-gray-900 font-medium">{c.customer?.name || c.name || "No Name"}</p>
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Phone Number</h4>
                    <p className="text-gray-900">{c.phone || '-'}</p>
                  </div>

                  {/* Status */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Status</h4>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${c.status?.toLowerCase() === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                        }`}
                    >
                      {c.status ? c.status.charAt(0).toUpperCase() + c.status.slice(1) : '-'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Actions</h4>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:bg-gray-100"
                        onClick={() => handleEditCustomer(c)}
                        title="Edit customer"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:bg-red-100 text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteCustomer(c.id || c._id)}
                        title="Delete customer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:bg-gray-100"
                        onClick={() => handleDownloadCustomerPDF(c)}
                        title="Download customer PDF report"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            {currentDisplayedItems.length === 0 && !loading && !error && (
              <div className="text-center py-8 text-gray-500">
                No customers found for selected filter.
              </div>
            )}
          </div>

          {/* Pagination */}
          {currentDisplayedItems.length > 0 && (
            <div className="border-t border-gray-200 px-4 py-4 sm:px-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
                <div className="text-center text-sm text-gray-700 sm:text-left">
                  Showing {((page - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(page * ITEMS_PER_PAGE, currentTotalItems)} of {currentTotalItems} results
                  {currentTotalPages > 1 && ` (Page ${page} of ${currentTotalPages})`}
                </div>

                <div className="flex items-center justify-center gap-2">
                  <Button
                    className="hover:bg-white bg-white text-slate-500 hover:text-[#654BCD] cursor-pointer"
                    size="sm"
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                  >
                    <MoveLeft className="h-4 w-4 sm:mr-1" />
                    <span className="hidden sm:inline">Previous</span>
                  </Button>

                  {/* Desktop pagination numbers */}
                  <div className="hidden sm:flex items-center gap-1">
                    {Array.from({ length: Math.min(currentTotalPages, 5) }, (_, i) => {
                      let pageNum;
                      if (currentTotalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= currentTotalPages - 2) {
                        pageNum = currentTotalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={page === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPage(pageNum)}
                          className={`w-8 h-8 p-0 ${page !== pageNum ? "hover:text-black" : ""}`}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  {/* Mobile pagination - show current page */}
                  <div className="sm:hidden flex items-center gap-1">
                    <span className="text-sm text-gray-500 px-2">
                      {page} / {currentTotalPages}
                    </span>
                  </div>

                  <Button
                    className="hover:bg-white bg-white text-slate-500 hover:text-[#654BCD] cursor-pointer"
                    size="sm"
                    onClick={() => setPage((prev) => Math.min(prev + 1, currentTotalPages))}
                    disabled={page === currentTotalPages}
                  >
                    <span className="hidden sm:inline">Next</span>
                    <MoveRight className="h-4 w-4 sm:ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}