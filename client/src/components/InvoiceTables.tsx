// import { useState } from "react";
// import { Card } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Download, Trash, MoreVertical, Edit, Filter, Plus, ChevronLeft, ChevronRight } from "lucide-react";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"
// import { format } from "date-fns";

// interface Invoice {
//   id: string;
//   number: string;
//   customer: string;
//   status: "paid" | "pending" | "overdue";
//   date: string;
//   dueDate: string;
//   amount: string;
// }

// const generateInvoices = (selectedDate: Date): Invoice[] => {
//   const monthMultiplier = selectedDate.getMonth() + 1;
//   const yearSuffix = selectedDate.getFullYear();
//   const baseAmount = 15000 + monthMultiplier * 500;

//   const statuses: Invoice["status"][] = ["paid", "pending", "overdue"];

//   return Array.from({ length: 12 + monthMultiplier }, (_, index) => ({
//     id: `${index + 1}`,
//     number: `INV-${yearSuffix}/${String(index + 1).padStart(3, '0')}`,
//     customer: `Customer ${String.fromCharCode(65 + (index % 26))}`,
//     status: statuses[index % 3],
//     date: format(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), Math.max(1, index + 1)), "dd MMMM yyyy"),
//     dueDate: format(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), Math.max(7, index + 7)), "dd MMMM yyyy"),
//     amount: `₹${(baseAmount + index * 1000).toLocaleString()}`
//   }));
// };

// const getStatusBadge = (status: Invoice["status"]) => {
//   switch (status) {
//     case "paid":
//       return <Badge className="bg-green-50 text-green-600 border-green-200">Paid</Badge>;
//     case "pending":
//       return <Badge className= "bg-yellow-50 text-yellow-600 border-yellow-200">Due in 5 days</Badge>;
//     case "overdue":
//       return <Badge className="bg-red-50 text-red-600 border-red-200">Waiting for Funds</Badge>;
//     default:
//       return <Badge variant="secondary">{status}</Badge>;
//   }
// };

// interface InvoiceTableProps {
//   selectedDate: Date;
// }

// export function InvoiceTable({ selectedDate }: InvoiceTableProps) {
//   const invoices = generateInvoices(selectedDate);
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 10;

//   const totalPages = Math.ceil(invoices.length / itemsPerPage);
//   const startIndex = (currentPage - 1) * itemsPerPage;
//   const endIndex = startIndex + itemsPerPage;
//   const currentInvoices = invoices.slice(startIndex, endIndex);

//   const goToPage = (page: number) => {
//     setCurrentPage(Math.max(1, Math.min(page, totalPages)));
//   };
//   return (
//     <Card className="p-6 bg-white">
//       <div className="space-y-4">
//         <div className="flex items-center justify-between">
//           <h3 className="text-lg font-semibold text-foreground">All Invoices - {format(selectedDate, "MMM yyyy")}</h3>
//           <div className="flex items-center gap-2">
//             <Button variant="outline" size="sm">
//               <Filter className="h-4 w-4 mr-2" />
//               Filter
//             </Button>
//             <Button size="sm">
//               <Plus className="h-4 w-4 mr-2" />
//               New Invoice
//             </Button>
//           </div>
//         </div>

//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead>
//               <tr className="border-b border-border">
//                 <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Invoice Number</th>
//                 <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Customer Name</th>
//                 <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
//                 <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Date</th>
//                 <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Due Date</th>
//                 <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Amount</th>
//                 <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {currentInvoices.map((invoice) => (
//                 <tr key={invoice.id} className="border-b border-border hover:bg-muted/20">
//                   <td className="py-3 px-2 text-sm text-foreground">{invoice.number}</td>
//                   <td className="py-3 px-2">
//                     <div className="flex items-center gap-2">
//                       <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
//                         <span className="text-xs font-medium text-muted-foreground">
//                           {invoice.customer.charAt(0)}
//                         </span>
//                       </div>
//                       <span className="text-sm text-foreground">{invoice.customer}</span>
//                     </div>
//                   </td>
//                   <td className="py-3 px-2">{getStatusBadge(invoice.status)}</td>
//                   <td className="py-3 px-2 text-sm text-foreground">{invoice.date}</td>
//                   <td className="py-3 px-2 text-sm text-foreground">{invoice.dueDate}</td>
//                   <td className="py-3 px-2 text-sm text-foreground">{invoice.amount}</td>
//                   <td className="py-3 px-2 flex items-center space-x-2">
//                 {/* Edit Icon */}
//                   <Button variant="ghost" size="sm">
//                     <Edit className="h-4 w-4" />
//                   </Button>

