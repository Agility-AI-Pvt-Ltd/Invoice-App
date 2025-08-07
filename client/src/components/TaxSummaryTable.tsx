//TaxSummaryTable.tsx

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ChevronDown, ChevronRight, Download, Calendar } from "lucide-react";

const taxData = [
  {
    id: '1',
    taxType: 'CGST',
    taxRate: '18%',
    taxableAmount: '₹2000',
    taxCollected: '₹2000',
    taxPaid: '₹2000',
    netTaxLiability: '₹5000',
    period: '29 July 2024',
    noOfInvoices: 2,
    expanded: false,
    children: [],
    isParent: false
  },
  {
    id: '2',
    taxType: 'SGST',
    taxRate: '5%',
    taxableAmount: '₹2000',
    taxCollected: '₹2000',
    taxPaid: '₹2000',
    netTaxLiability: '₹5000',
    period: '29 July 2024',
    noOfInvoices: 3,
    expanded: false,
    isParent: true,
    children: [
      {
        id: '2-1',
        taxType: 'IGST',
        taxRate: '12%',
        taxableAmount: '₹2000',
        taxCollected: '₹2000',
        taxPaid: '₹2000',
        netTaxLiability: '₹5000',
        period: '29 July 2024',
        noOfInvoices: 5,
        isChild: true
      },
      {
        id: '2-2',
        taxType: 'CGST',
        taxRate: '18%',
        taxableAmount: '₹2000',
        taxCollected: '₹2000',
        taxPaid: '₹2000',
        netTaxLiability: '₹5000',
        period: '29 July 2024',
        noOfInvoices: 2,
        isChild: true
      },
      {
        id: '2-3',
        taxType: 'IGST',
        taxRate: '18%',
        taxableAmount: '₹2000',
        taxCollected: '₹2000',
        taxPaid: '₹2000',
        netTaxLiability: '₹5000',
        period: '29 July 2024',
        noOfInvoices: 2,
        isChild: true
      },
      {
        id: '2-4',
        taxType: 'CGST',
        taxRate: '18%',
        taxableAmount: '₹2000',
        taxCollected: '₹2000',
        taxPaid: '₹2000',
        netTaxLiability: '₹5000',
        period: '29 July 2024',
        noOfInvoices: 2,
        isChild: true
      },
      {
        id: '2-5',
        taxType: 'IGST',
        taxRate: '18%',
        taxableAmount: '₹2000',
        taxCollected: '₹2000',
        taxPaid: '₹2000',
        netTaxLiability: '₹5000',
        period: '29 July 2024',
        noOfInvoices: 2,
        isChild: true
      }
    ]
  },
  {
    id: '3',
    taxType: 'CGST',
    taxRate: '18%',
    taxableAmount: '₹2000',
    taxCollected: '₹2000',
    taxPaid: '₹2000',
    netTaxLiability: '₹5000',
    period: '29 July 2024',
    noOfInvoices: 12,
    expanded: false,
    children: [],
    isParent: false
  },
  {
    id: '4',
    taxType: 'IGST',
    taxRate: '18%',
    taxableAmount: '₹2000',
    taxCollected: '₹2000',
    taxPaid: '₹2000',
    netTaxLiability: '₹5000',
    period: '29 July 2024',
    noOfInvoices: 5,
    expanded: false,
    children: [],
    isParent: false
  },
];

