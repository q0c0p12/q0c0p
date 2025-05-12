"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { ArrowLeft, CheckCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { updateOrderStatus } from "../actions"

export default function CompleteOrderPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleComplete = async () => {
    setIsLoading(true)
    try {
      const result = await updateOrderStatus(params.id, "completed", notes)

      if (result.success) {
        toast({
          title: "주문 완료 처리 성공",
          description: "주문이 성공적으로 완료 처리되었습니다.",
        })
        router.push(`/admin/orders/${params.id}`)
      } else {
        throw new Error(result.error || "주문 완료 처리 중 오류가 발생했습니다.")
      }
    } catch (error: any) {
      console.error("주문 완료 처리 오류:", error)
      toast({
        title: "주문 완료 처리 실패",
        description: error.message || "주문 완료 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full p-6">
      <div className="flex items-center mb-6">
        <Button variant="outline" size="sm" asChild className="mr-4">
          <Link href={`/admin/orders/${params.id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            주문 상세로 돌아가기
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">주문 완료 처리</h1>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            주문 #{params.id} 완료 처리
          </CardTitle>
          <CardDescription>이 주문을 완료 처리합니다. 완료된 주문은 상태를 변경할 수 없습니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">메모 (선택사항)</p>
              <Textarea
                placeholder="주문 완료에 대한 메모를 입력하세요..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href={`/admin/orders/${params.id}`}>취소</Link>
          </Button>
          <Button onClick={handleComplete} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                처리 중...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                완료 처리
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
