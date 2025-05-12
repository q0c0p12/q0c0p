"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Loader2, AlertTriangle } from "lucide-react"

interface OrderActionsProps {
  order: any
  isAdmin?: boolean
}

export function OrderActions({ order, isAdmin = false }: OrderActionsProps) {
  const [loading, setLoading] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showCompleteDialog, setShowCompleteDialog] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // 주문 취소 가능 여부 확인
  const canCancel = ["pending", "processing"].includes(order.status)

  // 주문 완료 가능 여부 확인 (관리자만)
  const canComplete = isAdmin && ["pending", "processing"].includes(order.status)

  // 주문 취소 처리
  const handleCancelOrder = async () => {
    if (!canCancel) return

    setLoading(true)
    try {
      // 주문 상태 업데이트
      const { error } = await supabase
        .from("orders")
        .update({
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id)

      if (error) throw error

      // 포인트 환불 처리
      // 여기에 포인트 환불 로직 추가

      toast({
        title: "주문이 취소되었습니다",
        description: "주문이 성공적으로 취소되었습니다.",
      })

      // 페이지 새로고침
      router.refresh()
    } catch (error) {
      console.error("주문 취소 오류:", error)
      toast({
        title: "주문 취소 실패",
        description: "주문을 취소하는 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setShowCancelDialog(false)
    }
  }

  // 주문 완료 처리 (관리자만)
  const handleCompleteOrder = async () => {
    if (!canComplete || !isAdmin) return

    setLoading(true)
    try {
      // 주문 상태 업데이트
      const { error } = await supabase
        .from("orders")
        .update({
          status: "completed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id)

      if (error) throw error

      toast({
        title: "주문이 완료되었습니다",
        description: "주문 상태가 완료로 변경되었습니다.",
      })

      // 페이지 새로고침
      router.refresh()
    } catch (error) {
      console.error("주문 완료 오류:", error)
      toast({
        title: "주문 완료 실패",
        description: "주문 상태를 변경하는 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setShowCompleteDialog(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>주문 액션</CardTitle>
          <CardDescription>주문에 대한 액션을 수행합니다</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 주문 취소 버튼 */}
          {canCancel && (
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => setShowCancelDialog(true)}
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <AlertTriangle className="mr-2 h-4 w-4" />}
              주문 취소
            </Button>
          )}

          {/* 관리자용 주문 완료 버튼 */}
          {canComplete && (
            <Button variant="default" className="w-full" onClick={() => setShowCompleteDialog(true)} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              주문 완료 처리
            </Button>
          )}

          {/* 주문 상태가 취소 불가능한 경우 안내 메시지 */}
          {!canCancel && !canComplete && (
            <p className="text-sm text-muted-foreground text-center py-2">
              현재 주문 상태에서는 가능한 액션이 없습니다.
            </p>
          )}
        </CardContent>
      </Card>

      {/* 주문 취소 확인 다이얼로그 */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>주문 취소</AlertDialogTitle>
            <AlertDialogDescription>
              정말로 이 주문을 취소하시겠습니까? 취소된 주문은 다시 활성화할 수 없습니다. 취소 시 사용한 포인트는
              환불됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelOrder}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              주문 취소
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 주문 완료 확인 다이얼로그 */}
      <AlertDialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>주문 완료 처리</AlertDialogTitle>
            <AlertDialogDescription>
              이 주문을 완료 처리하시겠습니까? 완료된 주문은 상태를 변경할 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleCompleteOrder} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              완료 처리
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
