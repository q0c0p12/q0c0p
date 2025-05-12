"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Pencil, Trash2, UserPlus, RefreshCw, Search } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { updateUserAdmin, deleteUser, inviteUser } from "@/app/admin/users/actions"
import { Badge } from "@/components/ui/badge"

// 사용자 타입 정의
interface User {
  id: string
  email?: string
  created_at?: string
  updated_at?: string
  last_sign_in_at?: string
  is_admin?: boolean
}

interface AdminUserManagementProps {
  initialUsers: User[]
}

export function AdminUserManagement({ initialUsers }: AdminUserManagementProps) {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [filteredUsers, setFilteredUsers] = useState<User[]>(initialUsers)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteAsAdmin, setInviteAsAdmin] = useState(false)

  // 검색 기능
  const handleSearch = (term: string) => {
    setSearchTerm(term)
    if (!term.trim()) {
      setFilteredUsers(users)
      return
    }

    const filtered = users.filter(
      (user) =>
        user.email?.toLowerCase().includes(term.toLowerCase()) || user.id.toLowerCase().includes(term.toLowerCase()),
    )
    setFilteredUsers(filtered)
  }

  // 관리자 권한 토글
  const handleToggleAdmin = async (id: string, isAdmin: boolean) => {
    try {
      setIsLoading(true)

      const { success, error } = await updateUserAdmin(id, !isAdmin)

      if (!success) {
        throw new Error(error || "사용자 권한 변경에 실패했습니다.")
      }

      // UI 업데이트
      const updatedUsers = users.map((user) => (user.id === id ? { ...user, is_admin: !isAdmin } : user))
      setUsers(updatedUsers)
      setFilteredUsers(
        searchTerm
          ? updatedUsers.filter(
              (user) =>
                user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.id.toLowerCase().includes(searchTerm.toLowerCase()),
            )
          : updatedUsers,
      )

      toast({
        title: "사용자 권한 변경됨",
        description: `사용자 권한이 ${!isAdmin ? "관리자로" : "일반 사용자로"} 변경되었습니다.`,
      })
    } catch (error) {
      console.error("사용자 권한 변경 오류:", error)
      toast({
        title: "오류 발생",
        description: error instanceof Error ? error.message : "사용자 권한을 변경하는 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 사용자 편집 다이얼로그 열기
  const handleEditUser = (user: User) => {
    setCurrentUser(user)
    setIsEditDialogOpen(true)
  }

  // 사용자 삭제 다이얼로그 열기
  const handleDeleteDialog = (user: User) => {
    setCurrentUser(user)
    setIsDeleteDialogOpen(true)
  }

  // 사용자 삭제 실행
  const handleDeleteUser = async () => {
    if (!currentUser) return

    try {
      setIsLoading(true)

      const { success, error } = await deleteUser(currentUser.id)

      if (!success) {
        throw new Error(error || "사용자 삭제에 실패했습니다.")
      }

      // UI 업데이트
      const updatedUsers = users.filter((user) => user.id !== currentUser.id)
      setUsers(updatedUsers)
      setFilteredUsers(
        searchTerm
          ? updatedUsers.filter(
              (user) =>
                user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.id.toLowerCase().includes(searchTerm.toLowerCase()),
            )
          : updatedUsers,
      )

      toast({
        title: "사용자 삭제됨",
        description: "사용자가 성공적으로 삭제되었습니다.",
      })

      setIsDeleteDialogOpen(false)
    } catch (error) {
      console.error("사용자 삭제 오류:", error)
      toast({
        title: "오류 발생",
        description: error instanceof Error ? error.message : "사용자를 삭제하는 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 사용자 초대 다이얼로그 열기
  const handleInviteDialog = () => {
    setInviteEmail("")
    setInviteAsAdmin(false)
    setIsInviteDialogOpen(true)
  }

  // 사용자 초대 실행
  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!inviteEmail) {
      toast({
        title: "이메일 필요",
        description: "초대할 사용자의 이메일을 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)

      const { success, user, error } = await inviteUser(inviteEmail, inviteAsAdmin)

      if (!success || !user) {
        throw new Error(error || "사용자 초대에 실패했습니다.")
      }

      // UI 업데이트
      const newUser = {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        is_admin: inviteAsAdmin,
      }

      const updatedUsers = [...users, newUser]
      setUsers(updatedUsers)
      setFilteredUsers(
        searchTerm
          ? updatedUsers.filter(
              (user) =>
                user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.id.toLowerCase().includes(searchTerm.toLowerCase()),
            )
          : updatedUsers,
      )

      toast({
        title: "사용자 초대됨",
        description: `${inviteEmail} 사용자가 성공적으로 초대되었습니다.`,
      })

      setIsInviteDialogOpen(false)
    } catch (error) {
      console.error("사용자 초대 오류:", error)
      toast({
        title: "오류 발생",
        description: error instanceof Error ? error.message : "사용자를 초대하는 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 사용자 정보 저장
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentUser) return

    try {
      setIsLoading(true)

      const formElement = e.target as HTMLFormElement
      const isAdmin = formElement.is_admin.checked

      const { success, error } = await updateUserAdmin(currentUser.id, isAdmin)

      if (!success) {
        throw new Error(error || "사용자 정보 수정에 실패했습니다.")
      }

      // UI 업데이트
      const updatedUsers = users.map((user) => (user.id === currentUser.id ? { ...user, is_admin: isAdmin } : user))
      setUsers(updatedUsers)
      setFilteredUsers(
        searchTerm
          ? updatedUsers.filter(
              (user) =>
                user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.id.toLowerCase().includes(searchTerm.toLowerCase()),
            )
          : updatedUsers,
      )

      toast({
        title: "사용자 정보 수정됨",
        description: "사용자 정보가 성공적으로 수정되었습니다.",
      })

      setIsEditDialogOpen(false)
    } catch (error) {
      console.error("사용자 정보 수정 오류:", error)
      toast({
        title: "오류 발생",
        description: error instanceof Error ? error.message : "사용자 정보를 수정하는 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 날짜 포맷팅 함수
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="이메일로 검색..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button onClick={handleInviteDialog} disabled={isLoading}>
            <UserPlus className="mr-2 h-4 w-4" />
            사용자 초대
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()} disabled={isLoading}>
            <RefreshCw className="h-4 w-4" />
            <span className="sr-only">새로고침</span>
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>이메일</TableHead>
              <TableHead>가입일</TableHead>
              <TableHead>마지막 로그인</TableHead>
              <TableHead>상태</TableHead>
              <TableHead className="w-[100px]">관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  {searchTerm ? "검색 결과가 없습니다." : "사용자가 없습니다."}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="font-medium">{user.email || "이메일 없음"}</div>
                    <div className="text-xs text-muted-foreground">{user.id}</div>
                  </TableCell>
                  <TableCell>{formatDate(user.created_at)}</TableCell>
                  <TableCell>{user.last_sign_in_at ? formatDate(user.last_sign_in_at) : "로그인 기록 없음"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant={user.is_admin ? "default" : "secondary"}>
                        {user.is_admin ? "관리자" : "일반 사용자"}
                      </Badge>
                      <Switch
                        checked={user.is_admin || false}
                        onCheckedChange={() => handleToggleAdmin(user.id, user.is_admin || false)}
                        disabled={isLoading}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditUser(user)} disabled={isLoading}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">수정</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteDialog(user)} disabled={isLoading}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">삭제</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 사용자 편집 다이얼로그 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>사용자 정보 수정</DialogTitle>
            <DialogDescription>사용자 정보를 수정하세요.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveUser} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input id="email" value={currentUser?.email || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="id">사용자 ID</Label>
              <Input id="id" value={currentUser?.id || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="created_at">가입일</Label>
              <Input id="created_at" value={formatDate(currentUser?.created_at)} disabled />
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="is_admin" name="is_admin" defaultChecked={currentUser?.is_admin || false} />
              <Label htmlFor="is_admin">관리자 권한</Label>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "처리 중..." : "저장"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 사용자 초대 다이얼로그 */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>새 사용자 초대</DialogTitle>
            <DialogDescription>초대할 사용자의 이메일을 입력하세요.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleInviteUser} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite_email">이메일</Label>
              <Input
                id="invite_email"
                type="email"
                placeholder="example@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="invite_as_admin" checked={inviteAsAdmin} onCheckedChange={setInviteAsAdmin} />
              <Label htmlFor="invite_as_admin">관리자 권한으로 초대</Label>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "처리 중..." : "초대하기"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 사용자 삭제 확인 다이얼로그 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>사용자 삭제</DialogTitle>
            <DialogDescription>정말로 이 사용자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>이메일</Label>
              <div className="p-2 border rounded-md bg-muted">{currentUser?.email || "이메일 없음"}</div>
            </div>
            <div className="space-y-2">
              <Label>사용자 ID</Label>
              <div className="p-2 border rounded-md bg-muted">{currentUser?.id || ""}</div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isLoading}>
                취소
              </Button>
              <Button variant="destructive" onClick={handleDeleteUser} disabled={isLoading}>
                {isLoading ? "처리 중..." : "삭제"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
