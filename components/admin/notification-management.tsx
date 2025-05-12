"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Bell, Search, Plus, Trash2, AlertTriangle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createNotification, deleteNotification } from "./notification-actions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface Notification {
  id: string
  title: string
  content: string
  type: string
  user_id?: string
  is_read?: boolean
  created_at: string
}

export function NotificationManagement({ notifications }: { notifications: Notification[] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newNotification, setNewNotification] = useState({
    title: "",
    content: "",
    type: "system",
  })

  // 알림 필터링
  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.content.toLowerCase().includes(searchTerm.toLowerCase())

    if (activeTab === "all") return matchesSearch
    return matchesSearch && notification.type === activeTab
  })

  // 알림 생성 처리
  const handleCreateNotification = async () => {
    try {
      setIsCreating(true)
      setError(null)
      const result = await createNotification(newNotification)

      if (!result.success) {
        setError(result.error as string)
        return
      }

      setNewNotification({ title: "", content: "", type: "system" })
      // 페이지 새로고침
      window.location.reload()
    } catch (error) {
      console.error("Error creating notification:", error)
      setError((error as Error).message)
    } finally {
      setIsCreating(false)
    }
  }

  // 알림 삭제 처리
  const handleDeleteNotification = async (id: string) => {
    try {
      setError(null)
      const result = await deleteNotification(id)

      if (!result.success) {
        setError(result.error as string)
        return
      }

      // 페이지 새로고침
      window.location.reload()
    } catch (error) {
      console.error("Error deleting notification:", error)
      setError((error as Error).message)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>오류</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>알림 관리</CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />새 알림 생성
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>새 알림 생성</DialogTitle>
                  <DialogDescription>
                    시스템에 새 알림을 생성합니다. 모든 사용자 또는 특정 사용자에게 알림을 보낼 수 있습니다.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">제목</Label>
                    <Input
                      id="title"
                      value={newNotification.title}
                      onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="content">내용</Label>
                    <Textarea
                      id="content"
                      value={newNotification.content}
                      onChange={(e) => setNewNotification({ ...newNotification, content: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="type">유형</Label>
                    <Select
                      value={newNotification.type}
                      onValueChange={(value) => setNewNotification({ ...newNotification, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="알림 유형 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="system">시스템</SelectItem>
                        <SelectItem value="payment">결제</SelectItem>
                        <SelectItem value="order">주문</SelectItem>
                        <SelectItem value="balance">잔액</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateNotification} disabled={isCreating}>
                    {isCreating ? "생성 중..." : "알림 생성"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <CardDescription>시스템의 모든 알림을 관리합니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="알림 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">전체</TabsTrigger>
              <TabsTrigger value="system">시스템</TabsTrigger>
              <TabsTrigger value="payment">결제</TabsTrigger>
              <TabsTrigger value="order">주문</TabsTrigger>
              <TabsTrigger value="balance">잔액</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>유형</TableHead>
                      <TableHead>제목</TableHead>
                      <TableHead>내용</TableHead>
                      <TableHead>생성일</TableHead>
                      <TableHead>작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredNotifications.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          알림이 없습니다.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredNotifications.map((notification) => (
                        <TableRow key={notification.id}>
                          <TableCell>
                            <Badge
                              variant={
                                notification.type === "system"
                                  ? "default"
                                  : notification.type === "payment"
                                    ? "secondary"
                                    : notification.type === "order"
                                      ? "outline"
                                      : "destructive"
                              }
                            >
                              <Bell className="h-3 w-3 mr-1" />
                              {notification.type === "system"
                                ? "시스템"
                                : notification.type === "payment"
                                  ? "결제"
                                  : notification.type === "order"
                                    ? "주문"
                                    : "잔액"}
                            </Badge>
                          </TableCell>
                          <TableCell>{notification.title}</TableCell>
                          <TableCell className="max-w-xs truncate">{notification.content}</TableCell>
                          <TableCell>{new Date(notification.created_at).toLocaleString()}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteNotification(notification.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">총 {filteredNotifications.length}개의 알림이 있습니다.</div>
        </CardFooter>
      </Card>
    </div>
  )
}
