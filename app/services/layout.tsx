import type React from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      {/* 브레드크럼 네비게이션 */}
      <div className="bg-muted py-2">
        <div className="container flex items-center text-sm">
          <Link href="/" className="text-muted-foreground hover:text-foreground">
            홈
          </Link>
          <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground" />
          <Link href="/services" className="text-muted-foreground hover:text-foreground">
            서비스
          </Link>
          <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground" />
          <span>상세 정보</span>
        </div>
      </div>

      {children}
    </div>
  )
}
