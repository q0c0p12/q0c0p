"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ActivityData {
  spending: Array<{ date: string; amount: number }>
  orders: Array<{ date: string; count: number }>
}

interface ActivityChartProps {
  data: ActivityData
}

export function SimpleActivityChart({ data }: ActivityChartProps) {
  const [period, setPeriod] = useState<"week" | "month" | "year">("month")

  // 최대값 계산
  const maxSpending = Math.max(...data.spending.map((item) => item.amount))
  const maxOrders = Math.max(...data.orders.map((item) => item.count))

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle>활동 분석</CardTitle>
            <CardDescription>지출 및 주문 활동을 분석합니다</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPeriod("week")}
              className={`text-xs px-2 py-1 rounded-md transition-colors ${
                period === "week" ? "bg-rose-100 text-rose-600 font-medium" : "text-muted-foreground hover:bg-gray-100"
              }`}
            >
              주간
            </button>
            <button
              onClick={() => setPeriod("month")}
              className={`text-xs px-2 py-1 rounded-md transition-colors ${
                period === "month" ? "bg-rose-100 text-rose-600 font-medium" : "text-muted-foreground hover:bg-gray-100"
              }`}
            >
              월간
            </button>
            <button
              onClick={() => setPeriod("year")}
              className={`text-xs px-2 py-1 rounded-md transition-colors ${
                period === "year" ? "bg-rose-100 text-rose-600 font-medium" : "text-muted-foreground hover:bg-gray-100"
              }`}
            >
              연간
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 pb-4">
        <Tabs defaultValue="spending" className="w-full">
          <div className="px-4 mb-2">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="spending">지출</TabsTrigger>
              <TabsTrigger value="orders">주문</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="spending" className="h-[350px] md:h-[380px] lg:h-[400px] mt-0 px-4">
            <div className="h-full w-full flex items-end justify-between gap-1 pt-4">
              {data.spending.map((item, index) => (
                <div key={index} className="flex flex-col items-center gap-2 flex-1 group">
                  <div className="relative w-full flex justify-center">
                    <div
                      className="w-[85%] bg-gradient-to-t from-rose-600 to-rose-400 rounded-t-md transition-all duration-300 group-hover:w-full group-hover:bg-gradient-to-t group-hover:from-rose-700 group-hover:to-rose-500 shadow-sm"
                      style={{
                        height: `${Math.max((item.amount / maxSpending) * 200, 30)}px`,
                      }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-rose-600 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {item.amount.toLocaleString()}원
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground truncate w-full text-center font-medium">
                    {item.date}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="orders" className="h-[350px] md:h-[380px] lg:h-[400px] mt-0 px-4">
            <div className="h-full w-full flex flex-col justify-between pt-8 pb-4">
              <div className="relative flex-1">
                {/* 배경 그리드 라인 */}
                <div className="absolute inset-0 grid grid-rows-4 w-full h-full">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-full border-t border-gray-100 flex items-center"
                      style={{ height: "25%" }}
                    >
                      <span className="text-[10px] text-gray-400 absolute -left-6">
                        {Math.round((maxOrders / 4) * (4 - i))}
                      </span>
                    </div>
                  ))}
                </div>

                {/* 데이터 포인트와 라인 */}
                {data.orders.map((item, index) => {
                  const prevItem = index > 0 ? data.orders[index - 1] : null
                  const x1 = index > 0 ? `${(index - 1) * (100 / (data.orders.length - 1))}%` : "0%"
                  const y1 = index > 0 ? `${100 - (prevItem!.count / maxOrders) * 80}%` : "0%"
                  const x2 = `${index * (100 / (data.orders.length - 1))}%`
                  const y2 = `${100 - (item.count / maxOrders) * 80}%`

                  return (
                    <div key={index} className="absolute group" style={{ left: x2, top: y2 }}>
                      <div className="w-4 h-4 bg-white border-2 border-rose-500 rounded-full -ml-2 -mt-2 transition-all duration-300 group-hover:border-rose-600 group-hover:scale-125 shadow-sm" />
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-rose-600 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {item.count}건
                      </div>
                      {index > 0 && (
                        <svg
                          className="absolute top-0 left-0 w-full h-full pointer-events-none"
                          style={{
                            width: `calc(${x2} - ${x1})`,
                            height: `calc(${y2} - ${y1})`,
                            transform: `translate(calc(-100% + 2px), 2px)`,
                          }}
                        >
                          <line
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="100%"
                            stroke="url(#gradient)"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                          <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#f43f5e" />
                              <stop offset="100%" stopColor="#e11d48" />
                            </linearGradient>
                          </defs>
                        </svg>
                      )}
                    </div>
                  )
                })}
              </div>
              <div className="flex justify-between mt-4 px-2">
                {data.orders.map((item, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div className="text-xs font-medium text-muted-foreground">{item.date}</div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
