import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { getRecentActivity, type RecentActivity } from "@/services/api/dashboard";
import { Input } from "./ui/Input";

// Column Definitions
const columns: ColumnDef<RecentActivity>[] = [
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
        cell: ({ row }) => format(new Date(row.original.date), "PPP, p"),
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
            const badgeColors: Record<RecentActivity["status"], string> = {
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
    const [data, setData] = useState<RecentActivity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const activities = await getRecentActivity(10);
                setData(activities);
            } catch (err) {
                console.error("Error fetching recent activity:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchActivities();
    }, []);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="w-full">
            <Card className="h-full bg-white">
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
                    {loading ? (
                        <div className="flex justify-center items-center py-6">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
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
                                            <TableCell
                                                key={cell.id}
                                                className="text-sm whitespace-normal break-words max-w-xs"
                                            >
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default RecentActivityTable;
