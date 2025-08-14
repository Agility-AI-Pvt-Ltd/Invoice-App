//@ts-nocheck
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Gauge from "./Guage";
import StockProgress from "./StockProgress";
import axios from "axios";
import { INVENTORY_API } from "@/services/api/inventory";  
import Cookies from "js-cookie";

const InventorySummary = () => {
    const [dataFromBackend, setDataFromBackend] = useState<any>(null);
    const token = Cookies.get('authToken') || "";

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const res = await axios.get(INVENTORY_API.SUMMARY, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const apiData = res.data.data;

                // Transform backend response to match old dataFromBackend structure
                const transformed = {
                    gauges: {
                        allProducts: apiData.totals.allProducts,
                        active: apiData.totals.activeProducts,
                    },
                    inStock: [
                        {
                            label: "In Stock",
                            color: "bg-green-600",
                            value: apiData.stockDistribution.inStock.segments.find(s => s.label === "In Stock")?.value || 0,
                        },
                        {
                            label: "In Progress",
                            color: "bg-green-300",
                            value: apiData.stockDistribution.inStock.segments.find(s => s.label === "In Progress")?.value || 0,
                        },
                        {
                            label: "Remaining",
                            color: "bg-gray-200",
                            value:
                                apiData.stockDistribution.inStock.count -
                                (apiData.stockDistribution.inStock.segments.find(s => s.label === "In Stock")?.value || 0) -
                                (apiData.stockDistribution.inStock.segments.find(s => s.label === "In Progress")?.value || 0),
                        },
                    ],
                    lowStock: [
                        {
                            label: "Low Stock",
                            color: "bg-orange-400",
                            value: apiData.stockDistribution.lowStock.segments.find(s => s.label === "Low Stock")?.value || 0,
                        },
                        {
                            label: "In Progress",
                            color: "bg-green-300",
                            value: apiData.stockDistribution.lowStock.segments.find(s => s.label === "In Progress")?.value || 0,
                        },
                        {
                            label: "Remaining",
                            color: "bg-gray-200",
                            value:
                                apiData.stockDistribution.lowStock.count -
                                (apiData.stockDistribution.lowStock.segments.find(s => s.label === "Low Stock")?.value || 0) -
                                (apiData.stockDistribution.lowStock.segments.find(s => s.label === "In Progress")?.value || 0),
                        },
                    ],
                    outOfStock: [
                        {
                            label: "Out of Stock",
                            color: "bg-gray-300",
                            value: apiData.stockDistribution.outOfStock.segments.find(s => s.label === "Out of Stock")?.value || 0,
                        },
                        {
                            label: "In Progress",
                            color: "bg-green-300",
                            value: apiData.stockDistribution.outOfStock.segments.find(s => s.label === "In Progress")?.value || 0,
                        },
                    ],
                };

                setDataFromBackend(transformed);
            } catch (error) {
                console.error("Error fetching inventory summary:", error);
            }
        };

        if (token) {
            fetchSummary();
        }
    }, [token]);

    if (!dataFromBackend) {
        return <div>Loading...</div>; // Can replace with skeleton loader
    }

    return (
        <Card className="bg-white shadow-sm rounded-xl w-full ">
            <CardContent className="">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Gauges Section */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Gauge
                            total={500}
                            value={dataFromBackend.gauges.allProducts}
                            label="All products"
                            legend={[{ label: "Active", color: "bg-violet-600" }]}
                        />
                        <Gauge
                            total={500}
                            value={dataFromBackend.gauges.active}
                            label="Active"
                            legend={[
                                { label: "Active", color: "bg-violet-600" },
                                { label: "Inactive", color: "bg-gray-200" },
                            ]}
                        />
                    </div>

                    <StockProgress
                        //@ts-ignore
                        inStock={dataFromBackend.inStock}
                        lowStock={dataFromBackend.lowStock}
                        outOfStock={dataFromBackend.outOfStock}
                    />
                </div>
            </CardContent>
        </Card>
    );
};

export default InventorySummary;
