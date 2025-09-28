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
import { useEffect, useState } from "react";
import { getTopProducts, type TopProductsData } from "@/services/api/dashboard";
// import { topProductsGraphData } from "@/lib/constants/dashboard";

ChartJS.register(ArcElement, Tooltip, Legend);

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
  const [chartData, setChartData] = useState<TopProductsData>({
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [],
        borderWidth: 4,
        cutout: "70%",
      },
    ],
  });

  const [graphErrorMessage, setGraphErrorMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [sortBy, setSortBy] = useState<"sales" | "units">("sales");
  const [period, setPeriod] = useState<"7-days" | "30-days" | "6-months">(
    "30-days",
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setGraphErrorMessage("");

        const data = await getTopProducts(sortBy, period);

        // Check if data exists and has the required structure
        if (!data || !data.labels || !data.datasets || data.datasets.length === 0) {
          setGraphErrorMessage("No Data Found");
          return;
        }

        // Check if labels array is empty
        if (data.labels.length === 0) {
          setGraphErrorMessage("No product labels found");
          return;
        }

        // Check if datasets array is empty or has no data
        const dataset = data.datasets[0];
        if (!dataset || !dataset.data || dataset.data.length === 0) {
          setGraphErrorMessage("No numeric data found to plot");
          return;
        }

        // Check if all data values are zero
        const allZero = dataset.data.every(value => value === 0);
        if (allZero) {
          setGraphErrorMessage("All entries are set to zero");
          return;
        }

        // If we reach here, data is valid - clear error message and set chart data
        setGraphErrorMessage("");
        setChartData(data);
      } catch (err) {
        console.error("Error fetching top products:", err);
        setGraphErrorMessage("Failed to fetch data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [sortBy, period]);

  return (
    <Card className="flex h-full w-full flex-col bg-white">
      <CardContent className="flex flex-1 flex-col p-4">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Top Products</h2>
          <div className="flex gap-2">
            <Select
              value={sortBy}
              onValueChange={(val) => setSortBy(val as "sales" | "units")}
            >
              <SelectTrigger className="w-[110px] justify-start text-sm">
                <SelectValue placeholder="By Sales" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sales">By Sales</SelectItem>
                <SelectItem value="units">By Units</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={period}
              onValueChange={(val) =>
                setPeriod(val as "7-days" | "30-days" | "6-months")
              }
            >
              <SelectTrigger className="w-[130px] justify-start text-sm">
                <Calendar className="mr-2 h-4 w-4" />
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
        <div className="flex flex-1 flex-col items-center justify-evenly gap-2 md:flex-row">
          {isLoading ? (
            <div className="mx-auto flex h-full w-full items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : !graphErrorMessage && chartData.labels.length > 0 && chartData.datasets[0]?.data.length > 0 ? (
            <>
              {/* Donut Chart */}
              <div className="h-[250px] w-[250px]">
                <Doughnut data={chartData} options={options} />
              </div>

              {/* Legend */}
              <div className="flex flex-col gap-2 text-sm">
                {chartData.labels.map((label, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{
                        backgroundColor:
                          chartData.datasets[0]?.backgroundColor[idx] || "#ccc",
                      }}
                    />
                    {label}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="mx-auto flex h-full w-full items-center justify-center text-xl text-gray-500">
              {graphErrorMessage || "No data available"}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopProductsCard;
