"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { updateUserPoints } from "@/app/admin/payments/actions"
import { useTransition } from "react"

interface User {
  id: string
  full_name: string
  points: number
}

export function PaymentManagement({ users = [] }: { users?: User[] }) {
  const [selectedUserId, setSelectedUserId] = useState("")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [operation, setOperation] = useState("add")
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedUserId) {
      toast({
        title: "사용자를 선택해주세요",
        variant: "destructive",
      })
      return
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast({
        title: "유효한 금액을 입력해주세요",
        variant: "destructive",
      })
      return
    }

    if (!description) {
      toast({
        title: "설명을 입력해주세요",
        variant: "destructive",
      })
      return
    }

    const pointAmount = operation === "add" ? Number(amount) : -Number(amount)

    startTransition(async () => {
      const result = await updateUserPoints(selectedUserId, pointAmount, description)

      if (result.success) {
        toast({
          title: "포인트 업데이트 성공",
          description: result.message,
        })
        // 폼 초기화
        setAmount("")
        setDescription("")
      } else {
        toast({
          title: "포인트 업데이트 실패",
          description: result.message,
          variant: "destructive",
        })
      }
    })
  }

  const selectedUser = users.find((user) => user.id === selectedUserId)

  return (
    <Card>
      <CardHeader>
        <CardTitle>포인트 관리</CardTitle>
        <CardDescription>사용자의 포인트를 추가하거나 차감합니다.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user">사용자</Label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger id="user">
                <SelectValue placeholder="사용자 선택" />
              </SelectTrigger>
              <SelectContent>
                {users.length === 0 ? (
                  <SelectItem value="no-users" disabled>
                    사용자가 없습니다
                  </SelectItem>
                ) : (
                  users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name || user.id.substring(0, 8)} ({user.points?.toLocaleString() || 0}P)
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedUser && (
            <div className="p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>{selectedUser.full_name || selectedUser.id.substring(0, 8)}</strong>님의 현재 포인트:{" "}
                <strong>{selectedUser.points?.toLocaleString() || 0}P</strong>
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="operation">작업</Label>
            <Select value={operation} onValueChange={setOperation}>
              <SelectTrigger id="operation">
                <SelectValue placeholder="작업 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="add">포인트 추가</SelectItem>
                <SelectItem value="subtract">포인트 차감</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">금액</Label>
            <div className="flex items-center">
              <Input
                id="amount"
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="금액 입력"
                className="flex-1"
              />
              <span className="ml-2">포인트</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">설명</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="포인트 변경 사유를 입력하세요"
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "처리 중..." : `포인트 ${operation === "add" ? "추가" : "차감"}`}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-sm text-gray-500">* 포인트 변경 내역은 사용자의 포인트 내역에 기록됩니다.</p>
      </CardFooter>
    </Card>
  )
}
