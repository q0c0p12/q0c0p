import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminSidebar } from "@/components/admin/sidebar"
import { NotificationManagement } from "@/components/admin/notification-management"

export default async function AdminNotificationsPage() {
  const supabase = createClient()

  // 세션 확인
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth?tab=signin")
  }

  // 관리자 권한 확인
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", session.user.id).single()

  const isAdmin = profile?.is_admin === true || session.user.user_metadata?.role === "admin"

  if (!isAdmin) {
    redirect("/dashboard")
  }

  // 알림 데이터 가져오기 (테이블이 없는 경우 빈 배열 반환)
  let notifications = []
  try {
    const { data, error } = await supabase.from("notifications").select("*").order("created_at", { ascending: false })

    if (!error) {
      notifications = data
    }
  } catch (error) {
    console.error("Error fetching notifications:", error)
    // 테이블이 없는 경우 빈 배열 사용
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col space-y-4 p-8 pt-6 ml-0 lg:ml-64">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">알림 관리</h2>
        </div>
        <NotificationManagement notifications={notifications || []} />
      </div>
    </div>
  )
}
