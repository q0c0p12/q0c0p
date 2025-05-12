"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingCart, CreditCard, BarChart3, Settings } from "lucide-react"
import Link from "next/link"

export function QuickActions() {
  const actions = [
    {
      icon: <ShoppingCart className="h-4 w-4" />,
      label: "서비스 주문",
      href: "/services",
      color: "bg-rose-100 text-rose-600",
    },
    {
      icon: <CreditCard className="h-4 w-4" />,
      label: "잔액 충전",
      href: "/dashboard/balance",
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: <BarChart3 className="h-4 w-4" />,
      label: "주문 내역",
      href: "/dashboard/orders",
      color: "bg-green-100 text-green-600",
    },
    {
      icon: <Settings className="h-4 w-4" />,
      label: "설정",
      href: "/dashboard/profile",
      color: "bg-purple-100 text-purple-600",
    },
  ]

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">빠른 액션</CardTitle>
        <CardDescription>자주 사용하는 기능에 빠르게 접근하세요</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto flex-col gap-1 py-4 justify-start items-center"
              asChild
            >
              <Link href={action.href}>
                <div className={`rounded-full p-2 ${action.color}`}>{action.icon}</div>
                <span className="mt-1">{action.label}</span>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