//                   {/* 3-dot Menu */}
//                   <DropdownMenu>
//                     <DropdownMenuTrigger asChild>
//                       <Button variant="ghost" size="sm">
//                         <MoreVertical className="h-4 w-4" />
//                       </Button>
//                     </DropdownMenuTrigger>
//                     <DropdownMenuContent align="end">
//                       <DropdownMenuItem>
//                         <Download className="mr-2 h-4 w-4" /> Download
//                       </DropdownMenuItem>
//                       <DropdownMenuItem className="text-red-500">
//                         <Trash className="mr-2 h-4 w-4" /> Delete
//                       </DropdownMenuItem>
//                     </DropdownMenuContent>
//                   </DropdownMenu>
//                 </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         <div className="flex items-center justify-between pt-4">
//           <p className="text-sm text-muted-foreground">
//             Showing {startIndex + 1}-{Math.min(endIndex, invoices.length)} of {invoices.length} results
//           </p>
//           <div className="flex items-center gap-2">
//             <Button 
//               variant="outline" 
//               size="sm" 
//               onClick={() => goToPage(currentPage - 1)}
//               disabled={currentPage === 1}
//             >
//               <ChevronLeft className="h-4 w-4 mr-1" />
//               Previous
//             </Button>

//             {/* Page Numbers */}
//             <div className="flex items-center gap-1">
//               {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
//                 <Button
//                   key={page}
//                   variant={currentPage === page ? "default" : "outline"}
//                   size="sm"
//                   onClick={() => goToPage(page)}
//                   className="w-8 h-8 p-0"
//                 >
//                   {page}
//                 </Button>
//               ))}
//             </div>

//             <Button 
//               variant="outline" 
//               size="sm" 
//               onClick={() => goToPage(currentPage + 1)}
//               disabled={currentPage === totalPages}
//             >
//               Next
//               <ChevronRight className="h-4 w-4 ml-1" />
//             </Button>
//           </div>
//         </div>
//       </div>
//     </Card>
//   );
// }







// import { useState } from "react";
// import { Card } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Download, Trash, MoreVertical, Edit, ChevronLeft, ChevronRight } from "lucide-react";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { format } from "date-fns";

// interface Invoice {
//   id: string;
//   number: string;
//   customer: string;
//   status: "paid" | "pending" | "overdue";
//   date: string;
//   dueDate: string;
//   amount: string;
// }

// const generateInvoices = (selectedDate: Date): Invoice[] => {
//   const monthMultiplier = selectedDate.getMonth() + 1;
//   const yearSuffix = selectedDate.getFullYear();
//   const baseAmount = 15000 + monthMultiplier * 500;
//   const statuses: Invoice["status"][] = ["paid", "pending", "overdue"];

//   return Array.from({ length: 12 + monthMultiplier }, (_, index) => ({
//     id: `${index + 1}`,
//     number: `INV-${yearSuffix}/${String(index + 1).padStart(3, '0')}`,
//     customer: `Customer ${String.fromCharCode(65 + (index % 26))}`,
//     status: statuses[index % 3],
//     date: format(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), Math.max(1, index + 1)), "dd MMMM yyyy"),
//     dueDate: format(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), Math.max(7, index + 7)), "dd MMMM yyyy"),
//     amount: `₹${(baseAmount + index * 1000).toLocaleString()}`
//   }));
// };

// const getStatusBadge = (status: Invoice["status"]) => {
//   switch (status) {
//     case "paid":
//       return <Badge className="bg-green-50 text-green-600 border-green-200">Paid</Badge>;
//     case "pending":
//       return <Badge className="bg-yellow-50 text-yellow-600 border-yellow-200">Due in 5 days</Badge>;
//     case "overdue":
//       return <Badge className="bg-red-50 text-red-600 border-red-200">Waiting for Funds</Badge>;
//     default:
//       return <Badge variant="secondary">{status}</Badge>;
//   }
// };

