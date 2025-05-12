"use client"

import type React from "react"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Copy, Package, ShoppingCart } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface OrderDetailsProps {
  order: any
  isAdmin?: boolean
}

export function OrderDetails({ order, isAdmin = false }: OrderDetailsProps) {
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)

  // 상태에 따른 배지 스타일
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">완료</Badge>
      case "processing":
        return <Badge className="bg-blue-500">진행중</Badge>
      case "pending":
        return <Badge className="bg-yellow-500">대기중</Badge>
      case "cancelled":
        return <Badge variant="destructive">취소됨</Badge>
      case "failed":
        return <Badge variant="destructive">실패</Badge>
      case "refunded":
        return <Badge className="bg-purple-500">환불됨</Badge>
      case "partial_refund":
        return <Badge className="bg-indigo-500">부분환불</Badge>
      default:
        return <Badge variant="outline">대기중</Badge>
    }
  }

  const copyToClipboard = (text: string) => {
    if (!text) {
      toast({
        title: "복사 실패",
        description: "복사할 텍스트가 없습니다.",
        variant: "destructive",
      })
      return
    }

    navigator.clipboard.writeText(text)
    toast({
      title: "클립보드에 복사되었습니다",
      description: text,
    })
  }

  const handleNotesSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!notes.trim()) return

    // 관리자만 메모 추가 가능
    if (!isAdmin) {
      toast({
        title: "권한 없음",
        description: "관리자만 메모를 추가할 수 있습니다.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // 여기에 메모 저장 로직 추가
      // const { error } = await supabase.from("order_notes").insert({ order_id: order.id, note: notes, created_by: userId })

      toast({
        title: "메모가 저장되었습니다",
        description: "주문에 메모가 추가되었습니다.",
      })
      setNotes("")
    } catch (error) {
      console.error("메모 저장 오류:", error)
      toast({
        title: "메모 저장 실패",
        description: "메모를 저장하는 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    if (!dateString) return "날짜 정보 없음"
    try {
      return new Date(dateString).toLocaleString()
    } catch (e) {
      return dateString
    }
  }

  // 금액 포맷팅 함수
  const formatCurrency = (amount: number) => {
    if (amount === undefined || amount === null) return "0원"
    return amount.toLocaleString() + "원"
  }

  // 주문 항목 정보 가져오기
  const orderItems = order.orderItems || []

  return (
    <div>
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="details">기본 정보</TabsTrigger>
          {isAdmin && <TabsTrigger value="notes">메모</TabsTrigger>}
        </TabsList>

        <TabsContent value="details" className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>주문 ID</Label>
              <div className="font-medium">#{order.id}</div>
            </div>
            <div className="space-y-2">
              <Label>주문 상태</Label>
              <div>{getStatusBadge(order.status)}</div>
            </div>
            <div className="space-y-2">
              <Label>주문 날짜</Label>
              <div>{formatDate(order.created_at)}</div>
            </div>
            {/* 금액 정보 */}
            <div className="space-y-2">
              <Label>총 금액</Label>
              <div>
                {order.status === "partial_refund" ? (
                  <div className="flex flex-col">
                    <span className="line-through text-muted-foreground">
                      {formatCurrency(order.total_amount || 0)}
                    </span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(
                        order.total_paid !== undefined
                          ? order.total_paid
                          : order.refunded_amount !== undefined
                            ? order.total_amount - order.refunded_amount
                            : order.total_amount,
                      )}
                    </span>
                    {order.refunded_amount !== undefined && (
                      <span className="text-xs text-red-500">
                        환불: {formatCurrency(order.refunded_amount)}
                        {order.refunded_quantity ? ` (${order.refunded_quantity}개)` : ""}
                      </span>
                    )}
                  </div>
                ) : order.status === "refunded" ? (
                  <div className="flex flex-col">
                    <span className="line-through text-muted-foreground">
                      {formatCurrency(order.total_amount || 0)}
                    </span>
                    <span className="text-xs text-red-500 font-medium">전액 환불됨</span>
                  </div>
                ) : order.status === "cancelled" ? (
                  <div className="flex flex-col">
                    <span className="line-through text-muted-foreground">
                      {formatCurrency(order.total_amount || 0)}
                    </span>
                    <span className="text-xs text-red-500 font-medium">주문 취소됨</span>
                    {order.refunded_amount !== undefined && order.refunded_amount > 0 && (
                      <span className="text-xs text-red-500">환불: {formatCurrency(order.refunded_amount)}</span>
                    )}
                  </div>
                ) : (
                  formatCurrency(order.total_amount || 0)
                )}
              </div>
            </div>
          </div>

          {/* 서비스 정보 섹션 */}
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4">주문 항목</h3>
            {orderItems.length > 0 ? (
              <div className="space-y-4">
                {orderItems.map((item, index) => (
                  <div key={index} className="border rounded-md p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                      <div className="font-medium text-lg">{item.service_title || "서비스 정보 없음"}</div>
                      <Badge variant="outline" className="w-fit">
                        {item.package_name || "기본 패키지"}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">수량: {item.quantity || 1}개</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">단가: {formatCurrency(item.price || 0)}</span>
                      </div>
                    </div>
                    {item.requirements && (
                      <div className="mt-4">
                        <Label className="text-sm">요구사항</Label>
                        <div className="mt-1 text-sm p-3 bg-muted rounded-md">{item.requirements}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground">주문 항목 정보가 없습니다.</div>
            )}
          </div>

          {/* 금액 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">주문 금액</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">상품 금액:</span>
                    <span className="font-medium">{formatCurrency(order.total_amount || 0)}</span>
                  </div>
                  {order.status === "partial_refund" && order.refunded_amount !== undefined && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">환불 금액:</span>
                        <span className="font-medium text-red-500">- {formatCurrency(order.refunded_amount)}</span>
                      </div>
                      {order.refunded_quantity !== undefined && order.refunded_quantity > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">환불 수량:</span>
                          <span className="font-medium">{order.refunded_quantity}개</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="font-medium">최종 결제 금액:</span>
                        <span className="font-bold text-green-600">
                          {formatCurrency(order.total_amount - order.refunded_amount)}
                        </span>
                      </div>
                    </>
                  )}
                  {order.status === "refunded" && (
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="font-medium">최종 결제 금액:</span>
                      <span className="font-bold text-red-500">전액 환불 처리되었습니다</span>
                    </div>
                  )}
                  {order.status === "cancelled" && (
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="font-medium">최종 결제 금액:</span>
                      <span className="font-bold text-red-500">주문이 취소되었습니다</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {order.link && (
            <div className="space-y-2 pt-2">
              <Label>링크</Label>
              <div className="flex items-center gap-2">
                <Input value={order.link} readOnly className="text-xs sm:text-sm" />
                <Button variant="outline" size="icon" onClick={() => copyToClipboard(order.link)} className="shrink-0">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {order.notes && (
            <div className="space-y-2 pt-2">
              <Label>추가 요청사항</Label>
              <div className="rounded-md border p-3 text-sm min-h-[80px]">{order.notes}</div>
            </div>
          )}
        </TabsContent>

        {/* 관리자만 메모 탭 표시 */}
        {isAdmin && (
          <TabsContent value="notes" className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>내부 메모</Label>
              <div className="rounded-md border p-3 text-sm min-h-[100px]">
                {order.internal_notes || "내부 메모가 없습니다."}
              </div>
            </div>

            <form onSubmit={handleNotesSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-note">새 메모 추가</Label>
                <Textarea
                  id="new-note"
                  placeholder="메모를 입력하세요..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
              <Button type="submit" disabled={!notes.trim() || loading}>
                {loading ? "저장 중..." : "메모 저장"}
              </Button>
            </form>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
