import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { getCashFlow, type CashFlowResponse } from "@/services/api/dashboard";
import Cookies from "js-cookie";

// interface CashFlowCardProps {
//   selectedDate: Date;
// }

export function CashFlowCard() {
  const [cashFlow, setCashFlow] = useState<CashFlowResponse | null>(null);
  const token = Cookies.get("authToken") || " ";

  useEffect(() => {
    (async () => {
      try {
        const data = await getCashFlow();
        setCashFlow(data);
      } catch (error) {
        console.error("Failed to load cash flow:", error);
      }
    })();
  }, [token]);

  if (!cashFlow) {
    return (
      <Card className="p-6 bg-white">
        <p>Loading...</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-white">
      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">
            Cash as on {cashFlow.asOfDate ? format(new Date(cashFlow.asOfDate), "dd/MM/yyyy") : format(new Date(), "dd/MM/yyyy")}
          </p>
          <p className="text-2xl font-bold text-foreground">
            ₹ {cashFlow.cashPosition.toLocaleString()}
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">Incoming</p>
            <p className="text-lg font-semibold text-success">
              ₹ {cashFlow.incoming.toLocaleString()}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Outgoing</p>
            <p className="text-lg font-semibold text-destructive">
              ₹ {cashFlow.outgoing.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
