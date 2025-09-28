import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
  Download,
  Upload,
  Plus,
  Edit,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { SingleDatePicker } from "@/components/ui/SingleDatePicker";
import Cookies from "js-cookie";

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

// Removed hardcoded production URL - now using API service

export default function TeamManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  // const [isImporting, setIsImporting] = useState(false);
  //@ts-ignore
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  
  // Debug: Log when teamMembers state changes
  console.log("🎯 Component render - teamMembers.length:", teamMembers.length);
  console.log("🎯 Component render - teamMembers:", teamMembers);
  console.log("🚨 Component render - loading state:", loading);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
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
    const token = Cookies.get("authToken");
    return !!token;
  };

  // --- API helper functions (direct fetch) ---
  const buildAuthHeaders = (token?: string) => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
  };

  const apiGetTeamMembers = async (
    token: string | undefined,
    page = 1,
    limit = 10,
    params: { search?: string } = {},
  ) => {
    try {
      // Use direct fetch to ensure consistency with create/update/delete operations
      const searchParam = params.search ? `&search=${encodeURIComponent(params.search)}` : '';
      const url = `${BASE_URL}/api/team-members?page=${page}&limit=${limit}${searchParam}`;
      
      console.log("🔗 Fetching from URL:", url);
      
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
      console.log("📋 API result.data:", result.data);
      console.log("📋 API result.data type:", typeof result.data);
      
      // Handle the API response structure: {success: true, message: '...', data: {...}}
      let data = [];
      let pagination = {};
      
      if (result.success && result.data) {
        console.log("📋 Processing successful API response");
        console.log("📋 result.data contents:", result.data);
        
        // Check if result.data has team members array
        if (Array.isArray(result.data)) {
          data = result.data;
          console.log("📋 Found array directly in result.data");
        } else if (result.data.teamMembers && Array.isArray(result.data.teamMembers)) {
          data = result.data.teamMembers;
          pagination = result.data.pagination || {};
          console.log("📋 Found teamMembers array in result.data");
        } else if (result.data.data && Array.isArray(result.data.data)) {
          data = result.data.data;
          pagination = result.data.pagination || {};
          console.log("📋 Found data array in result.data.data");
        } else {
          // Look for any array property in result.data
          for (const [key, value] of Object.entries(result.data)) {
            console.log(`📋 Checking result.data.${key}:`, value);
            if (Array.isArray(value)) {
              data = value;
              console.log(`📋 Found array in result.data.${key}`);
              break;
            }
          }
        }
        
        // Get pagination if it exists
        pagination = result.data.pagination || result.pagination || {};
      } else {
        console.log("📋 API response not successful or no data");
        console.log("📋 result.success:", result.success);
        console.log("📋 result.data exists:", !!result.data);
      }
      
      console.log("📋 Final extracted data:", data);
      console.log("📋 Final extracted pagination:", pagination);

      return {
        data: data,
        pagination: {
          totalPages: Math.ceil(data.length / limit),
          totalItems: data.length,
          currentPage: page
        }
      };
    } catch (error) {
      console.error('❌ Error fetching team members:', error);
      throw new Error(`Failed to fetch team members: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const generateRandomPassword = (len = 10) => {
    const chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~";
    let p = "";
    for (let i = 0; i < len; i++)
      p += chars[Math.floor(Math.random() * chars.length)];
    return p;
  };

  const apiCreateTeamMember = async (
    token: string | undefined,
    member: TeamMemberCreate,
  ) => {
    const username =
      (member.email && member.email.split("@")[0]) ||
      member.name.replace(/\s+/g, "").toLowerCase() ||
      `user${Date.now()}`;
    const password = generateRandomPassword(12);

    const payload: any = {
      name: member.name,
      role: (member.role || "").toLowerCase(),
      email: member.email,
      phone: member.phone,
      status: (member.status || "active").toLowerCase(),
      joiningDate: member.joiningDate || undefined,
      credentials: {
        username,
        password,
      },
    };
    // helpful debug during dev; remove in production
    // console.log("Creating team member payload:", payload);

    const res = await fetch(`${BASE_URL}/api/team-members`, {
      method: "POST",
      headers: buildAuthHeaders(token),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      if (res.status === 401) {
        await handleAuthError(res);
      }
      let errText = `Failed to create team member (status ${res.status})`;
      try {
        const body = await res.json();
        errText = body.detail || body.message || JSON.stringify(body);
      } catch (e) {}
      throw new Error(errText);
    }

    return await res.json();
  };

  const handleAuthError = async (
    res:
      | Response
      | {
          status?: number;
          json?: () => Promise<any>;
          data?: any;
          statusText?: string;
        },
  ) => {
    // Parse message if possible
    let msg = "Session expired. Please log in again.";
    try {
      // if it's a Fetch Response object
      // @ts-ignore
      if (res && typeof (res as Response).json === "function") {
        try {
          // @ts-ignore
          const body = await (res as Response).json();
          msg = body?.detail || body?.message || JSON.stringify(body);
        } catch (_) {
          // fallback: try text
          try {
            // @ts-ignore
            const text = await (res as Response).text();
            if (text) msg = text;
          } catch (_) {}
        }
      } else if ((res as any).data) {
        // axios error shape
        const data = (res as any).data;
        msg = data?.detail || data?.message || JSON.stringify(data);
      } else if ((res as any).statusText) {
        msg = (res as any).statusText;
      }
    } catch (e) {
      // ignore parse errors
    }

    // clearAuthTokens();
    toast({
      title: "Session expired",
      description: msg || "Session expired. Please log in again.",
      variant: "destructive",
    });
  };

  const apiUpdateTeamMember = async (
    token: string | undefined,
    id: string,
    update: TeamMemberUpdate,
  ) => {
    const cleaned: any = {};
    if (update.name) cleaned.name = update.name;
    if (update.role) cleaned.role = update.role;
    if (update.phone) cleaned.phone = update.phone;
    if (update.status) cleaned.status = update.status.toLowerCase();

    const res = await fetch(`${BASE_URL}/api/team-members/${id}`, {
      method: "PUT",
      headers: buildAuthHeaders(token),
      body: JSON.stringify(cleaned),
    });

    if (!res.ok) {
      let errText = `Failed to update team member (status ${res.status})`;
      try {
        const body = await res.json();
        errText = body.detail || body.message || JSON.stringify(body);
      } catch (e) {}
      throw new Error(errText);
    }

    return await res.json();
  };

  const apiDeleteTeamMember = async (token: string | undefined, id: string) => {
    const res = await fetch(`${BASE_URL}/api/team-members/${id}`, {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!res.ok) {
      let errText = `Failed to delete team member (status ${res.status})`;
      try {
        const body = await res.json();
        errText = body.detail || body.message || JSON.stringify(body);
      } catch (e) {}
      throw new Error(errText);
    }

    return await res.json();
  };

  const apiImportTeamMembers = async (
    token: string | undefined,
    file: File,
  ) => {
    const formData = new FormData();
    formData.append("file", file);

    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}/api/team-members/import`, {
      method: "POST",
      headers: headers, // Don't set Content-Type, let browser set it for FormData
      body: formData,
    });

    if (!res.ok) {
      let errText = `Failed to import team members (status ${res.status})`;
      try {
        const body = await res.json();
        errText = body.detail || body.message || JSON.stringify(body);
      } catch (e) {}
      throw new Error(errText);
    }

    return await res.json();
  };
  const downloadBlob = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const apiExportTeamMembers = async (
    token: string | undefined,
    format: "csv" | "excel" | "pdf",
  ) => {
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(
      `${BASE_URL}/api/team-members/export?format=${format}`,
      {
        method: "GET",
        headers: headers,
      },
    );

    if (!res.ok) {
      // Handle 204 No Content (no data to export)
      if (res.status === 204) {
        throw new Error("No team members found to export");
      }

      let errText = `Failed to export team members (status ${res.status})`;
      try {
        const body = await res.json();
        errText = body.detail || body.message || JSON.stringify(body);
      } catch (e) {}
      throw new Error(errText);
    }

    return res; // Return the response object for blob handling
  };

  const getExportFilename = (format: "csv" | "excel" | "pdf") => {
    const timestamp = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    switch (format) {
      case "csv":
        return `team_members_${timestamp}.csv`;
      case "excel":
        return `team_members_${timestamp}.xlsx`;
      case "pdf":
        return `team_members_${timestamp}.pdf`;
      default:
        return `team_members_${timestamp}.${format}`;
    }
  };

  // Fetch team members on component mount and when filters change
  useEffect(() => {
    if (isAuthenticated()) {
      fetchTeamMembers();
    } else {
      // If unauthenticated, show empty list but do not throw UI errors
      setTeamMembers([]);
      setPagination({ currentPage: 1, totalPages: 1, totalItems: 0 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm]);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const token = Cookies.get("authToken");
      const response = await apiGetTeamMembers(token, currentPage, 10, {
        search: searchTerm || undefined,
      });

      // Normalize possible response shapes:
      let data: any[] = [];
      let page = currentPage;
      let totalPages = 1;
      let total = 0;

      if (Array.isArray(response)) {
        data = response;
      } else if ((response as any).success && Array.isArray((response as any).data)) {
        data = (response as any).data;
        const p = (response as any).pagination || (response as any).page || {};
        page = p.currentPage || (response as any).page || currentPage;
        totalPages =
          ((response as any).pagination && (response as any).pagination.totalPages) ||
          (response as any).totalPages ||
          1;
        total =
          ((response as any).pagination && (response as any).pagination.totalItems) ||
          (response as any).total ||
          data.length;
      } else if ((response as any).data && Array.isArray((response as any).data)) {
        data = (response as any).data;
        page = (response as any).page || (response as any).pagination?.currentPage || currentPage;
        totalPages =
          (response as any).totalPages || (response as any).pagination?.totalPages || 1;
        total =
          (response as any).total || (response as any).pagination?.totalItems || data.length;
      } else if ((response as any).members && Array.isArray((response as any).members)) {
        data = (response as any).members;
      } else {
        for (const k of Object.keys(response)) {
          if (Array.isArray((response as any)[k])) {
            data = (response as any)[k];
            break;
          }
        }
      }

      console.log("🔄 Starting to map", data.length, "team members");
      
      const mapped = data.map((m: any, index: number) => {
        console.log(`🔄 Mapping member ${index + 1}:`, m);
        
        const rawRole = (m.role || "").toString();
        const roleCapitalized = rawRole
          ? rawRole.charAt(0).toUpperCase() + rawRole.slice(1)
          : "";
        const rawStatus = (m.status || "active").toString().toLowerCase();
        const status = rawStatus === "active" ? "Active" : "Inactive";
        const joining =
          m.dateJoined ||
          m.joiningDate ||
          (m.joiningDate
            ? new Date(m.joiningDate).toISOString().split("T")[0]
            : null);
            
        const mappedMember = {
          id: m.id || m._id || m.memberId || String(m._id || m.id || ""),
          name: m.name || m.fullName || "",
          role: roleCapitalized,
          email: m.email || "",
          phone: m.phone || m.phonenumber || "",
          dateJoined: joining || null,
          lastActive: m.lastActive || null,
          status,
          avatar: m.avatar || m.profilePicture || null,
        } as TeamMember;
        
        console.log(`✅ Mapped member ${index + 1}:`, mappedMember);
        return mappedMember;
      });
      
      console.log("📋 All mapped team members:", mapped);

      console.log("📊 Setting team members state with", mapped.length, "members");
      setTeamMembers(mapped);
      console.log(mapped, "TEAM");
      
      const paginationData = {
        currentPage: page,
        totalPages: totalPages || 1,
        totalItems: total || mapped.length,
      };
      
      console.log("📊 Setting pagination state:", paginationData);
      setPagination(paginationData);
      
      // Add a small delay to check if state was actually updated
      setTimeout(() => {
        console.log("🔍 State check - Current teamMembers length:", teamMembers.length);
        console.log("🔍 State check - Current teamMembers:", teamMembers);
      }, 100);
    } catch (error: unknown) {
      console.error("Error fetching team members:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

      toast({
        title: "Error",
        description: errorMessage.includes("Authentication")
          ? "Please log in again to access team members."
          : "Failed to fetch team members",
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
          status:
            formData.status === "active" || formData.status === "Active"
              ? "Active"
              : "Inactive",
        };
        await apiUpdateTeamMember(token, editingMember.id, updateData);
        toast({
          title: "Success",
          description: "Team member updated successfully!",
        });
      } else {
        // Add new member
        await apiCreateTeamMember(token, formData);
        toast({
          title: "Success",
          description: "Team member added successfully!",
        });
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
      console.error("Error saving team member:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

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
    if (window.confirm("Are you sure you want to delete this team member?")) {
      try {
        const token = Cookies.get("authToken") || undefined;
        await apiDeleteTeamMember(token, id);
        toast({
          title: "Success",
          description: "Team member deleted successfully!",
        });
        fetchTeamMembers();
      } catch (error) {
        console.error("Error deleting team member:", error);
        toast({
          title: "Error",
          description: "Failed to delete team member. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  // Handle import
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [".csv", ".xlsx", ".xls"];
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();

    if (!validTypes.includes(fileExtension)) {
      toast({
        title: "Error",
        description:
          "Only CSV and Excel files (.csv, .xlsx, .xls) are supported",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (optional - e.g., 10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      toast({
        title: "Error",
        description: "File size must be less than 10MB",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const token = Cookies.get("authToken") || undefined;

      toast({
        title: "Importing...",
        description: "Please wait while we import your team members",
      });

      const response = await apiImportTeamMembers(token, file);

      toast({
        title: "Success",
        description: response.message || "Team members imported successfully!",
      });

      // Refresh the team members list
      await fetchTeamMembers();

      // Reset the file input
      event.target.value = "";
    } catch (error) {
      console.error("Error importing team members:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

      toast({
        title: "Import Failed",
        description: errorMessage,
        variant: "destructive",
      });

      // Reset the file input even on error
      event.target.value = "";
    } finally {
      setLoading(false);
    }
  };

  // Handle export

  const handleExport = async (format: "csv" | "excel" | "pdf") => {
    try {
      setLoading(true);
      const token = Cookies.get("authToken") || undefined;

      toast({
        title: "Exporting...",
        description: `Preparing ${format.toUpperCase()} export, please wait...`,
      });

      const response = await apiExportTeamMembers(token, format);

      // Convert response to blob
      const blob = await response.blob();

      // Get filename from Content-Disposition header or use default
      const contentDisposition =
        response.headers.get("content-disposition") || "";
      let filename = getExportFilename(format);

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(
          /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/,
        );
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, "");
        }
      }

      // Download the file
      downloadBlob(blob, filename);

      toast({
        title: "Export Successful",
        description: `Team members exported as ${format.toUpperCase()} successfully!`,
      });
    } catch (error) {
      console.error("Error exporting team members:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

      let userMessage = errorMessage;
      if (errorMessage.includes("No team members found")) {
        userMessage =
          "No team members available to export. Add some team members first.";
      }

      toast({
        title: "Export Failed",
        description: userMessage,
        variant: "destructive",
      });
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
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  return (
    <div className="bg-background min-h-screen p-4 lg:p-8">
      {/* Locked Features Overlay */}
      {/* <div className="flex h-[70vh] items-center justify-center">
        <Card className="border-border w-full max-w-md rounded-2xl border bg-white shadow-lg">
          <CardContent className="space-y-4 p-8 text-center">
            <div className="flex justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-14 w-14 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V7.5a4.5 4.5 0 00-9 0v3m-3 0h15a1.5 1.5 0 011.5 1.5v7.5a1.5 1.5 0 01-1.5 1.5h-15a1.5 1.5 0 01-1.5-1.5v-7.5a1.5 1.5 0 011.5-1.5z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold">Locked Feature</h2>

            <p className="text-muted-foreground text-base">
              This feature is currently unavailable. Please check back later or
              upgrade to unlock access.
            </p>

            <Button disabled variant="secondary" className="mt-4 w-full">
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div> */}

      <div className="max-w-8xl mx-auto">
        <Card className="border-0 bg-white shadow-sm">
          {!showAddForm ? (
            <>
              {/* Header */}
              <div className="border-b border-slate-200 p-4 lg:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <h2 className="text-xl font-semibold text-slate-800">
                    Team Member List
                  </h2>

                  <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
                    {/* Search */}
                    <div className="relative flex-1 lg:w-80">
                      <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-slate-400" />
                      <Input
                        placeholder="Search by name, email, or role"
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="h-10 border-slate-200 bg-white pl-10 text-slate-600"
                      />
                    </div>

                    {/* Desktop/Tablet Actions */}
                    <div className="hidden flex-wrap gap-2 sm:flex">
                      <div>
                        <div className="hidden sm:block">
                          <SingleDatePicker
                            selectedDate={selectedDate}
                            onDateChange={setSelectedDate}
                          />
                        </div>
                        <div className="sm:hidden">
                          <SingleDatePicker
                            selectedDate={selectedDate}
                            onDateChange={setSelectedDate}
                            iconOnly
                          />
                        </div>
                      </div>
                      {/* Export Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            className={`h-10 border-slate-200 px-4 text-slate-600 hover:bg-slate-50 hover:text-black`}
                            disabled={loading}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            {"Export"}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-white text-black hover:bg-slate-50 hover:text-black">
                          <DropdownMenuItem
                            onClick={() => handleExport("csv")}
                            disabled={loading}
                            className={
                              loading ? "cursor-not-allowed opacity-50" : ""
                            }
                          >
                            Export as CSV
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleExport("excel")}
                            disabled={loading}
                            className={
                              loading ? "cursor-not-allowed opacity-50" : ""
                            }
                          >
                            Export as Excel
                          </DropdownMenuItem>
                          {/* <DropdownMenuItem
                            onClick={() => handleExport('pdf')}
                            disabled={loading}
                            className={loading ? 'opacity-50 cursor-not-allowed' : ''}
                          >
                            Export as PDF
                          </DropdownMenuItem> */}
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <div className="relative">
                        <label>
                          <input
                            type="file"
                            accept=".csv,.xlsx"
                            onChange={handleImport}
                            className="hidden"
                          />
                          <Button
                            asChild
                            variant="outline"
                            className="h-10 cursor-pointer border-slate-200 px-4 text-slate-600 hover:bg-slate-50 hover:text-black"
                          >
                            <span className="flex items-center">
                              <Upload className="mr-2 h-4 w-4" />
                              Import
                            </span>
                          </Button>
                        </label>
                      </div>

                      <Button
                        className="rounded-lg bg-gradient-to-b from-[#B5A3FF] via-[#785FDA] to-[#9F91D8] px-4 py-2 text-white"
                        onClick={() => setShowAddForm(true)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add New Member
                      </Button>
                    </div>

                    {/* Mobile Actions */}
                    <div className="no-scrollbar flex flex-nowrap items-center gap-2 overflow-x-auto sm:hidden">
                      <Button
                        variant="outline"
                        size="icon"
                        className="shrink-0"
                      >
                        <Calendar className="h-5 w-5" />
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className={`shrink-0`}
                            disabled={loading}
                          >
                            <Download className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={() => handleExport("csv")}
                            disabled={loading}
                          >
                            CSV
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleExport("excel")}
                            disabled={loading}
                          >
                            Excel
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleExport("pdf")}
                            disabled={loading}
                          >
                            PDF
                          </DropdownMenuItem>
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
                          <Button
                            variant="outline"
                            size="icon"
                            className="shrink-0 cursor-pointer"
                          >
                            <Upload className="h-5 w-5" />
                          </Button>
                        </label>
                      </div>

                      <Button
                        size="icon"
                        className="shrink-0 bg-gradient-to-b from-[#B5A3FF] via-[#785FDA] to-[#9F91D8] text-white"
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
                  <div className="p-8 text-center text-slate-500">
                    Loading team members...
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-slate-200 bg-slate-50">
                        <TableHead className="px-6 py-4 font-semibold text-slate-700">
                          Name
                        </TableHead>
                        <TableHead className="px-6 py-4 font-semibold text-slate-700">
                          Role
                        </TableHead>
                        <TableHead className="hidden px-6 py-4 font-semibold text-slate-700 sm:table-cell">
                          Email
                        </TableHead>
                        <TableHead className="hidden px-6 py-4 font-semibold text-slate-700 md:table-cell">
                          Phone No.
                        </TableHead>
                        <TableHead className="hidden px-6 py-4 font-semibold text-slate-700 lg:table-cell">
                          Date Joined
                        </TableHead>
                        <TableHead className="hidden px-6 py-4 font-semibold text-slate-700 lg:table-cell">
                          Last Active
                        </TableHead>
                        <TableHead className="px-6 py-4 font-semibold text-slate-700">
                          Status
                        </TableHead>
                        <TableHead className="px-6 py-4 font-semibold text-slate-700">
                          Action
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(() => {
                        console.log("🎯 Render condition check - teamMembers.length:", teamMembers.length);
                        console.log("🎯 Render condition check - showing empty?", teamMembers.length === 0);
                        return teamMembers.length === 0;
                      })() ? (
                        <TableRow>
                          <TableCell
                            colSpan={8}
                            className="py-8 text-center text-slate-500"
                          >
                            No team members found
                          </TableCell>
                        </TableRow>
                      ) : (
                        (() => {
                          console.log("🎯 Rendering team members list with", teamMembers.length, "members");
                          return teamMembers.map((member, index) => {
                            console.log(`🎯 Rendering member ${index + 1}:`, member.name);
                            return (
                          <TableRow
                            key={member.id}
                            className="border-b border-slate-100 hover:bg-slate-50"
                          >
                            <TableCell className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage
                                    src={member.avatar}
                                    alt={member.name}
                                  />
                                  <AvatarFallback className="bg-indigo-100 font-semibold text-indigo-600">
                                    {member.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium text-slate-800">
                                  {member.name}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="px-6 py-4 text-slate-600">
                              {member.role}
                            </TableCell>
                            <TableCell className="hidden px-6 py-4 text-slate-600 sm:table-cell">
                              {member.email}
                            </TableCell>
                            <TableCell className="hidden px-6 py-4 text-slate-600 md:table-cell">
                              {member.phone}
                            </TableCell>
                            <TableCell className="hidden px-6 py-4 text-slate-600 lg:table-cell">
                              {member.dateJoined}
                            </TableCell>
                            <TableCell className="hidden px-6 py-4 text-slate-600 lg:table-cell">
                              {member.lastActive}
                            </TableCell>
                            <TableCell className="px-6 py-4">
                              <Badge
                                variant={
                                  member.status === "Active"
                                    ? "secondary"
                                    : "destructive"
                                }
                                className={
                                  member.status === "Active"
                                    ? "border-emerald-200 bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                                    : "border-red-200 bg-red-100 text-red-700 hover:bg-red-100"
                                }
                              >
                                {member.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-6 py-4">
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
                            );
                          });
                        })()
                      )}
                    </TableBody>
                  </Table>
                )}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 p-4 sm:flex-row lg:p-6">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Previous</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {Array.from(
                      { length: Math.min(pagination.totalPages, 5) },
                      (_, i) => i + 1,
                    ).map((page) => (
                      <Button
                        key={page}
                        variant={page === currentPage ? "default" : "outline"}
                        size="sm"
                        className={
                          page === currentPage
                            ? "bg-indigo-500 text-white"
                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        }
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
                <h2 className="mb-8 text-xl font-semibold text-slate-800">
                  {editingMember ? "Edit Team Member" : "Add New Member"}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name and Role Row */}
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="space-y-2">
                      <Label
                        htmlFor="name"
                        className="text-sm font-medium text-slate-700"
                      >
                        Name
                      </Label>
                      <Input
                        id="name"
                        placeholder="New Member Name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="h-12 border-slate-200 text-slate-600 placeholder:text-slate-400"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="role"
                        className="text-sm font-medium text-slate-700"
                      >
                        Role
                      </Label>
                      <Select
                        value={formData.role}
                        onValueChange={(value) =>
                          setFormData({ ...formData, role: value })
                        }
                      >
                        <SelectTrigger className="h-12 w-full border-slate-200 text-slate-600">
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
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className="text-sm font-medium text-slate-700"
                      >
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="EmailAddress@123gmail.com"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="h-12 border-slate-200 text-slate-600 placeholder:text-slate-400"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="joiningDate"
                        className="text-sm font-medium text-slate-700"
                      >
                        Joining Date
                      </Label>
                      <Input
                        id="joiningDate"
                        type="date"
                        value={formData.joiningDate || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            joiningDate: e.target.value,
                          })
                        }
                        className="h-12 border-slate-200 text-slate-600"
                        required
                      />
                    </div>
                  </div>

                  {/* Phone and Status Row */}
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="space-y-2">
                      <Label
                        htmlFor="phone"
                        className="text-sm font-medium text-slate-700"
                      >
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        placeholder="+ 91 855 **** 987"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="h-12 border-slate-200 text-slate-600 placeholder:text-slate-400"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="status"
                        className="text-sm font-medium text-slate-700"
                      >
                        Status
                      </Label>
                      <Select
                        value={formData.status || ""}
                        onValueChange={(value) =>
                          setFormData({ ...formData, status: value })
                        }
                      >
                        <SelectTrigger className="h-12 w-full border-slate-200 text-slate-600">
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
                    <Label className="text-sm font-medium text-slate-700">
                      Profile Picture Upload
                    </Label>
                    <div className="relative flex h-32 cursor-pointer items-center justify-center border-2 border-dashed border-slate-300 text-slate-400">
                      <input
                        type="file"
                        accept=".png,.jpg,.jpeg,.webp,.pdf"
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            profilePicture: e.target.files?.[0] || null,
                          })
                        }
                        className="absolute h-full w-full cursor-pointer opacity-0"
                      />
                      <div className="text-center">
                        Upload <br />
                        <span className="text-xs text-slate-400">
                          Only PNG, JPG, PDF, WEBP files are supported
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-4 pt-6 sm:flex-row">
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
                      className="h-12 flex-1 cursor-pointer border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-gray-800"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="h-12 flex-1 cursor-pointer bg-indigo-500 text-white hover:bg-indigo-600 disabled:opacity-50"
                    >
                      {loading
                        ? "Saving..."
                        : editingMember
                          ? "Update"
                          : "Save"}
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