export function TaxSummaryTable() {
  const [data, setData] = useState(taxData);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const itemsPerPage = 10;

  const toggleRowExpansion = (id: string) => {
    setData(prevData => 
      prevData.map(item => 
        item.id === id ? { ...item, expanded: !item.expanded } : item
      )
    );
  };

  const toggleRowSelection = (id: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedRows.size === data.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(data.map(item => item.id)));
    }
  };

  const handleExport = () => {
    // Create CSV content for selected rows or all data if none selected
    const exportData = selectedRows.size > 0 ? data.filter(item => selectedRows.has(item.id)) : data;
    const csvContent = [
      "Tax Type,Tax Rate%,Taxable Amount,Tax Collected,Tax Paid,Net Tax Liability,Period,No. of Invoices",
      ...exportData.map(item => 
        `${item.taxType},${item.taxRate},${item.taxableAmount},${item.taxCollected},${item.taxPaid},${item.netTaxLiability},${item.period},${item.noOfInvoices}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tax-summary.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Flatten data to include expanded children
  const flattenedData = data.reduce((acc, item) => {
    acc.push(item);
    if (item.expanded && item.children) {
      acc.push(...item.children);
    }
    return acc;
  }, []);

  const totalPages = Math.ceil(flattenedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = flattenedData.slice(startIndex, startIndex + itemsPerPage);

  return (
    <Card className="p-6 bg-white">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">Tax Summary</h3>
        <div className="flex items-center gap-3">
          <DateRangePicker
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={handleExport}
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="">
        <Table>
          <TableHeader>
            <TableRow className="">
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedRows.size === data.length && data.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead className="font-semibold">
                <div className="flex items-center gap-2">
                  Tax Type
                  <ChevronDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="font-semibold">
                <div className="flex items-center gap-2">
                  Tax Rate%
                  <ChevronDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="font-semibold">
                <div className="flex items-center gap-2">
                  Taxable Amount
                  <ChevronDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="font-semibold">
                <div className="flex items-center gap-2">
                  Tax Collected
                  <ChevronDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="font-semibold">
                <div className="flex items-center gap-2">
                  Tax Paid
                  <ChevronDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="font-semibold">
                <div className="flex items-center gap-2">
                  Net Tax Liability
                  <ChevronDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="font-semibold">
                <div className="flex items-center gap-2">
                  Period
                  <ChevronDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="font-semibold">
                <div className="flex items-center gap-2">
                  No. of Invoices
                  <ChevronDown className="h-4 w-4" />
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.map((item) => (
              <TableRow
                key={item.id}
                className={`${selectedRows.has(item.id) ? "" : ""} ${item.isChild ? "" : ""}`}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedRows.has(item.id)}
                    onCheckedChange={() => toggleRowSelection(item.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  <div className={`flex items-center gap-2 ${item.isChild ? "pl-6" : ""}`}>
                    {item.isParent && (
                      <button
                        onClick={() => toggleRowExpansion(item.id)}
                        className="p-1 hover:bg-muted rounded"
                      >
                        {item.expanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                    )}
                    <span>{item.taxType}</span>
                  </div>
                </TableCell>
                <TableCell>{item.taxRate}</TableCell>
                <TableCell>{item.taxableAmount}</TableCell>
                <TableCell>{item.taxCollected}</TableCell>
                <TableCell>{item.taxPaid}</TableCell>
                <TableCell>{item.netTaxLiability}</TableCell>
                <TableCell>{item.period}</TableCell>
                <TableCell>{item.noOfInvoices}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-muted-foreground">
          Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, data.length)} of {data.length} entries
        </div>
        
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) setCurrentPage(currentPage - 1);
                }}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            
            <PaginationItem>
              <PaginationLink
                href="#"
                onClick={(e) => e.preventDefault()}
                isActive={true}
                className="bg-primary text-primary-foreground"
              >
                1
              </PaginationLink>
            </PaginationItem>
            
            <PaginationItem>
              <PaginationLink href="#" onClick={(e) => e.preventDefault()}>
                2
              </PaginationLink>
            </PaginationItem>
            
            <PaginationItem>
              <PaginationLink href="#" onClick={(e) => e.preventDefault()}>
                3
              </PaginationLink>
            </PaginationItem>
            
            <PaginationItem>
              <span className="px-3 py-2">...</span>
            </PaginationItem>
            
            <PaginationItem>
              <PaginationLink href="#" onClick={(e) => e.preventDefault()}>
                67
              </PaginationLink>
            </PaginationItem>
            
            <PaginationItem>
              <PaginationLink href="#" onClick={(e) => e.preventDefault()}>
                68
              </PaginationLink>
            </PaginationItem>
            
            <PaginationItem>
              <PaginationNext 
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </Card>
  );
}