// interface InvoiceTableProps {
//   selectedDate: Date;
// }

// export function InvoiceTable({ selectedDate }: InvoiceTableProps) {
//   const allInvoices = generateInvoices(selectedDate);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [activeStatusFilter, setActiveStatusFilter] = useState<"all" | "pending" | "paid" | "overdue">("all");
//   const itemsPerPage = 10;

//   // Filter logic
//   const filteredInvoices = activeStatusFilter === "all"
//     ? allInvoices
//     : allInvoices.filter(inv => inv.status === activeStatusFilter);

//   const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
//   const startIndex = (currentPage - 1) * itemsPerPage;
//   const endIndex = startIndex + itemsPerPage;
//   const currentInvoices = filteredInvoices.slice(startIndex, endIndex);

//   const goToPage = (page: number) => {
//     setCurrentPage(Math.max(1, Math.min(page, totalPages)));
//   };

//   const filterButtons: { label: string, value: "all" | "pending" | "paid" | "overdue" }[] = [
//     { label: "All", value: "all" },
//     { label: "Pending", value: "pending" },
//     { label: "Paid", value: "paid" },
//     { label: "Overdue", value: "overdue" }
//   ];

//   return (
//     <Card className="p-6 bg-white">
//       <div className="space-y-4">
//         {/* Header with Filters */}
//         <div className="flex items-center justify-between flex-wrap gap-3">
//           <h3 className="text-lg font-semibold text-foreground">
//             All Invoices - {format(selectedDate, "MMM yyyy")}
//           </h3>

//           <div className="flex items-center flex-wrap gap-2">
//             {filterButtons.map(btn => (
//               <Button
//                 key={btn.value}
//                 variant={activeStatusFilter === btn.value ? "default" : "outline"}
//                 size="sm"
//                 onClick={() => {
//                   setActiveStatusFilter(btn.value);
//                   setCurrentPage(1);
//                 }}
//               >
//                 {btn.label}
//               </Button>
//             ))}
//           </div>
//         </div>

//         {/* Table */}
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead>
//               <tr className="border-b border-border">
//                 <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Invoice Number</th>
//                 <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Customer Name</th>
//                 <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
//                 <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Date</th>
//                 <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Due Date</th>
//                 <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Amount</th>
//                 <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {currentInvoices.map((invoice) => (
//                 <tr key={invoice.id} className="border-b border-border hover:bg-muted/20">
//                   <td className="py-3 px-2 text-sm text-foreground">{invoice.number}</td>
//                   <td className="py-3 px-2">
//                     <div className="flex items-center gap-2">
//                       <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
//                         <span className="text-xs font-medium text-muted-foreground">
//                           {invoice.customer.charAt(0)}
//                         </span>
//                       </div>
//                       <span className="text-sm text-foreground">{invoice.customer}</span>
//                     </div>
//                   </td>
//                   <td className="py-3 px-2">{getStatusBadge(invoice.status)}</td>
//                   <td className="py-3 px-2 text-sm text-foreground">{invoice.date}</td>
//                   <td className="py-3 px-2 text-sm text-foreground">{invoice.dueDate}</td>
//                   <td className="py-3 px-2 text-sm text-foreground">{invoice.amount}</td>
//                   <td className="py-3 px-2 flex items-center space-x-2">
//                     <Button variant="ghost" size="sm">
//                       <Edit className="h-4 w-4" />
//                     </Button>
//                     <DropdownMenu>
//                       <DropdownMenuTrigger asChild>
//                         <Button variant="ghost" size="sm">
//                           <MoreVertical className="h-4 w-4" />
//                         </Button>
//                       </DropdownMenuTrigger>
//                       <DropdownMenuContent align="end">
//                         <DropdownMenuItem>
//                           <Download className="mr-2 h-4 w-4" /> Download
//                         </DropdownMenuItem>
//                         <DropdownMenuItem className="text-red-500">
//                           <Trash className="mr-2 h-4 w-4" /> Delete
//                         </DropdownMenuItem>
//                       </DropdownMenuContent>
//                     </DropdownMenu>
//                   </td>
//                 </tr>
//               ))}
//               {currentInvoices.length === 0 && (
//                 <tr>
//                   <td colSpan={7} className="py-4 text-center text-muted-foreground">
//                     No invoices found for selected filter.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination */}
//         <div className="flex items-center justify-between pt-4">
//           <p className="text-sm text-muted-foreground">
//             Showing {startIndex + 1}-{Math.min(endIndex, filteredInvoices.length)} of {filteredInvoices.length} results
//           </p>
//           <div className="flex items-center gap-2">
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => goToPage(currentPage - 1)}
//               disabled={currentPage === 1}
//             >
//               <ChevronLeft className="h-4 w-4 mr-1" />
//               Previous
//             </Button>

