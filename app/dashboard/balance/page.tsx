"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Wallet, ArrowUpRight, ArrowDownRight, CreditCard } from "lucide-react"
import { getUserStats, getTransactionHistory, requestBalanceCharge } from "./actions"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"

export default function BalancePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [amount, setAmount] = useState("")
  const [depositor, setDepositor] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("계좌이체")
  const [userStats, setUserStats] = useState<any>({
    balance: 0,
    total_spent: 0,
    total_charged: 0,
  })
  const [transactions, setTransactions] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("balance")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isDataLoading, setIsDataLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      try {
        setIsDataLoading(true)
        // 세션 확인
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          router.push("/auth")
          return
        }

        console.log("세션 확인 완료, 사용자 ID:", session.user.id)

        // 사용자 통계 정보 가져오기
        const statsResult = await getUserStats()
        console.log("사용자 통계 정보 결과:", statsResult)
        if (statsResult.success) {
          setUserStats(statsResult.data)
        }

        // 거래 내역 가져오기
        console.log("거래 내역 요청 시작")
        const historyResult = await getTransactionHistory()
        console.log("거래 내역 결과:", historyResult)
        if (historyResult.success) {
          setTransactions(historyResult.data || [])
        } else {
          console.error("거래 내역 조회 실패:", historyResult.message)
        }
      } catch (error) {
        console.error("데이터 로딩 오류:", error)
        toast({
          title: "데이터 로딩 오류",
          description: "사용자 정보를 불러오는 중 오류가 발생했습니다.",
          variant: "destructive",
        })
      } finally {
        setIsDataLoading(false)
      }
    }

    fetchData()
  }, [supabase, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const formData = new FormData()
      formData.append("amount", amount)
      formData.append("paymentMethod", paymentMethod)
      formData.append("depositor", depositor)

      console.log("충전 요청 전송:", { amount, paymentMethod, depositor })
      const result = await requestBalanceCharge(formData)
      console.log("충전 요청 결과:", result)

      if (result.success) {
        setSuccessMessage(result.message)
        toast({
          title: "충전 요청 성공",
          description: result.message,
        })

        // 폼 초기화
        setAmount("")
        setDepositor("")

        // 데이터 새로고침
        const statsResult = await getUserStats()
        if (statsResult.success) {
          setUserStats(statsResult.data)
        }

        const historyResult = await getTransactionHistory()
        if (historyResult.success) {
          setTransactions(historyResult.data || [])
        }
      } else {
        setErrorMessage(result.message)
        toast({
          title: "충전 요청 실패",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("충전 요청 오류:", error)
      setErrorMessage("충전 요청 중 오류가 발생했습니다.")
      toast({
        title: "오류 발생",
        description: "충전 요청 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const setQuickAmount = (value: string) => {
    setAmount(value)
  }

  // 상태에 따른 배지 렌더링
  const renderStatusBadge = (status: string, type: string) => {
    if (type === "charge") {
      switch (status) {
        case "pending":
          return <Badge className="bg-yellow-500">대기중</Badge>
        case "approved":
          return <Badge className="bg-green-500">승인됨</Badge>
        case "rejected":
          return <Badge className="bg-red-500">거절됨</Badge>
        default:
          return <Badge>{status}</Badge>
      }
    } else {
      switch (status) {
        case "completed":
          return <Badge className="bg-green-500">완료</Badge>
        case "pending":
          return <Badge className="bg-yellow-500">진행중</Badge>
        case "cancelled":
          return <Badge className="bg-red-500">취소됨</Badge>
        default:
          return <Badge>{status}</Badge>
      }
    }
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">포인트 관리</h1>

      <Tabs defaultValue="balance" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="balance">포인트 충전</TabsTrigger>
          <TabsTrigger value="history">거래 내역</TabsTrigger>
        </TabsList>

        <TabsContent value="balance">
          {errorMessage && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>오류</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert variant="default" className="mb-4 bg-green-50 border-green-200">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertTitle>성공</AlertTitle>
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>포인트 정보</CardTitle>
                <CardDescription>현재 포인트 잔액 및 사용 내역을 확인하세요.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center">
                    <Wallet className="mr-2 h-5 w-5 text-primary" />
                    <span className="font-medium">현재 잔액</span>
                  </div>
                  <span className="text-xl font-bold">{userStats?.balance?.toLocaleString() || 0}원</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <ArrowUpRight className="mr-2 h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">총 충전액</span>
                    </div>
                    <span className="text-lg font-bold">{userStats?.total_charged?.toLocaleString() || 0}원</span>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <ArrowDownRight className="mr-2 h-4 w-4 text-red-500" />
                      <span className="text-sm font-medium">총 사용액</span>
                    </div>
                    <span className="text-lg font-bold">{userStats?.total_spent?.toLocaleString() || 0}원</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>포인트 충전</CardTitle>
                <CardDescription>충전할 금액과 입금자명을 입력하세요.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">충전 금액</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="충전할 금액을 입력하세요"
                      min="10000"
                      step="10000"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => setQuickAmount("10000")}>
                        1만원
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => setQuickAmount("30000")}>
                        3만원
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => setQuickAmount("50000")}>
                        5만원
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => setQuickAmount("100000")}>
                        10만원
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">결제 방법</Label>
                    <select
                      id="paymentMethod"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      <option value="계좌이체">계좌이체</option>
                      <option value="카드결제">카드결제</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="depositor">입금자명</Label>
                    <Input
                      id="depositor"
                      placeholder="입금자명을 입력하세요"
                      value={depositor}
                      onChange={(e) => setDepositor(e.target.value)}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "처리 중..." : "충전 신청하기"}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex flex-col items-start">
                <Alert variant="default" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>충전 안내</AlertTitle>
                  <AlertDescription>
                    충전 신청 후 관리자 승인이 필요합니다. 계좌이체의 경우 입금 확인 후 승인됩니다.
                  </AlertDescription>
                </Alert>
              </CardFooter>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>충전 안내</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">계좌이체 정보</h4>
                  <p className="text-sm text-muted-foreground">신한은행 110-123-456789 (주)크몽SMM</p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">충전 과정</h4>
                  <p className="text-sm text-muted-foreground">
                    1. 충전 금액과 입금자명 입력 → 2. 계좌이체 → 3. 관리자 승인 → 4. 포인트 충전 완료
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">유의사항</h4>
                  <p className="text-sm text-muted-foreground">
                    입금자명이 다를 경우 승인이 지연될 수 있습니다. 최소 충전 금액은 10,000원입니다.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>거래 내역</CardTitle>
              <CardDescription>포인트 충전 및 사용 내역을 확인하세요.</CardDescription>
            </CardHeader>
            <CardContent>
              {isDataLoading ? (
                <div className="flex justify-center items-center h-40">
                  <p className="text-muted-foreground">거래 내역을 불러오는 중...</p>
                </div>
              ) : transactions && transactions.length > 0 ? (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-start space-x-4">
                        {transaction.type === "charge" ? (
                          <CreditCard
                            className={`h-10 w-10 p-2 rounded-full ${
                              transaction.status === "approved"
                                ? "bg-green-100 text-green-600"
                                : transaction.status === "rejected"
                                  ? "bg-red-100 text-red-600"
                                  : "bg-yellow-100 text-yellow-600"
                            }`}
                          />
                        ) : (
                          <Wallet className="h-10 w-10 p-2 rounded-full bg-blue-100 text-blue-600" />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{transaction.description}</h4>
                            {renderStatusBadge(transaction.status, transaction.type)}
                          </div>
                          <p className="text-sm text-muted-foreground">{transaction.content}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`text-right ${
                          transaction.type === "charge" && transaction.status === "approved"
                            ? "text-green-600"
                            : transaction.type === "payment"
                              ? "text-red-600"
                              : "text-muted-foreground"
                        }`}
                      >
                        <span className="text-lg font-bold">
                          {transaction.type === "charge" && transaction.status === "approved"
                            ? "+"
                            : transaction.type === "payment"
                              ? "-"
                              : ""}
                          {transaction.amount.toLocaleString()}원
                        </span>
                        <p className="text-xs">
                          {transaction.status === "pending"
                            ? "처리 대기중"
                            : transaction.status === "rejected"
                              ? "거절됨"
                              : transaction.status === "approved"
                                ? "승인됨"
                                : "완료"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">거래 내역이 없습니다.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
