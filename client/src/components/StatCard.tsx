import { Card, CardContent } from "@/components/ui/card";
import { GreenUp, RedDown, GreenUpIcon, RedDownIcon } from "./ui/ArrowSVG";

interface StatCardProps {
    title: string;
    value: string;
    change: number; 
    changeLabel: string;
    trend: "up" | "down";
}

const StatCard = ({ title, value, change, changeLabel, trend }: StatCardProps) => {
    const isPositive = trend === "up";

    return (
        <Card className="w-full rounded-2xl  border border-gray-200">
            <CardContent className="px-5 flex flex-col justify-between h-full">
                {/* Top Row: Title + Graph */}
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-sm text-muted-foreground font-medium">{title}</h3>
                        <p className="text-3xl font-bold text-blue-800 mt-1">{value}</p>
                    </div>
                    <div className="h-12 w-20">{isPositive ? <GreenUp /> : <RedDown />}</div>
                </div>

                {/* Bottom Row: Arrow Icon + % Change + Label */}
                <div className="mt-6 flex items-center space-x-2">
                    <span className="flex items-center">
                        {isPositive ? <GreenUpIcon className="w-4 h-4 mr-1" /> : <RedDownIcon className="w-4 h-4 mr-1" />}
                        <span className={isPositive ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                            {Math.abs(change)}%
                        </span>
                    </span>
                    <span className="text-xs text-center text-muted-foreground">{changeLabel}</span>
                </div>
            </CardContent>
        </Card>
    );
};

export default StatCard;