//             <div className="flex items-center gap-1">
//               {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
//                 <Button
//                   key={page}
//                   variant={currentPage === page ? "default" : "outline"}
//                   size="sm"
//                   onClick={() => goToPage(page)}
//                   className="w-8 h-8 p-0"
//                 >
//                   {page}
//                 </Button>
//               ))}
//             </div>

//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => goToPage(currentPage + 1)}
//               disabled={currentPage === totalPages}
//             >
//               Next
//               <ChevronRight className="h-4 w-4 ml-1" />
//             </Button>
//           </div>
//         </div>
//       </div>
//     </Card>
//   );
// }
// import { useState } from "react";
// import { Card } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Download, Trash, MoreVertical, Edit, ChevronLeft, ChevronRight, PlusCircle, ScanLine, Filter, DownloadCloud } from "lucide-react";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { format } from "date-fns";

// interface Invoice {
//   id: string;
//   number: string;
//   customer: string;
//   status: "paid" | "pending" | "overdue";
//   date: string;
//   dueDate: string;
//   amount: string;
// }

// const generateInvoices = (selectedDate: Date): Invoice[] => {
//   const monthMultiplier = selectedDate.getMonth() + 1;
//   const yearSuffix = selectedDate.getFullYear();
//   const baseAmount = 15000 + monthMultiplier * 500;
//   const statuses: Invoice["status"][] = ["paid", "pending", "overdue"];

//   return Array.from({ length: 12 + monthMultiplier }, (_, index) => ({
//     id: `${index + 1}`,
//     number: `INV-${yearSuffix}/${String(index + 1).padStart(3, '0')}`,
//     customer: `Customer ${String.fromCharCode(65 + (index % 26))}`,
//     status: statuses[index % 3],
//     date: format(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), Math.max(1, index + 1)), "dd MMMM yyyy"),
//     dueDate: format(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), Math.max(7, index + 7)), "dd MMMM yyyy"),
//     amount: `₹${(baseAmount + index * 1000).toLocaleString()}`
//   }));
// };

// const getStatusBadge = (status: Invoice["status"]) => {
//   switch (status) {
//     case "paid":
//       return <Badge className="bg-green-50 text-green-600 border-green-200">Paid</Badge>;
//     case "pending":
//       return <Badge className="bg-yellow-50 text-yellow-600 border-yellow-200">Due in 5 days</Badge>;
//     case "overdue":
//       return <Badge className="bg-red-50 text-red-600 border-red-200">Waiting for Funds</Badge>;
//     default:
//       return <Badge variant="secondary">{status}</Badge>;
//   }
// };

// interface InvoiceTableProps {
//   selectedDate: Date;
// }

// export function InvoiceTable({ selectedDate }: InvoiceTableProps) {
//   const allInvoices = generateInvoices(selectedDate);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [activeStatusFilter, setActiveStatusFilter] = useState<"all" | "pending" | "paid" | "overdue">("all");
//   const itemsPerPage = 10;

//   const filteredInvoices = activeStatusFilter === "all"
//     ? allInvoices
//     : allInvoices.filter(inv => inv.status === activeStatusFilter);

//   const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
//   const startIndex = (currentPage - 1) * itemsPerPage;
//   const endIndex = startIndex + itemsPerPage;
//   const currentInvoices = filteredInvoices.slice(startIndex, endIndex);

