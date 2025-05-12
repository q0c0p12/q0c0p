import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { AlertCircle, BarChart2, CheckCircle, HelpCircle, XCircle, Package, ShoppingCart } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { OrderFilters } from "@/components/dashboard/order-filters"
import { isAdmin } from "@/lib/auth-utils"

// 타입 정의
interface OrderItem {
  id: string | number
  order_id: string | number
  service_id?: string | number
  service_title?: string
  package_name?: string
  price?: number
  quantity?: number
  requirements?: string
  service?: any
}

interface Order {
  id: string | number
  user_id?: string
  status?: string
  total_amount?: number
  created_at?: string
  refunded_amount?: number
  refunded_quantity?: number
  orderItems?: OrderItem[]
}

interface Service {
  id: string | number
  title?: string
  description?: string
  [key: string]: any
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // 안전하게 파라미터 가져오기
  const getStringParam = (name: string): string | undefined => {
    const value = searchParams[name]
    if (value === undefined) return undefined
    return typeof value === "string" ? value : value[0]
  }

  const getNumberParam = (name: string): number | undefined => {
    const value = getStringParam(name)
    if (value === undefined) return undefined
    const num = Number(value)
    return isNaN(num) ? undefined : num
  }

  const status = getStringParam("status")
  const service = getStringParam("service")
  const minAmount = getNumberParam("minAmount")
  const maxAmount = getNumberParam("maxAmount")
  const fromDate = getStringParam("fromDate")
  const toDate = getStringParam("toDate")
  const search = getStringParam("search")
  const page = getNumberParam("page") || 1
  const pageSize = 10

