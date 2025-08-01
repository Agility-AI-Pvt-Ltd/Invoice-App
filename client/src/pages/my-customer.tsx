import { useEffect, useState } from "react";
import { customer as allCustomers } from "@/lib/mock/customer";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
} from "@/components/ui/pagination";
import { MoreVertical, MoveLeft, MoveRight, Pencil, Trash2 } from "lucide-react";
import MultiStepForm from "./add-customer";

const ITEMS_PER_PAGE = 10;

export default function CustomerDashboard() {
    const [page, setPage] = useState(1);
    const [customers, setCustomers] = useState([]);
    const [showAddCustomerForm, setShowAddCustomerForm] = useState(false);

    useEffect(() => {
        const start = (page - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        const paginated = allCustomers.data.slice(start, end);
        setCustomers(paginated);
    }, [page]);
    
    const totalPages = allCustomers.pagination.totalPages;
    
    if (showAddCustomerForm) {
        // 🚀 Replace full card when form is shown
        return (
            <Card className="max-w-full p-4 sm:p-6 bg-white mx-2 sm:mx-4">
                    <p className="font-semibold text-2xl ">Add New Customer</p>
                <CardContent className="mt-2">
                    <MultiStepForm onCancel={() => setShowAddCustomerForm(false)} />
                </CardContent>
            </Card>
        );
    }
    return (
        <Card className="max-w-full p-4 sm:p-6 bg-white mx-2 sm:mx-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4 sm:mt-6 ml-2 sm:ml-6 mr-2 sm:mr-6">
                <div>
                    <h2 className="text-xl sm:text-2xl font-semibold">Customers List</h2>
                    <p className="text-gray-500 text-sm">Total 89.5k</p>
                </div>
                <div className="flex flex-wrap gap-2">

                    <Button
                        variant="outline"
                        className="text-blue-500 hover:text-blue-600 shadow-sm"
                        onClick={() => setShowAddCustomerForm(true)}
                    >
                        Add Customer
                    </Button>

                    <Button variant="outline">Filter</Button>
                    <Button variant="ghost" size="icon">
                        <MoreVertical className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            <CardContent className="overflow-x-auto mt-4">
                {/* {showAddCustomerForm ? (
                    // <MultiStepForm onCancel={() => setShowAddCustomerForm(false)} />

                ) : ( */}
                    <>
                        <div className="min-w-[750px]">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Company Name</TableHead>
                                        <TableHead>Customer Name</TableHead>
                                        <TableHead>Phone Number</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Last Invoice Date</TableHead>
                                        <TableHead>Outstanding Balance</TableHead>
                                        <TableHead>Download</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {customers.map((c, i) => (
                                        <TableRow key={i}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Avatar>
                                                        <AvatarImage src={c.company.logo} />
                                                        <AvatarFallback>{c.company.name[0]}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-medium">{c.company.name}</p>
                                                        <p className="text-sm text-gray-500">{c.company.email}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Avatar>
                                                        <AvatarImage src={c.customer.avatar} />
                                                        <AvatarFallback>{c.customer.name[0]}</AvatarFallback>
                                                    </Avatar>
                                                    <p>{c.customer.name}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>{c.phone}</TableCell>
                                            <TableCell>
                                                <span
                                                    className={`px-3 py-1 rounded-full text-sm font-medium ${c.status === "Active"
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-red-300 text-red-800"
                                                        }`}
                                                >
                                                    {c.status}
                                                </span>
                                            </TableCell>
                                            <TableCell>{c.lastInvoice}</TableCell>
                                            <TableCell className="font-semibold">{c.balance}</TableCell>
                                            <TableCell className="flex gap-2">
                                                <Button size="icon" variant="outline" className="h-8 w-8 p-1">
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon" variant='outline' className="h-8 w-8 p-1 ">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        <Pagination className="mt-6 justify-center sm:justify-end">
                            <PaginationContent className="gap-2 px-2 sm:px-4 py-2">
                                {/* Previous Button */}
                                <PaginationItem>
                                    <PaginationLink
                                        href="#"
                                        onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                                        isActive={false}
                                        className={`px-6 sm:px-14 py-2 ${page === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
                                    >
                                        <MoveLeft /> Previous
                                    </PaginationLink>
                                </PaginationItem>

                                {[page, page + 1, page + 2].map((pageNum) => {
                                    if (pageNum > totalPages) return null;
                                    return (
                                        <PaginationItem key={pageNum}>
                                            <PaginationLink
                                                href="#"
                                                isActive={page === pageNum}
                                                onClick={() => setPage(pageNum)}
                                                className={`px-4 py-2 ${page === pageNum ? "bg-blue-500 text-white rounded" : ""
                                                    } hover:bg-blue-600 hover:text-black`}
                                            >
                                                {pageNum}
                                            </PaginationLink>
                                        </PaginationItem>
                                    );
                                })}

                                {page + 2 < totalPages && (
                                    <>
                                        <PaginationItem>
                                            <PaginationEllipsis className="px-3 py-2" />
                                        </PaginationItem>
                                        <PaginationItem>
                                            <PaginationLink
                                                href="#"
                                                isActive={page === totalPages}
                                                onClick={() => setPage(totalPages)}
                                                className="px-4 py-2"
                                            >
                                                {totalPages}
                                            </PaginationLink>
                                        </PaginationItem>
                                    </>
                                )}

                                {/* Next Button */}
                                <PaginationItem>
                                    <PaginationLink
                                        href="#"
                                        onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                                        className={`px-4 sm:px-6 py-2 ${page === totalPages ? "opacity-50 cursor-not-allowed" : ""}`}
                                    >
                                        Next <MoveRight />
                                    </PaginationLink>
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </>
                {/* )} */}
            </CardContent>
        </Card>

    );
}
