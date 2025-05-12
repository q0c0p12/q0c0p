"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"
import { approveBalanceRequest, rejectBalanceRequest } from "./actions"

export function BalanceRequestsTable() {
  const [requests, setRequests] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    fetchRequests()
  }, [])

  async function fetchRequests() {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("balance_requests")
        .select(`
          *,
          profile:user_id (
            id,
            full_name
          )
        `)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("충전 요청 조회 오류:", error)
        toast({
          title: "데이터 로딩 오류",
          description: "충전 요청 목록을 불러오는 중 오류가 발생했습니다.",
          variant: "destructive",
        })
      } else {
        setRequests(data || [])
      }
    } catch (error) {
      console.error("충전 요청 조회 오류:", error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleApprove(id: string) {
    if (confirm("이 충전 요청을 승인하시겠습니까?")) {
      setProcessingId(id)
      try {
        const result = await approveBalanceRequest(id)
        if (result.success) {
          toast({
            title: "승인 완료",
            description: result.message,
          })
          fetchRequests() // 목록 새로고침
        } else {
          toast({
            title: "승인 실패",
            description: result.message,
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("승인 처리 오류:", error)
        toast({
          title: "오류 발생",
          description: "승인 처리 중 오류가 발생했습니다.",
          variant: "destructive",
        })
      } finally {
        setProcessingId(null)
      }
    }
  }

  async function handleReject(id: string) {
    if (confirm("이 충전 요청을 거절하시겠습니까?")) {
      setProcessingId(id)
      try {
        const result = await rejectBalanceRequest(id)
        if (result.success) {
          toast({
            title: "거절 완료",
            description: result.message,
          })
          fetchRequests() // 목록 새로고침
        } else {
          toast({
            title: "거절 실패",
            description: result.message,
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("거절 처리 오류:", error)
        toast({
          title: "오류 발생",
          description: "거절 처리 중 오류가 발생했습니다.",
          variant: "destructive",
        })
      } finally {
        setProcessingId(null)
      }
    }
  }

  function renderStatusBadge(status: string) {
    let color = ""
    let label = ""

    switch (status) {
      case "pending":
        color = "bg-yellow-100 text-yellow-800"
        label = "대기중"
        break
      case "approved":
        color = "bg-green-100 text-green-800"
        label = "승인됨"
        break
      case "rejected":
        color = "bg-red-100 text-red-800"
        label = "거절됨"
        break
      default:
        color = "bg-gray-100 text-gray-800"
        label = status
    }

    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>{label}</span>
  }

  if (isLoading) {
    return <div className="text-center py-8">충전 요청 목록을 불러오는 중...</div>
  }

  if (requests.length === 0) {
    return <div className="text-center py-8">충전 요청이 없습니다.</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2 text-left">ID</th>
            <th className="border p-2 text-left">사용자</th>
            <th className="border p-2 text-left">금액</th>
            <th className="border p-2 text-left">상태</th>
            <th className="border p-2 text-left">결제 방법</th>
            <th className="border p-2 text-left">설명</th>
            <th className="border p-2 text-left">신청일</th>
            <th className="border p-2 text-left">처리일</th>
            <th className="border p-2 text-left">작업</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <tr key={request.id} className="hover:bg-gray-50">
              <td className="border p-2">{request.id.substring(0, 8)}...</td>
              <td className="border p-2">{request.profile?.full_name || request.user_id.substring(0, 8)}</td>
              <td className="border p-2">{request.amount.toLocaleString()}원</td>
              <td className="border p-2">{renderStatusBadge(request.status)}</td>
              <td className="border p-2">{request.payment_method || "계좌이체"}</td>
              <td className="border p-2">{request.description || "-"}</td>
              <td className="border p-2">{new Date(request.created_at).toLocaleString()}</td>
              <td className="border p-2">
                {request.reviewed_at ? new Date(request.reviewed_at).toLocaleString() : "-"}
              </td>
              <td className="border p-2">
                {request.status === "pending" && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
                      onClick={() => handleApprove(request.id)}
                      disabled={processingId === request.id}
                    >
                      {processingId === request.id ? "처리중..." : "승인"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200"
                      onClick={() => handleReject(request.id)}
                      disabled={processingId === request.id}
                    >
                      {processingId === request.id ? "처리중..." : "거절"}
                    </Button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