//   const goToPage = (page: number) => {
//     setCurrentPage(Math.max(1, Math.min(page, totalPages)));
//   };

//   const filterButtons: { label: string, value: "all" | "pending" | "paid" | "overdue" }[] = [
//     { label: "All", value: "all" },
//     { label: "Pending", value: "pending" },
//     { label: "Paid", value: "paid" },
//     { label: "Overdue", value: "overdue" }
//   ];

//   return (
//     <Card className="p-6 bg-white">
//       <div className="space-y-4">
//         {/* Header with Filters and Actions */}
//         <div className="flex items-center justify-between flex-wrap gap-3">
//           <h3 className="text-lg font-semibold text-foreground">
//             All Invoices - {format(selectedDate, "MMM yyyy")}
//           </h3>

//           <div className="flex items-center flex-wrap gap-2">
//             {filterButtons.map(btn => (
//               <Button
//                 key={btn.value}
//                 variant={activeStatusFilter === btn.value ? "default" : "outline"}
//                 size="sm"
//                 onClick={() => {
//                   setActiveStatusFilter(btn.value);
//                   setCurrentPage(1);
//                 }}
//               >
//                 {btn.label}
//               </Button>
//             ))}

//             <Button size="sm" variant="outline">
//               <PlusCircle className="h-4 w-4 mr-2" /> New Invoice
//             </Button>
//             <Button size="sm" variant="outline">
//               <ScanLine className="h-4 w-4 mr-2" /> Scan Invoice
//             </Button>
//             <Button size="sm" variant="outline">
//               <DownloadCloud className="h-4 w-4 mr-2" /> Export CSV
//             </Button>
//             <Button size="sm" variant="outline">
//               <Filter className="h-4 w-4 mr-2" /> Filter
//             </Button>
//           </div>
//         </div>

//         {/* Table */}
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead>
//               <tr className="border-b border-border">
//                 <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Invoice Number</th>
//                 <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Customer Name</th>
//                 <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
//                 <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Date</th>
//                 <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Due Date</th>
//                 <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Amount</th>
//                 <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {currentInvoices.map((invoice) => (
//                 <tr key={invoice.id} className="border-b border-border hover:bg-muted/20">
//                   <td className="py-3 px-2 text-sm text-foreground">{invoice.number}</td>
//                   <td className="py-3 px-2">
//                     <div className="flex items-center gap-2">
//                       <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
//                         <span className="text-xs font-medium text-muted-foreground">
//                           {invoice.customer.charAt(0)}
//                         </span>
//                       </div>
//                       <span className="text-sm text-foreground">{invoice.customer}</span>
//                     </div>
//                   </td>
//                   <td className="py-3 px-2">{getStatusBadge(invoice.status)}</td>
//                   <td className="py-3 px-2 text-sm text-foreground">{invoice.date}</td>
//                   <td className="py-3 px-2 text-sm text-foreground">{invoice.dueDate}</td>
//                   <td className="py-3 px-2 text-sm text-foreground">{invoice.amount}</td>
//                   <td className="py-3 px-2 flex items-center space-x-2">
//                     <Button variant="ghost" size="sm">
//                       <Edit className="h-4 w-4" />
//                     </Button>
//                     <DropdownMenu>
//                       <DropdownMenuTrigger asChild>
//                         <Button variant="ghost" size="sm">
//                           <MoreVertical className="h-4 w-4" />
//                         </Button>
//                       </DropdownMenuTrigger>
//                       <DropdownMenuContent align="end">
//                         <DropdownMenuItem>
//                           <Download className="mr-2 h-4 w-4" /> Download
//                         </DropdownMenuItem>
//                         <DropdownMenuItem className="text-red-500">
//                           <Trash className="mr-2 h-4 w-4" /> Delete
//                         </DropdownMenuItem>
//                       </DropdownMenuContent>
//                     </DropdownMenu>
//                   </td>
//                 </tr>
//               ))}
//               {currentInvoices.length === 0 && (
//                 <tr>
//                   <td colSpan={7} className="py-4 text-center text-muted-foreground">
//                     No invoices found for selected filter.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination */}
//         <div className="flex items-center justify-between pt-4">
//           <p className="text-sm text-muted-foreground">
//             Showing {startIndex + 1}-{Math.min(endIndex, filteredInvoices.length)} of {filteredInvoices.length} results
//           </p>
//           <div className="flex items-center gap-2">
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => goToPage(currentPage - 1)}
//               disabled={currentPage === 1}
//             >
//               <ChevronLeft className="h-4 w-4 mr-1" />
//               Previous
//             </Button>

