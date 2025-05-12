"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Home, ClipboardList, Wallet, LifeBuoy, User, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/lib/sidebar-context"

export function DashboardSidebar() {
  const pathname = usePathname()
  const { isCollapsed, setIsCollapsed } = useSidebar()

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  // 일반 사용자 메뉴 아이템
  const menuItems = [
    {
      title: "홈",
      href: "/dashboard",
      icon: Home,
      active: pathname === "/dashboard",
    },
    {
      title: "주문 내역",
      href: "/dashboard/orders",
      icon: ClipboardList,
      active: pathname === "/dashboard/orders" || pathname.startsWith("/dashboard/orders/"),
    },
    {
      title: "잔액 충전",
      href: "/dashboard/balance",
      icon: Wallet,
      active: pathname === "/dashboard/balance",
    },
    {
      title: "고객 지원",
      href: "/dashboard/support",
      icon: LifeBuoy,
      active: pathname === "/dashboard/support",
    },
    {
      title: "내 정보",
      href: "/dashboard/profile",
      icon: User,
      active: pathname === "/dashboard/profile",
    },
  ]

  return (
    <aside
      className={`fixed left-0 z-30 flex h-screen flex-col border-r bg-background transition-all duration-300 ${isCollapsed ? "w-20" : "w-64"}`}
    >
      <div className="flex h-14 items-center justify-between border-b px-3">
        <Link href="/dashboard" className="flex items-center gap-x-2 font-semibold">
          {!isCollapsed && <span>SMM 패널</span>}
          {isCollapsed && <span className="text-xs">SMM</span>}
        </Link>
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-8 w-8">
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className={`grid items-start ${isCollapsed ? "px-1 gap-1" : "px-2 gap-2"}`}>
          {menuItems.map((item) => (
            <Button
              key={item.href}
              variant={item.active ? "secondary" : "ghost"}
              className={`justify-${isCollapsed ? "center" : "start"}`}
              asChild
            >
              <Link href={item.href} className="flex items-center">
                <item.icon className={`${isCollapsed ? "" : "mr-2"} h-5 w-5`} />
                {!isCollapsed && <span>{item.title}</span>}
              </Link>
            </Button>
          ))}
        </nav>
      </div>
      <div className="border-t p-3">
        {!isCollapsed && <p className="text-xs text-muted-foreground">© 2025 SMM크몽</p>}
      </div>
    </aside>
  )
}
