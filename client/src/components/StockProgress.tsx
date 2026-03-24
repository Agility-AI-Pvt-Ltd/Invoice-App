import { cn } from "@/lib/utils"

type StockSegment = {
    label: string
    color: string
    value: number
}

const Bar = ({ values }: { values: StockSegment[] }) => {
    const total = values.reduce((sum, item) => sum + item.value, 0)

    return (
        <div className="flex w-full h-2 rounded-full overflow-hidden bg-gray-100">
            {values.map((item, idx) => (
                <div
                    key={idx}
                    style={{ width: `${(item.value / total) * 100}%` }}
                    className={cn(item.color)}
                />
            ))}
        </div>
    )
}

interface StockProgressProps {
    inStock: StockSegment[]
    lowStock: StockSegment[]
    outOfStock: StockSegment[]
}

const StockProgress = ({ inStock, lowStock, outOfStock }: StockProgressProps) => {
    const allSegments = [...inStock, ...lowStock, ...outOfStock]

    const uniqueLegendItems = allSegments.filter(
        (item, i, self) => i === self.findIndex((s) => s.label === item.label)
    )

    return (
        <div className="w-full max-w-5xl mx-auto bg-white p-4 sm:p-6 rounded-lg">
            <div className="flex flex-col lg:flex-row gap-6 lg:items-start">
                {/* Stock Section */}
                <div className="flex-1 space-y-6">
                    {/* In Stock */}
                    <div>
                        <div className="mb-2">
                            <span className="text-sm sm:text-base font-semibold text-gray-900">
                                In Stock
                            </span>
                        </div>
                        <Bar values={inStock} />
                    </div>

                    {/* Low Stock */}
                    <div>
                        <div className="mb-2">
                            <span className="text-sm sm:text-base font-semibold text-gray-900">
                                Low Stock
                            </span>
                        </div>
                        <Bar values={lowStock} />
                    </div>

                    {/* Out of Stock */}
                    <div>
                        <div className="mb-2">
                            <span className="text-sm sm:text-base font-semibold text-gray-900">
                                Out of Stock
                            </span>
                        </div>
                        <Bar values={outOfStock} />
                    </div>
                </div>

                {/* Legend */}
                <div className="min-w-[140px] w-full sm:w-auto">
                    <div className="space-y-3 sm:space-y-2 flex flex-wrap sm:block gap-4 sm:gap-0">
                        {uniqueLegendItems.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                <div
                                    className={cn("w-2.5 h-2.5 rounded-full flex-shrink-0", item.color)}
                                />
                                <span className="text-xs sm:text-sm font-medium text-gray-700">
                                    {item.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default StockProgress
