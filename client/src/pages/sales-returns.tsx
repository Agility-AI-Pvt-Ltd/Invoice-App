import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { BASE_URL } from "@/lib/api-config";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import {
  Search,
  Plus,
  Edit,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Cookies from "js-cookie";
import type { SalesReturn, SalesReturnCreate, SalesReturnUpdate } from "@/types/salesReturn";

export default function SalesReturns() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [salesReturns, setSalesReturns] = useState<SalesReturn[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });
  const [editingReturn, setEditingReturn] = useState<SalesReturn | null>(null);
  const [formData, setFormData] = useState<SalesReturnCreate>({
    gstin: "",
    partyName: "",
    billNo: "",
    date: "",
    state: "",
    qty: 0,
    hsn: "",
    rate: 0,
    taxable: 0,
    igst: 0,
    cgst: 0,
    sgst: 0,
    total: 0,
    remark: "",
  });
  const { toast } = useToast();

  // Helper function to check if user is authenticated
  const isAuthenticated = () => {
    const token = Cookies.get("authToken");
    return !!token;
  };

  // API helper functions
  const buildAuthHeaders = (token?: string) => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
  };

  const apiGetSalesReturns = async (
    token: string | undefined,
    page = 1,
    limit = 10,
    params: { search?: string } = {},
  ) => {
    try {
      const searchParam = params.search ? `&search=${encodeURIComponent(params.search)}` : '';
      const url = `${BASE_URL}/api/sales/returns?page=${page}&limit=${limit}${searchParam}`;

      console.log("🔗 Fetching sales returns from URL:", url);

      const response = await fetch(url, {
        method: 'GET',
        headers: buildAuthHeaders(token),
      });

      console.log("📡 Response status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("📋 Raw API result:", result);

      let data = [];
      let pagination = {};

      if (result.success && result.data) {
        if (Array.isArray(result.data)) {
          data = result.data;
        } else if (result.data.data && Array.isArray(result.data.data)) {
          data = result.data.data;
          pagination = result.data.pagination || {};
        }
      }

      return {
        data: data,
        pagination: {
          totalPages: (pagination as any).totalPages || Math.ceil(((pagination as any).totalItems || data.length) / limit),
          totalItems: (pagination as any).totalItems || data.length,
          currentPage: (pagination as any).currentPage || page
        }
      };
    } catch (error) {
      console.error('❌ Error fetching sales returns:', error);
      throw new Error(`Failed to fetch sales returns: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const apiCreateSalesReturn = async (token: string | undefined, data: SalesReturnCreate) => {
    const response = await fetch(`${BASE_URL}/api/sales/returns`, {
      method: "POST",
      headers: buildAuthHeaders(token),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create sales return");
    }

    return response.json();
  };

  const apiUpdateSalesReturn = async (
    token: string | undefined,
    id: string,
    update: SalesReturnUpdate
  ) => {
    const response = await fetch(`${BASE_URL}/api/sales/returns/${id}`, {
      method: "PUT",
      headers: buildAuthHeaders(token),
      body: JSON.stringify(update),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update sales return");
    }

    return response.json();
  };

  const apiDeleteSalesReturn = async (token: string | undefined, id: string) => {
    const response = await fetch(`${BASE_URL}/api/sales/returns/${id}`, {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete sales return");
    }

    return response.json();
  };

  // Fetch sales returns on component mount and when filters change
  useEffect(() => {
    if (isAuthenticated()) {
      fetchSalesReturns();
    } else {
      setSalesReturns([]);
      setPagination({ currentPage: 1, totalPages: 1, totalItems: 0 });
    }
  }, [currentPage, searchTerm]);

  const fetchSalesReturns = async () => {
    try {
      setLoading(true);
      const token = Cookies.get("authToken");

      console.log("🔄 Fetching sales returns...", { currentPage, searchTerm, token: !!token });

      const response = await apiGetSalesReturns(token, currentPage, 10, {
        search: searchTerm || undefined,
      });

      console.log("📊 Sales returns API Response:", response);

      const { data, pagination: paginationData } = response;
      const { totalPages, totalItems, currentPage: responsePage } = paginationData;

      console.log("📋 Final mapped sales returns:", data);
      setSalesReturns(data);

      setPagination({
        currentPage: responsePage || currentPage,
        totalPages: totalPages || 1,
        totalItems: totalItems || data.length,
      });

    } catch (error: unknown) {
      console.error("❌ Error fetching sales returns:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

      toast({
        title: "Error",
        description: errorMessage.includes("Authentication")
          ? "Please log in again to access sales returns."
          : "Failed to fetch sales returns",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate total automatically when rate, qty, or taxes change
  const calculateTotal = () => {
    const taxableAmount = formData.rate * formData.qty;
    const totalTax = formData.igst + formData.cgst + formData.sgst;
    const total = taxableAmount + totalTax;

    setFormData(prev => ({
      ...prev,
      taxable: taxableAmount,
      total: total
    }));
  };

  // Update calculations when relevant fields change
  useEffect(() => {
    calculateTotal();
  }, [formData.rate, formData.qty, formData.igst, formData.cgst, formData.sgst]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      const token = Cookies.get("authToken") || undefined;

      if (editingReturn) {
        // Update existing return
        await apiUpdateSalesReturn(token, editingReturn.id.toString(), formData);
        toast({
          title: "Success",
          description: "Sales return updated successfully!",
        });
      } else {
        // Add new return
        console.log("➕ Creating new sales return with data:", formData);
        const newReturn = await apiCreateSalesReturn(token, formData);
        console.log("✅ Sales return created successfully:", newReturn);

        toast({
          title: "Success",
          description: "Sales return added successfully!",
        });
      }

      // Reset form and refresh data
      console.log("🔄 Resetting form and refreshing sales returns list...");
      setFormData({
        gstin: "",
        partyName: "",
        billNo: "",
        date: "",
        state: "",
        qty: 0,
        hsn: "",
        rate: 0,
        taxable: 0,
        igst: 0,
        cgst: 0,
        sgst: 0,
        total: 0,
        remark: "",
      });
      setEditingReturn(null);
      setShowAddForm(false);

      // Add a small delay to ensure the backend has processed the request
      setTimeout(() => {
        console.log("⏰ Fetching sales returns after delay...");
        fetchSalesReturns();
      }, 500);
    } catch (error: unknown) {
      console.error("Error saving sales return:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (salesReturn: SalesReturn) => {
    setEditingReturn(salesReturn);
    setFormData({
      gstin: salesReturn.gstin || "",
      partyName: salesReturn.partyName,
      billNo: salesReturn.billNo,
      date: salesReturn.date.split('T')[0], // Convert to date input format
      state: salesReturn.state || "",
      qty: salesReturn.qty,
      hsn: salesReturn.hsn || "",
      rate: salesReturn.rate,
      taxable: salesReturn.taxable,
      igst: salesReturn.igst,
      cgst: salesReturn.cgst,
      sgst: salesReturn.sgst,
      total: salesReturn.total,
      remark: salesReturn.remark || "",
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this sales return?")) return;

    try {
      const token = Cookies.get("authToken");
      await apiDeleteSalesReturn(token, id);
      toast({
        title: "Success",
        description: "Sales return deleted successfully!",
      });
      fetchSalesReturns();
    } catch (error) {
      console.error("Error deleting sales return:", error);
      toast({
        title: "Error",
        description: "Failed to delete sales return. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800 lg:text-3xl">
            Sales Returns Management
          </h1>
          <p className="mt-2 text-slate-600">
            Manage your sales returns and track refunds
          </p>
        </div>

        {showAddForm ? (
          /* Add/Edit Form */
          <Card className="mb-8 overflow-hidden border-0 shadow-md">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 lg:p-8">
              <h2 className="text-xl font-semibold text-white">
                {editingReturn ? "Edit Sales Return" : "Add New Sales Return"}
              </h2>
            </div>
            <div className="p-6 lg:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Row 1: Party Details */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="partyName" className="text-sm font-medium text-slate-700">
                      Party Name *
                    </Label>
                    <Input
                      id="partyName"
                      placeholder="Enter party name"
                      value={formData.partyName}
                      onChange={(e) =>
                        setFormData({ ...formData, partyName: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="billNo" className="text-sm font-medium text-slate-700">
                      Bill No *
                    </Label>
                    <Input
                      id="billNo"
                      placeholder="Enter bill number"
                      value={formData.billNo}
                      onChange={(e) =>
                        setFormData({ ...formData, billNo: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-sm font-medium text-slate-700">
                      Date *
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                {/* Row 2: GSTIN and State */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="gstin" className="text-sm font-medium text-slate-700">
                      GSTIN
                    </Label>
                    <Input
                      id="gstin"
                      placeholder="Enter GSTIN"
                      value={formData.gstin}
                      onChange={(e) =>
                        setFormData({ ...formData, gstin: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-sm font-medium text-slate-700">
                      State
                    </Label>
                    <Input
                      id="state"
                      placeholder="Enter state"
                      value={formData.state}
                      onChange={(e) =>
                        setFormData({ ...formData, state: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Row 3: Product Details */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                  <div className="space-y-2">
                    <Label htmlFor="hsn" className="text-sm font-medium text-slate-700">
                      HSN Code
                    </Label>
                    <Input
                      id="hsn"
                      placeholder="Enter HSN code"
                      value={formData.hsn}
                      onChange={(e) =>
                        setFormData({ ...formData, hsn: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="qty" className="text-sm font-medium text-slate-700">
                      Quantity *
                    </Label>
                    <Input
                      id="qty"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.qty}
                      onChange={(e) =>
                        setFormData({ ...formData, qty: parseFloat(e.target.value) || 0 })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rate" className="text-sm font-medium text-slate-700">
                      Rate *
                    </Label>
                    <Input
                      id="rate"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.rate}
                      onChange={(e) =>
                        setFormData({ ...formData, rate: parseFloat(e.target.value) || 0 })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxable" className="text-sm font-medium text-slate-700">
                      Taxable Amount
                    </Label>
                    <Input
                      id="taxable"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.taxable}
                      readOnly
                      className="bg-slate-50"
                    />
                  </div>
                </div>

                {/* Row 4: Tax Details */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                  <div className="space-y-2">
                    <Label htmlFor="igst" className="text-sm font-medium text-slate-700">
                      IGST
                    </Label>
                    <Input
                      id="igst"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.igst}
                      onChange={(e) =>
                        setFormData({ ...formData, igst: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cgst" className="text-sm font-medium text-slate-700">
                      CGST
                    </Label>
                    <Input
                      id="cgst"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.cgst}
                      onChange={(e) =>
                        setFormData({ ...formData, cgst: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sgst" className="text-sm font-medium text-slate-700">
                      SGST
                    </Label>
                    <Input
                      id="sgst"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.sgst}
                      onChange={(e) =>
                        setFormData({ ...formData, sgst: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="total" className="text-sm font-medium text-slate-700">
                      Total Amount
                    </Label>
                    <Input
                      id="total"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.total}
                      readOnly
                      className="bg-slate-50 font-semibold"
                    />
                  </div>
                </div>

                {/* Row 5: Remarks */}
                <div className="space-y-2">
                  <Label htmlFor="remark" className="text-sm font-medium text-slate-700">
                    Remarks
                  </Label>
                  <Input
                    id="remark"
                    placeholder="Enter any remarks"
                    value={formData.remark}
                    onChange={(e) =>
                      setFormData({ ...formData, remark: e.target.value })
                    }
                  />
                </div>

                {/* Form Actions */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {loading ? "Saving..." : editingReturn ? "Update Return" : "Add Return"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingReturn(null);
                      setFormData({
                        gstin: "",
                        partyName: "",
                        billNo: "",
                        date: "",
                        state: "",
                        qty: 0,
                        hsn: "",
                        rate: 0,
                        taxable: 0,
                        igst: 0,
                        cgst: 0,
                        sgst: 0,
                        total: 0,
                        remark: "",
                      });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        ) : (
          /* List View */
          <Card className="overflow-hidden border-0 shadow-md">
            {/* Controls */}
            <div className="border-b border-slate-200 bg-white p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 items-center gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      placeholder="Search by party name, bill no..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <Button
                  onClick={() => setShowAddForm(true)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Return
                </Button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-8 text-center text-slate-500">
                  Loading sales returns...
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-slate-200 bg-slate-50">
                      <TableHead className="px-6 py-4 font-semibold text-slate-700">
                        Party Name
                      </TableHead>
                      <TableHead className="px-6 py-4 font-semibold text-slate-700">
                        Bill No
                      </TableHead>
                      <TableHead className="px-6 py-4 font-semibold text-slate-700">
                        Date
                      </TableHead>
                      <TableHead className="px-6 py-4 font-semibold text-slate-700">
                        State
                      </TableHead>
                      <TableHead className="px-6 py-4 font-semibold text-slate-700">
                        Qty
                      </TableHead>
                      <TableHead className="px-6 py-4 font-semibold text-slate-700">
                        Rate
                      </TableHead>
                      <TableHead className="px-6 py-4 font-semibold text-slate-700">
                        Total
                      </TableHead>
                      <TableHead className="px-6 py-4 font-semibold text-slate-700">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesReturns.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="py-8 text-center text-slate-500"
                        >
                          No sales returns found
                        </TableCell>
                      </TableRow>
                    ) : (
                      salesReturns.map((salesReturn) => (
                        <TableRow
                          key={salesReturn.id}
                          className="border-b border-slate-100 hover:bg-slate-50"
                        >
                          <TableCell className="px-6 py-4 font-medium">
                            {salesReturn.partyName}
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            {salesReturn.billNo}
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            {formatDate(salesReturn.date)}
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            {salesReturn.state || "-"}
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            {salesReturn.qty}
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            {formatCurrency(salesReturn.rate)}
                          </TableCell>
                          <TableCell className="px-6 py-4 font-semibold">
                            {formatCurrency(salesReturn.total)}
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600"
                                onClick={() => handleEdit(salesReturn)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 p-0 text-slate-400 hover:text-red-600"
                                onClick={() => handleDelete(salesReturn.id.toString())}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-200 p-6">
                <div className="text-sm text-slate-500">
                  Showing {(currentPage - 1) * 10 + 1} to{" "}
                  {Math.min(currentPage * 10, pagination.totalItems)} of{" "}
                  {pagination.totalItems} results
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="px-3 py-1 text-sm">
                    {currentPage} of {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))
                    }
                    disabled={currentPage === pagination.totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