  try {
    const supabase = createClient()

    // 관리자 여부 확인
    const adminUser = await isAdmin()

    // 현재 로그인한 사용자 정보 가져오기
    const {
      data: { session },
    } = await supabase.auth.getSession()
    const userId = session?.user?.id

    if (!userId) {
      return (
        <div className="w-full p-6">
          <Card>
            <CardHeader>
              <CardTitle>로그인이 필요합니다</CardTitle>
              <CardDescription>주문 내역을 확인하려면 로그인해주세요.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-6">
              <Button asChild>
                <Link href="/auth?tab=signin">로그인하기</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }

    // 주문 정보 가져오기
    let query = supabase.from("orders").select("*", { count: "exact" })

    // 관리자가 아닌 경우 자신의 주문만 볼 수 있음
    if (!adminUser && userId) {
      query = query.eq("user_id", userId)
    }

    // 필터 적용
    if (status && status !== "all") {
      query = query.eq("status", status)
    }

    if (service && service !== "all") {
      query = query.eq("service_id", service)
    }

    if (minAmount !== undefined) {
      query = query.gte("total_amount", minAmount)
    }

    if (maxAmount !== undefined) {
      query = query.lte("total_amount", maxAmount)
    }

    if (fromDate) {
      query = query.gte("created_at", fromDate)
    }

    if (toDate) {
      // 종료일은 해당 일자의 끝까지 포함하기 위해 다음 날의 시작으로 설정
      const nextDay = new Date(toDate)
      nextDay.setDate(nextDay.getDate() + 1)
      query = query.lt("created_at", nextDay.toISOString().split("T")[0])
    }

    if (search) {
      // 숫자인 경우 ID로 검색, 그렇지 않으면 다른 필드로 검색
      if (/^\d+$/.test(search)) {
        query = query.eq("id", search)
      } else {
        // 여기서 or 조건을 사용할 때 주의해야 함
        query = query.or(`service_title.ilike.%${search}%`)
      }
    }

    // 전체 주문 수 가져오기 위한 별도의 쿼리 실행
    const countQuery = supabase.from("orders").select("id", { count: "exact", head: true })

    // 관리자가 아닌 경우 자신의 주문만 볼 수 있음
    if (!adminUser && userId) {
      countQuery.eq("user_id", userId)
    }

    const { count: totalCount } = await countQuery

    // 페이지네이션 적용
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    // 정렬 (기본값: 최신순) 및 페이지네이션 적용
    const { data: orders, error } = await query.order("created_at", { ascending: false }).range(from, to)

    if (error) {
      console.error("주문 조회 오류:", error)
      throw new Error(`주문 조회 오류: ${error.message}`)
    }

    // 주문 ID 목록 추출
    const orderIds = (orders || []).map((order) => order.id)

    let processedOrders: Order[] = orders || []
    let serviceData: Service[] = []
    let orderItems: OrderItem[] = []

    // 주문 항목 및 서비스 정보 가져오기
    if (orderIds.length > 0) {
      try {
        const adminClient = createAdminClient()

        // 주문 항목 정보 가져오기 (관리자 권한으로)
        const { data: items, error: orderItemsError } = await adminClient
          .from("order_items")
          .select("*")
          .in("order_id", orderIds)

        if (orderItemsError) {
          console.error("주문 항목 조회 오류:", orderItemsError)
        } else {
          orderItems = items || []

          // 서비스 ID 목록 추출
          const serviceIds = [...new Set(orderItems.filter((item) => item.service_id).map((item) => item.service_id))]

          // 서비스 정보 가져오기 (관리자 권한으로)
          if (serviceIds.length > 0) {
            const { data: services, error: serviceError } = await adminClient
              .from("services")
              .select("*")
              .in("id", serviceIds)

            if (serviceError) {
              console.error("서비스 조회 오류:", serviceError)
            } else {
              serviceData = services || []
            }
          }
        }
      } catch (err) {
        console.error("데이터 조회 오류:", err)
      }
    }

    // 서비스 정보를 ID를 키로 하는 맵으로 변환
    const serviceMap: Record<string, Service> = {}
    for (const service of serviceData) {
      if (service.id) {
        serviceMap[service.id.toString()] = service
      }
    }

    // 주문 항목을 주문 ID를 키로 하는 맵으로 변환
    const orderItemsMap: Record<string, OrderItem[]> = {}
    for (const item of orderItems) {
      const orderId = item.order_id.toString()
      if (!orderItemsMap[orderId]) {
        orderItemsMap[orderId] = []
      }

      // 서비스 정보 추가
      const serviceInfo = item.service_id ? serviceMap[item.service_id.toString()] : undefined
      orderItemsMap[orderId].push({
        ...item,
        service: serviceInfo,
        service_title: serviceInfo?.title || item.service_title || "서비스 정보 없음",
      })
    }

    // 주문 데이터 처리 - 주문 항목 정보 추가
    processedOrders = (orders || []).map((order) => ({
      ...order,
      orderItems: orderItemsMap[order.id.toString()] || [],
    }))

    // 서비스 목록 가져오기 (필터용)
    const { data: services } = await supabase.from("services").select("id, title").order("title")

    // 상태에 따른 배지 스타일
    const getStatusBadge = (status: string | undefined) => {
      if (!status) return <Badge variant="outline">대기중</Badge>

      switch (status) {
        case "completed":
          return <Badge className="bg-green-500">완료</Badge>
        case "processing":
          return <Badge className="bg-blue-500">진행중</Badge>
        case "pending":
          return <Badge className="bg-yellow-500">대기중</Badge>
        case "cancelled":
          return <Badge variant="destructive">취소됨</Badge>
        case "failed":
          return <Badge variant="destructive">실패</Badge>
        case "refunded":
          return <Badge className="bg-purple-500">환불됨</Badge>
        case "partial_refund":
          return <Badge className="bg-indigo-500">부분환불</Badge>
        default:
          return <Badge variant="outline">대기중</Badge>
      }
    }

    // 날짜 포맷 함수
    const formatDate = (dateString: string | undefined) => {
      if (!dateString) return "날짜 없음"
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString("ko-KR", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      } catch (e) {
        return "날짜 형식 오류"
      }
    }

    // 금액 포맷 함수
    const formatCurrency = (amount: number | undefined) => {
      if (amount === undefined || amount === null) return "0원"
      try {
        return new Intl.NumberFormat("ko-KR", {
          style: "currency",
          currency: "KRW",
          maximumFractionDigits: 0,
        }).format(amount)
      } catch (e) {
        return `${amount}원`
      }
    }

    // 주문 통계 계산
    const orderStats = {
      total: totalCount || 0,
      completed: processedOrders.filter((o) => o.status === "completed").length,
      processing: processedOrders.filter((o) => o.status === "processing").length,
      pending: processedOrders.filter((o) => o.status === "pending").length,
      cancelled: processedOrders.filter((o) => o.status === "cancelled").length,
      failed: processedOrders.filter((o) => o.status === "failed").length,
      refunded: processedOrders.filter((o) => o.status === "refunded" || o.status === "partial_refund").length,
      totalSpent: processedOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0),
    }

    // 서비스별 주문 통계 (필터링된 결과 기준)
    const serviceCounts: Record<string, number> = {}
    for (const order of processedOrders) {
      const serviceId = order.id.toString() || "unknown"
      serviceCounts[serviceId] = (serviceCounts[serviceId] || 0) + 1
    }

    const serviceStats = Object.entries(serviceCounts)
      .map(([serviceId, count]) => {
        const percentage = orderStats.total > 0 ? (count / orderStats.total) * 100 : 0
        return { serviceId, orders: count, percentage }
      })
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 5) // 상위 5개만 표시

