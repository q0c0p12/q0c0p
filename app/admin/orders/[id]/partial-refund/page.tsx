"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"
import { createAdminClient } from "@/lib/supabase/admin"
import { processPartialRefund } from "../actions"

export default function PartialRefundPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const orderId = params.id

  const [isLoading, setIsLoading] = useState(false)
  const [order, setOrder] = useState<any>(null)
  const [orderItems, setOrderItems] = useState<any[]>([])
  const [refundQuantity, setRefundQuantity] = useState<number>(1)
  const [maxQuantity, setMaxQuantity] = useState<number>(1)
  const [unitPrice, setUnitPrice] = useState<number>(0)
  const [refundAmount, setRefundAmount] = useState<number>(0)
  const [isLoadingData, setIsLoadingData] = useState(true)

  // 주문 정보 로드
  useEffect(() => {
    async function loadOrderData() {
      try {
        const supabase = createAdminClient()

        // 주문 정보 가져오기
        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .select("*")
          .eq("id", orderId)
          .single()

        if (orderError) {
          throw new Error("주문 정보를 불러올 수 없습니다.")
        }

        // 주문 항목 정보 가져오기
        const { data: orderItemsData, error: itemsError } = await supabase
          .from("order_items")
          .select("*")
          .eq("order_id", orderId)

        if (itemsError) {
          console.error("주문 항목 조회 오류:", itemsError)
        }

        setOrder(orderData)
        setOrderItems(orderItemsData || [])

        // 최대 수량 및 단가 계산
        if (orderItemsData && orderItemsData.length > 0) {
          const firstItem = orderItemsData[0]
          const quantity = firstItem.quantity || 1
          const price = firstItem.price || orderData.total_amount / quantity

          setMaxQuantity(quantity)
          setUnitPrice(price)
          setRefundQuantity(1)
          setRefundAmount(price) // 기본 1개 환불 금액
        } else {
          // 주문 항목이 없는 경우 기본값 설정
          setMaxQuantity(1)
          setUnitPrice(orderData.total_amount)
          setRefundAmount(orderData.total_amount)
        }
      } catch (error) {
        console.error("데이터 로드 오류:", error)
        toast({
          title: "데이터 로드 실패",
          description: "주문 정보를 불러오는 중 오류가 발생했습니다.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingData(false)
      }
    }

    loadOrderData()
  }, [orderId])

  // 환불 수량 변경 시 환불 금액 계산
  useEffect(() => {
    setRefundAmount(unitPrice * refundQuantity)
  }, [refundQuantity, unitPrice])

  // 환불 처리
  const handleRefund = async () => {
    if (refundQuantity <= 0 || refundQuantity > maxQuantity) {
      toast({
        title: "유효하지 않은 환불 수량",
        description: "환불 수량은 1에서 최대 주문 수량 사이여야 합니다.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const result = await processPartialRefund(orderId, refundQuantity)

      if (!result.success) {
        throw new Error(result.error || "부분 환불 처리 중 오류가 발생했습니다.")
      }

      toast({
        title: "부분 환불 처리 완료",
        description: result.message || `주문 #${orderId}에 대한 부분 환불이 처리되었습니다.`,
      })

      // 주문 상세 페이지로 리다이렉트
      router.push(`/admin/orders/${orderId}`)
    } catch (error: any) {
      console.error("부분 환불 처리 오류:", error)
      toast({
        title: "부분 환불 처리 실패",
        description: error.message || "부분 환불 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 금액 포맷팅
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(amount)
  }

  if (isLoadingData) {
    return (
      <div className="w-full p-6">
        <div className="flex items-center mb-6">
          <Button variant="outline" size="sm" asChild className="mr-4">
            <Link href={`/admin/orders/${orderId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              주문 상세로 돌아가기
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">부분 환불 처리</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">주문 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full p-6">
      <div className="flex items-center mb-6">
        <Button variant="outline" size="sm" asChild className="mr-4">
          <Link href={`/admin/orders/${orderId}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            주문 상세로 돌아가기
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">부분 환불 처리</h1>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>주문 #{orderId} 부분 환불</CardTitle>
            <CardDescription>환불할 수량을 입력하여 부분 환불을 처리합니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 주문 정보 요약 */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-md">
              <div>
                <p className="text-sm font-medium">주문 ID</p>
                <p>#{orderId}</p>
              </div>
              <div>
                <p className="text-sm font-medium">총 금액</p>
                <p className="font-semibold">{formatCurrency(order?.total_amount || 0)}</p>
              </div>
              <div>
                <p className="text-sm font-medium">주문 상태</p>
                <p>{order?.status || "알 수 없음"}</p>
              </div>
              <div>
                <p className="text-sm font-medium">총 수량</p>
                <p>{maxQuantity}개</p>
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
                    max={maxQuantity}
                    value={refundQuantity}
                    onChange={(e) => setRefundQuantity(Number.parseInt(e.target.value) || 1)}
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">/ {maxQuantity}개</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>단가</Label>
                <p>{formatCurrency(unitPrice)} / 개</p>
              </div>

              <div className="space-y-2">
                <Label>환불 금액</Label>
                <p className="text-xl font-bold">{formatCurrency(refundAmount)}</p>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-4">
                  환불 처리 시 해당 금액만큼 사용자의 포인트가 증가하며, 주문 상태는 부분 환불로 변경됩니다. 전체 수량을
                  환불할 경우 주문 상태는 환불됨으로 변경됩니다.
                </p>

                <div className="flex space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/admin/orders/${orderId}`)}
                    disabled={isLoading}
                  >
                    취소
                  </Button>
                  <Button
                    className="bg-orange-600 hover:bg-orange-700"
                    onClick={handleRefund}
                    disabled={isLoading || refundQuantity <= 0 || refundQuantity > maxQuantity}
                  >
                    {isLoading ? "처리 중..." : "환불 처리"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
