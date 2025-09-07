import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, MoreVertical, ChevronDown, Download } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
  onDelete,
  selectedStatus,
  selectedReason,
  onStatusFilterChange,
  onReasonFilterChange,
}: CreditDebitTableProps) => {
  
  // Handle download functionality
  const handleDownload = (note: Note) => {
    try {
      const doc = new jsPDF();

      // Title
      doc.setFontSize(16);
      doc.text(activeTab === "credit-notes" ? "Credit Note" : "Debit Note", 14, 20);

      // Note details
      doc.setFontSize(12);
      doc.text(`${activeTab === "credit-notes" ? "Credit Note" : "Debit Note"} Number: ${note.noteNo}`, 14, 35);
      doc.text(`Invoice Number: ${note.invoiceNo}`, 14, 45);
      doc.text(`${activeTab === "credit-notes" ? "Customer" : "Vendor"}: ${activeTab === "credit-notes" ? note.customerName : note.vendorName}`, 14, 55);
      doc.text(`Date Issued: ${note.dateIssued}`, 14, 65);
      doc.text(`Status: ${note.status}`, 14, 75);
      doc.text(`Reason: ${note.reason}`, 14, 85);

      // Amount Table
      autoTable(doc, {
        startY: 100,
        head: [["Description", "Amount"]],
        body: [
          ["Total Amount", `₹${note.amount}`],
        ],
      });

      // Save the file
      doc.save(`${note.noteNo}.pdf`);
    } catch (err: any) {
      alert(err.message || `Failed to generate ${activeTab === "credit-notes" ? "credit note" : "debit note"} PDF`);
    }
  };

  // Handle delete functionality
  const handleDelete = async (noteId: string | number) => {
    if (!confirm(`Are you sure you want to delete this ${activeTab === "credit-notes" ? "credit note" : "debit note"}?`)) return;
    
    try {
      // TODO: Add API call here to delete the note
      // Example: await deleteNoteAPI(noteId);
      
      // For now, just call the onDelete callback if provided
      onDelete?.(noteId);
      
      // TODO: Remove this line when API is implemented and data is refreshed from parent
      console.log(`Delete ${activeTab === "credit-notes" ? "credit note" : "debit note"} with ID:`, noteId);
    } catch (err: any) {
      alert(err.message || `Failed to delete ${activeTab === "credit-notes" ? "credit note" : "debit note"}`);
    }
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
                    {/* <button
                      className="h-8 w-8 p-0 text-black hover:text-white hover:bg-gray-700 flex items-center justify-center rounded-[8px]"
                      onClick={() => onEdit?.(note)}
                    >
                      <Edit className="h-4 w-4" />
                    </button> */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-gray-900 text-white" align="end">
                        <DropdownMenuItem onClick={() => handleDownload(note)}>
                          <Download className="mr-2 h-4 w-4" /> Download
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-500" onClick={() => handleDelete(note.id)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
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
