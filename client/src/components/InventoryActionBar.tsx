"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Upload, Filter } from "lucide-react"
import { InventoryFilterMenu } from "./InventoryFilterMenu"
import { exportToCSV } from "@/lib/helper/exportToCSV"
import { exportToExcel } from "@/lib/helper/exportToExcel"
import { exportToPDF } from "@/lib/helper/exportToPDF"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export function InventoryActionsBar({
    filters,
    setFilters,
    setCurrentPage,
    data,
}: {
    filters: any
    setFilters: React.Dispatch<React.SetStateAction<any>>
    setCurrentPage: (page: number) => void
    data: any
}) {
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [isExportOpen, setIsExportOpen] = useState(false);

    return (
        <div className="flex gap-2 items-center">
            {/* Desktop */}
            <div className="hidden sm:flex gap-2">
                <InventoryFilterMenu
                    selectedStatus={filters.status || ""}
                    onStatusChange={(status) => {
                        setFilters((prev:any) => ({ ...prev, status: status || undefined }))
                        setCurrentPage(1)
                    }}
                />
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <Button
                            variant="outline"
                            size="sm"
                            className="transition-colors duration-200 ease-in-out 
                                bg-transparent text-slate-700 dark:text-slate-300 
                                hover:bg-slate-200 dark:hover:bg-slate-700 
                                hover:text-slate-900 dark:hover:text-white 
                                focus:ring-2 focus:ring-slate-400 focus:outline-none"
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="z-50 bg-white ">
                        <DropdownMenuItem className="hover:bg-gray-100 cursor-pointer text-black" onClick={() => exportToCSV(data?.data || [])}>Export as CSV</DropdownMenuItem>
                        <DropdownMenuItem className="hover:bg-gray-100 cursor-pointer text-black" onClick={() => exportToExcel(data?.data || [])}>Export as Excel</DropdownMenuItem>
                        <DropdownMenuItem className="hover:bg-gray-100 cursor-pointer text-black" onClick={() => exportToPDF(data?.data || [])}>Export as PDF</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <Button
                    variant="outline"
                    size="sm"
                    className="transition-colors duration-200 ease-in-out 
                        bg-transparent text-slate-700 dark:text-slate-300 
                        hover:bg-slate-200 dark:hover:bg-slate-700 
                        hover:text-slate-900 dark:hover:text-white 
                        focus:ring-2 focus:ring-slate-400 focus:outline-none"
                >
                    <Upload className="h-4 w-4 mr-2" />
                    Import
                </Button>
            </div>


            <div className="sm:hidden flex items-center gap-2">
                {/* Filter Icon Button */}
                <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                    <PopoverTrigger>
                        <Button size="icon" variant="outline">
                            <Filter className="h-5 w-5" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-48">
                        <InventoryFilterMenu
                            selectedStatus={filters.status || ""}
                            onStatusChange={(status) => {
                                setFilters((prev: any) => ({ ...prev, status: status || undefined }));
                                setCurrentPage(1);
                                setIsPopoverOpen(false);
                            }}
                        />
                    </PopoverContent>
                </Popover>

                {/* Export Icon Button */}
                <Popover open={isExportOpen} onOpenChange={setIsExportOpen}>
                    <PopoverTrigger>
                        <Button size="icon" variant="outline">
                            <Download className="h-5 w-5" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-48">
                        <div className="flex flex-col gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => exportToCSV(data?.data || [])}
                            >
                                Export as CSV
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => exportToExcel(data?.data || [])}
                            >
                                Export as Excel
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => exportToPDF(data?.data || [])}
                            >
                                Export as PDF
                            </Button>
                        </div>
                    </PopoverContent>
                </Popover>

                {/* Import Icon Button */}
                <Button
                    size="icon"
                    variant="outline"
                    onClick={() => {
                        // open import modal or trigger file input
                    }}
                >
                    <Upload className="h-5 w-5" />
                </Button>
            </div>

        </div>
    )
}
