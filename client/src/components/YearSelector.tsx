// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// interface YearSelectorProps {
//   selectedYear: number;
//   onYearChange: (year: number) => void;
// }

// export const YearSelector = ({ selectedYear, onYearChange }: YearSelectorProps) => {
//   const currentYear = new Date().getFullYear();
//   const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

//   return (
//     <div className="flex items-center gap-2">
//       <span className="text-sm font-medium">Year:</span>
//       <Select value={selectedYear.toString()} onValueChange={(value) => onYearChange(parseInt(value))}>
//         <SelectTrigger className="w-32">
//           <SelectValue placeholder="Select year" />
//         </SelectTrigger>
//         <SelectContent>
//           {years.map((year) => (
//             <SelectItem key={year} value={year.toString()}>
//               {year}
//             </SelectItem>
//           ))}
//         </SelectContent>
//       </Select>
//     </div>
//   );
// };