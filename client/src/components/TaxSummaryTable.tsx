//TaxSummaryTable.tsx

import { useEffect, useState } from "react";

import axios from "axios";
import Cookies from "js-cookie";
import { routes } from "@/lib/routes/route";

import { Card } from "@/components/ui/card";
import { SingleDatePicker } from "@/components/ui/SingleDatePicker";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/Checkbox";
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

import { ChevronDown, ChevronRight, Download } from "lucide-react";
import Cookies from "js-cookie";
import { getTaxSummary } from "@/services/api/tax";

import { ChevronDown, Download } from "lucide-react";


interface ApiSummaryRow {
  taxType?: string;
  taxRate?: string;
  period?: string;
  taxableAmount: number;
  taxCollected: number;
  taxPaid: number;
  netTaxLiability: number;
  noOfInvoices: number;
}

interface TableRowItem {
  id: string;
  taxType: string;
  taxRate: string;
  period: string;
  taxableAmount: number;
  taxCollected: number;
  taxPaid: number;
  netTaxLiability: number;
  noOfInvoices: number;
}

export function TaxSummaryTable() {

  const [data, setData] = useState<TaxItem[]>([]);

  const [rows, setRows] = useState<TableRowItem[]>([]);

  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const itemsPerPage = 10;


  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Cookies.get("authToken")  // or however you store it
        if (!token) return;
        const res = await getTaxSummary(token);
        //@ts-ignore
        setData(res);
      } catch (error) {
        console.error("Failed to fetch tax summary:", error);
      }
    };
    fetchData();
  }, []);

  const toggleRowExpansion = (id: string) => {
    setData(prevData =>
      prevData.map(item =>
        item.id === id ? { ...item, expanded: !item.expanded } : item
      )
    );
  };

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const token = Cookies.get("authToken") || localStorage.getItem("token") || "";
        const res = await axios.get(routes.tax.summary, {
          params: { from: selectedDate.toISOString(), to: selectedDate.toISOString(), groupBy: 'period' },
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const list: ApiSummaryRow[] = Array.isArray(res.data?.rows) ? res.data.rows : [];
        const normalized: TableRowItem[] = list.map((r, idx) => ({
          id: `${idx}`,
          taxType: r.taxType ?? '-',
          taxRate: r.taxRate ?? '-',
          period: r.period ?? '-',
          taxableAmount: r.taxableAmount ?? 0,
          taxCollected: r.taxCollected ?? 0,
          taxPaid: r.taxPaid ?? 0,
          netTaxLiability: r.netTaxLiability ?? 0,
          noOfInvoices: r.noOfInvoices ?? 0,
        }));
        setRows(normalized);
        setCurrentPage(1);
        setSelectedRows(new Set());
      } catch (e) {
        console.error("Failed to fetch tax summary:", e);
        setRows([]);
      }
    };
    fetchSummary();
  }, [selectedDate]);


  const toggleRowSelection = (id: string) => {
    const next = new Set(selectedRows);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedRows(next);
  };

  const toggleSelectAll = () => {
    if (selectedRows.size === rows.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(rows.map(r => r.id)));
    }
  };


  const handleExport = () => {
    const exportData = selectedRows.size > 0 ? data.filter(item => selectedRows.has(item.id)) : data;
    const csvContent = [
      "Tax Type,Tax Rate%,Taxable Amount,Tax Collected,Tax Paid,Net Tax Liability,Period,No. of Invoices",
      ...exportData.map(item =>
        `${item.taxType},${item.taxRate},${item.taxableAmount},${item.taxCollected},${item.taxPaid},${item.netTaxLiability},${item.period},${item.noOfInvoices}`
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });

  const currency = (n: number) => `₹${n.toLocaleString()}`;

  const totalPages = Math.ceil(rows.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = rows.slice(startIndex, startIndex + itemsPerPage);

  const handleExportSelected = () => {
    const exportData = selectedRows.size > 0 ? rows.filter(r => selectedRows.has(r.id)) : rows;
    const csv = [
      'Tax Type,Tax Rate%,Taxable Amount,Tax Collected,Tax Paid,Net Tax Liability,Period,No. of Invoices',
      ...exportData.map(r => `${r.taxType},${r.taxRate},${r.taxableAmount},${r.taxCollected},${r.taxPaid},${r.netTaxLiability},${r.period},${r.noOfInvoices}`)
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tax-summary.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };


  const flattenedData: TaxItem[] = data.reduce((acc: TaxItem[], item) => {
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
    <Card className="p-3 sm:p-4 lg:p-6 bg-white">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-xl font-semibold">Tax Summary</h3>
        <div className="flex flex-row items-center gap-2 sm:gap-3 flex-nowrap">
          <div className="hidden sm:block">
            <SingleDatePicker selectedDate={selectedDate} onDateChange={setSelectedDate} />
          </div>
          <div className="sm:hidden">
            <SingleDatePicker selectedDate={selectedDate} onDateChange={setSelectedDate} iconOnly />
          </div>


          {/* Export button responsive */}
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:inline-flex items-center gap-2 w-full sm:w-auto"
            onClick={handleExport}
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="inline-flex sm:hidden"
            aria-label="Export"
            onClick={handleExport}
          >

          <Button variant="outline" size="sm" className="hidden sm:inline-flex items-center gap-2 w-full sm:w-auto" onClick={handleExportSelected}>
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
          <Button variant="outline" size="icon" className="inline-flex sm:hidden" aria-label="Export" onClick={handleExportSelected}>

            <Download className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox checked={selectedRows.size === rows.length && rows.length > 0} onCheckedChange={toggleSelectAll} />
              </TableHead>
              <TableHead className="font-semibold text-xs sm:text-sm">
                <div className="flex items-center gap-2">Tax Type<ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" /></div>
              </TableHead>
              <TableHead className="font-semibold text-xs sm:text-sm">
                <div className="flex items-center gap-2">Tax Rate%<ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" /></div>
              </TableHead>
              <TableHead className="font-semibold text-xs sm:text-sm">
                <div className="flex items-center gap-2">Taxable Amount<ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" /></div>
              </TableHead>
              <TableHead className="font-semibold text-xs sm:text-sm">
                <div className="flex items-center gap-2">Tax Collected<ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" /></div>
              </TableHead>
              <TableHead className="font-semibold text-xs sm:text-sm">
                <div className="flex items-center gap-2">Tax Paid<ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" /></div>
              </TableHead>
              <TableHead className="font-semibold text-xs sm:text-sm">
                <div className="flex items-center gap-2">Net Tax Liability<ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" /></div>
              </TableHead>
              <TableHead className="font-semibold text-xs sm:text-sm">
                <div className="flex items-center gap-2">Period<ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" /></div>
              </TableHead>
              <TableHead className="font-semibold text-xs sm:text-sm">
                <div className="flex items-center gap-2">No. of Invoices<ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" /></div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Checkbox checked={selectedRows.has(item.id)} onCheckedChange={() => toggleRowSelection(item.id)} />
                </TableCell>
                <TableCell className="text-xs sm:text-sm">{item.taxType}</TableCell>
                <TableCell className="text-xs sm:text-sm">{item.taxRate}</TableCell>
                <TableCell className="text-xs sm:text-sm">{currency(item.taxableAmount)}</TableCell>
                <TableCell className="text-xs sm:text-sm">{currency(item.taxCollected)}</TableCell>
                <TableCell className="text-xs sm:text-sm">{currency(item.taxPaid)}</TableCell>
                <TableCell className="text-xs sm:text-sm">{currency(item.netTaxLiability)}</TableCell>
                <TableCell className="text-xs sm:text-sm">{item.period}</TableCell>
                <TableCell className="text-xs sm:text-sm">{item.noOfInvoices}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4 sm:mt-6">
        <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
          Showing {rows.length === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + itemsPerPage, rows.length)} of {rows.length} entries
        </div>


        <Pagination>
          <PaginationContent className="flex-wrap">
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) setCurrentPage(currentPage - 1);
                }}
                className={`text-xs sm:text-sm ${currentPage === 1 ? "pointer-events-none opacity-50" : ""}`}
              />
            </PaginationItem>

            <PaginationItem>
              <PaginationLink
                href="#"
                onClick={(e) => e.preventDefault()}
                isActive={true}
                className="bg-primary text-primary-foreground text-xs sm:text-sm"
              >
                1
              </PaginationLink>
            </PaginationItem>

            <PaginationItem>
              <PaginationLink href="#" onClick={(e) => e.preventDefault()} className="text-xs sm:text-sm">
                2
              </PaginationLink>
            </PaginationItem>

            <PaginationItem>
              <PaginationLink href="#" onClick={(e) => e.preventDefault()} className="text-xs sm:text-sm">
                3
              </PaginationLink>
            </PaginationItem>

            <PaginationItem>
              <span className="px-2 sm:px-3 py-2 text-xs sm:text-sm">...</span>
            </PaginationItem>

            <PaginationItem>
              <PaginationLink href="#" onClick={(e) => e.preventDefault()} className="text-xs sm:text-sm">
                67
              </PaginationLink>
            </PaginationItem>


        <Pagination>
          <PaginationContent className="flex-wrap">
            <PaginationItem>
              <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); if (currentPage > 1) setCurrentPage(currentPage - 1); }} className={`text-xs sm:text-sm ${currentPage === 1 ? "pointer-events-none opacity-50" : ""}`} />
            </PaginationItem>

            <PaginationItem>
              <PaginationLink href="#" onClick={(e) => e.preventDefault()} isActive className="bg-primary text-primary-foreground text-xs sm:text-sm">{currentPage}</PaginationLink>
            </PaginationItem>


            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                }}
                className="text-xs sm:text-sm"
              />

            <PaginationItem>
              <PaginationNext href="#" onClick={(e) => { e.preventDefault(); if (currentPage < totalPages) setCurrentPage(currentPage + 1); }} className="text-xs sm:text-sm" />

            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </Card>
  );
}