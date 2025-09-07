"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip as tp, Legend } from "chart.js";
import { cn } from "@/lib/utils";
import { getTopCustomers, type TopCustomersResponse } from "@/services/api/dashboard";
import Cookies from "js-cookie";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

ChartJS.register(BarElement, CategoryScale, LinearScale, tp, Legend);

export function TopCustomersCard({ className }: React.HTMLAttributes<HTMLDivElement>) {
    const [topCustomers, setTopCustomers] = useState<TopCustomersResponse | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getTopCustomers();
                setTopCustomers(data);
            } catch (error) {
                console.error("Error fetching top customers:", error);
            }
        };
        fetchData();
    }, []);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
        },
        scales: {
            x: { ticks: { font: { size: 12 } } },
            y: { ticks: { font: { size: 12 } } },
        },
    };

    // Prepare chart data
    const chartData = topCustomers
        ? {
            labels: topCustomers.labels,
            datasets: topCustomers.datasets.map((ds) => ({
                ...ds,
                borderRadius: 4,
                barThickness: 28,
            })),
        }
        : {
            labels: [],
            datasets: [],
        };

    // Prepare legend with percentages
    const total = topCustomers?.datasets[0]?.data.reduce((acc, val) => acc + val, 0) || 0;
    const customerLabels =
        topCustomers?.labels.map((label, idx) => {
            const val = topCustomers.datasets[0].data[idx];
            const percent = total ? ((val / total) * 100).toFixed(2) : "0";
            return `${label} (${percent}%)`;
        }) || [];

    const colors = topCustomers?.datasets[0]?.backgroundColor || [];

    return (
        <Card className={cn("bg-white", className)}>
            <CardHeader>
                <CardTitle className="text-base font-semibold">Top Customers</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col lg:flex-row gap-4 items-stretch">
                    {/* Chart */}
                    <div className="flex-1 min-w-0 h-[260px]">
                        <Bar data={chartData} options={options} />
                    </div>

                    {/* Legend */}
                    <div className="flex flex-col gap-3 text-sm w-[180px] shrink-0">
                        {customerLabels.map((label, idx) => (
                            <div key={idx} className="flex items-center gap-2 whitespace-nowrap">
                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[idx] }} />
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span
                                            className="text-muted-foreground max-w-[120px] truncate block"
                                        >
                                            {label}
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{label}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
