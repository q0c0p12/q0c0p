import type React from "react"
import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminSidebar } from "@/components/admin/sidebar"
import { SidebarProvider } from "@/lib/sidebar-context"

export const metadata: Metadata = {
  title: "관리자 패널",
  description: "SMM 패널 관리자 대시보드",
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    const supabase = createClient()

    // 사용자 세션 확인
    let session
    try {
      const { data } = await supabase.auth.getSession()
      session = data.session
    } catch (sessionError) {
      console.error("세션 확인 중 오류 발생:", sessionError)
      redirect("/auth?tab=signin&error=session")
    }

    // 로그인하지 않은 사용자는 로그인 페이지로 리디렉션
    if (!session) {
      console.log("Admin layout: No session, redirecting to login")
      redirect("/auth?tab=signin")
    }

    // 관리자 권한 확인
    let profile
    try {
      const { data, error } = await supabase.from("profiles").select("is_admin").eq("id", session.user.id).single()

      if (error) {
        console.error("프로필 조회 중 오류 발생:", error)
        throw error
      }

      profile = data
    } catch (profileError) {
      console.error("관리자 권한 확인 중 오류 발생:", profileError)
      // 프로필 조회 실패 시 기본적으로 관리자가 아닌 것으로 처리
      redirect("/dashboard?error=admin_check")
    }

    // 디버깅 로그 추가
    console.log("Admin layout check:", {
      userId: session.user.id,
      metadata: session.user.user_metadata,
      profile,
      isAdmin: profile?.is_admin === true,
    })

    // 관리자가 아니면 대시보드로 리디렉션
    if (!profile?.is_admin) {
      console.log("Admin layout: Not admin, redirecting to dashboard")
      redirect("/dashboard")
    }

    return (
      <SidebarProvider>
        <div className="flex min-h-screen">
          <AdminSidebar />
          <div className="flex-1 pl-0 md:pl-20 lg:pl-64 transition-all duration-300">
            <main className="p-4 md:p-6">{children}</main>
          </div>
        </div>
      </SidebarProvider>
    )
  } catch (error) {
    console.error("Error in admin layout:", error)
    // 더 자세한 오류 정보 제공
    redirect(`/auth?tab=signin&error=${encodeURIComponent(error.message || "unknown_error")}`)
  }
}
