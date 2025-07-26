import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import type { DateRange } from "react-day-picker";

export function DateRangePicker({ iconOnly = false }: { iconOnly?: boolean }) {
    const [date, setDate] = React.useState<DateRange | undefined>();

    const getLabel = () => {
        const getFormatted = (d?: Date) => (d ? format(d, "MMM d, yyyy") : "");
        if (!date?.from && !date?.to) return "Pick a date range";
        if (date.from && !date.to) return `${getFormatted(date.from)} - ...`;
        if (!date.from && date.to) return `... - ${getFormatted(date.to)}`;
        if (date.from && date.to)
            return `${getFormatted(date.from)} - ${getFormatted(date.to)}`;
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    data-empty={!date?.from && !date?.to}
                    className={`data-[empty=true]:text-muted-foreground text-xs font-normal ${
                        iconOnly ? "p-2 w-9 h-9" : "w-[200px] justify-start text-left"
                    }`}
                >
                    <CalendarIcon className="h-4 w-4" />
                    {!iconOnly && <span className="ml-2">{getLabel()}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Calendar
                    mode="range"
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={2}
                />
            </PopoverContent>
        </Popover>
    );
}
