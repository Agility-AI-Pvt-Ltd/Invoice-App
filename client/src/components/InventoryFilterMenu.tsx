// components/inventory/InventoryFilterMenu.tsx
"use client"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Filter, ChevronDown } from "lucide-react"

interface Props {
    selectedStatus: string
    onStatusChange: (status: string | null) => void
}

const statusOptions = ["In Stock", "Out of Stock", "Low in Stock", "Discontinued"]

export function InventoryFilterMenu({ selectedStatus, onStatusChange }: Props) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <Button
                    variant="outline"
                    size="sm"
                    className="transition-colors duration-200 ease-in-out hover:bg-slate-300 hover:text-black dark:hover:bg-slate-600 bg-transparent"
                >
                    <Filter className="h-4 w-4 mr-2" />
                    {selectedStatus ? selectedStatus : "Filter"}
                    <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="start"
                className="z-50 bg-white border border-gray-200 shadow-lg w-48"
            >
                <DropdownMenuItem
                    onClick={() => onStatusChange(null)}
                    className="hover:bg-gray-100 cursor-pointer text-black"
                >
                    Clear Filter
                </DropdownMenuItem>
                {statusOptions.map((status) => (
                    <DropdownMenuItem
                        key={status}
                        onClick={() => onStatusChange(status)}
                        className="hover:bg-gray-100 cursor-pointer text-black"
                    >
                        {status}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
