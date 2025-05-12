"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { isAdminComprehensive } from "@/lib/auth-utils"

export function UserAuthForm() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user || null)

      // 사용자가 있으면 관리자 권한 확인
      if (session?.user) {
        const adminStatus = await isAdminComprehensive()
        setIsAdmin(adminStatus)
        console.log("관리자 권한 확인 결과:", adminStatus) // 디버깅용 로그 추가
      }

      setLoading(false)
    }

    getUser()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user || null)

      // 사용자가 있으면 관리자 권한 확인
      if (session?.user) {
        const adminStatus = await isAdminComprehensive()
        setIsAdmin(adminStatus)
        console.log("로그인 상태 변경 후 관리자 권한 확인 결과:", adminStatus) // 디버깅용 로그 추가
      } else {
        setIsAdmin(false)
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase])

  const handleSignOut = async () => {
    try {
      await fetch("/auth/signout", { method: "POST" })
      toast({
        title: "로그아웃 되었습니다",
      })
      router.refresh()
    } catch (error) {
      toast({
        title: "로그아웃 실패",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon">
          <User className="h-5 w-5" />
        </Button>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center gap-4">
        <Link href="/auth?tab=signin">
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
            <span className="sr-only">프로필</span>
          </Button>
        </Link>
        <Link href="/auth?tab=signin">
          <Button variant="outline" size="sm" className="hidden md:flex">
            로그인
          </Button>
        </Link>
        <Link href="/auth?tab=signup">
          <Button size="sm" className="hidden md:flex bg-rose-600 hover:bg-rose-700">
            회원가입
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.user_metadata?.avatar_url || ""} alt={user.user_metadata?.full_name || "사용자"} />
              <AvatarFallback>{(user.user_metadata?.full_name || "사용자")[0]}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>내 계정</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/dashboard">대시보드</Link>
          </DropdownMenuItem>
          {isAdmin ? (
            <DropdownMenuItem asChild>
              <Link href="/admin/dashboard">관리자 대시보드</Link>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem disabled className="text-gray-400">
              관리자 권한 없음
            </DropdownMenuItem>
          )}
          <DropdownMenuItem asChild>
            <Link href="/dashboard/orders">주문 내역</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/profile">프로필 설정</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>로그아웃</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
