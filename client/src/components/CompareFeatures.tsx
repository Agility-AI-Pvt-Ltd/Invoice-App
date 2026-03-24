import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Check, Minus } from "lucide-react";

type PlanKey = "Starter" | "Premium" | "Diamond";

type CellValue = boolean | string | { enabled: boolean; note?: string };

type FeatureRow = {
  label: string;
  isKey?: boolean;
  values: Record<PlanKey, CellValue>;
};

const allRows: FeatureRow[] = [
  {
    label: "Users & Roles",
    isKey: true,
    values: {
      Starter: "1 Admin",
      Premium: "1 Admin + 2 Team Member",
      Diamond: "2 Admin + 2 Manager + 1 Executive",
    },
  },
  { 
    label: "Unlimited Invoices", 
    isKey: true,
    values: { Starter: true, Premium: true, Diamond: true } 
  },
  { 
    label: "Income & Expense Tracking", 
    isKey: true,
    values: { Starter: true, Premium: true, Diamond: true } 
  },
  {
    label: "Invoice Scan (auto data capture)",
    values: {
      Starter: "Basic",
      Premium: true,
      Diamond: "Bulk upload + Advanced",
    },
  },
  { 
    label: "GST-Compliant Invoices", 
    isKey: true,
    values: { Starter: true, Premium: true, Diamond: true } 
  },
  { 
    label: "Automated Payment Reminders", 
    isKey: true,
    values: { Starter: true, Premium: true, Diamond: true } 
  },
  { 
    label: "Recurring Invoices & Auto-Billing", 
    values: { Starter: false, Premium: true, Diamond: true } 
  },
  { 
    label: "Expense Categorization & Tags", 
    values: { Starter: false, Premium: true, Diamond: true } 
  },
  {
    label: "Reports (P&L, Tax, Expense)",
    values: {
      Starter: "Basic tax summary",
      Premium: "Standard Reports",
      Diamond: "Advanced dashboards & Analytics",
    },
  },
  { 
    label: "Payment Tracking & Partial Payments", 
    values: { Starter: false, Premium: true, Diamond: true } 
  },
  { 
    label: "Approval Workflows", 
    values: { Starter: false, Premium: false, Diamond: true } 
  },
  { 
    label: "Custom Invoice Templates", 
    values: { Starter: false, Premium: false, Diamond: true } 
  },
  { 
    label: "Audit Trail & Activity Logs", 
    values: { Starter: false, Premium: false, Diamond: true } 
  },
  { 
    label: "Data Export & Backup", 
    values: { Starter: false, Premium: false, Diamond: true } 
  },
];

const plans: PlanKey[] = ["Starter", "Premium", "Diamond"];

/** returns true only when the cell represents an enabled/ticked state */
// const isEnabled = (value: CellValue): boolean => {
//   if (typeof value === "boolean") return value;
//   if (typeof value === "object" && value !== null && "enabled" in value) return !!value.enabled;
//   // strings (like "1 Admin" or "Basic") are NOT treated as ticks
//   return false;
// };

const Cell = ({ value }: { value: CellValue }) => {
  if (typeof value === "string") {
    return (
      <div className="flex items-center justify-center py-3">
        <span className="text-sm text-foreground/90 whitespace-pre-wrap text-center">{value}</span>
      </div>
    );
  }

  if (typeof value === "object" && value !== null && "enabled" in value) {
    const val = value as { enabled: boolean; note?: string };
    return (
      <div className="flex items-center justify-center gap-3 py-3">
        <div className="flex items-center justify-center flex-shrink-0 w-6 h-6">
          {val.enabled ? (
            <div className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 ring-1 ring-emerald-300">
              <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" />
            </div>
          ) : (
            <div className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-100 ring-1 ring-red-300">
              <Minus className="h-4 w-4 text-red-600" aria-hidden="true" />
            </div>
          )}
        </div>
        {val.note && <span className="text-sm text-foreground/90 whitespace-nowrap">{val.note}</span>}
      </div>
    );
  }

  // boolean -> keep same centered fixed-size icon column (alignment preserved)
  return (
    <div className="flex items-center justify-center py-3">
      <div className="flex items-center justify-center flex-shrink-0 w-6 h-6">
        {value ? (
          <div className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 ring-1 ring-emerald-300">
            <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" />
          </div>
        ) : (
          <div className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-100 ring-1 ring-red-300">
            <Minus className="h-4 w-4 text-red-600" aria-hidden="true" />
          </div>
        )}
      </div>
    </div>
  );
};

