"use client"

import { useState } from "react"
import { approveChargeRequest, rejectChargeRequest } from "@/app/admin/payments/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { CheckIcon, XIcon, SearchIcon } from "lucide-react"

// 충전 요청 타입 정의
interface ChargeRequest {
  id: string
  user_id: string
  amount: number
  status: string
  created_at: string
  depositor?: string
  payment_method?: string
  user: {
    id: string
    full_name: string
    email: string | null
  }
}

// 충전 요청 관리 컴포넌트 props 타입 정의
interface ChargeRequestsManagementProps {
  chargeRequests: ChargeRequest[]
}

export function ChargeRequestsManagement({ chargeRequests }: ChargeRequestsManagementProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({})

  // 검색어에 따라 충전 요청 필터링
  const filteredRequests = chargeRequests.filter((request) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      request.user.full_name?.toLowerCase().includes(searchLower) ||
      request.depositor?.toLowerCase().includes(searchLower) ||
      request.amount.toString().includes(searchLower) ||
      request.status.toLowerCase().includes(searchLower)
    )
  })

  // 충전 요청 승인 처리
  const handleApprove = async (request: ChargeRequest) => {
    try {
      setIsLoading({ ...isLoading, [request.id]: true })

      const result = await approveChargeRequest(request.id, request.user_id, request.amount)

      if (result.success) {
        toast({
          title: "승인 완료",
          description: result.message,
        })
      } else {
        toast({
          title: "승인 실패",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "승인 실패",
        description: "충전 요청을 승인하는 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsLoading({ ...isLoading, [request.id]: false })
    }
  }

  // 충전 요청 거절 처리
  const handleReject = async (request: ChargeRequest) => {
    try {
      setIsLoading({ ...isLoading, [request.id]: true })

      const result = await rejectChargeRequest(request.id)

      if (result.success) {
        toast({
          title: "거절 완료",
          description: result.message,
        })
      } else {
        toast({
          title: "거절 실패",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "거절 실패",
        description: "충전 요청을 거절하는 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsLoading({ ...isLoading, [request.id]: false })
    }
  }

  // 상태에 따른 배지 색상 결정
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">대기중</Badge>
      case "approved":
        return <Badge variant="success">승인됨</Badge>
      case "rejected":
        return <Badge variant="destructive">거절됨</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (error) {
      return dateString
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <SearchIcon className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="이름, 입금자명, 금액 또는 상태로 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {filteredRequests.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {searchTerm ? "검색 결과가 없습니다." : "충전 요청이 없습니다."}
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>사용자</TableHead>
                <TableHead>금액</TableHead>
                <TableHead>입금자명</TableHead>
                <TableHead>결제 방법</TableHead>
                <TableHead>신청일</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.user.full_name || "알 수 없음"}</TableCell>
                  <TableCell>{request.amount.toLocaleString()}원</TableCell>
                  <TableCell>{request.depositor || "-"}</TableCell>
                  <TableCell>{request.payment_method || "계좌이체"}</TableCell>
                  <TableCell>{formatDate(request.created_at)}</TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell>
                    {request.status === "pending" ? (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={() => handleApprove(request)}
                          disabled={isLoading[request.id]}
                        >
                          <CheckIcon className="h-4 w-4 text-green-500" />
                          <span className="sr-only">승인</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={() => handleReject(request)}
                          disabled={isLoading[request.id]}
                        >
                          <XIcon className="h-4 w-4 text-red-500" />
                          <span className="sr-only">거절</span>
                        </Button>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">처리 완료</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
