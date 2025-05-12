"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { isAdmin } from "@/lib/auth-utils"
import { Button } from "@/components/ui/button"
import { CartButton } from "@/components/cart-button"
import { User } from "lucide-react"

export function SiteHeader() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isAdminState, setIsAdminState] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    // 현재 세션 확인
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user || null)

      // 관리자 여부 확인
      if (session?.user) {
        const adminStatus = await isAdmin()
        setIsAdminState(adminStatus)
      }

      setLoading(false)
    }

    checkUser()

    // 인증 상태 변경 리스너
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user || null)

      // 관리자 여부 확인
      if (session?.user) {
        const adminStatus = await isAdmin()
        setIsAdminState(adminStatus)
      } else {
        setIsAdminState(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container flex h-14 items-center">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl">
              <span className="text-rose-600">Q0c0P</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
            <Link href="/services" className="text-sm font-medium transition-colors hover:text-rose-600">
              서비스
            </Link>
            <Link href="/consultation" className="text-sm font-medium transition-colors hover:text-rose-600">
              상담신청
            </Link>
          </nav>
        </div>
        <div className="flex items-center ml-auto space-x-4">
          <CartButton />
          {!loading &&
            (user ? (
              <div className="flex items-center gap-2">
                <Link href="/dashboard">
                  <Button variant="ghost" className="text-sm flex items-center gap-1">
                    <User className="h-4 w-4" />
                    대시보드
                  </Button>
                </Link>
                {isAdminState && (
                  <Link href="/admin/dashboard">
                    <Button variant="ghost" className="text-sm flex items-center gap-1 text-rose-600">
                      <User className="h-4 w-4" />
                      관리자
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <Link href="/auth">
                <Button variant="ghost" className="text-sm">
                  로그인
                </Button>
              </Link>
            ))}
        </div>
      </div>
    </header>
  )
}
