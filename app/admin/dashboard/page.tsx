import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, CreditCard, ShoppingCart, Package, ArrowUp, ArrowDown, DollarSign, Calendar } from "lucide-react"
import { RevenueChart } from "@/components/admin/revenue-chart"
import { UserStats } from "@/components/admin/user-stats"
import { SystemStatus } from "@/components/admin/system-status"

export default async function AdminDashboardPage() {
  const supabase = createClient()

  // 주문 통계
  const { count: totalOrders } = await supabase.from("orders").select("*", { count: "exact", head: true })

  // 사용자 통계
  const { count: totalUsers } = await supabase.from("profiles").select("*", { count: "exact", head: true })

  // 서비스 통계
  const { count: totalServices } = await supabase.from("services").select("*", { count: "exact", head: true })

  // 카테고리 통계
  const { count: totalCategories } = await supabase.from("categories").select("*", { count: "exact", head: true })

  // 최근 주문
  const { data: recentOrders } = await supabase
    .from("orders")
    .select(`
      id,
      order_number,
      created_at,
      status,
      total_amount,
      user_id,
      profiles(email)
    `)
    .order("created_at", { ascending: false })
    .limit(5)

  // 월별 매출 데이터 (최근 6개월)
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
  sixMonthsAgo.setDate(1)
  sixMonthsAgo.setHours(0, 0, 0, 0)

  const { data: monthlyRevenue } = await supabase
    .from("orders")
    .select("created_at, total_amount")
    .gte("created_at", sixMonthsAgo.toISOString())
    .eq("status", "completed")

  // 월별 매출 계산
  const revenueByMonth: { [key: string]: number } = {}

  monthlyRevenue?.forEach((order) => {
    const date = new Date(order.created_at)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

    if (!revenueByMonth[monthKey]) {
      revenueByMonth[monthKey] = 0
    }

    revenueByMonth[monthKey] += order.total_amount
  })

  // 차트 데이터 형식으로 변환
  const chartData = Object.entries(revenueByMonth)
    .map(([month, amount]) => ({
      name: month,
      total: amount,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))

  // 이번 달과 지난 달 매출 비교
  const currentDate = new Date()
  const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`
  const lastMonth = `${currentDate.getMonth() === 0 ? currentDate.getFullYear() - 1 : currentDate.getFullYear()}-${String(currentDate.getMonth() === 0 ? 12 : currentDate.getMonth()).padStart(2, "0")}`

  const currentMonthRevenue = revenueByMonth[currentMonth] || 0
  const lastMonthRevenue = revenueByMonth[lastMonth] || 0
  const revenueChange = lastMonthRevenue ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">관리자 대시보드</h1>
        <p className="text-muted-foreground">시스템 전반의 통계와 주문 현황을 확인하세요.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">총 주문</p>
                <h3 className="text-2xl font-bold mt-1">{totalOrders || 0}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">총 사용자</p>
                <h3 className="text-2xl font-bold mt-1">{totalUsers || 0}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">총 서비스</p>
                <h3 className="text-2xl font-bold mt-1">{totalServices || 0}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">이번 달 매출</p>
                <h3 className="text-2xl font-bold mt-1">₩{currentMonthRevenue.toLocaleString()}</h3>
                <div className="flex items-center mt-1">
                  {revenueChange > 0 ? (
                    <>
                      <ArrowUp className="h-4 w-4 text-green-500" />
                      <span className="text-xs text-green-500">{Math.abs(revenueChange).toFixed(1)}%</span>
                    </>
                  ) : revenueChange < 0 ? (
                    <>
                      <ArrowDown className="h-4 w-4 text-red-500" />
                      <span className="text-xs text-red-500">{Math.abs(revenueChange).toFixed(1)}%</span>
                    </>
                  ) : (
                    <span className="text-xs text-gray-500">0%</span>
                  )}
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-rose-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-rose-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>매출 추이</CardTitle>
            <CardDescription>최근 6개월 간의 매출 추이입니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueChart data={chartData} />
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>최근 주문</CardTitle>
            <CardDescription>최근 접수된 주문 목록입니다.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentOrders && recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between border-b pb-4">
                    <div>
                      <p className="font-medium">{order.order_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()} - {order.profiles?.email || "사용자"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">₩{order.total_amount?.toLocaleString() || 0}</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          order.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : order.status === "processing"
                              ? "bg-blue-100 text-blue-800"
                              : order.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {order.status === "completed"
                          ? "완료"
                          : order.status === "processing"
                            ? "처리중"
                            : order.status === "pending"
                              ? "대기중"
                              : order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-40">
                <p className="text-muted-foreground">주문 내역이 없습니다.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>사용자 통계</CardTitle>
            <CardDescription>사용자 등록 및 활동 통계입니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <UserStats />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>시스템 상태</CardTitle>
            <CardDescription>시스템 리소스 및 성능 지표입니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <SystemStatus />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>빠른 작업</CardTitle>
            <CardDescription>자주 사용하는 관리 기능에 빠르게 접근하세요.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full justify-start" variant="outline" asChild>
              <a href="/admin/services">
                <Package className="mr-2 h-4 w-4" />
                서비스 관리
              </a>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <a href="/admin/categories">
                <CreditCard className="mr-2 h-4 w-4" />
                카테고리 관리
              </a>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <a href="/admin/orders">
                <ShoppingCart className="mr-2 h-4 w-4" />
                주문 관리
              </a>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <a href="/admin/users">
                <Users className="mr-2 h-4 w-4" />
                사용자 관리
              </a>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <a href="/admin/settings">
                <Calendar className="mr-2 h-4 w-4" />
                일정 관리
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
