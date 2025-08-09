// import { Card } from "@/components/ui/card";

// export function CashFlowCard() {
//   return (
//     <Card className="p-6 bg-white">
//       <div className="space-y-4">
//         <div>
//           <p className="text-sm text-muted-foreground">Cash as on 21/07/2023</p>
//           <p className="text-2xl font-bold text-foreground">₹ 23,345</p>
//         </div>
        
//         <div className="space-y-3">
//           <div>
//             <p className="text-sm text-muted-foreground">Incoming</p>
//             <p className="text-lg font-semibold text-success">₹ 23,345</p>
//           </div>
          
//           <div>
//             <p className="text-sm text-muted-foreground">Outgoing</p>
//             <p className="text-lg font-semibold text-destructive">₹ 23,345</p>
//           </div>
//         </div>
//       </div>
//     </Card>
//   );
// }



import { Card } from "@/components/ui/card";
import { format } from "date-fns";

interface CashFlowCardProps {
  selectedDate: Date;
}

export function CashFlowCard({ selectedDate }: CashFlowCardProps) {
  const monthMultiplier = selectedDate.getMonth() + 1;
  const cashAmount = 23345 + monthMultiplier * 1000;
  const incomingAmount = 12000 + monthMultiplier * 800;
  const outgoingAmount = 8000 + monthMultiplier * 300;

  return (
    <Card className="p-6 bg-white">
      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Cash as on {format(selectedDate, "dd/MM/yyyy")}</p>
          <p className="text-2xl font-bold text-foreground">₹ {cashAmount.toLocaleString()}</p>
        </div>
        
        <div className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">Incoming</p>
            <p className="text-lg font-semibold text-success">₹ {incomingAmount.toLocaleString()}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Outgoing</p>
            <p className="text-lg font-semibold text-destructive">₹ {outgoingAmount.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}