//             <div className="flex items-center gap-1">
//               {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
//                 <Button
//                   key={page}
//                   variant={currentPage === page ? "default" : "outline"}
//                   size="sm"
//                   onClick={() => goToPage(page)}
//                   className="w-8 h-8 p-0"
//                 >
//                   {page}
//                 </Button>
//               ))}
//             </div>

//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => goToPage(currentPage + 1)}
//               disabled={currentPage === totalPages}
//             >
//               Next
//               <ChevronRight className="h-4 w-4 ml-1" />
//             </Button>
//           </div>
//         </div>
//       </div>
//     </Card>
//   );
// }

import { useState, useEffect } from "react";
import { invoicesAPI, type Invoice as APIInvoice } from "@/services/api/dashboard"; // your API module
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

interface InvoiceTableProps {
  selectedDate: Date;
  setIsInvoiceFormOpen: (val: boolean) => void;
}

export function InvoiceTable({ selectedDate, setIsInvoiceFormOpen }: InvoiceTableProps) {
  const [invoices, setInvoices] = useState<APIInvoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeStatusFilter, setActiveStatusFilter] = useState<"all" | "pending" | "paid" | "overdue">("all");
  const itemsPerPage = 10;

  const fetchInvoices = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await invoicesAPI.getAll({
        status: activeStatusFilter,
        month: selectedDate.getMonth() + 1,
        year: selectedDate.getFullYear(),
        page: currentPage,
        limit: itemsPerPage,
      });
      setInvoices(res.data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [selectedDate, currentPage, activeStatusFilter]);

  const totalPages = Math.ceil(invoices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentInvoices = invoices.slice(startIndex, endIndex);

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

  const downloadCSV = (data: APIInvoice[], filename: string) => {
    const csvRows = [
      ["Invoice Number", "Customer", "Status", "Date", "Due Date", "Amount"],
      ...data.map(inv => [
        inv.invoiceNumber,
        inv.billTo.name,
        inv.status,
        inv.date,
        inv.dueDate || "",
        inv.total || 0,
      ]),
    ];
    const csvContent = csvRows.map(row => row.join(",")).join("\n");
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
      setInvoices(prev => prev.filter(inv => inv._id !== invoiceId));
    } catch (err: any) {
      alert(err.message || "Failed to delete invoice");
    }
  };

  const handleDownload = async (invoiceId: string, invoiceNumber: string) => {
    try {
      const blob = await invoicesAPI.download(invoiceId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      alert(err.message || "Failed to download invoice");
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
            <Button size="sm" variant="ghost">
              <ScanLine className="h-4 w-4 mr-2" /> Scan Invoice
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

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Invoice Number</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Customer Name</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Date</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Due Date</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Amount</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentInvoices.map((invoice) => (
                <tr key={invoice._id} className="border-b border-border hover:bg-muted/20">
                  <td className="py-3 px-2 text-sm text-foreground">{invoice.invoiceNumber}</td>
                  <td className="py-3 px-2">{invoice.billTo.name}</td>
                  <td className="py-3 px-2">{getStatusBadge(invoice.status)}</td>
                  <td className="py-3 px-2 text-sm text-foreground">{invoice.date}</td>
                  <td className="py-3 px-2 text-sm text-foreground">{invoice.dueDate}</td>
                  <td className="py-3 px-2 text-sm text-foreground">₹{invoice.total}</td>
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
                        <DropdownMenuItem onClick={() => handleDownload(invoice._id, invoice.invoiceNumber)}>
                          <Download className="mr-2 h-4 w-4" /> Download
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-500" onClick={() => handleDelete(invoice._id)}>
                          <Trash className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              {currentInvoices.length === 0 && (
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
  );
}
