import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const Gauge = ({
  value,
  total,
  label,
  legend = [{ label: "Active", color: "bg-violet-600" }],
}: {
  value: number
  total: number
  label: string
  legend?: { label: string; color: string }[]
}) => {
  const SEGMENTS = 24
  const filled = Math.round((value / total) * SEGMENTS)

  return (
    <Card className="w-full max-w-md shadow-sm border border-gray-100">
      <CardContent className="">
        {label && <div className="text-lg font-semibold text-gray-700 mb-4">{label}</div>}

        <div className="flex items-center justify-between gap-8">
          {/* Gauge Container */}
          <div className="relative flex-shrink-0">
            <div className="relative w-48 h-24 sm:w-56 sm:h-28">
              {/* Gauge Segments */}
              {[...Array(SEGMENTS)].map((_, i) => {
                const angle = (180 / (SEGMENTS - 1)) * i
                const rotate = angle - 90
                const isActive = i < filled

                return (
                  <div
                    key={i}
                    className={cn(
                      "absolute bottom-0 left-1/2 rounded-full transition-colors duration-200",
                      "w-2 h-8 sm:w-2.5 sm:h-9",
                      isActive ? "bg-gradient-to-t from-indigo-600 via-violet-600 to-violet-400" : "bg-gray-200",
                    )}
                    style={{
                      transform: `rotate(${rotate}deg) translateX(-50%) translateY(-${
                        i === 0 || i === SEGMENTS - 1 ? "70px" : "72px"
                      })`,
                      transformOrigin: "bottom center",
                    }}
                  />
                )
              })}

              {/* Center Value */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1">
                <span className="text-4xl sm:text-5xl font-bold text-gray-900 tabular-nums">{value}</span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-col gap-3 min-w-0">
            {legend.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2.5">
                <div className={cn("w-2.5 h-2.5 rounded-full flex-shrink-0", item.color)} />
                <span className="text-sm font-medium text-gray-700 truncate">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default Gauge
