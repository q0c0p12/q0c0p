"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export function SecurityForm() {
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [emailNotifications, setEmailNotifications] = useState(true)

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast({
        title: "비밀번호가 일치하지 않습니다",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error

      toast({
        title: "비밀번호가 변경되었습니다",
      })

      // 폼 초기화
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error: any) {
      toast({
        title: "비밀번호 변경 실패",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleTwoFactorToggle = () => {
    setTwoFactorEnabled(!twoFactorEnabled)
    toast({
      title: !twoFactorEnabled ? "2단계 인증이 활성화되었습니다" : "2단계 인증이 비활성화되었습니다",
    })
  }

  const handleEmailNotificationsToggle = () => {
    setEmailNotifications(!emailNotifications)
    toast({
      title: !emailNotifications ? "이메일 알림이 활성화되었습니다" : "이메일 알림이 비활성화되었습니다",
    })
  }

  return (
    <div className="space-y-5 w-full">
      <Card className="w-full">
        <form onSubmit={handlePasswordChange}>
          <CardHeader>
            <CardTitle>비밀번호 변경</CardTitle>
            <CardDescription>계정 보안을 위해 주기적으로 비밀번호를 변경하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">현재 비밀번호</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">새 비밀번호</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">새 비밀번호 확인</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full bg-rose-600 hover:bg-rose-700"
              disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 변경 중...
                </>
              ) : (
                "비밀번호 변경"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>보안 설정</CardTitle>
          <CardDescription>계정 보안 및 알림 설정을 관리하세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="two-factor">2단계 인증</Label>
              <p className="text-sm text-muted-foreground">로그인 시 추가 인증 단계를 요구합니다</p>
            </div>
            <Switch id="two-factor" checked={twoFactorEnabled} onCheckedChange={handleTwoFactorToggle} />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">이메일 알림</Label>
              <p className="text-sm text-muted-foreground">주문 상태 변경 및 중요 알림을 이메일로 받습니다</p>
            </div>
            <Switch
              id="email-notifications"
              checked={emailNotifications}
              onCheckedChange={handleEmailNotificationsToggle}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>계정 삭제</CardTitle>
          <CardDescription>계정을 삭제하면 모든 데이터가 영구적으로 제거됩니다</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            계정 삭제는 되돌릴 수 없으며, 모든 데이터와 주문 내역이 영구적으로 삭제됩니다. 삭제 전에 필요한 데이터를
            백업하세요.
          </p>
        </CardContent>
        <CardFooter>
          <Button variant="destructive" className="w-full">
            계정 삭제
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
