import { Suspense } from "react"
import { createAdminClient } from "@/lib/supabase/admin"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminOrdersTable } from "@/components/admin/orders-table"
import { AdminOrderFilters } from "@/components/admin/order-filters"
import { AdminOrderPagination } from "@/components/admin/order-pagination"

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  try {
    // 관리자 권한으로 Supabase 클라이언트 생성
    const supabase = createAdminClient()

    // 검색 파라미터 처리
    const status = searchParams.status as string | undefined
    const service = searchParams.service as string | undefined
    const dateRange = searchParams.dateRange as string | undefined
    const search = searchParams.search as string | undefined
    const page = Number.parseInt((searchParams.page as string) || "1")
    const pageSize = 10

    // 주문 데이터 쿼리 구성 - orders와 order_items 테이블 조인
    let countQuery = supabase.from("orders").select("*", { count: "exact", head: true })

    // 필터 적용 (카운트 쿼리)
    if (status && status !== "all") {
      countQuery = countQuery.eq("status", status)
    }

    if (search) {
      countQuery = countQuery.or(`id.eq.${search},user_id.ilike.%${search}%`)
    }

    // 날짜 범위 필터 (카운트 쿼리)
    if (dateRange) {
      const [start, end] = dateRange.split(":")
      if (start && end) {
        countQuery = countQuery.gte("created_at", start).lte("created_at", end)
      }
    }

    // 전체 주문 수를 가져오기 위한 쿼리 실행
    const { count: totalCount, error: countError } = await countQuery

    if (countError) {
      console.error("주문 수 조회 오류:", countError)
      throw new Error("주문 수를 조회하는 중 오류가 발생했습니다.")
    }

    // 페이지네이션
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    // 주문 데이터 쿼리 구성 - orders와 order_items 테이블 조인
    let query = supabase.from("orders").select(`
        *,
        orderItems:order_items(*)
      `)

    // 필터 적용
    if (status && status !== "all") {
      query = query.eq("status", status)
    }

    if (search) {
      query = query.or(`id.eq.${search},user_id.ilike.%${search}%`)
    }

    // 날짜 범위 필터
    if (dateRange) {
      const [start, end] = dateRange.split(":")
      if (start && end) {
        query = query.gte("created_at", start).lte("created_at", end)
      }
    }

    // 정렬 및 페이지네이션 적용
    const { data: orders, error } = await query.order("created_at", { ascending: false }).range(from, to)

    if (error) {
      console.error("주문 목록 조회 오류:", error)
      throw new Error("주문 목록을 조회하는 중 오류가 발생했습니다.")
    }

    // 사용자 정보 가져오기 (별도 쿼리)
    const userIds = orders?.map((order) => order.user_id) || []
    let userProfiles = {}
    let userEmails = {}

    if (userIds.length > 0) {
      // 사용자 프로필 정보 가져오기
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", userIds)

      if (profilesError) {
        console.error("사용자 프로필 정보 조회 오류:", profilesError)
      } else if (profiles) {
        // 사용자 ID를 키로 하는 객체로 변환
        userProfiles = profiles.reduce((acc, profile) => {
          acc[profile.id] = profile
          return acc
        }, {})
      }

      // 사용자 이메일 정보 가져오기 (auth.users 테이블)
      const { data: authUsers, error: authUsersError } = await supabase.auth.admin.listUsers({
        perPage: userIds.length,
      })

      if (authUsersError) {
        console.error("사용자 인증 정보 조회 오류:", authUsersError)
      } else if (authUsers) {
        // 사용자 ID를 키로 하는 객체로 변환
        userEmails = authUsers.users.reduce((acc, user) => {
          acc[user.id] = user.email
          return acc
        }, {})
      }
    }

    // 서비스 목록 가져오기 (필터용)
    const { data: services, error: servicesError } = await supabase.from("services").select("id, title").order("title")

    if (servicesError) {
      console.error("서비스 목록 조회 오류:", servicesError)
    }

    // 페이지네이션 계산
    const totalPages = Math.ceil(totalCount || 0 / pageSize)
    const hasPrevPage = page > 1
    const hasNextPage = page < totalPages

    // 주문 데이터에 사용자 정보 추가
    const ordersWithDetails =
      orders?.map((order) => {
        return {
          ...order,
          userProfile: userProfiles[order.user_id] || null,
          userEmail: userEmails[order.user_id] || null,
        }
      }) || []

    console.log(
      "주문 데이터 샘플:",
      ordersWithDetails.length > 0
        ? {
            id: ordersWithDetails[0].id,
            orderItemsCount: ordersWithDetails[0].orderItems?.length || 0,
            orderItems: ordersWithDetails[0].orderItems?.map((item) => ({
              id: item.id,
              service_title: item.service_title,
              package_name: item.package_name,
            })),
          }
        : "주문 없음",
    )

    return (
      <div className="w-full p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">주문 관리</h1>
            <p className="text-muted-foreground">모든 주문을 관리하고 상태를 업데이트하세요.</p>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>주문 필터</CardTitle>
            <CardDescription>원하는 조건으로 주문을 필터링하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-[100px] w-full" />}>
              <AdminOrderFilters services={services || []} />
            </Suspense>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>주문 목록</CardTitle>
            <CardDescription>
              총 {totalCount || 0}개의 주문 중 {totalCount ? from + 1 : 0}-{Math.min(totalCount || 0, to + 1)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                <div className="mb-4 p-2 bg-yellow-50 rounded-md border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    <strong>주문 정보 안내:</strong> 각 주문의 서비스명, 패키지명, 가격, 수량이 표시됩니다. 더 자세한
                    정보는 '펼치기' 또는 '상세 보기'를 클릭하세요.
                  </p>
                </div>
                <AdminOrdersTable orders={ordersWithDetails} />
              </Suspense>
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="mt-4">
                <AdminOrderPagination
                  currentPage={page}
                  totalPages={totalPages}
                  hasPrevPage={hasPrevPage}
                  hasNextPage={hasNextPage}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  } catch (error) {
    console.error("Error in admin orders page:", error)
    return (
      <div className="w-full p-6">
        <Card>
          <CardHeader>
            <CardTitle>오류 발생</CardTitle>
            <CardDescription>주문 데이터를 불러오는 중 오류가 발생했습니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>다시 시도하거나 관리자에게 문의하세요.</p>
          </CardContent>
        </Card>
      </div>
    )
  }
}