    // 주문 상태 요약 (필터링된 결과 기준)
    const orderStatusSummary = [
      { status: "완료", count: orderStats.completed, percentage: (orderStats.completed / orderStats.total) * 100 || 0 },
      {
        status: "진행중",
        count: orderStats.processing,
        percentage: (orderStats.processing / orderStats.total) * 100 || 0,
      },
      { status: "대기중", count: orderStats.pending, percentage: (orderStats.pending / orderStats.total) * 100 || 0 },
      {
        status: "취소됨",
        count: orderStats.cancelled,
        percentage: (orderStats.cancelled / orderStats.total) * 100 || 0,
      },
      { status: "실패", count: orderStats.failed, percentage: (orderStats.failed / orderStats.total) * 100 || 0 },
      { status: "환불", count: orderStats.refunded, percentage: (orderStats.refunded / orderStats.total) * 100 || 0 },
    ].filter((item) => item.count > 0)

    // 페이지네이션 계산
    const totalPages = Math.ceil((totalCount || 0) / pageSize)
    const hasPrevPage = page > 1
    const hasNextPage = page < totalPages

    // 페이지네이션 링크 생성 함수
    const createPageLink = (pageNum: number) => {
      const params = new URLSearchParams()

      if (status && status !== "all") params.set("status", status)
      if (service && service !== "all") params.set("service", service)
      if (minAmount !== undefined) params.set("minAmount", minAmount.toString())
      if (maxAmount !== undefined) params.set("maxAmount", maxAmount.toString())
      if (fromDate) params.set("fromDate", fromDate)
      if (toDate) params.set("toDate", toDate)
      if (search) params.set("search", search)
      params.set("page", pageNum.toString())

      return `/dashboard/orders?${params.toString()}`
    }

