"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar } from "react-chartjs-2"
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js"
import { cn } from "@/lib/utils"

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend)

export function TopCustomersCard({ className }: React.HTMLAttributes<HTMLDivElement>) {


    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
        },
        scales: {
            x: {
                ticks: {
                    font: {
                        size: 12,
                    },
                },
            },
            y: {
                ticks: {
                    font: {
                        size: 12,
                    },
                },
            },
        },
    }

    const values = [9000, 80000, 70000, 68000, 64000, 54000] //backend
    const total = values.reduce((acc, val) => acc + val, 0)

    const customerLabels = values.map((val, idx) => {
        const percent = ((val / total) * 100).toFixed(2)
        return `Customer ${idx + 1} (${percent}%)`
    })

    const data = {
        labels: ["Cust.1", "Cust.2", "Cust.3", "Cust.4", "Cust.5", "Cust.6"], //Nmaes wil come from backend
        datasets: [
            {
                label: "Top Customers",
                data: values,
                backgroundColor: [
                    "#6366f1",
                    "#22c55e",
                    "#eab308",
                    "#3b82f6",
                    "#f97316",
                    "#ef4444",
                ],
                borderRadius: 4,
                barThickness: 28,
            },
        ],
    }


    const colors = [
        "#6366f1",
        "#22c55e",
        "#eab308",
        "#3b82f6",
        "#f97316",
        "#ef4444",
    ]

    return (
        <Card className={cn("bg-white",className)}  >
            <CardHeader>
                <CardTitle className="text-base font-semibold">Top Customers</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col lg:flex-row gap-4 items-stretch">
                    {/* Chart area */}
                    <div className="flex-1 min-w-0 h-[260px]">
                        <Bar data={data} options={options} />
                    </div>

                    {/* Legend area */}
                    <div className="flex flex-col gap-3 text-sm w-[180px] shrink-0">
                        {customerLabels.map((label, idx) => (
                            <div key={idx} className="flex items-center gap-2 whitespace-nowrap">
                                <span
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: colors[idx] }}
                                />
                                <span className="text-muted-foreground">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
