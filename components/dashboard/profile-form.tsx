"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Upload } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface ProfileFormProps {
  user: any
}

export function ProfileForm({ user }: ProfileFormProps) {
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [fullName, setFullName] = useState(user?.full_name || user?.user_metadata?.full_name || "")
  const [phone, setPhone] = useState(user?.phone || "")
  const [company, setCompany] = useState(user?.company || "")
  const [website, setWebsite] = useState(user?.website || "")
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || user?.user_metadata?.avatar_url || "")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // 프로필 테이블 업데이트
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          phone,
          company,
          website,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) throw error

      toast({
        title: "프로필이 업데이트되었습니다",
      })
    } catch (error: any) {
      toast({
        title: "프로필 업데이트 실패",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const file = e.target.files[0]
    const fileExt = file.name.split(".").pop()
    const filePath = `avatars/${user.id}-${Math.random()}.${fileExt}`

    setIsLoading(true)

    try {
      // 파일 업로드
      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file)

      if (uploadError) throw uploadError

      // 파일 URL 가져오기
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath)

      if (data) {
        setAvatarUrl(data.publicUrl)
      }
    } catch (error: any) {
      toast({
        title: "이미지 업로드 실패",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>프로필 정보</CardTitle>
          <CardDescription>프로필 정보를 업데이트하세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={fullName} />
              <AvatarFallback>{(fullName[0] || "U").toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-2">
              <Label htmlFor="avatar" className="cursor-pointer">
                <div className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                  <Upload className="h-4 w-4" />
                  <span>이미지 업로드</span>
                </div>
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                  disabled={isLoading}
                />
              </Label>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input id="email" value={user?.email} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="full-name">이름</Label>
                <Input
                  id="full-name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">전화번호</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={isLoading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">회사/단체명</Label>
                <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} disabled={isLoading} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">웹사이트</Label>
              <Input id="website" value={website} onChange={(e) => setWebsite(e.target.value)} disabled={isLoading} />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full bg-rose-600 hover:bg-rose-700" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 저장 중...
              </>
            ) : (
              "변경사항 저장"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
