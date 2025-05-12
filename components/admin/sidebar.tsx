"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  BarChart3,
  ShoppingCart,
  Package,
  Tag,
  Users,
  Database,
  FileText,
  Bell,
  Settings,
  Home,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  MessageSquare,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/lib/sidebar-context"

export function AdminSidebar() {
  const pathname = usePathname()
  const { isCollapsed, setIsCollapsed } = useSidebar()

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  // 관리자 메뉴 아이템
  const menuItems = [
    {
      title: "대시보드",
      href: "/admin/dashboard",
      icon: BarChart3,
      active: pathname === "/admin/dashboard",
    },
    {
      title: "주문 관리",
      href: "/admin/orders",
      icon: ShoppingCart,
      active: pathname === "/admin/orders" || pathname.startsWith("/admin/orders/"),
    },
    {
      title: "서비스 관리",
      href: "/admin/services",
      icon: Package,
      active: pathname === "/admin/services" || pathname.startsWith("/admin/services/"),
    },
    {
      title: "상담신청 관리",
      href: "/admin/consultations",
      icon: MessageSquare,
      active: pathname === "/admin/consultations",
    },
    {
      title: "카테고리 관리",
      href: "/admin/categories",
      icon: Tag,
      active: pathname === "/admin/categories",
    },
    {
      title: "사용자 관리",
      href: "/admin/users",
      icon: Users,
      active: pathname === "/admin/users",
    },
    {
      title: "결제 관리",
      href: "/admin/payments",
      icon: Database,
      active: pathname === "/admin/payments",
    },
    {
      title: "보고서",
      href: "/admin/reports",
      icon: FileText,
      active: pathname === "/admin/reports",
    },
    {
      title: "알림 관리",
      href: "/admin/notifications",
      icon: Bell,
      active: pathname === "/admin/notifications",
    },
    {
      title: "설정",
      href: "/admin/settings",
      icon: Settings,
      active: pathname === "/admin/settings",
    },
    {
      title: "서비스 대시보드",
      href: "/admin/services-dashboard",
      icon: LayoutDashboard,
      active: pathname === "/admin/services-dashboard",
    },
  ]

  return (
    <aside
      className={`fixed left-0 z-30 flex h-screen flex-col border-r bg-background transition-all duration-300 ${isCollapsed ? "w-20" : "w-64"}`}
    >
      <div className="flex h-14 items-center justify-between border-b px-3">
        <Link href="/admin/dashboard" className="flex items-center gap-x-2 font-semibold">
          {!isCollapsed && <span>관리자 패널</span>}
          {isCollapsed && <span className="text-xs">관리자</span>}
        </Link>
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-8 w-8">
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className={`grid items-start ${isCollapsed ? "px-1 gap-1" : "px-2 gap-2"}`}>
          <Button variant="ghost" className={`justify-${isCollapsed ? "center" : "start"}`} asChild>
            <Link href="/" className="flex items-center">
              <Home className={`${isCollapsed ? "" : "mr-2"} h-5 w-5`} />
              {!isCollapsed && <span>홈으로 돌아가기</span>}
            </Link>
          </Button>

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
        {!isCollapsed && <p className="text-xs text-muted-foreground">© 2025 관리자 패널</p>}
      </div>
    </aside>
  )
}
