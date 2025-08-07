import { Card, CardContent } from "@/components/ui/card"
import Gauge from "./Guage"
import StockProgress from "./StockProgress"

// type StockSegment = {
//     label: string
//     color: string
//     value: number
// }

// const Bar = ({ values }: { values: StockSegment[] }) => {
//     const total = values.reduce((sum, item) => sum + item.value, 0)

//     return (
//         <div className="flex w-full h-2 rounded-full overflow-hidden bg-gray-100">
//             {values.map((item, idx) => (
//                 <div
//                     key={idx}
//                     style={{ width: `${(item.value / total) * 100}%` }}
//                     className={cn(item.color)}
//                 />
//             ))}
//         </div>
//     )
// }

const InventorySummary = () => {
    const dataFromBackend = {
        gauges: {
            allProducts: 310,
            active: 310,
        },
        inStock: [
            { label: "In Stock", color: "bg-green-600", value: 60 },
            { label: "In Progress", color: "bg-green-300", value: 25 },
            { label: "Remaining", color: "bg-gray-200", value: 15 },
        ],
        lowStock: [
            { label: "Low Stock", color: "bg-orange-400", value: 65 },
            { label: "In Progress", color: "bg-green-300", value: 20 },
            { label: "Remaining", color: "bg-gray-200", value: 15 },
        ],
        outOfStock: [{ label: "Out of Stock", color: "bg-gray-300", value: 100 }],
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

                    <StockProgress />
                </div>
            </CardContent>
        </Card>
    )
}

export default InventorySummary
