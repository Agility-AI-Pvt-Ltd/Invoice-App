import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { GreenUp, RedDown, GreenUpIcon, RedDownIcon } from "./ui/ArrowSVG";
import type { SummaryCardData } from "@/types/purchase";

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

export default function SummaryCard({
    title,
    value,
    percentageChange,
    isPositive,
    unit,
    extraInfo,
    borderColor,
}: SummaryCardData) {
    return (
        <Card className={cn("w-full rounded-xl shadow border bg-white hover:shadow-lg transition-shadow duration-300", borderColor && `border-2 ${borderColor}`)} >
            <CardContent className="px-4 py-2 flex flex-col justify-between h-full">
                {/* Title + Graph */}
                <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 ml-4">
                        <h3 className="text-2xl  font-semibold text-black">{title}</h3>
                        <p className="text-5xl items-center font-bold text-[#1e1eb6] mt-1 leading-none">
                            {unit} {formatCurrency(value).replace("₹", "")}
                        </p>
                    </div>
                    <div className="mr-4">
                        {
                            isPositive ? (
                                <GreenUp />
                            ) : (
                                <RedDown />
                            )
                        }
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="mt-4 flex justify-between items-end">
                    {/* Change Info */}
                    <div className="flex items-center text-sm">
                        {isPositive ? (
                            <GreenUpIcon className="h-4 w-4 mr-1 text-green-600" />
                        ) : (
                            <RedDownIcon className="h-4 w-4 mr-1 text-red-600" />
                        )}
                        <span
                            className={cn("font-medium", isPositive ? "text-green-600" : "text-red-600")}
                        >
                            {percentageChange}%
                        </span>
                        <span className="ml-1 text-gray-500 text-[13px]">
                            {isPositive ? "Since last month" : "Since this month"}
                        </span>
                    </div>

                    {/* Optional Extra Info */}
                    {extraInfo && (
                        <div className="text-right">
                            <div className="text-sm font-medium text-[#555]">{extraInfo.label}</div>
                            <div className="text-xl font-bold text-black leading-none">
                                {extraInfo.value}
                            </div>
                            {extraInfo.progressBar && (
                                <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
                                    <div
                                        className="h-full bg-blue-600 rounded-full"
                                        style={{
                                            width: `${(extraInfo.progressBar.current / extraInfo.progressBar.total) * 100
                                                }%`,
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
