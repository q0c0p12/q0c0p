"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function RefundSimulationPage() {
  // 주문 정보 (시뮬레이션용)
  const [order, setOrder] = useState({
    id: "12345",
    user_id: "user123",
    total_amount: 70000,
    status: "processing",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    quantity: 7,
    refunded_quantity: 0,
    refunded_amount: 0,
    total_paid: 70000,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [refundQuantity, setRefundQuantity] = useState<number>(1)
  const [refundAmount, setRefundAmount] = useState<number>(10000)
  const [remainingAmount, setRemainingAmount] = useState<number>(60000)
  const [isRefunded, setIsRefunded] = useState(false)

  // 환불 수량 변경 시 환불 금액 및 남은 금액 계산
  const updateRefundAmounts = (quantity: number) => {
    // 입력값 유효성 검사
    const validQuantity = Math.max(1, Math.min(quantity, order.quantity))

    // 단가 계산
    const unitPrice = order.total_amount / order.quantity

    // 환불 금액 = 단가 × 환불 수량
    const newRefundAmount = unitPrice * validQuantity

    // 남은 결제 금액 = 총 결제금액 - 환불 금액
    const newRemainingAmount = order.total_amount - newRefundAmount

    setRefundQuantity(validQuantity)
    setRefundAmount(newRefundAmount)
    setRemainingAmount(newRemainingAmount)
  }

  // 부분 환불 처리
  const handlePartialRefund = async () => {
    if (refundQuantity <= 0 || refundQuantity > order.quantity) {
      toast({
        title: "유효하지 않은 환불 수량",
        description: "환불 수량은 1에서 최대 주문 수량 사이여야 합니다.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // 환불 처리 시뮬레이션 (실제로는 서버 액션 호출)
    setTimeout(() => {
      // 주문 상태 업데이트
      setOrder({
        ...order,
        status: "partial_refund",
        refunded_quantity: refundQuantity,
        refunded_amount: refundAmount,
        total_paid: remainingAmount,
      })

      setIsRefunded(true)
      setIsLoading(false)

      toast({
        title: "부분 환불 처리 완료",
        description: `주문 #${order.id}에 대한 부분 환불이 처리되었습니다.`,
      })
    }, 1500) // 1.5초 지연으로 처리 시간 시뮬레이션
  }

  // 금액 포맷팅
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(amount)
  }

  return (
    <div className="w-full p-6">
      <div className="flex items-center mb-6">
        <Button variant="outline" size="sm" asChild className="mr-4">
          <Link href="/admin/orders">
            <ArrowLeft className="h-4 w-4 mr-2" />
            주문 목록으로 돌아가기
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">부분 환불 시뮬레이션</h1>
      </div>

      <div className="max-w-2xl mx-auto">
        {!isRefunded ? (
          <Card>
            <CardHeader>
              <CardTitle>주문 #{order.id} 부분 환불</CardTitle>
              <CardDescription>환불할 수량을 입력하여 부분 환불을 처리합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 주문 정보 요약 */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-md">
                <div>
                  <p className="text-sm font-medium">주문 ID</p>
                  <p>#{order.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">총 금액</p>
                  <p className="font-semibold">{formatCurrency(order.total_amount)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">주문 상태</p>
                  <p>{order.status}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">총 수량</p>
                  <p>{order.quantity}개</p>
                </div>
              </div>

              {/* 환불 수량 입력 */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="refund-quantity">환불 수량</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="refund-quantity"
                      type="number"
                      min={1}
                      max={order.quantity}
                      value={refundQuantity}
                      onChange={(e) => updateRefundAmounts(Number.parseInt(e.target.value) || 1)}
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground">/ {order.quantity}개</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>단가</Label>
                  <p>{formatCurrency(order.total_amount / order.quantity)} / 개</p>
                </div>

                <div className="space-y-2">
                  <Label>환불 금액</Label>
                  <p className="text-xl font-bold text-red-500">{formatCurrency(refundAmount)}</p>
                </div>

                <div className="space-y-2">
                  <Label>환불 후 결제 금액</Label>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(remainingAmount)}</p>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-4">
                    환불 처리 시 해당 금액만큼 사용자의 포인트가 증가하며, 주문 상태는 부분 환불로 변경됩니다. 전체
                    수량을 환불할 경우 주문 상태는 환불됨으로 변경됩니다.
                  </p>

                  <div className="flex space-x-4">
                    <Button variant="outline" onClick={() => {}} disabled={isLoading}>
                      취소
                    </Button>
                    <Button
                      className="bg-orange-600 hover:bg-orange-700"
                      onClick={handlePartialRefund}
                      disabled={isLoading || refundQuantity <= 0 || refundQuantity > order.quantity}
                    >
                      {isLoading ? "처리 중..." : "환불 처리"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>부분 환불 처리 완료</CardTitle>
              <CardDescription>주문 #{order.id}에 대한 부분 환불이 처리되었습니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 주문 정보 요약 */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-md">
                <div>
                  <p className="text-sm font-medium">주문 ID</p>
                  <p>#{order.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">주문 상태</p>
                  <Badge className="bg-orange-500">부분환불</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium">환불 수량</p>
                  <p>
                    {order.refunded_quantity}개 / {order.quantity}개
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">환불 금액</p>
                  <p className="text-red-500 font-medium">{formatCurrency(order.refunded_amount)}</p>
                </div>
              </div>

              {/* 환불 결과 표시 */}
              <div className="p-4 border rounded-md">
                <h3 className="font-medium mb-3">환불 후 주문 정보</h3>

                <div className="space-y-3">
                  <div className="flex flex-col">
                    <div className="flex items-center">
                      <span className="text-sm font-medium mr-2">원래 금액:</span>
                      <span className="line-through text-muted-foreground">{formatCurrency(order.total_amount)}</span>
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center">
                      <span className="text-sm font-medium mr-2">실제 결제:</span>
                      <span className="text-green-600 font-medium">{formatCurrency(order.total_paid)}</span>
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center">
                      <span className="text-sm font-medium mr-2">환불:</span>
                      <span className="text-red-600 font-medium">{formatCurrency(order.refunded_amount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button variant="outline" onClick={() => setIsRefunded(false)} className="mr-2">
                  다시 시뮬레이션
                </Button>
                <Button asChild>
                  <Link href="/admin/orders">주문 목록으로</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
