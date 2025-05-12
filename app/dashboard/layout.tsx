import type React from "react"
import { createClient } from "@/lib/supabase/server"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { DynamicDashboardHeader, DynamicDashboardSidebar } from "@/lib/dynamic-imports"
import { SidebarProvider } from "@/lib/sidebar-context"
import { ResponsiveWrapper } from "@/components/dashboard/responsive-wrapper"

// 로딩 상태를 위한 스켈레톤 컴포넌트
function HeaderSkeleton() {
  return (
    <header className="sticky top-0 z-40 flex h-12 sm:h-14 items-center border-b bg-background px-0">
      <div className="flex flex-1 items-center justify-between">
        <Skeleton className="h-6 w-24 ml-3" />
        <div className="flex items-center gap-2 mr-3">
          <Skeleton className="h-7 w-7 rounded-full" />
          <Skeleton className="h-7 w-7 rounded-full" />
          <Skeleton className="hidden md:block h-7 w-20 rounded-full" />
        </div>
      </div>
    </header>
  )
}

function SidebarSkeleton() {
  return (
    <div className="hidden md:flex h-screen w-16 md:w-64 flex-shrink-0 flex-col border-r">
      <div className="flex items-center justify-between p-3">
        <Skeleton className="h-6 w-24" />
      </div>
      <div className="flex-1 p-3">
        {Array(6)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={i} className="h-8 w-full mb-2 rounded-md" />
          ))}
      </div>
    </div>
  )
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let profile = null
  let isAdmin = false

  const supabase = createClient()

  try {
    // 사용자 세션 확인
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session) {
      // 사용자 프로필 정보 가져오기
      const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()
      profile = data

      // 관리자 여부 확인
      isAdmin = data?.is_admin === true
    }
  } catch (error) {
    console.error("Error fetching profile:", error)
    // 프로필 정보를 가져오는 데 실패해도 계속 진행
  }

  return (
    <SidebarProvider>
      <div className="flex flex-col min-h-screen">
        <Suspense fallback={<HeaderSkeleton />}>
          <DynamicDashboardHeader user={profile} isAdmin={isAdmin} />
        </Suspense>
        <div className="flex w-full flex-1">
          <Suspense fallback={<SidebarSkeleton />}>
            <DynamicDashboardSidebar isAdmin={isAdmin} />
          </Suspense>
          <main className="flex-1 w-full overflow-y-auto bg-white">
            <ResponsiveWrapper>
              <div className="p-0">
                <Suspense
                  fallback={
                    <div className="space-y-4">
                      <Skeleton className="h-8 w-full max-w-md" />
                      <Skeleton className="h-64 w-full" />
                    </div>
                  }
                >
                  {children}
                </Suspense>
              </div>
            </ResponsiveWrapper>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
