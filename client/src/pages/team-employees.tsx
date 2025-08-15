import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Search, Calendar, Download, Upload, Plus, Edit, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { getTeamMembers, type TeamMember } from "@/services/api/team";
import { useToast } from "@/hooks/use-toast";
import Cookies from "js-cookie";

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
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-white border-slate-200 text-slate-600 h-10"
                      />
                    </div>

                    {/* Desktop/Tablet Actions (labels) */}
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
                        className="bg-gradient-to-b from-[#B5A3FF] via-[#785FDA] to-[#9F91D8] text-white px-4 py-2 rounded-lg"
                        onClick={() => setShowAddForm(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Member
                      </Button>
                    </div>

                    {/* Mobile Actions (icon-only, single line) */}
                    <div className="sm:hidden flex items-center gap-2 flex-nowrap overflow-x-auto no-scrollbar">
                      <Button variant="outline" size="icon" className="shrink-0">
                        <Calendar className="h-5 w-5" />
                      </Button>
                      {/* Export */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon" className="shrink-0" aria-label="Export">
                            <Download className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-white">
                          <DropdownMenuItem>Export CSV</DropdownMenuItem>
                          <DropdownMenuItem>Export Excel</DropdownMenuItem>
                          <DropdownMenuItem>Export PDF</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      {/* Import */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon" className="shrink-0" aria-label="Import">
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
                        size="icon"
                        className="bg-gradient-to-b from-[#B5A3FF] via-[#785FDA] to-[#9F91D8] text-white shrink-0"
                        onClick={() => setShowAddForm(true)}
                        aria-label="Add Member"
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
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Add New Member Form */}
              <div className="p-6 lg:p-8">
                <h2 className="text-xl font-semibold text-slate-800 mb-8">Add New Member</h2>

                <form className="space-y-6">
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

                  {/* Profile Picture Upload */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Profile Picture Upload</Label>
                    <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center bg-slate-50">
                      <Upload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                      <div className="text-sm text-slate-600 mb-2">
                        <span className="font-medium text-slate-800 cursor-pointer hover:text-indigo-600">Upload</span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Only PNG, JPG, PDF, WEBP<br />
                        files are supported
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddForm(false)}
                      className="flex-1 h-12 border-slate-200 text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 h-12 bg-indigo-500 hover:bg-indigo-600 text-white"
                    >
                      Save
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