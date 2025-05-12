"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"

interface ActivityData {
  spending: Array<{ date: string; amount: number }>
  orders: Array<{ date: string; count: number }>
}

interface ActivityChartProps {
  data: ActivityData
}

export function ActivityChart({ data }: ActivityChartProps) {
  const [period, setPeriod] = useState<"week" | "month" | "year">("month")

  // 날짜 포맷 변환 함수
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("ko-KR", { month: "short", day: "numeric" })
  }

  // 지출 데이터 포맷
  const spendingData = data.spending.map((item) => ({
    date: formatDate(item.date),
    amount: item.amount,
  }))

  // 주문 데이터 포맷
  const ordersData = data.orders.map((item) => ({
    date: formatDate(item.date),
    count: item.count,
  }))

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle>활동 분석</CardTitle>
          <CardDescription>지출 및 주문 활동을 분석합니다</CardDescription>
        </div>
        <Tabs defaultValue="spending" className="w-[200px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="spending">지출</TabsTrigger>
            <TabsTrigger value="orders">주문</TabsTrigger>
          </TabsList>
          <TabsContent value="spending" className="h-[300px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={spendingData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [`${Number(value).toLocaleString()}원`, "지출"]}
                  labelFormatter={(label) => `날짜: ${label}`}
                />
                <Bar dataKey="amount" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
          <TabsContent value="orders" className="h-[300px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ordersData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}건`, "주문"]} labelFormatter={(label) => `날짜: ${label}`} />
                <Line type="monotone" dataKey="count" stroke="#f43f5e" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="flex justify-end">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPeriod("week")}
              className={`text-xs px-2 py-1 rounded ${period === "week" ? "bg-rose-100 text-rose-600" : "text-muted-foreground"}`}
            >
              주간
            </button>
            <button
              onClick={() => setPeriod("month")}
              className={`text-xs px-2 py-1 rounded ${period === "month" ? "bg-rose-100 text-rose-600" : "text-muted-foreground"}`}
            >
              월간
            </button>
            <button
              onClick={() => setPeriod("year")}
              className={`text-xs px-2 py-1 rounded ${period === "year" ? "bg-rose-100 text-rose-600" : "text-muted-foreground"}`}
            >
              연간
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
