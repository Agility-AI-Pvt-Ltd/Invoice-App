import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash2, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import StatusDropdown from "./StatusDropdown";
import ReasonDropdown from "./ReasonDropdown";

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
  onStatusUpdate?: (id: string | number, newStatus: string) => void;
  onReasonUpdate?: (id: string | number, newReason: string) => void;
}

const CreditDebitTable = ({
  activeTab,
  notesData,
  onEdit,
  onDelete,
  onStatusUpdate,
  onReasonUpdate,
}: CreditDebitTableProps) => {
  const handleStatusUpdate = (id: string | number, newStatus: string) => {
    onStatusUpdate?.(id, newStatus);
  };

  const handleReasonUpdate = (id: string | number, newReason: string) => {
    onReasonUpdate?.(id, newReason);
  };

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
              Reason
            </TableHead>
            <TableHead className="px-6 py-4 font-semibold text-slate-700">
              Date Issued
            </TableHead>
            <TableHead className="px-6 py-4 font-semibold text-slate-700">
              Amount
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
                  <ReasonDropdown
                    currentReason={note.reason}
                    noteId={String(note.id)}
                    noteType={activeTab}
                    onReasonUpdate={(newReason) => handleReasonUpdate(note.id, newReason)}
                  />
                </TableCell>
                <TableCell className="px-6 py-4">{note.dateIssued}</TableCell>
                <TableCell className="px-6 py-4">{note.amount}</TableCell>
                <TableCell className="px-6 py-4">
                  <StatusDropdown
                    currentStatus={note.status}
                    noteId={String(note.id)}
                    noteType={activeTab}
                    onStatusUpdate={(newStatus) => handleStatusUpdate(note.id, newStatus)}
                  />
                </TableCell>
                <TableCell className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600"
                      onClick={() => onEdit?.(note)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onDelete?.(note.id)}>
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