const Segmented = ({ value, onChange }: { value: "all" | "key"; onChange: (v: "all" | "key") => void }) => (
  <div className="inline-flex overflow-hidden rounded-full border border-border bg-background/60 p-1 backdrop-blur">
    <button
      type="button"
      onClick={() => onChange("all")}
      className={cn(
        "px-3 py-1.5 text-sm transition-colors",
        value === "all" ? "bg-primary text-primary-foreground rounded-full" : "text-muted-foreground hover:text-foreground"
      )}
      aria-pressed={value === "all"}
    >
      All features
    </button>
    <button
      type="button"
      onClick={() => onChange("key")}
      className={cn(
        "px-3 py-1.5 text-sm transition-colors",
        value === "key" ? "bg-primary text-primary-foreground rounded-full" : "text-muted-foreground hover:text-foreground"
      )}
      aria-pressed={value === "key"}
    >
      Key features
    </button>
  </div>
);

const CompareFeatures = () => {
  const [mode, setMode] = useState<"all" | "key">("all");
  const [mobilePlan, setMobilePlan] = useState<PlanKey>("Starter");

  // Filter rows based on mode
  const rows = useMemo(() => {
    if (mode === "key") {
      return allRows.filter((r) => r.isKey);
    }
    return allRows;
  }, [mode]);

  return (
    <section id="compare-features" className="relative py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10 bg-transparent" aria-hidden="true" />
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex flex-col gap-6 md:mb-12 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">Compare all features</h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Segmented value={mode} onChange={setMode} />
          </div>
        </header>

        {/* Mobile friendly view */}
        <div className="sm:hidden space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Plan</span>
            <select 
              value={mobilePlan} 
              onChange={(e) => setMobilePlan(e.target.value as PlanKey)}
              className="w-40 bg-background/60 backdrop-blur rounded-md px-3 py-2 text-sm "
            >
              {plans.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className="rounded-2xl border border-border bg-transparent divide-y">
            <div className="px-4 pt-4 pb-2 text-xs uppercase tracking-wide text-gray-500">What We Offer</div>
            {rows.map((row) => (
              <div key={row.label} className="flex items-center justify-between px-4 py-3">
                <span className="text-foreground pr-4">{row.label}</span>
                <Cell value={row.values[mobilePlan]} />
              </div>
            ))}
          </div>
        </div>

        {/* Desktop/Tablet table */}
        <div className="hidden sm:block overflow-x-auto rounded-2xl border border-border bg-transparent">
          <table className="min-w-[720px] w-full text-sm">
            <thead className="sticky top-0 z-10 bg-white/40 backdrop-blur">
              <tr className="text-left">
                <th scope="col" className="px-4 py-4 font-medium text-foreground">Features</th>
                {plans.map((p) => (
                  <th key={p} scope="col" className="px-4 py-4 text-center font-medium text-foreground">
                    {p}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={plans.length + 1} className="px-4 pt-6 pb-3 text-xs uppercase tracking-wide text-gray-500">
                  What We Offer
                </td>
              </tr>
              {rows.map((row, idx) => (
                <tr key={row.label} className={cn("border-t border-border/40", idx === 0 && "border-t-0")}>
                  <th scope="row" className="whitespace-nowrap px-4 py-3 text-left font-normal text-foreground align-middle">
                    <div className="flex items-center gap-2">
                      <span className="inline-block text-muted-foreground">▸</span>
                      {row.label}
                    </div>
                  </th>
                  {plans.map((p) => (
                    <td key={p} className="px-4 align-middle">
                      <Cell value={row.values[p]} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default CompareFeatures;
