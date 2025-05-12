"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, LogOut, Menu, Settings, User } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { ThemeToggle } from "@/components/dashboard/theme-toggle"
import { useSidebarContext } from "@/components/ui/sidebar"

interface DashboardHeaderProps {
  user: any
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [notifications, setNotifications] = useState(3)
  const { toggleSidebar } = useSidebarContext()

  // 현재 페이지 이름 가져오기
  const getPageTitle = () => {
    const path = pathname.split("/").pop() || "dashboard"

    const titles: Record<string, string> = {
      dashboard: "대시보드",
      order: "서비스 주문",
      orders: "주문 내역",
      balance: "잔액 충전",
      api: "API 정보",
      support: "고객 지원",
      profile: "내 정보",
    }

    return titles[path] || "대시보드"
  }

  const handleSignOut = async () => {
    try {
      await fetch("/auth/signout", { method: "POST" })
      toast({
        title: "로그아웃 되었습니다",
      })
      router.push("/")
    } catch (error) {
      toast({
        title: "로그아웃 실패",
        variant: "destructive",
      })
    }
  }

  return (
    <header className="sticky top-0 z-40 flex h-12 sm:h-14 items-center border-b bg-background px-0 left-0 right-0 w-full">
      <div className="flex flex-1 items-center justify-between">
        <div className="flex items-center gap-1 md:ml-4 pl-2 sm:pl-3">
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
              <Menu className="h-4 w-4" />
              <span className="sr-only">메뉴 열기</span>
            </Button>
          </div>
          <h1 className="text-base sm:text-lg font-semibold truncate max-w-[180px] sm:max-w-none">{getPageTitle()}</h1>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 pr-2 sm:pr-3 md:pr-4">
          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-8 w-8">
                <Bell className="h-4 w-4" />
                {notifications > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] text-white">
                    {notifications}
                  </span>
                )}
                <span className="sr-only">알림</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="text-xs">알림</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-xs">새로운 주문이 완료되었습니다</DropdownMenuItem>
              <DropdownMenuItem className="text-xs">잔액이 충전되었습니다</DropdownMenuItem>
              <DropdownMenuItem className="text-xs">시스템 점검 안내</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 flex items-center gap-2 rounded-full">
                <Avatar className="h-6 w-6 sm:h-7 sm:w-7">
                  <AvatarImage src={user?.avatar_url || ""} alt={user?.full_name || "사용자"} />
                  <AvatarFallback>{(user?.full_name?.[0] || "U").toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="hidden md:inline-block text-xs">{user?.full_name || "사용자"}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="text-xs">내 계정</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="text-xs">
                <a href="/dashboard/profile" className="flex items-center">
                  <User className="mr-2 h-3.5 w-3.5" />
                  <span>프로필 설정</span>
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="text-xs">
                <a href="/dashboard/settings" className="flex items-center">
                  <Settings className="mr-2 h-3.5 w-3.5" />
                  <span>계정 설정</span>
                </a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="flex items-center text-xs">
                <LogOut className="mr-2 h-3.5 w-3.5" />
                <span>로그아웃</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