    return (
      <div className="w-full p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">주문 내역</h1>
          <p className="text-muted-foreground">
            {adminUser ? "모든 주문 내역을 확인하고 관리하세요." : "내 주문 내역을 확인하세요."}
          </p>
        </div>

        {/* 공지사항 */}
        <Card className="border-yellow-200 bg-yellow-50 w-full overflow-hidden mb-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-2 pt-2">
            <div className="space-y-0.5">
              <CardTitle className="text-sm font-medium">주문 처리 안내</CardTitle>
              <CardDescription>중요 안내</CardDescription>
            </div>
            <AlertCircle className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent className="px-2 pb-2">
            <div className="space-y-1">
              <p className="text-sm font-medium">주문 처리 시간 변경 안내</p>
              <p className="text-sm text-muted-foreground">
                2025년 5월 10일부터 주문 처리 시간이 최대 24시간으로 단축됩니다. 더 빠른 서비스를 제공해 드리겠습니다.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div className="md:col-span-2 lg:col-span-3 space-y-6">
            {/* 주문 통계 카드 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              <Card className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-2 pt-2">
                  <div className="space-y-0.5">
                    <CardTitle className="text-sm font-medium">총 주문</CardTitle>
                    <CardDescription>전체 주문 수</CardDescription>
                  </div>
                  <BarChart2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="px-2 pb-2">
                  <div className="text-2xl font-bold">{orderStats.total}건</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {search || status || service || minAmount || maxAmount || fromDate || toDate
                      ? "필터링된 결과"
                      : "모든 주문"}
                  </p>
                </CardContent>
              </Card>
              <Card className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-2 pt-2">
                  <div className="space-y-0.5">
                    <CardTitle className="text-sm font-medium">완료된 주문</CardTitle>
                    <CardDescription>성공적으로 처리된 주문</CardDescription>
                  </div>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent className="px-2 pb-2">
                  <div className="text-2xl font-bold">{orderStats.completed}건</div>
                  <Progress className="mt-2" value={(orderStats.completed / orderStats.total) * 100 || 0} />
                </CardContent>
              </Card>
              <Card className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-2 pt-2">
                  <div className="space-y-0.5">
                    <CardTitle className="text-sm font-medium">처리 중인 주문</CardTitle>
                    <CardDescription>진행 중인 주문</CardDescription>
                  </div>
                  <HelpCircle className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent className="px-2 pb-2">
                  <div className="text-2xl font-bold">{orderStats.processing + orderStats.pending}건</div>
                  <Progress
                    className="mt-2"
                    value={((orderStats.processing + orderStats.pending) / orderStats.total) * 100 || 0}
                  />
                </CardContent>
              </Card>
              <Card className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-2 pt-2">
                  <div className="space-y-0.5">
                    <CardTitle className="text-sm font-medium">총 지출</CardTitle>
                    <CardDescription>총 주문 금액</CardDescription>
                  </div>
                  <XCircle className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent className="px-2 pb-2">
                  <div className="text-2xl font-bold">{formatCurrency(orderStats.totalSpent)}</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    평균 주문 금액:{" "}
                    {formatCurrency(orderStats.total > 0 ? orderStats.totalSpent / orderStats.total : 0)}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* 주문 목록 */}
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-2 pt-2">
                <div className="space-y-1">
                  <CardTitle>주문 목록</CardTitle>
                  <CardDescription>
                    {search || status || service || minAmount || maxAmount || fromDate || toDate
                      ? `필터링된 ${orderStats.total}개의 주문`
                      : `총 ${orderStats.total}개의 주문이 있습니다`}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="px-2 pb-2">
                {/* 필터 컴포넌트 - 관리자만 모든 필터 옵션 표시 */}
                <OrderFilters isAdmin={adminUser} services={services || []} />

                <div className="mt-4 overflow-x-auto -mx-2 px-2">
                  <div className="min-w-[800px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[80px]">주문 ID</TableHead>
                          <TableHead className="w-[250px]">서비스 정보</TableHead>
                          <TableHead className="text-right">금액</TableHead>
                          <TableHead>상태</TableHead>
                          <TableHead>날짜</TableHead>
                          <TableHead className="w-[80px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {processedOrders.length > 0 ? (
                          processedOrders.map((order) => (
                            <TableRow key={order.id}>
                              <TableCell className="font-medium">#{order.id}</TableCell>
                              <TableCell>
                                {order.orderItems && order.orderItems.length > 0 ? (
                                  <div className="space-y-1">
                                    {order.orderItems.map((item, index) => (
                                      <div key={index} className="text-sm">
                                        <div className="font-medium">
                                          {item.service?.title ||
                                            item.service_title ||
                                            `서비스 #${item.service_id || "알 수 없음"}`}
                                        </div>
                                        <div className="flex items-center text-muted-foreground">
                                          <ShoppingCart className="h-3 w-3 mr-1" />
                                          <span>{formatCurrency(item.price)}</span>
                                          <span className="ml-2">x {item.quantity || 1}</span>
                                        </div>
                                        {item.package_name && (
                                          <div className="flex items-center text-xs text-gray-500 mt-1">
                                            <Package className="h-3 w-3 mr-1" />
                                            <span>{item.package_name}</span>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-sm text-muted-foreground">
                                    <div>주문 항목이 없습니다</div>
                                    <div className="text-xs text-gray-500">주문 ID: {order.id}</div>
                                  </div>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                {order.status === "partial_refund" ? (
                                  <div className="flex flex-col items-end">
                                    <span className="line-through text-muted-foreground">
                                      {formatCurrency(order.total_amount)}
                                    </span>
                                    <span className="font-medium text-green-600">
                                      {formatCurrency(
                                        order.refunded_amount !== undefined
                                          ? (order.total_amount || 0) - (order.refunded_amount || 0)
                                          : order.total_amount,
                                      )}
                                    </span>
                                    {order.refunded_amount !== undefined && (
                                      <span className="text-xs text-red-500">
                                        환불: {formatCurrency(order.refunded_amount)}
                                        {order.refunded_quantity ? ` (${order.refunded_quantity}개)` : ""}
                                      </span>
                                    )}
                                  </div>
                                ) : order.status === "refunded" ? (
                                  <div className="flex flex-col items-end">
                                    <span className="line-through text-muted-foreground">
                                      {formatCurrency(order.total_amount)}
                                    </span>
                                    <span className="text-xs text-red-500 font-medium">전액 환불됨</span>
                                  </div>
                                ) : order.status === "cancelled" ? (
                                  <div className="flex flex-col items-end">
                                    <span className="line-through text-muted-foreground">
                                      {formatCurrency(order.total_amount)}
                                    </span>
                                    <span className="text-xs text-red-500 font-medium">주문 취소됨</span>
                                    {order.refunded_amount !== undefined && order.refunded_amount > 0 && (
                                      <span className="text-xs text-red-500">
                                        환불: {formatCurrency(order.refunded_amount)}
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  formatCurrency(order.total_amount)
                                )}
                              </TableCell>
                              <TableCell>{getStatusBadge(order.status)}</TableCell>
                              <TableCell>{formatDate(order.created_at)}</TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm" asChild>
                                  <Link href={`/dashboard/orders/${order.id}`}>상세</Link>
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-4">
                              {search || status || service || minAmount || maxAmount || fromDate || toDate
                                ? "검색 결과가 없습니다."
                                : "주문 내역이 없습니다."}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* 페이지네이션 */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 px-1">
                    <div className="text-sm text-muted-foreground">
                      페이지 {page} / {totalPages} (총 {orderStats.total}건)
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" disabled={!hasPrevPage}>
                        {hasPrevPage ? <Link href={createPageLink(page - 1)}>이전</Link> : "이전"}
                      </Button>
                      <Button variant="outline" size="sm" disabled={!hasNextPage}>
                        {hasNextPage ? <Link href={createPageLink(page + 1)}>다음</Link> : "다음"}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 서비스별 주문 통계 - 관리자만 표시 */}
            {adminUser && serviceStats.length > 0 && (
              <Card className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-2 pt-2">
                  <div className="space-y-1">
                    <CardTitle>주문 통계</CardTitle>
                    <CardDescription>주문 ID별 통계</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="px-2 pb-2">
                  <div className="space-y-2">
                    {serviceStats.map((service, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                            <span className="text-sm font-medium">주문 ID: {service.serviceId}</span>
                          </div>
                          <span className="text-sm">
                            {service.orders}건 ({Math.round(service.percentage)}%)
                          </span>
                        </div>
                        <Progress value={service.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 오른쪽 사이드바 컨텐츠 */}
          <div className="space-y-6">
            {/* 주문 상태 요약 */}
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-2 pt-2">
                <div>
                  <CardTitle className="text-base">주문 상태 요약</CardTitle>
                  <CardDescription>현재 주문 상태 분포</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="px-2 pb-2">
                <div className="space-y-2">
                  {orderStatusSummary.map((status, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{status.status}</span>
                        <span className="text-sm">
                          {status.count}건 ({Math.round(status.percentage)}%)
                        </span>
                      </div>
                      <Progress
                        value={status.percentage}
                        className="h-2"
                        style={{
                          backgroundColor:
                            status.status === "완료"
                              ? "#10b981"
                              : status.status === "진행중"
                                ? "#3b82f6"
                                : status.status === "대기중"
                                  ? "#f59e0b"
                                  : status.status === "취소됨"
                                    ? "#ef4444"
                                    : status.status === "환불"
                                      ? "#8b5cf6"
                                      : "#ef4444",
                        }}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 최근 활동 */}
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-2 pt-2">
                <div>
                  <CardTitle className="text-base">최근 활동</CardTitle>
                  <CardDescription>최근 주문 상태 변경</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="px-2 pb-2">
                <div className="space-y-4">
                  {processedOrders.length > 0 ? (
                    processedOrders.slice(0, 5).map((order) => {
                      const orderItem = order.orderItems && order.orderItems.length > 0 ? order.orderItems[0] : null

                      return (
                        <div key={order.id} className="flex items-start space-x-3">
                          <div className="relative mt-1">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <div className="absolute top-2 bottom-0 left-1 w-[1px] -ml-px bg-gray-200"></div>
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium">주문 #{order.id}</p>
                              <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {orderItem?.service?.title || orderItem?.service_title || "알 수 없음"} (
                              {orderItem?.quantity || 0}개)
                            </p>
                            <p className="text-sm text-muted-foreground">{getStatusBadge(order.status)}</p>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <p className="text-sm text-muted-foreground py-2">최근 활동이 없습니다.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 필터 가이드 */}
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-2 pt-2">
                <div>
                  <CardTitle className="text-base">필터 가이드</CardTitle>
                  <CardDescription>효율적인 주문 검색 방법</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="px-2 pb-2">
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium">주문 ID로 검색</p>
                    <p className="text-muted-foreground">정확한 주문 ID를 입력하여 특정 주문을 찾을 수 있습니다.</p>
                  </div>
                  <div>
                    <p className="font-medium">날짜 범위 지정</p>
                    <p className="text-muted-foreground">특정 기간 동안의 주문을 확인하려면 날짜 필터를 사용하세요.</p>
                  </div>
                  <div>
                    <p className="font-medium">상태별 필터링</p>
                    <p className="text-muted-foreground">완료, 처리중, 실패 등 상태별로 주문을 필터링할 수 있습니다.</p>
                  </div>
                  <div>
                    <p className="font-medium">서비스별 필터링</p>
                    <p className="text-muted-foreground">특정 서비스의 주문만 보려면 서비스 필터를 사용하세요.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error("주문 페이지 오류:", error)
    return (
      <div className="w-full p-6">
        <Card>
          <CardHeader>
            <CardTitle>오류가 발생했습니다</CardTitle>
            <CardDescription>주문 내역을 불러오는 중 문제가 발생했습니다.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center py-6 gap-4">
            <p className="text-muted-foreground">잠시 후 다시 시도해주세요.</p>
            <Button asChild>
              <Link href="/dashboard">대시보드로 돌아가기</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
}
