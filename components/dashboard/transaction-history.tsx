"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getTransactionHistory } from "@/app/dashboard/balance/actions"

interface Transaction {
  id: string
  amount: number
  description: string
  content?: string
  created_at: string
  status: string
  type: "payment" | "charge"
}

export function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const result = await getTransactionHistory()
        if (result.success) {
          setTransactions(result.data)
        }
      } catch (error) {
        console.error("거래 내역 조회 오류:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, [])

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
    <Card>
      <CardHeader>
        <CardTitle>거래 내역</CardTitle>
        <CardDescription>최근 거래 내역을 확인하세요.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <p className="text-muted-foreground">거래 내역을 불러오는 중...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">거래 내역이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex justify-between items-start border-b pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{transaction.description}</h4>
                    {renderStatusBadge(transaction.status, transaction.type)}
                  </div>
                  <p className="text-sm text-muted-foreground">{transaction.content}</p>
                  <p className="text-xs text-muted-foreground">{new Date(transaction.created_at).toLocaleString()}</p>
                </div>
                <div className={`font-bold ${transaction.type === "charge" ? "text-green-600" : "text-red-600"}`}>
                  {transaction.type === "charge" ? "+" : "-"}
                  {transaction.amount.toLocaleString()}원
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
