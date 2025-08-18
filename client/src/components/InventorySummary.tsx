// FILE: client\src\components\InventorySummary.tsx

//@ts-nocheck
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Gauge from "./Guage";
import StockProgress from "./StockProgress";
import axios from "axios";
import { INVENTORY_API } from "@/services/api/inventory";
import Cookies from "js-cookie";

/**
 * Props:
 * - refreshSignal?: optional number; increment this from parent to force re-fetch
 *
 * NOTE: UI/markup untouched. This component is now more defensive about missing fields
 * in backend response (uses safe defaults).
 */
const InventorySummary = ({ refreshSignal }: { refreshSignal?: number } = {}) => {
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

                const apiData = res?.data?.data || {};

                // safe helpers
                const safeNumber = (v: any) => {
                    const n = Number(v);
                    return isNaN(n) ? 0 : n;
                };

                const getSegmentValue = (segments: any, label: string) => {
                    if (!Array.isArray(segments)) return 0;
                    const seg = segments.find((s: any) => s?.label === label);
                    return safeNumber(seg?.value ?? 0);
                };

                const inStockSegments = apiData?.stockDistribution?.inStock?.segments || [];
                const lowStockSegments = apiData?.stockDistribution?.lowStock?.segments || [];
                const outOfStockSegments = apiData?.stockDistribution?.outOfStock?.segments || [];

                const inStockCount = safeNumber(apiData?.stockDistribution?.inStock?.count ?? 0);
                const lowStockCount = safeNumber(apiData?.stockDistribution?.lowStock?.count ?? 0);
                const outOfStockCount = safeNumber(apiData?.stockDistribution?.outOfStock?.count ?? 0);

                // Transform backend response to match old dataFromBackend structure (safely)
                const transformed = {
                    gauges: {
                        allProducts: safeNumber(apiData?.totals?.allProducts ?? 0),
                        active: safeNumber(apiData?.totals?.activeProducts ?? 0),
                    },
                    inStock: [
                        {
                            label: "In Stock",
                            color: "bg-green-600",
                            value: getSegmentValue(inStockSegments, "In Stock"),
                        },
                        {
                            label: "In Progress",
                            color: "bg-green-300",
                            value: getSegmentValue(inStockSegments, "In Progress"),
                        },
                        {
                            label: "Remaining",
                            color: "bg-gray-200",
                            value:
                                inStockCount -
                                getSegmentValue(inStockSegments, "In Stock") -
                                getSegmentValue(inStockSegments, "In Progress"),
                        },
                    ],
                    lowStock: [
                        {
                            label: "Low Stock",
                            color: "bg-orange-400",
                            value: getSegmentValue(lowStockSegments, "Low Stock"),
                        },
                        {
                            label: "In Progress",
                            color: "bg-green-300",
                            value: getSegmentValue(lowStockSegments, "In Progress"),
                        },
                        {
                            label: "Remaining",
                            color: "bg-gray-200",
                            value:
                                lowStockCount -
                                getSegmentValue(lowStockSegments, "Low Stock") -
                                getSegmentValue(lowStockSegments, "In Progress"),
                        },
                    ],
                    outOfStock: [
                        {
                            label: "Out of Stock",
                            color: "bg-gray-300",
                            value: getSegmentValue(outOfStockSegments, "Out of Stock"),
                        },
                        {
                            label: "In Progress",
                            color: "bg-green-300",
                            value: getSegmentValue(outOfStockSegments, "In Progress"),
                        },
                    ],
                };

                setDataFromBackend(transformed);
            } catch (error) {
                console.error("Error fetching inventory summary:", error);
                // keep previous data or set to null so UI shows loading/empty state
                setDataFromBackend(null);
            }
        };

        if (token) {
            fetchSummary();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, refreshSignal]);

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
