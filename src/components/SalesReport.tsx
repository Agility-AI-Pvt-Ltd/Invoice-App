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

ChartJS.register(
    LineElement,
    PointElement,
    LinearScale,
    Title,
    CategoryScale,
    Tooltip,
    Legend
);

// Chart Data
const chartData = {
    labels: [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ],
    datasets: [
        {
            label: "Total Sales",
            data: [200, 300, 250, 650, 400, 600, 300, 500, 600, 550, 752, 450],
            borderColor: "#22c55e",
            backgroundColor: "#22c55e",
            tension: 0.4,
            fill: false,
            pointRadius: 4,
        },
        {
            label: "Total Expenses",
            data: [650, 400, 500, 300, 450, 350, 550, 400, 450, 420, 200, 350],
            borderColor: "#f87171",
            backgroundColor: "#f87171",
            tension: 0.4,
            fill: false,
            pointRadius: 4,
        },
    ],
};

// Chart Options
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
            min: 100,
            max: 800,
            ticks: {
                stepSize: 100,
            },
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
    return (
        <Card className="w-full h-full flex flex-col bg-white">
            <CardContent className="flex flex-col flex-1 px-4 py-4">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">Sales Report</h2>
                    <Select defaultValue="this-year">
                        <SelectTrigger className="w-[140px] text-sm justify-start">
                            <Calendar className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Select Period" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="this-year">This Year</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Chart */}
                <div className="flex-1 min-h-[300px]">
                    <Line data={chartData} options={chartOptions} />
                </div>
            </CardContent>
        </Card>
    );
};

export default SalesReportCard;