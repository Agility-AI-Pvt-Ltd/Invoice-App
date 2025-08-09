import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Filter } from "lucide-react";
import { format } from "date-fns";
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";

// Activity Type
type Activity = {
    description: string;
    type: "Transaction" | "Invoice" | "Access Change";
    user: string;
    date: Date;
    amount?: number;
    status: "Paid" | "Pending" | "Active" | "Refunded" | "Revoked";
};

// Dummy Data
const activities: Activity[] = [
    {
        description: "Payment of ₹12,500 received from Arvind Pvt Ltd",
        type: "Transaction",
        user: "Executive - Simran",
        date: new Date("2025-07-18T10:45:00"),
        amount: 12500,
        status: "Paid",
    },
    {
        description: "Invoice #INV-0932 sent to Orchid Ltd.",
        type: "Invoice",
        user: "CA - Rahul",
        date: new Date("2025-07-18T10:45:00"),
        amount: 12500,
        status: "Pending",
    },
    {
        description: "Access granted to Anita for \"Sales Data\" only",
        type: "Access Change",
        user: "Owner",
        date: new Date("2025-07-18T10:45:00"),
        status: "Active",
    },
    {
        description: "Refund of ₹1,000 issued to Bluewave Pvt Ltd",
        type: "Transaction",
        user: "Executive - Rohan",
        date: new Date("2025-07-18T10:45:00"),
        amount: 12500,
        status: "Refunded",
    },
    {
        description: "Access revoked for Mohan — cannot view invoices",
        type: "Access Change",
        user: "Owner",
        date: new Date("2025-07-18T10:45:00"),
        status: "Revoked",
    },
];

// Column Definitions
const columns: ColumnDef<Activity>[] = [
    {
        accessorKey: "description",
        header: "Activity Description",
        cell: ({ row }) => <div className="max-w-xs">{row.original.description}</div>,
    },
    {
        accessorKey: "type",
        header: "Type",
    },
    {
        accessorKey: "user",
        header: "User",
    },
    {
        accessorKey: "date",
        header: "Date & Time",
        cell: ({ row }) => format(row.original.date, "PPP, p"),
    },
    {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => row.original.amount ? `₹${row.original.amount}` : "-",
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.original.status;
            const badgeColors: Record<Activity["status"], string> = {
                Paid: "bg-green-100 text-green-600",
                Pending: "bg-yellow-100 text-yellow-600",
                Active: "bg-blue-100 text-blue-600",
                Refunded: "bg-green-100 text-green-600",
                Revoked: "bg-red-100 text-red-600",
            };

            return (
                <Badge className={`${badgeColors[status]} rounded-full px-3 text-xs font-medium`}>
                    {status}
                </Badge>
            );
        },
    },
];

// Component
const RecentActivityTable = () => {
    const [data] = useState(activities);
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="w-full">
            <Card className="h-full  bg-white">
                <CardHeader className="pb-2">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <CardTitle className="text-xl font-semibold text-gray-800">
                            Recent Activity
                        </CardTitle>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <Input
                                placeholder="Search activity..."
                                className="w-full sm:w-64"
                            />
                            <Button variant="outline" size="sm">
                                <Filter className="h-4 w-4 mr-1" />
                                Filter
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-0 overflow-auto px-4 py-2">
                    <Table className="text-sm">
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id} className="text-sm">
                                            {flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="text-sm whitespace-normal break-words max-w-xs">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default RecentActivityTable;
