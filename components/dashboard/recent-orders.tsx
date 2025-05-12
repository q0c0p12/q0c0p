import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Order {
  id: string | number
  order_number?: string
  service?: string
  package_name?: string
  quantity?: number
  amount?: number
  status?: string
  date?: string
  created_at?: string
  refunded_amount?: number
  refunded_quantity?: number
}

interface RecentOrdersProps {
  orders: Order[]
}

export function RecentOrders({ orders }: RecentOrdersProps) {
  // 상태에 따른 배지 스타일
  const getStatusBadge = (status: string | undefined) => {
    if (!status) return <Badge variant="outline">대기중</Badge>

    switch (status.toLowerCase()) {
      case "completed":
        return <Badge className="bg-green-500">완료</Badge>
      case "pending":
        return <Badge variant="outline">대기중</Badge>
      case "processing":
        return <Badge className="bg-yellow-500">처리중</Badge>
      case "failed":
        return <Badge variant="destructive">실패</Badge>
      case "refunded":
        return <Badge variant="destructive">환불됨</Badge>
      case "partial_refund":
        return <Badge variant="destructive">부분환불</Badge>
      case "cancelled":
        return <Badge variant="destructive">취소됨</Badge>
      default:
        return <Badge variant="outline">대기중</Badge>
    }
  }

  // 날짜 포맷팅 함수
  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return "-"
    try {
      return new Date(dateStr).toLocaleDateString()
    } catch (error) {
      console.error("날짜 변환 오류:", error)
      return "-"
    }
  }

  // 숫자 포맷팅 함수
  const formatNumber = (num: number | undefined) => {
    if (num === undefined || num === null) return "0"
    try {
      return num.toLocaleString()
    } catch (error) {
      console.error("숫자 변환 오류:", error)
      return "0"
    }
  }

  // 금액 표시 함수 (환불 정보 포함)
  const renderAmount = (order: Order) => {
    const { amount, status, refunded_amount } = order

    if (!amount) return "0원"

    if (status === "refunded") {
      return (
        <div className="text-right">
          <span className="line-through text-gray-500">{formatNumber(amount)}원</span>
          <div className="text-red-500 text-xs">전액 환불됨</div>
        </div>
      )
    } else if (status === "partial_refund" && refunded_amount) {
      const actualPaid = amount - refunded_amount
      return (
        <div className="text-right">
          <span className="line-through text-gray-500">{formatNumber(amount)}원</span>
          <div className="text-green-500 text-xs">{formatNumber(actualPaid)}원</div>
          <div className="text-red-500 text-xs">-{formatNumber(refunded_amount)}원</div>
        </div>
      )
    } else if (status === "cancelled") {
      return (
        <div className="text-right">
          <span className="line-through text-gray-500">{formatNumber(amount)}원</span>
          <div className="text-red-500 text-xs">주문 취소됨</div>
        </div>
      )
    } else {
      return <div className="text-right">{formatNumber(amount)}원</div>
    }
  }

  // 수량 표시 함수 (환불된 수량 포함)
  const renderQuantity = (order: Order) => {
    const { quantity, status, refunded_quantity } = order

    if (!quantity) return "0"

    if (status === "refunded") {
      return (
        <div className="text-right">
          <span className="line-through text-gray-500">{formatNumber(quantity)}</span>
          <div className="text-red-500 text-xs">전체 환불</div>
        </div>
      )
    } else if (status === "partial_refund" && refunded_quantity) {
      const actualQuantity = quantity - refunded_quantity
      return (
        <div className="text-right">
          <span className="line-through text-gray-500">{formatNumber(quantity)}</span>
          <div className="text-green-500 text-xs">{formatNumber(actualQuantity)}</div>
          <div className="text-red-500 text-xs">-{formatNumber(refunded_quantity)}</div>
        </div>
      )
    } else if (status === "cancelled") {
      return (
        <div className="text-right">
          <span className="line-through text-gray-500">{formatNumber(quantity)}</span>
          <div className="text-red-500 text-xs">취소됨</div>
        </div>
      )
    } else {
      return <div className="text-right">{formatNumber(quantity)}</div>
    }
  }

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
        <div className="space-y-0.5">
          <CardTitle>최근 주문 내역</CardTitle>
          <CardDescription>최근에 주문한 서비스 목록입니다</CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/orders">전체보기</Link>
        </Button>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>주문번호</TableHead>
              <TableHead className="hidden xs:table-cell">서비스</TableHead>
              <TableHead className="hidden sm:table-cell">패키지</TableHead>
              <TableHead className="hidden md:table-cell text-right">수량</TableHead>
              <TableHead className="text-right">금액</TableHead>
              <TableHead>상태</TableHead>
              <TableHead className="hidden sm:table-cell">날짜</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.order_number || `ORD-${order.id}`}</TableCell>
                  <TableCell className="hidden xs:table-cell">{order.service || "-"}</TableCell>
                  <TableCell className="hidden sm:table-cell">{order.package_name || "-"}</TableCell>
                  <TableCell className="hidden md:table-cell">{renderQuantity(order)}</TableCell>
                  <TableCell>{renderAmount(order)}</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell className="hidden sm:table-cell">{formatDate(order.date || order.created_at)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/orders/${order.id}`}>상세</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  최근 주문 내역이 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
