"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

export default function BalanceRequestsPage() {
  const router = useRouter()
  const [pendingRequests, setPendingRequests] = useState<any[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    async function checkAdminAndFetchRequests() {
      try {
        // 세션 확인
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          router.push("/auth")
          return
        }

        // 관리자 권한 확인
        const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", session.user.id).single()

        if (!profile?.is_admin) {
          router.push("/dashboard")
          return
        }

        setIsAdmin(true)

        // 모든 사용자의 대기 중인 충전 요청 가져오기
        const allPendingCharges: any[] = []

        // 로컬 스토리지에서 모든 키 가져오기
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && key.startsWith("pendingCharges_")) {
            const userId = key.replace("pendingCharges_", "")
            const storedPendingCharges = localStorage.getItem(key)

            if (storedPendingCharges) {
              const charges = JSON.parse(storedPendingCharges)

              // 사용자 정보 가져오기
              const { data: userData } = await supabase.from("profiles").select("email").eq("id", userId).single()

              // 각 충전 요청에 사용자 이메일 추가
              const chargesWithUserInfo = charges.map((charge: any) => ({
                ...charge,
                userEmail: userData?.email || "알 수 없는 사용자",
              }))

              allPendingCharges.push(...chargesWithUserInfo)
            }
          }
        }

        // 날짜 기준으로 정렬
        allPendingCharges.sort((a, b) => {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        })

        setPendingRequests(allPendingCharges)
      } catch (error) {
        console.error("Error checking admin status:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAdminAndFetchRequests()
  }, [supabase, router])

  // 충전 요청 승인 처리
  async function handleApprove(request: any) {
    try {
      // 세션 확인
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        toast({
          title: "오류",
          description: "로그인이 필요합니다.",
          variant: "destructive",
        })
        return
      }

      // 사용자 프로필 가져오기
      const { data: profile } = await supabase
        .from("profiles")
        .select("balance, points")
        .eq("id", request.user_id)
        .single()

      // 현재 잔액 계산
      const currentBalance = profile?.balance || profile?.points || 0

      // 잔액 업데이트
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          balance: currentBalance + request.amount,
          // 다른 필드가 있다면 여기에 추가
        })
        .eq("id", request.user_id)

      if (updateError) {
        toast({
          title: "오류",
          description: "잔액 업데이트 중 오류가 발생했습니다.",
          variant: "destructive",
        })
        return
      }

      // 로컬 스토리지에서 해당 요청 상태 업데이트
      const storageKey = `pendingCharges_${request.user_id}`
      const storedPendingCharges = localStorage.getItem(storageKey)

      if (storedPendingCharges) {
        const charges = JSON.parse(storedPendingCharges)
        const updatedCharges = charges.map((charge: any) => {
          if (charge.id === request.id) {
            return { ...charge, status: "approved" }
          }
          return charge
        })

        localStorage.setItem(storageKey, JSON.stringify(updatedCharges))
      }

      // 현재 표시 중인 요청 목록 업데이트
      const updatedRequests = pendingRequests.map((req) => {
        if (req.id === request.id) {
          return { ...req, status: "approved" }
        }
        return req
      })

      setPendingRequests(updatedRequests)

      toast({
        title: "승인 완료",
        description: "충전 요청이 승인되었습니다.",
      })
    } catch (error) {
      console.error("Error approving request:", error)
      toast({
        title: "오류",
        description: "요청 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  // 충전 요청 거절 처리
  function handleReject(request: any) {
    try {
      // 로컬 스토리지에서 해당 요청 상태 업데이트
      const storageKey = `pendingCharges_${request.user_id}`
      const storedPendingCharges = localStorage.getItem(storageKey)

      if (storedPendingCharges) {
        const charges = JSON.parse(storedPendingCharges)
        const updatedCharges = charges.map((charge: any) => {
          if (charge.id === request.id) {
            return { ...charge, status: "rejected" }
          }
          return charge
        })

        localStorage.setItem(storageKey, JSON.stringify(updatedCharges))
      }

      // 현재 표시 중인 요청 목록 업데이트
      const updatedRequests = pendingRequests.map((req) => {
        if (req.id === request.id) {
          return { ...req, status: "rejected" }
        }
        return req
      })

      setPendingRequests(updatedRequests)

      toast({
        title: "거절 완료",
        description: "충전 요청이 거절되었습니다.",
      })
    } catch (error) {
      console.error("Error rejecting request:", error)
      toast({
        title: "오류",
        description: "요청 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>로딩 중...</p>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>관리자 권한이 필요합니다.</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">포인트 충전 요청 관리</h1>
        <p className="text-muted-foreground">사용자의 포인트 충전 요청을 관리합니다.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>충전 요청 목록</CardTitle>
          <CardDescription>사용자가 요청한 포인트 충전 내역입니다.</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingRequests && pendingRequests.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">요청 ID</th>
                    <th className="text-left p-2">사용자</th>
                    <th className="text-left p-2">입금자명</th>
                    <th className="text-left p-2">금액</th>
                    <th className="text-left p-2">상태</th>
                    <th className="text-left p-2">요청일</th>
                    <th className="text-left p-2">액션</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRequests.map((request) => (
                    <tr key={request.id} className="border-b hover:bg-muted/50">
                      <td className="p-2">{request.id.substring(0, 8)}...</td>
                      <td className="p-2">{request.userEmail}</td>
                      <td className="p-2">
                        {request.content?.includes("입금자명:") ? request.content.split("입금자명:")[1].trim() : "-"}
                      </td>
                      <td className="p-2">{request.amount.toLocaleString()}원</td>
                      <td className="p-2">
                        <Badge
                          className={
                            request.status === "pending"
                              ? "bg-yellow-500"
                              : request.status === "approved"
                                ? "bg-green-500"
                                : "bg-red-500"
                          }
                        >
                          {request.status === "pending"
                            ? "대기중"
                            : request.status === "approved"
                              ? "승인됨"
                              : "거절됨"}
                        </Badge>
                      </td>
                      <td className="p-2">{new Date(request.created_at).toLocaleDateString()}</td>
                      <td className="p-2">
                        {request.status === "pending" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleApprove(request)}
                            >
                              승인
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleReject(request)}>
                              거절
                            </Button>
                          </div>
                        )}
                        {request.status !== "pending" && <span className="text-muted-foreground">처리 완료</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">충전 요청이 없습니다.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
