"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import Link from "next/link"

interface RelatedOrdersProps {
  orderId: string
  userId: string
}

export function RelatedOrders({ orderId, userId }: RelatedOrdersProps) {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchRelatedOrders() {
      try {
        const { data, error } = await supabase
          .from("orders")
          .select("id, status, total_amount, created_at")
          .eq("user_id", userId)
          .neq("id", orderId)
          .order("created_at", { ascending: false })
          .limit(5)

        if (error) {
          console.error("관련 주문 조회 오류:", error)
          return
        }

        setOrders(data || [])
      } catch (error) {
        console.error("관련 주문 조회 중 오류 발생:", error)
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchRelatedOrders()
    }
  }, [orderId, userId, supabase])

  // 주문 상태에 따른 배지 및 아이콘
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-500 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            완료
          </Badge>
        )
      case "processing":
        return (
          <Badge className="bg-blue-500 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            진행중
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            취소됨
          </Badge>
        )
      case "refunded":
        return (
          <Badge className="bg-purple-500 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            환불됨
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            대기중
          </Badge>
        )
    }
  }

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  // 금액 포맷팅
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-3 w-[80px]" />
            </div>
            <Skeleton className="h-5 w-[60px]" />
          </div>
        ))}
      </div>
    )
  }

  if (orders.length === 0) {
    return <div className="text-center text-muted-foreground py-4">관련 주문이 없습니다.</div>
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <Link
          key={order.id}
          href={`/dashboard/orders/${order.id}`}
          className="flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors"
        >
          <div>
            <div className="font-medium">주문 #{order.id}</div>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <span>{formatDate(order.created_at)}</span>
              <span>•</span>
              <span>{formatCurrency(order.total_amount)}</span>
            </div>
          </div>
          <div>{getStatusBadge(order.status)}</div>
        </Link>
      ))}
    </div>
  )
}
