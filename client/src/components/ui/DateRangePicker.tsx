// import * as React from "react";
// import { format } from "date-fns";
// import { Calendar as CalendarIcon } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Calendar } from "@/components/ui/calendar";
// import {
//     Popover,
//     PopoverContent,
//     PopoverTrigger,
// } from "@/components/ui/popover";
// import type { DateRange } from "react-day-picker";

// export function DateRangePicker({ iconOnly = false }: { iconOnly?: boolean }) {
//     const [date, setDate] = React.useState<DateRange | undefined>();

//     const getLabel = () => {
//         const getFormatted = (d?: Date) => (d ? format(d, "MMM d, yyyy") : "");
//         if (!date?.from && !date?.to) return "Pick a date range";
//         if (date.from && !date.to) return `${getFormatted(date.from)} - ...`;
//         if (!date.from && date.to) return `... - ${getFormatted(date.to)}`;
//         if (date.from && date.to)
//             return `${getFormatted(date.from)} - ${getFormatted(date.to)}`;
//     };

//     return (
//         <Popover>
//             <PopoverTrigger asChild>
//                 <Button
//                     variant="outline"
//                     data-empty={!date?.from && !date?.to}
//                     className={`data-[empty=true]:text-muted-foreground text-xs font-normal ${
//                         iconOnly ? "p-2 w-9 h-9" : "w-[200px] justify-start text-left"
//                     }`}
//                 >
//                     <CalendarIcon className="h-4 w-4" />
//                     {!iconOnly && <span className="ml-2">{getLabel()}</span>}
//                 </Button>
//             </PopoverTrigger>
//             <PopoverContent className="w-auto p-0">
//                 <Calendar
//                     mode="range"
//                     selected={date}
//                     onSelect={setDate}
//                     numberOfMonths={2}
//                 />
//             </PopoverContent>
//         </Popover>
//     );
// }


import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { DateRange } from "react-day-picker";

// 🔹 First component: RANGE Picker
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
      <PopoverTrigger>
        <Button
          variant="outline"
          data-empty={!date?.from && !date?.to}
          className={cn(
            "data-[empty=true]:text-muted-foreground text-xs font-normal",
            iconOnly ? "p-2 w-9 h-9" : "w-[200px] justify-start text-left"
          )}
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

// 🔹 Second component: SINGLE date picker

interface SingleDatePickerProps {
  date?: Date;
  selectedDate?: Date;
  onDateChange?: (date: Date) => void;
}

export function SingleDatePicker({
  date,
  selectedDate,
  onDateChange = () => {},
}: SingleDatePickerProps) {
  const currentDate = date || selectedDate || new Date();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[240px] justify-start text-left font-normal bg-white",
            !currentDate && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {currentDate ? format(currentDate, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white z-50" align="start">
        <Calendar
          mode="single"
          selected={currentDate}
          onSelect={(newDate) => newDate && onDateChange(newDate)}
          disabled={(date) => date > new Date()}
          initialFocus
          className="p-3 pointer-events-auto"
        />
      </PopoverContent>
    </Popover>
  );
}
