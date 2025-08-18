import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Search, Calendar, Download, Upload, Plus, Edit, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

// Type definitions
interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  dateJoined: string;
  lastActive: string;
  status: "Active" | "Inactive";
  avatar?: string;
}

interface TeamMemberCreate {
  name: string;
  role: string;
  email: string;
  phone: string;
  joiningDate?: string;
  status?: string;
  profilePicture?: File | null;
}

interface TeamMemberUpdate {
  name?: string;
  role?: string;
  phone?: string;
  status?: "Active" | "Inactive";
}

const Cookies = {
  get: (name: string): string | undefined => {
    // Mock implementation - in real app, this would get actual cookies
    if (name === 'authToken') {
      return undefined; // Return undefined to use mock data
    }
    return undefined;
  }
};

// API base (change via Vite env: VITE_API_URL)
const API_BASE = "https://invoice-backend-604217703209.asia-south1.run.app";

export default function TeamManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  //@ts-ignore
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState<TeamMemberCreate>({
    name: "",
    role: "",
    email: "",
    phone: "",
    joiningDate: "",
    status: "",
    profilePicture: null,
  });
  const { toast } = useToast();

  // Helper function to check if user is authenticated
  const isAuthenticated = () => {
    const token = Cookies.get('authToken');
    return !!token;
  };

  // --- API helper functions (direct fetch) ---
  const buildAuthHeaders = (token?: string) => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
  };

  const apiGetTeamMembers = async (token: string | undefined, page = 1, limit = 10, params: { search?: string } = {}) => {
    const q = new URLSearchParams();
    q.append("page", String(page));
    q.append("limit", String(limit));
    if (params.search) q.append("search", params.search);

    const url = `${API_BASE}/api/team-members?${q.toString()}`;
    const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
    if (!res.ok) {
      // try to parse error body
      let errText = `Failed to fetch team members (status ${res.status})`;
      try { const body = await res.json(); errText = body.detail || body.message || JSON.stringify(body); } catch (e) {}
      throw new Error(errText);
    }

    const json = await res.json();
    return json;
  };

  const apiCreateTeamMember = async (token: string | undefined, member: TeamMemberCreate) => {
    // backend expects JSON (joiningDate as YYYY-MM-DD); it creates avatar itself
    const payload: any = {
      name: member.name,
      role: member.role,
      email: member.email,
      phone: member.phone,
      status: (member.status || "active").toLowerCase(),
    };
    if (member.joiningDate) payload.joiningDate = member.joiningDate;

    const res = await fetch(`${API_BASE}/api/team-members`, {
      method: "POST",
      headers: buildAuthHeaders(token),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      let errText = `Failed to create team member (status ${res.status})`;
      try { const body = await res.json(); errText = body.detail || body.message || JSON.stringify(body); } catch (e) {}
      throw new Error(errText);
    }

    return await res.json();
  };

  const apiUpdateTeamMember = async (token: string | undefined, id: string, update: TeamMemberUpdate) => {
    const cleaned: any = {};
    if (update.name) cleaned.name = update.name;
    if (update.role) cleaned.role = update.role;
    if (update.phone) cleaned.phone = update.phone;
    if (update.status) cleaned.status = update.status.toLowerCase();

    const res = await fetch(`${API_BASE}/api/team-members/${id}`, {
      method: "PUT",
      headers: buildAuthHeaders(token),
      body: JSON.stringify(cleaned),
    });

    if (!res.ok) {
      let errText = `Failed to update team member (status ${res.status})`;
      try { const body = await res.json(); errText = body.detail || body.message || JSON.stringify(body); } catch (e) {}
      throw new Error(errText);
    }

    return await res.json();
  };

  const apiDeleteTeamMember = async (token: string | undefined, id: string) => {
    const res = await fetch(`${API_BASE}/api/team-members/${id}`, {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!res.ok) {
      let errText = `Failed to delete team member (status ${res.status})`;
      try { const body = await res.json(); errText = body.detail || body.message || JSON.stringify(body); } catch (e) {}
      throw new Error(errText);
    }

    return await res.json();
  };

  // Fetch team members on component mount and when filters change
  useEffect(() => {
    if (isAuthenticated()) {
      fetchTeamMembers();
    } else {
      return;
    }
  }, [currentPage, searchTerm]);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const token = Cookies.get("authToken") || undefined;
      const response = await apiGetTeamMembers(token, currentPage, 10, { search: searchTerm || undefined });

      // Backend might return different shapes. Normalize below.
      // Possible shapes:
      // 1) { data: [...], page: x, totalPages: y, total: z }
      // 2) { data: [...] , pagination: { page, totalPages, total } }
      // 3) array directly

      let data: any[] = [];
      let page = 1;
      let totalPages = 1;
      let total = 0;

      if (Array.isArray(response)) {
        data = response;
      } else if (response.data && Array.isArray(response.data)) {
        data = response.data;
        page = response.page || response.pagination?.page || currentPage;
        totalPages = response.totalPages || response.pagination?.totalPages || 1;
        total = response.total || response.pagination?.total || data.length;
      } else if (response.members && Array.isArray(response.members)) {
        // fallback: sometimes API returns "members"
        data = response.members;
      } else {
        // try to find array in response
        for (const k of Object.keys(response)) {
          if (Array.isArray((response as any)[k])) {
            data = (response as any)[k];
            break;
          }
        }
      }

      // map server fields to our TeamMember shape if needed
      const mapped = data.map((m: any) => ({
        id: m.id || m._id || m.memberId || String(m._id || m.id || ""),
        name: m.name || m.fullName || "",
        role: (m.role || "").charAt(0).toUpperCase() + (m.role || "").slice(1) || "",
        email: m.email || "",
        phone: m.phone || m.phonenumber || "",
        dateJoined: m.dateJoined || m.joiningDate || (m.joiningDate ? new Date(m.joiningDate).toISOString().split('T')[0] : ""),
        lastActive: m.lastActive || null,
        status: (m.status || "active") === "active" ? "Active" : "Inactive",
        avatar: m.avatar || undefined,
      }));

      setTeamMembers(mapped as TeamMember[]);
      setPagination({ currentPage: page, totalPages, totalItems: total });
    } catch (error: unknown) {
      console.error('Error fetching team members:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      toast({
        title: "Error",
        description: errorMessage.includes('Authentication') ?
          "Please log in again to access team members." :
          "Failed to fetch team members",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      const token = Cookies.get("authToken") || undefined;

      if (editingMember) {
        // Update existing member
        const updateData: TeamMemberUpdate = {
          name: formData.name,
          role: formData.role,
          phone: formData.phone,
          status: formData.status === "active" || formData.status === "Active" ? "Active" : "Inactive"
        };
        await apiUpdateTeamMember(token, editingMember.id, updateData);
        toast({ title: "Success", description: "Team member updated successfully!" });
      } else {
        // Add new member
        await apiCreateTeamMember(token, formData);
        toast({ title: "Success", description: "Team member added successfully!" });
      }

      // Reset form and refresh data
      setFormData({
        name: "",
        role: "",
        email: "",
        phone: "",
        joiningDate: "",
        status: "",
        profilePicture: null,
      });
      setEditingMember(null);
      setShowAddForm(false);
      fetchTeamMembers();

    } catch (error: unknown) {
      console.error('Error saving team member:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle edit member
  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      role: member.role.toLowerCase(),
      email: member.email,
      phone: member.phone,
      joiningDate: member.dateJoined,
      status: member.status.toLowerCase(),
      profilePicture: null,
    });
    setShowAddForm(true);
  };

  // Handle delete member
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this team member?')) {
      try {
        const token = Cookies.get("authToken") || undefined;
        await apiDeleteTeamMember(token, id);
        toast({ title: "Success", description: "Team member deleted successfully!" });
        fetchTeamMembers();
      } catch (error) {
        console.error('Error deleting team member:', error);
        toast({ title: "Error", description: "Failed to delete team member. Please try again.", variant: "destructive" });
      }
    }
  };

  // Handle import
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setLoading(true);
        toast({ title: "Info", description: "Import functionality will be implemented soon." });
      } catch (error) {
        console.error('Error importing team members:', error);
        toast({ title: "Error", description: "Failed to import team members. Please try again.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle export
  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      setLoading(true);
      toast({ title: "Info", description: `Export functionality for ${format.toUpperCase()} will be implemented soon.` });
    } catch (error) {
      console.error('Error exporting team members:', error);
      toast({ title: "Error", description: "Failed to export team members. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-background p-4 lg:p-8">
      <div className="max-w-8xl mx-auto">
        <Card className="bg-white border-0 shadow-sm">
          {!showAddForm ? (
            <>
              {/* Header */}
              <div className="p-4 lg:p-6 border-b border-slate-200">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <h2 className="text-xl font-semibold text-slate-800">Team Member List</h2>

                  <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    {/* Search */}
                    <div className="relative flex-1 lg:w-80">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                      <Input
                        placeholder="Search by name, email, or role"
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-10 bg-white border-slate-200 text-slate-600 h-10"
                      />
                    </div>

                    {/* Desktop/Tablet Actions */}
                    <div className="hidden sm:flex gap-2 flex-wrap">
                      <Button variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50 h-10 px-4">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Date</span>
                      </Button>

                      {/* Export Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50 h-10 px-4">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleExport('csv')}>CSV</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleExport('excel')}>Excel</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleExport('pdf')}>PDF</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      {/* Import */}
                      <div className="relative">
                        <input
                          type="file"
                          accept=".csv,.xlsx"
                          onChange={handleImport}
                          className="hidden"
                          id="import-file"
                        />
                        <label htmlFor="import-file">
                          <Button variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50 h-10 px-4 cursor-pointer">
                            <Upload className="h-4 w-4 mr-2" />
                            Import
                          </Button>
                        </label>
                      </div>

                      <Button
                        className="bg-gradient-to-b from-[#B5A3FF] via-[#785FDA] to-[#9F91D8] text-white px-4 py-2 rounded-lg"
                        onClick={() => setShowAddForm(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Member
                      </Button>
                    </div>

                    {/* Mobile Actions */}
                    <div className="sm:hidden flex items-center gap-2 flex-nowrap overflow-x-auto no-scrollbar">
                      <Button variant="outline" size="icon" className="shrink-0">
                        <Calendar className="h-5 w-5" />
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon" className="shrink-0">
                            <Download className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleExport('csv')}>CSV</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleExport('excel')}>Excel</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleExport('pdf')}>PDF</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <div className="relative">
                        <input
                          type="file"
                          accept=".csv,.xlsx"
                          onChange={handleImport}
                          className="hidden"
                          id="import-file-mobile"
                        />
                        <label htmlFor="import-file-mobile">
                          <Button variant="outline" size="icon" className="shrink-0 cursor-pointer">
                            <Upload className="h-5 w-5" />
                          </Button>
                        </label>
                      </div>

                      <Button
                        size="icon"
                        className="bg-gradient-to-b from-[#B5A3FF] via-[#785FDA] to-[#9F91D8] text-white shrink-0"
                        onClick={() => setShowAddForm(true)}
                      >
                        <Plus className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="p-8 text-center text-slate-500">Loading team members...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-slate-200 bg-slate-50">
                        <TableHead className="font-semibold text-slate-700 py-4 px-6">Name ↓</TableHead>
                        <TableHead className="font-semibold text-slate-700 py-4 px-6">Role ↓</TableHead>
                        <TableHead className="font-semibold text-slate-700 py-4 px-6 hidden sm:table-cell">Email ↓</TableHead>
                        <TableHead className="font-semibold text-slate-700 py-4 px-6 hidden md:table-cell">Phone No. ↓</TableHead>
                        <TableHead className="font-semibold text-slate-700 py-4 px-6 hidden lg:table-cell">Date Joined ↓</TableHead>
                        <TableHead className="font-semibold text-slate-700 py-4 px-6 hidden lg:table-cell">Last Active</TableHead>
                        <TableHead className="font-semibold text-slate-700 py-4 px-6">Status ↓</TableHead>
                        <TableHead className="font-semibold text-slate-700 py-4 px-6">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teamMembers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                            No team members found
                          </TableCell>
                        </TableRow>
                      ) : (
                        teamMembers.map((member) => (
                          <TableRow key={member.id} className="border-b border-slate-100 hover:bg-slate-50">
                            <TableCell className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={member.avatar} alt={member.name} />
                                  <AvatarFallback className="bg-indigo-100 text-indigo-600 font-semibold">
                                    {member.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium text-slate-800">{member.name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="py-4 px-6 text-slate-600">{member.role}</TableCell>
                            <TableCell className="py-4 px-6 text-slate-600 hidden sm:table-cell">{member.email}</TableCell>
                            <TableCell className="py-4 px-6 text-slate-600 hidden md:table-cell">{member.phone}</TableCell>
                            <TableCell className="py-4 px-6 text-slate-600 hidden lg:table-cell">{member.dateJoined}</TableCell>
                            <TableCell className="py-4 px-6 text-slate-600 hidden lg:table-cell">{member.lastActive}</TableCell>
                            <TableCell className="py-4 px-6">
                              <Badge
                                variant={member.status === "Active" ? "secondary" : "destructive"}
                                className={
                                  member.status === "Active"
                                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200"
                                    : "bg-red-100 text-red-700 hover:bg-red-100 border-red-200"
                                }
                              >
                                {member.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-4 px-6">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600"
                                  onClick={() => handleEdit(member)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 p-0 text-slate-400 hover:text-red-600"
                                  onClick={() => handleDelete(member.id)}
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
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 lg:p-6 border-t border-slate-200">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Previous</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={page === currentPage ? "default" : "outline"}
                        size="sm"
                        className={page === currentPage ? "bg-indigo-500 text-white" : "border-slate-200 text-slate-600 hover:bg-slate-50"}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Add/Edit Member Form */}
              <div className="p-6 lg:p-8">
                <h2 className="text-xl font-semibold text-slate-800 mb-8">
                  {editingMember ? 'Edit Team Member' : 'Add New Member'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name and Role Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium text-slate-700">Name</Label>
                      <Input
                        id="name"
                        placeholder="New Member Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="h-12 border-slate-200 text-slate-600 placeholder:text-slate-400"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role" className="text-sm font-medium text-slate-700">Role</Label>
                      <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                        <SelectTrigger className="h-12 border-slate-200 text-slate-600">
                          <SelectValue placeholder="Select Admin/ Manager/ Accountant/ Viewer" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="accountant">Accountant</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Email and Joining Date Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="EmailAddress@123gmail.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="h-12 border-slate-200 text-slate-600 placeholder:text-slate-400"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="joiningDate" className="text-sm font-medium text-slate-700">Joining Date</Label>
                      <Input
                        id="joiningDate"
                        type="date"
                        value={formData.joiningDate || ""}
                        onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                        className="h-12 border-slate-200 text-slate-600"
                        required
                      />
                    </div>
                  </div>

                  {/* Phone and Status Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium text-slate-700">Phone Number</Label>
                      <Input
                        id="phone"
                        placeholder="+ 91 855 **** 987"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="h-12 border-slate-200 text-slate-600 placeholder:text-slate-400"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status" className="text-sm font-medium text-slate-700">Status</Label>
                      <Select value={formData.status || ""} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                        <SelectTrigger className="h-12 border-slate-200 text-slate-600">
                          <SelectValue placeholder="Active / Inactive" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Profile Picture Upload */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Profile Picture Upload</Label>
                    <div className="border-2 border-dashed border-slate-300 h-32 flex items-center justify-center text-slate-400 cursor-pointer relative">
                      <input
                        type="file"
                        accept=".png,.jpg,.jpeg,.webp,.pdf"
                        onChange={(e) => setFormData({ ...formData, profilePicture: e.target.files?.[0] || null })}
                        className="absolute w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="text-center">
                        Upload <br />
                        <span className="text-xs text-slate-400">Only PNG, JPG, PDF, WEBP files are supported</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingMember(null);
                        setFormData({
                          name: "",
                          role: "",
                          email: "",
                          phone: "",
                          joiningDate: "",
                          status: "",
                          profilePicture: null,
                        });
                      }}
                      className="flex-1 h-12 border-slate-200 text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex-1 h-12 bg-indigo-500 hover:bg-indigo-600 text-white disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : (editingMember ? 'Update' : 'Save')}
                    </Button>
                  </div>
                </form>

              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
