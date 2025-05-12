import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminSidebar } from "@/components/admin/sidebar"
import { ReportManagement } from "@/components/admin/report-management"

export default async function AdminReportsPage() {
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

  // 주문 데이터 가져오기
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })

  if (ordersError) {
    console.error("Error fetching orders:", ordersError)
  }

  // 사용자 데이터 가져오기
  const { data: users, error: usersError } = await supabase.from("profiles").select("*")

  if (usersError) {
    console.error("Error fetching users:", usersError)
  }

  // 서비스 데이터 가져오기
  const { data: services, error: servicesError } = await supabase.from("services").select("*")

  if (servicesError) {
    console.error("Error fetching services:", servicesError)
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col space-y-4 p-8 pt-6 ml-0 lg:ml-64">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">보고서</h2>
        </div>
        <ReportManagement orders={orders || []} users={users || []} services={services || []} />
      </div>
    </div>
  )
}
