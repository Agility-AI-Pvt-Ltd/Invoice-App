import { Card, CardContent } from "@/components/ui/card";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Calendar } from "lucide-react";

ChartJS.register(ArcElement, Tooltip, Legend);

const data = {
    labels: ["Product 1", "Product 2", "Product 3", "Others"],
    datasets: [
        {
            data: [300, 250, 200, 100],
            backgroundColor: ["#6366f1", "#34d399", "#60a5fa", "#f87171"],
            borderWidth: 4,
            cutout: "70%",
        },
    ],
};

const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false,
        },
    },
};

const TopProductsCard = () => {
    return (
        <Card className="w-full h-full flex flex-col bg-white">
            <CardContent className="flex flex-col flex-1 p-4">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Top Products</h2>
                    <div className="flex gap-2">
                        <Select defaultValue="sales">
                            <SelectTrigger className="w-[110px] text-sm justify-start">
                                <SelectValue placeholder="By Sales" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="sales">By Sales</SelectItem>
                                <SelectItem value="units">By Units</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select defaultValue="30-days">
                            <SelectTrigger className="w-[130px] text-sm justify-start">
                                <Calendar className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Last 30 days" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="7-days">Last 7 days</SelectItem>
                                <SelectItem value="30-days">Last 30 days</SelectItem>
                                <SelectItem value="6-months">Last 6 months</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Chart and Legend */}
                <div className="flex flex-col lg:flex-row items-center justify-evenly gap-2 flex-1">
                    {/* Donut Chart */}
                    <div className="w-[250px] h-[250px]">
                        <Doughnut data={data} options={options} />
                    </div>

                    {/* Legend */}
                    <div className="flex flex-col gap-2 text-sm">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-[#6366f1]" />
                            Product 1
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-[#34d399]" />
                            Product 2
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-[#60a5fa]" />
                            Product 3
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-[#f87171]" />
                            Others
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default TopProductsCard;
