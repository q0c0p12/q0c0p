"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "@/components/ui/use-toast"
import {
  ChevronDown,
  Eye,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  RefreshCw,
  Mail,
  ShoppingCart,
  Package,
  RotateCcw,
  Loader2,
} from "lucide-react"
import { updateOrderStatus, updateMultipleOrderStatus, processPartialRefund } from "@/app/admin/orders/[id]/actions"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RefundAmountDisplay } from "./refund-amount-display"

// 주문 상태에 따른 배지 색상
const statusColors: Record<string, string> = {
  pending: "bg-yellow-500",
  processing: "bg-blue-500",
  completed: "bg-green-500",
  cancelled: "bg-red-500",
  refunded: "bg-purple-500",
  partial_refund: "bg-orange-500",
}

// 주문 상태 한글 표시
const statusLabels: Record<string, string> = {
  pending: "대기중",
  processing: "처리중",
  completed: "완료됨",
  cancelled: "취소됨",
  refunded: "환불됨",
  partial_refund: "부분환불",
}

export function AdminOrdersTable({ orders: initialOrders }: { orders: any[] }) {
  const router = useRouter()
  const [orders, setOrders] = useState(initialOrders)
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})
  const [actionOrder, setActionOrder] = useState<any>(null)
  const [actionType, setActionType] = useState<"complete" | "cancel" | "process" | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [processingOrderIds, setProcessingOrderIds] = useState<string[]>([])
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [bulkActionType, setBulkActionType] = useState<"complete" | "cancel" | "process" | null>(null)
  const [showBulkActionDialog, setShowBulkActionDialog] = useState(false)

  // 부분 환불 관련 상태
  const [showPartialRefundDialog, setShowPartialRefundDialog] = useState(false)
  const [partialRefundOrder, setPartialRefundOrder] = useState<any>(null)
  const [refundQuantity, setRefundQuantity] = useState<number>(1)
  const [maxRefundQuantity, setMaxRefundQuantity] = useState<number>(1)
  const [unitPrice, setUnitPrice] = useState<number>(0)
  const [refundAmount, setRefundAmount] = useState<number>(0)
  const [remainingAmount, setRemainingAmount] = useState<number>(0)

  // 행 확장/축소 토글
  const toggleRow = (id: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    if (!dateString) return "날짜 없음"
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  // 금액 포맷팅
  const formatCurrency = (amount: number) => {
    if (amount === undefined || amount === null) return "금액 없음"
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(amount)
  }

  // 주문 상태 변경 처리
  const handleStatusChange = async () => {
    if (!actionOrder || !actionType) return

    setIsLoading(true)
    setProcessingOrderIds((prev) => [...prev, actionOrder.id.toString()])

    try {
      let newStatus = ""
      switch (actionType) {
        case "complete":
          newStatus = "completed"
          break
        case "cancel":
          newStatus = "cancelled"
          break
        case "process":
          newStatus = "processing"
          break
      }

      // 서버 액션 호출
      const result = await updateOrderStatus(actionOrder.id.toString(), newStatus)

      if (!result.success) {
        throw new Error(result.error || "상태 변경 중 오류가 발생했습니다.")
      }

      // 로컬 상태 업데이트
      setOrders((prevOrders) =>
        prevOrders.map((order) => {
          if (order.id === actionOrder.id) {
            return { ...order, status: newStatus }
          }
          return order
        }),
      )

      toast({
        title: "주문 상태 변경 완료",
        description: `주문 #${actionOrder.id}의 상태가 ${statusLabels[newStatus]}(으)로 변경되었습니다.`,
      })
    } catch (error: any) {
      console.error("주문 상태 변경 오류:", error)
      toast({
        title: "주문 상태 변경 실패",
        description: error.message || "주문 상태를 변경하는 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setActionOrder(null)
      setActionType(null)
      setProcessingOrderIds((prev) => prev.filter((id) => id !== actionOrder.id.toString()))
    }
  }

  // 다중 주문 상태 변경 처리
  const handleBulkStatusChange = async () => {
    if (!bulkActionType || selectedOrders.length === 0) return

    setIsLoading(true)
    setProcessingOrderIds((prev) => [...prev, ...selectedOrders])

    try {
      let newStatus = ""
      switch (bulkActionType) {
        case "complete":
          newStatus = "completed"
          break
        case "cancel":
          newStatus = "cancelled"
          break
        case "process":
          newStatus = "processing"
          break
      }

      // 서버 액션 호출
      const result = await updateMultipleOrderStatus(selectedOrders, newStatus)

      // 로컬 상태 업데이트
      if (result.success || (result.summary && result.summary.success > 0)) {
        setOrders((prevOrders) =>
          prevOrders.map((order) => {
            if (selectedOrders.includes(order.id.toString())) {
              return { ...order, status: newStatus }
            }
            return order
          }),
        )
      }

      if (result.success) {
        toast({
          title: "일괄 상태 변경 완료",
          description: `${result.summary.success}개 주문의 상태가 ${statusLabels[newStatus]}(으)로 변경되었습니다.`,
        })
      } else if (result.summary && result.summary.success > 0) {
        toast({
          title: "일부 주문 상태 변경 완료",
          description: `${result.summary.success}개 성공, ${result.summary.fail}개 실패`,
          variant: "default",
        })
      } else {
        throw new Error(result.error || "상태 변경 중 오류가 발생했습니다.")
      }

      // 선택 초기화
      setSelectedOrders([])
    } catch (error: any) {
      console.error("일괄 상태 변경 오류:", error)
      toast({
        title: "일괄 상태 변경 실패",
        description: error.message || "주문 상태를 변경하는 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setBulkActionType(null)
      setShowBulkActionDialog(false)
      setProcessingOrderIds([])
    }
  }

  // 부분 환불 다이얼로그 열기
  const openPartialRefundDialog = (order: any) => {
    // 주문 항목에서 수량 정보 가져오기
    let quantity = 1
    let price = 0

    if (order.orderItems && order.orderItems.length > 0) {
      const item = order.orderItems[0]
      quantity = item.quantity || 1
      // 단가 계산: 항목 가격 또는 총액을 수량으로 나눈 값
      price = item.price || order.total_amount / quantity
    } else {
      // 주문 항목이 없는 경우 총액을 기준으로 단가 계산
      quantity = order.quantity || 1
      price = order.total_amount / quantity
    }

    setPartialRefundOrder(order)
    setMaxRefundQuantity(quantity)
    setUnitPrice(price)
    setRefundQuantity(1) // 기본값 1로 설정
    setRefundAmount(price) // 1개 환불 금액
    setRemainingAmount(order.total_amount - price) // 환불 후 남은 금액
    setShowPartialRefundDialog(true)
  }

  // 환불 수량 변경 시 환불 금액 및 남은 금액 계산
  const updateRefundAmounts = (quantity: number) => {
    if (!partialRefundOrder) return

    // 입력값 유효성 검사
    const validQuantity = Math.max(1, Math.min(quantity, maxRefundQuantity))

    // 환불 금액 = 단가 × 환불 수량
    const newRefundAmount = unitPrice * validQuantity

    // 남은 결제 금액 = 총 결제금액 - 환불 금액
    const newRemainingAmount = partialRefundOrder.total_amount - newRefundAmount

    setRefundQuantity(validQuantity)
    setRefundAmount(newRefundAmount)
    setRemainingAmount(newRemainingAmount)
  }

  // 부분 환불 처리
  const handlePartialRefund = async () => {
    if (!partialRefundOrder || refundQuantity <= 0 || refundQuantity > maxRefundQuantity) {
      toast({
        title: "유효하지 않은 환불 수량",
        description: "환불 수량은 1에서 최대 주문 수량 사이여야 합니다.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setProcessingOrderIds((prev) => [...prev, partialRefundOrder.id.toString()])

    try {
      // 서버 액션 호출
      const result = await processPartialRefund(partialRefundOrder.id.toString(), refundQuantity)

      if (!result.success) {
        throw new Error(result.error || "부분 환불 처리 중 오류가 발생했습니다.")
      }

      // 로컬 상태 업데이트
      const newStatus = refundQuantity === maxRefundQuantity ? "refunded" : "partial_refund"

      setOrders((prevOrders) =>
        prevOrders.map((order) => {
          if (order.id === partialRefundOrder.id) {
            return {
              ...order,
              status: newStatus,
              refunded_amount: refundAmount,
              refunded_quantity: refundQuantity,
            }
          }
          return order
        }),
      )

      toast({
        title: "부분 환불 처리 완료",
        description: result.message || `주문 #${partialRefundOrder.id}에 대한 부분 환불이 처리되었습니다.`,
      })
    } catch (error: any) {
      console.error("부분 환불 처리 오류:", error)
      toast({
        title: "부분 환불 처리 실패",
        description: error.message || "부분 환불 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setPartialRefundOrder(null)
      setShowPartialRefundDialog(false)
      setProcessingOrderIds((prev) => prev.filter((id) => id !== partialRefundOrder.id.toString()))
    }
  }

  // 주문 상태 변경 다이얼로그 열기
  const openStatusDialog = (order: any, type: "complete" | "cancel" | "process") => {
    setActionOrder(order)
    setActionType(type)
  }

  // 일괄 처리 다이얼로그 열기
  const openBulkActionDialog = (type: "complete" | "cancel" | "process") => {
    if (selectedOrders.length === 0) {
      toast({
        title: "선택된 주문 없음",
        description: "처리할 주문을 하나 이상 선택해주세요.",
        variant: "destructive",
      })
      return
    }

    setBulkActionType(type)
    setShowBulkActionDialog(true)
  }

  // 체크박스 토글
  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders((prev) => {
      if (prev.includes(orderId)) {
        return prev.filter((id) => id !== orderId)
      } else {
        return [...prev, orderId]
      }
    })
  }

  // 모든 주문 선택/해제
  const toggleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([])
    } else {
      setSelectedOrders(orders.map((order) => order.id.toString()))
    }
  }

  // 부분 환불 상태 표시 여부 확인
  const isPartialRefund = (order: any) => {
    return order.status === "partial_refund"
  }

  // 전체 환불 상태 표시 여부 확인
  const isFullRefund = (order: any) => {
    return order.status === "refunded"
  }

  // 취소 상태 표시 여부 확인
  const isCancelled = (order: any) => {
    return order.status === "cancelled"
  }

  // 주문이 처리 중인지 확인
  const isProcessing = (orderId: string) => {
    return processingOrderIds.includes(orderId)
  }

  return (
    <>
      {/* 일괄 처리 버튼 */}
      {selectedOrders.length > 0 && (
        <div className="bg-muted p-4 rounded-md mb-4 flex flex-wrap items-center gap-2">
          <span className="font-medium mr-2">{selectedOrders.length}개 주문 선택됨</span>
          <Button
            size="sm"
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
            onClick={() => openBulkActionDialog("complete")}
            disabled={isLoading}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            일괄 완료 처리
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
            onClick={() => openBulkActionDialog("process")}
            disabled={isLoading}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            일괄 처리중으로 변경
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
            onClick={() => openBulkActionDialog("cancel")}
            disabled={isLoading}
          >
            <XCircle className="mr-2 h-4 w-4" />
            일괄 취소 처리
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="ml-auto"
            onClick={() => setSelectedOrders([])}
            disabled={isLoading}
          >
            선택 해제
          </Button>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={selectedOrders.length === orders.length && orders.length > 0}
                  onCheckedChange={toggleSelectAll}
                  aria-label="모든 주문 선택"
                  disabled={isLoading}
                />
              </TableHead>
              <TableHead className="w-[50px]">ID</TableHead>
              <TableHead>사용자</TableHead>
              <TableHead className="w-[250px]">서비스 정보</TableHead>
              <TableHead>금액</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>날짜</TableHead>
              <TableHead className="text-right">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  주문 내역이 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <>
                  <TableRow key={order.id} className="hover:bg-muted/50">
                    <TableCell>
                      <Checkbox
                        checked={selectedOrders.includes(order.id.toString())}
                        onCheckedChange={() => toggleOrderSelection(order.id.toString())}
                        aria-label={`주문 ${order.id} 선택`}
                        disabled={isProcessing(order.id.toString()) || isLoading}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                          <Mail className="h-3 w-3 text-gray-500" />
                        </div>
                        <span className="text-sm truncate max-w-[150px]">
                          {order.userEmail || order.userProfile?.full_name || "사용자 " + order.user_id}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {order.orderItems && order.orderItems.length > 0 ? (
                        <div className="space-y-1">
                          {order.orderItems.map((item, index) => (
                            <div key={index} className="text-sm">
                              <div className="font-medium">
                                {item.service_title || item.service?.title || "서비스 정보 없음"}
                              </div>
                              <div className="flex items-center text-muted-foreground">
                                <ShoppingCart className="h-3 w-3 mr-1" />
                                <span>{formatCurrency(item.price || 0)}</span>
                                <span className="ml-2">x {item.quantity || 1}</span>
                              </div>
                              {(item.package_name || item.package_id) && (
                                <div className="flex items-center text-xs text-gray-500 mt-1">
                                  <Package className="h-3 w-3 mr-1" />
                                  <span>{item.package_name || `패키지 #${item.package_id}`}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="text-sm">
                            <div className="font-medium">{order.service_title || "서비스명 없음"}</div>
                            <div className="flex items-center text-muted-foreground">
                              <ShoppingCart className="h-3 w-3 mr-1" />
                              <span>{formatCurrency(order.price || 0)}</span>
                              <span className="ml-2">x {order.quantity || 1}</span>
                            </div>
                            {order.package_name && (
                              <div className="flex items-center text-xs text-gray-500 mt-1">
                                <Package className="h-3 w-3 mr-1" />
                                <span>{order.package_name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {order.status === "partial_refund" ? (
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <span className="line-through text-muted-foreground mr-2">
                              {formatCurrency(order.total_amount)}
                            </span>
                            <span className="font-medium text-green-600">
                              {formatCurrency(order.total_amount - (order.refunded_amount || 0))}
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-red-600">
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 mr-1">
                              환불
                            </Badge>
                            {formatCurrency(order.refunded_amount || 0)}
                            {order.refunded_quantity && (
                              <span className="ml-1 text-xs text-muted-foreground">({order.refunded_quantity}개)</span>
                            )}
                          </div>
                        </div>
                      ) : order.status === "refunded" ? (
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <span className="line-through text-muted-foreground">
                              {formatCurrency(order.total_amount)}
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-red-600">
                            <Badge variant="destructive" className="mr-1">
                              전액 환불
                            </Badge>
                            {formatCurrency(order.refunded_amount || order.total_amount)}
                          </div>
                        </div>
                      ) : order.status === "cancelled" ? (
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <span className="line-through text-muted-foreground">
                              {formatCurrency(order.total_amount)}
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-red-600">
                            <Badge variant="destructive" className="mr-1">
                              주문 취소
                            </Badge>
                            {formatCurrency(order.total_amount)}
                          </div>
                        </div>
                      ) : (
                        <div className="font-medium">{formatCurrency(order.total_amount)}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      {isProcessing(order.id.toString()) ? (
                        <div className="flex items-center">
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          <span className="text-sm">처리 중...</span>
                        </div>
                      ) : (
                        <Badge className={statusColors[order.status] || "bg-gray-500"}>
                          {statusLabels[order.status] || order.status}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(order.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            disabled={isProcessing(order.id.toString()) || isLoading}
                          >
                            <span className="sr-only">메뉴 열기</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/orders/${order.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              상세 보기
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleRow(order.id)}>
                            <ChevronDown className="mr-2 h-4 w-4" />
                            {expandedRows[order.id] ? "접기" : "펼치기"}
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          {/* 상태 변경 메뉴 */}
                          {order.status !== "completed" && (
                            <DropdownMenuItem onClick={() => openStatusDialog(order, "complete")}>
                              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                              완료 처리
                            </DropdownMenuItem>
                          )}

                          {order.status !== "processing" && order.status !== "completed" && (
                            <DropdownMenuItem onClick={() => openStatusDialog(order, "process")}>
                              <RefreshCw className="mr-2 h-4 w-4 text-blue-500" />
                              처리중으로 변경
                            </DropdownMenuItem>
                          )}

                          {order.status !== "cancelled" && (
                            <DropdownMenuItem onClick={() => openStatusDialog(order, "cancel")}>
                              <XCircle className="mr-2 h-4 w-4 text-red-500" />
                              취소 처리
                            </DropdownMenuItem>
                          )}

                          {/* 부분 환불 메뉴 추가 - 취소되거나 환불된 주문이 아닌 경우 표시 */}
                          {order.status !== "cancelled" && order.status !== "refunded" && (
                            <DropdownMenuItem onClick={() => openPartialRefundDialog(order)}>
                              <RotateCcw className="mr-2 h-4 w-4 text-orange-500" />
                              부분 환불
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                  {expandedRows[order.id] && (
                    <TableRow>
                      <TableCell colSpan={8} className="bg-muted/50 p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold mb-2">주문 정보</h4>
                            <p>
                              <span className="font-medium">주문 ID:</span> {order.id}
                            </p>
                            <p>
                              <span className="font-medium">사용자 ID:</span> {order.user_id}
                            </p>
                            <p>
                              <span className="font-medium">이메일:</span> {order.userEmail || "이메일 없음"}
                            </p>
                            <p>
                              <span className="font-medium">총 금액:</span> {formatCurrency(order.total_amount)}
                            </p>
                            {(isPartialRefund(order) || isFullRefund(order)) && (
                              <div className="mt-2 p-3 bg-gray-100 rounded-md">
                                <h5 className="font-medium mb-1">환불 정보</h5>
                                <RefundAmountDisplay order={order} formatCurrency={formatCurrency} />
                                {order.refunded_quantity && (
                                  <p className="text-sm mt-1">
                                    <span className="font-medium">환불 수량:</span> {order.refunded_quantity}개
                                  </p>
                                )}
                                {order.refund_reason && (
                                  <p className="text-sm mt-1">
                                    <span className="font-medium">환불 사유:</span> {order.refund_reason}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">상태 정보</h4>
                            <p>
                              <span className="font-medium">현재 상태:</span>{" "}
                              {statusLabels[order.status] || order.status}
                            </p>
                            <p>
                              <span className="font-medium">생성 날짜:</span> {formatDate(order.created_at)}
                            </p>
                            <p>
                              <span className="font-medium">업데이트 날짜:</span> {formatDate(order.updated_at)}
                            </p>
                            <div className="mt-4 flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => router.push(`/admin/orders/${order.id}`)}
                                disabled={isProcessing(order.id.toString()) || isLoading}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                상세 보기
                              </Button>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 상태 변경 확인 다이얼로그 */}
      <AlertDialog
        open={!!actionOrder && !!actionType}
        onOpenChange={(open) => {
          if (!open) {
            setActionOrder(null)
            setActionType(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === "complete" && "주문 완료 처리"}
              {actionType === "cancel" && "주문 취소 처리"}
              {actionType === "process" && "주문 처리중으로 변경"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === "complete" && "이 주문을 완료 처리하시겠습니까? 완료된 주문은 상태를 변경할 수 없습니다."}
              {actionType === "cancel" && "이 주문을 취소 처리하시겠습니까? 취소된 주문은 다시 활성화할 수 없습니다."}
              {actionType === "process" && "이 주문을 처리중 상태로 변경하시겠습니까?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStatusChange}
              disabled={isLoading}
              className={
                actionType === "cancel" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""
              }
            >
              {isLoading ? "처리 중..." : "확인"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 일괄 처리 확인 다이얼로그 */}
      <AlertDialog
        open={showBulkActionDialog}
        onOpenChange={(open) => {
          if (!open) {
            setBulkActionType(null)
            setShowBulkActionDialog(false)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {bulkActionType === "complete" && "일괄 완료 처리"}
              {bulkActionType === "cancel" && "일괄 취소 처리"}
              {bulkActionType === "process" && "일괄 처리중으로 변경"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {bulkActionType === "complete" &&
                `선택한 ${selectedOrders.length}개 주문을 완료 처리하시겠습니까? 완료된 주문은 상태를 변경할 수 없습니다.`}
              {bulkActionType === "cancel" &&
                `선택한 ${selectedOrders.length}개 주문을 취소 처리하시겠습니까? 취소된 주문은 다시 활성화할 수 없습니다.`}
              {bulkActionType === "process" &&
                `선택한 ${selectedOrders.length}개 주문을 처리중 상태로 변경하시겠습니까?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkStatusChange}
              disabled={isLoading}
              className={
                bulkActionType === "cancel" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""
              }
            >
              {isLoading ? "처리 중..." : "확인"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 부분 환불 다이얼로그 */}
      <AlertDialog
        open={showPartialRefundDialog}
        onOpenChange={(open) => {
          if (!open) {
            setPartialRefundOrder(null)
            setShowPartialRefundDialog(false)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>부분 환불 처리</AlertDialogTitle>
            <AlertDialogDescription>
              주문 #{partialRefundOrder?.id}에 대한 부분 환불을 처리합니다. 환불할 수량을 입력해주세요.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            {/* 주문 정보 요약 */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-md mb-4">
              <div>
                <p className="text-sm font-medium">주문 ID</p>
                <p>#{partialRefundOrder?.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium">총 금액</p>
                <p className="font-semibold">
                  {partialRefundOrder ? formatCurrency(partialRefundOrder.total_amount) : "-"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">주문 상태</p>
                <p>
                  {partialRefundOrder?.status
                    ? statusLabels[partialRefundOrder.status] || partialRefundOrder.status
                    : "-"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">총 수량</p>
                <p>{maxRefundQuantity}개</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="refund-quantity">환불 수량</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="refund-quantity"
                  type="number"
                  min={1}
                  max={maxRefundQuantity}
                  value={refundQuantity}
                  onChange={(e) => updateRefundAmounts(Number.parseInt(e.target.value) || 1)}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">/ {maxRefundQuantity}개</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>단가</Label>
              <div className="text-sm">{formatCurrency(unitPrice)} / 개</div>
            </div>

            <div className="space-y-2">
              <Label>환불 금액</Label>
              <div className="text-lg font-semibold text-red-500">{formatCurrency(refundAmount)}</div>
            </div>

            <div className="space-y-2">
              <Label>환불 후 결제 금액</Label>
              <div className="text-lg font-semibold text-green-600">{formatCurrency(remainingAmount)}</div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-4">
                환불 처리 시 해당 금액만큼 사용자의 포인트가 증가하며, 주문 상태는 부분 환불로 변경됩니다. 전체 수량을
                환불할 경우 주문 상태는 환불됨으로 변경됩니다.
              </p>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePartialRefund}
              disabled={isLoading || refundQuantity <= 0 || refundQuantity > maxRefundQuantity}
              className="bg-orange-600 text-white hover:bg-orange-700"
            >
              {isLoading ? "처리 중..." : "환불 처리"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
