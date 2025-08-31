import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash2, MoreVertical, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Note = {
  id: string | number;
  noteNo: string;
  invoiceNo: string;
  customerName?: string; // for Credit Notes
  vendorName?: string; // for Debit Notes
  reason: string;
  dateIssued: string;
  amount: number;
  status: string;
};

interface CreditDebitTableProps {
  activeTab: "credit-notes" | "debit-notes";
  notesData: Note[];
  onEdit?: (note: Note) => void;
  onDelete?: (id: string | number) => void;
  selectedStatus: string;
  selectedReason: string;
  onStatusFilterChange: (status: string) => void;
  onReasonFilterChange: (reason: string) => void;
}

const statusOptions = {
  "credit-notes": ["All", "Open", "Adjusted", "Refunded"],
  "debit-notes": ["All", "Open", "Accepted", "Rejected", "Settled"],
};

const reasonOptions = {
  "credit-notes": ["All", "Returned Goods", "Discount", "Overpayment", "Other"],
  "debit-notes": ["All", "Damaged Goods", "Overcharged", "Quantity Mismatch", "Other"],
};

const statusColors: Record<string, string> = {
  Open: "border-blue-200 bg-blue-100 text-blue-700",
  Refunded: "border-emerald-200 bg-emerald-100 text-emerald-700",
  Adjusted: "border-amber-200 bg-amber-100 text-amber-700",
  Accepted: "border-indigo-200 bg-indigo-100 text-indigo-700",
  Settled: "border-emerald-200 bg-emerald-100 text-emerald-700",
  Rejected: "border-red-200 bg-red-100 text-red-700",
};

const CreditDebitTable = ({
  activeTab,
  notesData,
  onEdit,
  onDelete,
  selectedStatus,
  selectedReason,
  onStatusFilterChange,
  onReasonFilterChange,
}: CreditDebitTableProps) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-slate-200 bg-slate-50">
            <TableHead className="px-6 py-4 font-semibold text-slate-700">
              {activeTab === "credit-notes" ? "Credit Note No." : "Debit Note No."}
            </TableHead>
            <TableHead className="px-6 py-4 font-semibold text-slate-700">
              Invoice No.
            </TableHead>
            <TableHead className="px-6 py-4 font-semibold text-slate-700">
              {activeTab === "credit-notes" ? "Customer Name" : "Vendor Name"}
            </TableHead>
            <TableHead className="px-6 py-4 font-semibold text-slate-700">

              <div className="flex items-center justify-between">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-[f5f5f6] hover:text-black"
                    >
                      <span>Reason</span>
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    {reasonOptions[activeTab].map((reason) => (
                      <DropdownMenuItem
                        key={reason}
                        onClick={() => onReasonFilterChange(reason)}
                        className={`cursor-pointer ${
                          reason === selectedReason
                            ? "bg-[#8066FF] text-white"
                            : "bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {reason}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </TableHead>
            <TableHead className="px-6 py-4 font-semibold text-slate-700">
              Date Issued
            </TableHead>
            <TableHead className="px-6 py-4 font-semibold text-slate-700">
              Amount
            </TableHead>
            <TableHead className="px-6 py-4 font-semibold text-slate-700">
              <div className="flex items-center justify-between">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-[f5f5f6] hover:text-black"
                    >
                      <span>Status</span>
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-32">
                    {statusOptions[activeTab].map((status) => (
                      <DropdownMenuItem
                        key={status}
                        onClick={() => onStatusFilterChange(status)}
                        className={`cursor-pointer ${
                          status === selectedStatus
                            ? "bg-[#8066FF] text-white"
                            : "bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {status}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </TableHead>
            <TableHead className="px-6 py-4 font-semibold text-slate-700">
              Action
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {notesData.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={8}
                className="py-8 text-center text-slate-500"
              >
                No {activeTab === "credit-notes" ? "Credit Notes" : "Debit Notes"} found
              </TableCell>
            </TableRow>
          ) : (
            notesData.map((note) => (
              <TableRow
                key={note.id}
                className="border-b border-slate-100 hover:bg-slate-50"
              >
                <TableCell className="px-6 py-4">{note.noteNo}</TableCell>
                <TableCell className="px-6 py-4">{note.invoiceNo}</TableCell>
                <TableCell className="px-6 py-4">
                  {activeTab === "credit-notes" ? note.customerName : note.vendorName}
                </TableCell>
                <TableCell className="px-6 py-4">
                  <span className="text-sm text-slate-700">{note.reason}</span>
                </TableCell>
                <TableCell className="px-6 py-4">{note.dateIssued}</TableCell>
                <TableCell className="px-6 py-4">{note.amount}</TableCell>
                <TableCell className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[note.status] || 'border-gray-200 bg-gray-100 text-gray-700'}`}>
                    {note.status}
                  </span>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      className="h-8 w-8 p-0 text-black hover:text-white hover:bg-gray-700 flex items-center justify-center rounded-[8px]"
                      onClick={() => onEdit?.(note)}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="h-8 w-8 p-0 text-black hover:text-white hover:bg-gray-700 flex items-center justify-center rounded-[8px]"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="text-black" onClick={() => onDelete?.(note.id)}>
                          <Trash2 className="mr-2 h-4 w-4 text-red-500" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default CreditDebitTable;
