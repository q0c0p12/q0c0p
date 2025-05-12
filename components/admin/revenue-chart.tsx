"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

interface RevenueChartProps {
  data: {
    name: string
    total: number
  }[]
}

export function RevenueChart({ data }: RevenueChartProps) {
  // 월 이름 포맷팅
  const formatMonth = (month: string) => {
    const [year, monthNum] = month.split("-")
    return `${monthNum}월`
  }

  // 금액 포맷팅
  const formatCurrency = (value: number) => {
    return `₩${value.toLocaleString()}`
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          tickFormatter={formatMonth}
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={formatCurrency} />
        <Tooltip formatter={(value: number) => [`₩${value.toLocaleString()}`, "매출"]} labelFormatter={formatMonth} />
        <Bar dataKey="total" fill="#4f46e5" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
