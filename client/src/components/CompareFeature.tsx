import { useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Check, Minus } from "lucide-react";

type PlanKey = "Starter" | "Professional" | "Ultimate" | "Enterprise";

type FeatureRow = {
  label: string;
  isKey?: boolean;
  values: Record<PlanKey, boolean>;
};

const allRows: FeatureRow[] = [
  // What We Offer group header is rendered separately
  { label: "Sync across device", isKey: true, values: { Starter: true, Professional: true, Ultimate: true, Enterprise: true } },
  { label: "5 workspace", isKey: true, values: { Starter: true, Professional: true, Ultimate: true, Enterprise: true } },
  { label: "Collaborate with 5 user", isKey: true, values: { Starter: true, Professional: true, Ultimate: true, Enterprise: true } },
  { label: "Admin tools", isKey: true, values: { Starter: true, Professional: true, Ultimate: true, Enterprise: true } },
  { label: "100+ integrations", isKey: true, values: { Starter: true, Professional: true, Ultimate: true, Enterprise: true } },
  { label: "Everything in Free Plan", values: { Starter: true, Professional: true, Ultimate: true, Enterprise: true } },
  { label: "Unlimited workspace", values: { Starter: false, Professional: true, Ultimate: true, Enterprise: true } },
  { label: "Collaborative workspace", values: { Starter: false, Professional: false, Ultimate: true, Enterprise: true } },
  { label: "Daily performance reports", values: { Starter: false, Professional: false, Ultimate: true, Enterprise: true } },
  { label: "Dedicated assistant", values: { Starter: false, Professional: false, Ultimate: true, Enterprise: true } },
  { label: "Advanced security", values: { Starter: false, Professional: true, Ultimate: true, Enterprise: true } },
];

const plans: PlanKey[] = ["Starter", "Professional", "Ultimate", "Enterprise"];

const Cell = ({ enabled }: { enabled: boolean }) => (
  <div className="flex items-center justify-center py-3">
    {enabled ? (
      <div className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 ring-1 ring-emerald-300">
        <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" />
      </div>
    ) : (
      <div className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-100 ring-1 ring-red-300">
        <Minus className="h-4 w-4 text-red-600" aria-hidden="true" />
      </div>
    )}
  </div>
);

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
  const [seat, setSeat] = useState("full");
  const [mode, setMode] = useState<"all" | "key">("all");
  const [mobilePlan, setMobilePlan] = useState<PlanKey>("Starter");

  const rows = useMemo(
    () => (mode === "key" ? allRows.filter((r) => r.isKey) : allRows),
    [mode]
  );

  return (
    <section id="compare-features" className="relative py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10 bg-transparent" aria-hidden="true" />
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex flex-col gap-6 md:mb-12 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">Compare all features</h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Seat</span>
              <Select value={seat} onValueChange={setSeat}>
                <SelectTrigger className="w-36 bg-background/60 backdrop-blur">
                  <SelectValue placeholder="Full seat" />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="full">Full seat</SelectItem>
                  <SelectItem value="limited">Limited seat</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Segmented value={mode} onChange={setMode} />
          </div>
        </header>

        {/* Mobile friendly view */}
        <div className="sm:hidden space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Plan</span>
            <Select value={mobilePlan} onValueChange={(v) => setMobilePlan(v as PlanKey)}>
              <SelectTrigger className="w-40 bg-background/60 backdrop-blur">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                {plans.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-2xl border border-border bg-transparent divide-y">
            <div className="px-4 pt-4 pb-2 text-xs uppercase tracking-wide text-gray-500">What We Offer</div>
            {rows.map((row) => (
              <div key={row.label} className="flex items-center justify-between px-4 py-3">
                <span className="text-foreground pr-4">{row.label}</span>
                <Cell enabled={row.values[mobilePlan]} />
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
                <td colSpan={5} className="px-4 pt-6 pb-3 text-xs uppercase tracking-wide text-gray-500">
                  What We Offer
                </td>
              </tr>
              {rows.map((row, idx) => (
                <tr key={row.label} className={cn("border-t border-border/40", idx === 0 && "border-t-0")}> 
                  <th scope="row" className="whitespace-nowrap px-4 py-3 text-left font-normal text-foreground">
                    <div className="flex items-center gap-2">
                      <span className="inline-block text-muted-foreground">▸</span>
                      {row.label}
                    </div>
                  </th>
                  {plans.map((p) => (
                    <td key={p} className="px-4">
                      <Cell enabled={row.values[p]} />
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
