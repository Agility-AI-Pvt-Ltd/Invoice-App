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

import { getTeamMembers, type TeamMember } from "@/services/api/team";
import { useToast } from "@/hooks/use-toast";
import Cookies from "js-cookie";

import Cookies from "js-cookie";

// Team API Service
const API_BASE_URL = 'https://invoice-backend-604217703209.asia-south1.run.app/api'; // Your actual backend URL

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  dateJoined: string;
  lastActive: string;
  status: string;
  avatar: string;
}

interface TeamMemberCreate {
  name: string;
  role: string;
  email: string;
  phone: string;
  joiningDate: string;
  status: string;
}

interface TeamMemberUpdate {
  name?: string;
  role?: string;
  email?: string;
  phone?: string;
  joiningDate?: string;
  status?: string;
}

interface TeamMembersResponse {
  success: boolean;
  data: TeamMember[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
}

// Team API functions
const teamAPI = {
  // Get all team members with pagination and filters
  getTeamMembers: async (params?: {
    search?: string;
    page?: number;
    limit?: number;
    status?: string;
    role?: string;
  }): Promise<TeamMembersResponse> => {
    try {
      // Get auth token from cookies
      const token = Cookies.get('authToken');
      
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      const response = await fetch(`${API_BASE_URL}/team-members?${new URLSearchParams(params as Record<string, string>)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.status === 401) {
        throw new Error('Authentication expired. Please log in again.');
      }
      
      if (response.status === 403) {
        throw new Error('Access forbidden. You do not have permission to access team members.');
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Add new team member
  addTeamMember: async (memberData: TeamMemberCreate): Promise<{ success: boolean }> => {
    try {
      // Get auth token from cookies
      const token = Cookies.get('authToken');
      
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      const response = await fetch(`${API_BASE_URL}/team-members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(memberData),
      });
      
      if (response.status === 401) {
        throw new Error('Authentication expired. Please log in again.');
      }
      
      if (response.status === 403) {
        throw new Error('Access forbidden. You do not have permission to add team members.');
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Update team member
  updateTeamMember: async (id: string, memberData: TeamMemberUpdate): Promise<{ success: boolean }> => {
    try {
      // Get auth token from cookies
      const token = Cookies.get('authToken');
      
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      const response = await fetch(`${API_BASE_URL}/team-members/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(memberData),
      });
      
      if (response.status === 401) {
        throw new Error('Authentication expired. Please log in again.');
      }
      
      if (response.status === 403) {
        throw new Error('Access forbidden. You do not have permission to update team members.');
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Delete team member
  deleteTeamMember: async (id: string): Promise<{ success: boolean }> => {
    try {
      // Get auth token from cookies
      const token = Cookies.get('authToken');
      
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      const response = await fetch(`${API_BASE_URL}/team-members/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.status === 401) {
        throw new Error('Authentication expired. Please log in again.');
      }
      
      if (response.status === 403) {
        throw new Error('Access forbidden. You do not have permission to delete team members.');
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Import team members from file
  importTeamMembers: async (file: File): Promise<{ success: boolean }> => {
    try {
      // Get auth token from cookies
      const token = Cookies.get('authToken');
      
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${API_BASE_URL}/team-members/import`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (response.status === 401) {
        throw new Error('Authentication expired. Please log in again.');
      }
      
      if (response.status === 403) {
        throw new Error('Access forbidden. You do not have permission to import team members.');
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Export team members
  exportTeamMembers: async (format: 'csv' | 'excel' | 'pdf'): Promise<{ success: boolean }> => {
    try {
      // Get auth token from cookies
      const token = Cookies.get('authToken');
      
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      const response = await fetch(`${API_BASE_URL}/team-members/export?format=${format}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.status === 401) {
        throw new Error('Authentication expired. Please log in again.');
      }
      
      if (response.status === 403) {
        throw new Error('Access forbidden. You do not have permission to export team members.');
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `team_members.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
};


export default function TeamManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  //@ts-ignore
  const [loading, setLoading] = useState(true);
  //@ts-ignore
  const [totalMembers, setTotalMembers] = useState(0);
  //@ts-ignore
  const [totalPages, setTotalPages] = useState(0);
  const { toast } = useToast();


  const [formData, setFormData] = useState({

  const [loading, setLoading] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });
  const [formData, setFormData] = useState<TeamMemberCreate>({

    name: "",
    role: "",
    email: "",
    phone: "",
    joiningDate: "",
    status: ""
  });


  const token = Cookies.get('authToken') || "";
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        setLoading(true);
        const token = Cookies.get("authToken") || "";
        const response = await getTeamMembers(token, currentPage, 10, {
          search: searchTerm || undefined,
        });

        // match updated return format from getTeamMembers
        setTeamMembers(response.data || []);
        setTotalMembers(response.total || 0);
        setTotalPages(response.totalPages || 0);
      } catch (error) {
        console.error("Error fetching team members:", error);
        toast({
          title: "Error",
          description: "Failed to fetch team members",
          variant: "destructive",
        });
        setTeamMembers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, [token, currentPage, searchTerm, toast]);

  // const handleSearch = (value: string) => {
  //   setSearchTerm(value);
  //   setCurrentPage(1); // Reset to first page when searching
  // };

  // const handlePageChange = (page: number) => {
  //   setCurrentPage(page);
  // };

  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  // Helper function to check if user is authenticated
  const isAuthenticated = () => {
    const token = Cookies.get('authToken');
    console.log('Auth token found:', !!token, 'Token length:', token ? token.length : 0);
    return !!token;
  };

  // Fetch team members on component mount and when filters change
  useEffect(() => {
    if (isAuthenticated()) {
      fetchTeamMembers();
    } else {
      // Show mock data if not authenticated
      setTeamMembers(mockTeamMembers);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalItems: mockTeamMembers.length
      });
    }
  }, [currentPage, searchTerm]);

  // Temporary mock data for testing when backend is not available
  const mockTeamMembers: TeamMember[] = [
    {
      id: "1",
      name: "John Doe",
      role: "Manager",
      email: "john@example.com",
      phone: "+91 9876543210",
      dateJoined: "2024-01-15",
      lastActive: "2024-12-19",
      status: "Active",
      avatar: ""
    },
    {
      id: "2",
      name: "Jane Smith",
      role: "Admin",
      email: "jane@example.com",
      phone: "+91 9876543211",
      dateJoined: "2024-02-20",
      lastActive: "2024-12-19",
      status: "Active",
      avatar: ""
    },
    {
      id: "3",
      name: "Mike Johnson",
      role: "Accountant",
      email: "mike@example.com",
      phone: "+91 9876543212",
      dateJoined: "2024-03-10",
      lastActive: "2024-12-18",
      status: "Inactive",
      avatar: ""
    }
  ];

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const response = await teamAPI.getTeamMembers({
        search: searchTerm,
        page: currentPage,
        limit: 10
      });
      
      if (response.success) {
        setTeamMembers(response.data);
        setPagination(response.pagination);
      }
    } catch (error: unknown) {
      console.error('Error fetching team members:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      if (errorMessage.includes('Authentication token not found')) {
        alert('Please log in again to access team members.');
        // Redirect to login or show login modal
        // window.location.href = '/login';
      } else if (errorMessage.includes('Authentication expired')) {
        alert('Your session has expired. Please log in again.');
        // Redirect to login or show login modal
        // window.location.href = '/login';
      } else if (errorMessage.includes('Access forbidden')) {
        alert('You do not have permission to access team members. Please contact your administrator.');
        // Fallback to mock data for demo purposes
        setTeamMembers(mockTeamMembers);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalItems: mockTeamMembers.length
        });
      } else if (errorMessage.includes('Failed to fetch')) {
        alert('Network error. Please check your internet connection.');
        // Fallback to mock data for demo purposes
        setTeamMembers(mockTeamMembers);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalItems: mockTeamMembers.length
        });
      } else {
        alert(`Error: ${errorMessage || 'Failed to fetch team members. Please try again.'}`);
        // Fallback to mock data for demo purposes
        setTeamMembers(mockTeamMembers);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalItems: mockTeamMembers.length
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (editingMember) {
        // Update existing member
        await teamAPI.updateTeamMember(editingMember.id, formData);
        alert('Team member updated successfully!');
      } else {
        // Add new member
        await teamAPI.addTeamMember(formData);
        alert('Team member added successfully!');
      }
      
      // Reset form and refresh data
      setFormData({
        name: "",
        role: "",
        email: "",
        phone: "",
        joiningDate: "",
        status: ""
      });
      setEditingMember(null);
      setShowAddForm(false);
      fetchTeamMembers();
      
    } catch (error: unknown) {
      console.error('Error saving team member:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      if (errorMessage.includes('Access forbidden')) {
        alert('Access denied. Please check if you are logged in or have proper permissions.');
      } else if (errorMessage.includes('Failed to fetch')) {
        alert('Network error. Please check your internet connection.');
      } else {
        alert(`Error: ${errorMessage || 'Failed to save team member. Please try again.'}`);
      }
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
      status: member.status.toLowerCase()
    });
    setShowAddForm(true);
  };

  // Handle delete member
  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this team member?')) {
      try {
        await teamAPI.deleteTeamMember(id);
        alert('Team member deleted successfully!');
        fetchTeamMembers();
      } catch (error) {
        console.error('Error deleting team member:', error);
        alert('Failed to delete team member. Please try again.');
      }
    }
  };

  // Handle import
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setLoading(true);
        await teamAPI.importTeamMembers(file);
        alert('Team members imported successfully!');
        fetchTeamMembers();
      } catch (error) {
        console.error('Error importing team members:', error);
        alert('Failed to import team members. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle export
  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      setLoading(true);
      await teamAPI.exportTeamMembers(format);
      alert(`Team members exported as ${format.toUpperCase()} successfully!`);
    } catch (error) {
      console.error('Error exporting team members:', error);
      alert('Failed to export team members. Please try again.');
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
                        placeholder="Search"

                      <Input 
                        placeholder="Search by name, email, or role"

                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-10 bg-white border-slate-200 text-slate-600 h-10"
                      />
                    </div>


                    {/* Desktop/Tablet Actions (labels) */}

                    
                    {/* Desktop/Tablet Actions */}

                    <div className="hidden sm:flex gap-2 flex-wrap">
                      <Button variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50 h-10 px-4">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Date</span>
                      </Button>


                      <Select>
                        <SelectTrigger className="w-auto min-w-[100px] border-slate-200 text-slate-600 hover:bg-slate-50 h-10">
                          <Download className="h-4 w-4 mr-2" />
                          <SelectValue placeholder="Export" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="csv">CSV</SelectItem>
                          <SelectItem value="excel">Excel</SelectItem>
                          <SelectItem value="pdf">PDF</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select>
                        <SelectTrigger className="w-auto min-w-[100px] border-slate-200 text-slate-600 hover:bg-slate-50 h-10">
                          <Upload className="h-4 w-4 mr-2" />
                          <SelectValue placeholder="Import" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="csv">CSV</SelectItem>
                          <SelectItem value="excel">Excel</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button

                      
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

                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-white">
                          <DropdownMenuItem>Import CSV</DropdownMenuItem>
                          <DropdownMenuItem>Import Excel</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      {/* Add */}
                      <Button

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
                        <TableCell
                          colSpan={8}
                          className="text-center text-slate-500 py-6"
                        >
                          No team members found
                        </TableCell>
                      </TableRow>
                    ) : (
                      teamMembers.map((member) => (
                        <TableRow
                          key={member.id}
                          className="border-b border-slate-100 hover:bg-slate-50"
                        >
                          <TableCell className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={member.avatar} alt={member.name} />
                                <AvatarFallback className="bg-indigo-100 text-indigo-600 font-semibold">
                                  {member.name.split(' ').map((n) => n[0]).join('')}
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
                              <Button variant="ghost" size="icon" className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>

                </Table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 lg:p-6 border-t border-slate-200">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Previous</span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant={currentPage === 1 ? "default" : "outline"}
                    size="sm"
                    className={currentPage === 1 ? "bg-indigo-500 text-white" : "border-slate-200 text-slate-600 hover:bg-slate-50"}
                    onClick={() => setCurrentPage(1)}
                  >
                    1
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-200 text-slate-600 hover:bg-slate-50"
                    onClick={() => setCurrentPage(2)}
                  >
                    2
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-200 text-slate-600 hover:bg-slate-50"
                    onClick={() => setCurrentPage(3)}
                  >
                    3
                  </Button>
                  <span className="text-slate-400 hidden sm:inline">...</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-200 text-slate-600 hover:bg-slate-50 hidden sm:inline-flex"
                  >
                    67
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-200 text-slate-600 hover:bg-slate-50 hidden sm:inline-flex"
                  >
                    68
                  </Button>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="h-4 w-4" />

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
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
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

                <h2 className="text-xl font-semibold text-slate-800 mb-8">Add New Member</h2>

                <form className="space-y-6">

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
                        placeholder="dd/mm/yyyy"
                        value={formData.joiningDate}
                        onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                        className="h-12 border-slate-200 text-slate-600 placeholder:text-slate-400"
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
                      <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                        <SelectTrigger className="h-12 border-slate-200 text-slate-600">
                          <SelectValue placeholder="Active/ Inactive" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
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
                          status: ""
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