import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Chart as ChartJS,
    LineElement,
    PointElement,
    LinearScale,
    Title,
    CategoryScale,
    Tooltip,
    Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import { Calendar } from "lucide-react";
import Cookies from "js-cookie";
import { getSalesReport, type SalesReportData } from "@/services/api/dashboard";

ChartJS.register(
    LineElement,
    PointElement,
    LinearScale,
    Title,
    CategoryScale,
    Tooltip,
    Legend
);

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: true,
            position: "top" as const,
            labels: {
                usePointStyle: true,
                pointStyle: "circle",
                boxWidth: 8,
                padding: 16,
            },
        },
        tooltip: {
            callbacks: {
                label: (context: any) => `${context.dataset.label}: ${context.parsed.y}`,
            },
        },
    },
    scales: {
        y: {
            grid: {
                color: "#e5e7eb",
                drawBorder: false,
            },
        },
        x: {
            grid: {
                display: false,
            },
        },
    },
};

const SalesReportCard = () => {
    const [chartData, setChartData] = useState<SalesReportData | null>(null);
    const [period, setPeriod] = useState("this-year");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getSalesReport(period);
                // Ensure Chart.js expected format is preserved
                setChartData({
                    labels: data.labels,
                    datasets: data.datasets.map(ds => ({
                        ...ds,
                        tension: 0.4,
                        fill: false,
                        pointRadius: 4,
                    })),
                });
            } catch (err) {
                console.error("Failed to fetch sales report:", err);
            }
        };
        fetchData();
    }, [period]);

    return (
        <Card className="w-full h-full flex flex-col bg-white">
            <CardContent className="flex flex-col flex-1 px-4 py-4">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">Sales Report</h2>
                    <Select value={period} onValueChange={setPeriod}>
                        <SelectTrigger className="w-[140px] text-sm justify-start">
                            <Calendar className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Select Period" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="this-year">This Year</SelectItem>
                            <SelectItem value="this-month">This Month</SelectItem>
                            <SelectItem value="last-month">Last Month</SelectItem>
                            <SelectItem value="last-year">Last Year</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Chart */}
                <div className="flex-1 min-h-[300px]">
                    {chartData ? (
                        <Line data={chartData} options={chartOptions} />
                    ) : (
                        <div className="flex justify-center items-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default SalesReportCard;
