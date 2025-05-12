import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { approveBalanceRequest, rejectBalanceRequest, updateUserPoints } from "./actions"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { formatDate } from "@/lib/utils"

export default async function PaymentsPage() {
  // 관리자 권한 확인
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">접근 권한 없음</h1>
        <p>로그인이 필요합니다.</p>
      </div>
    )
  }

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", session.user.id).single()

  if (!profile?.is_admin) {
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">접근 권한 없음</h1>
        <p>관리자 권한이 필요합니다.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">결제 관리</h1>

      <Tabs defaultValue="requests" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="requests">충전 요청</TabsTrigger>
          <TabsTrigger value="points">포인트 관리</TabsTrigger>
        </TabsList>

        <TabsContent value="requests">
          <Suspense fallback={<div>로딩 중...</div>}>
            <ChargeRequestsTable />
          </Suspense>
        </TabsContent>

        <TabsContent value="points">
          <PointManagement />
        </TabsContent>
      </Tabs>
    </div>
  )
}

async function ChargeRequestsTable() {
  // 관리자 클라이언트 사용하여 충전 요청 목록 가져오기
  const { data: requests, error } = await supabaseAdmin
    .from("balance_requests")
    .select(`
      *,
      profiles:user_id (
        id,
        full_name
      )
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("충전 요청 목록 조회 오류:", error)
    return (
      <Card>
        <CardHeader>
          <CardTitle>충전 요청 목록</CardTitle>
          <CardDescription>사용자의 포인트 충전 요청을 관리합니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-red-50 text-red-800 rounded-md">
            <p>충전 요청 목록을 불러오는 중 오류가 발생했습니다.</p>
            <p className="text-sm mt-2">오류 메시지: {error.message}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // 충전 요청 승인 처리 함수
  async function handleApprove(formData: FormData) {
    "use server"
    const id = formData.get("id") as string
    const result = await approveBalanceRequest(id)
    return result
  }

  // 충전 요청 거절 처리 함수
  async function handleReject(formData: FormData) {
    "use server"
    const id = formData.get("id") as string
    const result = await rejectBalanceRequest(id)
    return result
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>충전 요청 목록</CardTitle>
        <CardDescription>사용자의 포인트 충전 요청을 관리합니다.</CardDescription>
      </CardHeader>
      <CardContent>
        {requests && requests.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>사용자</TableHead>
                <TableHead>금액</TableHead>
                <TableHead>결제 방법</TableHead>
                <TableHead>설명</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>요청일</TableHead>
                <TableHead>액션</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-mono text-xs">{request.id.substring(0, 8)}...</TableCell>
                  <TableCell>{request.profiles?.full_name || request.user_id.substring(0, 8)}</TableCell>
                  <TableCell>{request.amount.toLocaleString()}원</TableCell>
                  <TableCell>{request.payment_method || "계좌이체"}</TableCell>
                  <TableCell>{request.description || "-"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        request.status === "approved"
                          ? "success"
                          : request.status === "rejected"
                            ? "destructive"
                            : "outline"
                      }
                    >
                      {request.status === "approved" ? "승인됨" : request.status === "rejected" ? "거절됨" : "대기중"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(request.created_at)}</TableCell>
                  <TableCell>
                    {request.status === "pending" && (
                      <div className="flex space-x-2">
                        <form action={handleApprove}>
                          <input type="hidden" name="id" value={request.id} />
                          <Button size="sm" variant="default" type="submit">
                            승인
                          </Button>
                        </form>
                        <form action={handleReject}>
                          <input type="hidden" name="id" value={request.id} />
                          <Button size="sm" variant="destructive" type="submit">
                            거절
                          </Button>
                        </form>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">충전 요청이 없습니다.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function PointManagement() {
  async function handleUpdatePoints(formData: FormData) {
    "use server"
    const result = await updateUserPoints(formData)
    return result
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>포인트 직접 관리</CardTitle>
        <CardDescription>사용자의 포인트를 직접 추가하거나 차감합니다.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleUpdatePoints} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="userId">사용자 ID</Label>
            <Input id="userId" name="userId" placeholder="사용자 ID를 입력하세요" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">금액</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              placeholder="추가할 금액은 양수, 차감할 금액은 음수로 입력하세요"
              required
            />
            <p className="text-xs text-muted-foreground">예: 10000 (1만원 추가), -5000 (5천원 차감)</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">설명</Label>
            <Input id="description" name="description" placeholder="포인트 변경 사유를 입력하세요" />
          </div>

          <Button type="submit">포인트 업데이트</Button>
        </form>
      </CardContent>
    </Card>
  )
}
