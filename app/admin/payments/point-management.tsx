"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"
import { updateUserPoints } from "./actions"

export function PointManagement() {
  const [userId, setUserId] = useState("")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [userInfo, setUserInfo] = useState<any>(null)
  const { toast } = useToast()
  const supabase = createClient()

  async function searchUser() {
    if (!userId) {
      toast({
        title: "사용자 ID 필요",
        description: "사용자 ID를 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      // 사용자 정보 조회
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single()

      if (profileError) {
        toast({
          title: "사용자 조회 실패",
          description: "해당 ID의 사용자를 찾을 수 없습니다.",
          variant: "destructive",
        })
        setUserInfo(null)
        return
      }

      // 사용자 통계 정보 조회
      const { data: stats, error: statsError } = await supabase
        .from("user_stats")
        .select("*")
        .eq("user_id", userId)
        .single()

      if (statsError) {
        // 통계 정보가 없으면 기본값 설정
        setUserInfo({
          ...profile,
          balance: 0,
          total_spent: 0,
          total_charged: 0,
          total_orders: 0,
        })
      } else {
        setUserInfo({
          ...profile,
          ...stats,
        })
      }
    } catch (error) {
      console.error("사용자 조회 오류:", error)
      toast({
        title: "오류 발생",
        description: "사용자 정보를 조회하는 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleAddPoints() {
    if (!userId || !amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast({
        title: "입력값 오류",
        description: "유효한 사용자 ID와 금액을 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const result = await updateUserPoints(userId, Number(amount), description || "관리자 포인트 추가")
      if (result.success) {
        toast({
          title: "포인트 추가 완료",
          description: result.message,
        })
        // 사용자 정보 새로고침
        searchUser()
        // 입력값 초기화
        setAmount("")
        setDescription("")
      } else {
        toast({
          title: "포인트 추가 실패",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("포인트 추가 오류:", error)
      toast({
        title: "오류 발생",
        description: "포인트를 추가하는 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSubtractPoints() {
    if (!userId || !amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast({
        title: "입력값 오류",
        description: "유효한 사용자 ID와 금액을 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const result = await updateUserPoints(userId, -Number(amount), description || "관리자 포인트 차감")
      if (result.success) {
        toast({
          title: "포인트 차감 완료",
          description: result.message,
        })
        // 사용자 정보 새로고침
        searchUser()
        // 입력값 초기화
        setAmount("")
        setDescription("")
      } else {
        toast({
          title: "포인트 차감 실패",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("포인트 차감 오류:", error)
      toast({
        title: "오류 발생",
        description: "포인트를 차감하는 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="userId">사용자 ID</Label>
          <div className="flex gap-2">
            <Input
              id="userId"
              placeholder="사용자 ID를 입력하세요"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
            <Button onClick={searchUser} disabled={isLoading}>
              {isLoading ? "조회 중..." : "조회"}
            </Button>
          </div>
        </div>

        {userInfo && (
          <div className="border rounded-md p-4 bg-gray-50">
            <h3 className="font-medium mb-2">사용자 정보</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium">이름:</span> {userInfo.full_name || "이름 없음"}
              </div>
              <div>
                <span className="font-medium">ID:</span> {userInfo.id.substring(0, 8)}...
              </div>
              <div>
                <span className="font-medium">현재 잔액:</span> {userInfo.balance?.toLocaleString() || 0}원
              </div>
              <div>
                <span className="font-medium">총 충전액:</span> {userInfo.total_charged?.toLocaleString() || 0}원
              </div>
              <div>
                <span className="font-medium">총 사용액:</span> {userInfo.total_spent?.toLocaleString() || 0}원
              </div>
              <div>
                <span className="font-medium">총 주문수:</span> {userInfo.total_orders || 0}건
              </div>
            </div>
          </div>
        )}

        {userInfo && (
          <>
            <div className="space-y-2">
              <Label htmlFor="amount">금액</Label>
              <Input
                id="amount"
                type="number"
                placeholder="금액을 입력하세요"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">설명 (선택사항)</Label>
              <Input
                id="description"
                placeholder="포인트 변경 사유를 입력하세요"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="flex gap-4">
              <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={handleAddPoints} disabled={isLoading}>
                {isLoading ? "처리 중..." : "포인트 추가"}
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={handleSubtractPoints}
                disabled={isLoading}
              >
                {isLoading ? "처리 중..." : "포인트 차감"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
