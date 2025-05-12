import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { Skeleton } from "@/components/ui/skeleton"
import { DynamicNoticeCard, DynamicRecentOrders } from "@/lib/dynamic-imports"
import { DynamicStatsCards } from "@/lib/dynamic-imports"
import { DynamicSimpleActivityChart } from "@/lib/dynamic-imports"
import { DynamicRecommendedServices } from "@/lib/dynamic-imports"
import { DynamicQuickActions } from "@/lib/dynamic-imports"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell, Calendar, TrendingUp } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ko } from "date-fns/locale"

export default async function DashboardPage() {
  try {
    const supabase = createClient()

    // 사용자 세션 가져오기
    const {
      data: { session },
    } = await supabase.auth.getSession()

    console.log("세션 정보:", session ? `사용자 ID: ${session.user.id}` : "세션 없음")

    // 사용자 통계 정보 가져오기
    const userStats = {
      balance: 0,
      total_spent: 0,
      total_orders: 0,
    }

    // 최근 주문 내역을 저장할 변수
    let recentOrders = []

    // 사용자 ID 확인
    const userId = session?.user?.id

    if (userId) {
      try {
        // 프로필에서 잔액 정보 가져오기
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("points, balance")
          .eq("id", userId)
          .single()

        if (profileError) {
          console.error("프로필 데이터 조회 오류:", profileError)
        } else if (profileData) {
          userStats.balance = profileData.points || profileData.balance || 0
          console.log("프로필 데이터:", profileData)
        }
      } catch (error) {
        console.error("프로필 데이터 요청 중 예외 발생:", error)
        // 오류가 발생해도 계속 진행
      }

      try {
        // 주문 내역 가져오기 - 서비스 정보 포함
        console.log("주문 내역 조회 시작...")

        // 먼저 주문 데이터 가져오기
        const { data: ordersData, error: ordersError } = await supabase
          .from("orders")
          .select("*, service_id")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(10)

        if (ordersError) {
          console.error("주문 내역 조회 오류:", ordersError)
        } else {
          console.log("주문 내역 조회 결과:", ordersData ? ordersData.length : 0, "건")
          console.log("주문 데이터 샘플:", ordersData && ordersData.length > 0 ? ordersData[0] : "데이터 없음")

          if (ordersData && ordersData.length > 0) {
            // 서비스 ID 목록 추출
            const serviceIds = ordersData
              .map((order) => order.service_id)
              .filter((id) => id !== null && id !== undefined)

            console.log("서비스 ID 목록:", serviceIds)

            // 서비스 정보 가져오기
            let servicesData = {}

            if (serviceIds.length > 0) {
              try {
                const { data: services, error: servicesError } = await supabase
                  .from("services")
                  .select("id, title, description") // name을 title로 변경
                  .in("id", serviceIds)

                if (servicesError) {
                  console.error("서비스 정보 조회 오류:", servicesError)
                } else if (services) {
                  console.log("서비스 정보 조회 결과:", services.length, "건")

                  // 서비스 ID를 키로 하는 객체로 변환
                  servicesData = services.reduce((acc, service) => {
                    acc[service.id] = service
                    return acc
                  }, {})
                }
              } catch (error) {
                console.error("서비스 정보 조회 중 예외 발생:", error)
              }
            }

            // 패키지 정보 가져오기
            let packagesData = {}

            // 패키지 ID 목록 추출
            const packageIds = ordersData
              .map((order) => order.package_id)
              .filter((id) => id !== null && id !== undefined)

            if (packageIds.length > 0) {
              try {
                const { data: packages, error: packagesError } = await supabase
                  .from("service_packages")
                  .select("id, name, description")
                  .in("id", packageIds)

                if (packagesError) {
                  console.error("패키지 정보 조회 오류:", packagesError)
                } else if (packages) {
                  console.log("패키지 정보 조회 결과:", packages.length, "건")

                  // 패키지 ID를 키로 하는 객체로 변환
                  packagesData = packages.reduce((acc, pkg) => {
                    acc[pkg.id] = pkg
                    return acc
                  }, {})
                }
              } catch (error) {
                console.error("패키지 정보 조회 중 예외 발생:", error)
              }
            }

            // 주문 데이터 처리
            recentOrders = ordersData.map((order) => {
              // 서비스 정보 가져오기
              const serviceInfo = order.service_id ? servicesData[order.service_id] : null
              const packageInfo = order.package_id ? packagesData[order.package_id] : null

              return {
                id: order.id,
                order_number: `ORD-${order.id}`,
                service: serviceInfo ? serviceInfo.title : order.service_name || "-", // name을 title로 변경
                package_name: packageInfo ? packageInfo.name : order.package_name || "-",
                quantity: order.quantity || 0,
                amount: order.total_amount || 0,
                status: order.status || "pending",
                date: order.created_at,
                refunded_amount: order.refunded_amount || 0,
                refunded_quantity: order.refunded_quantity || 0,
              }
            })

            console.log("처리된 주문 데이터:", recentOrders.length, "건")
            console.log("처리된 주문 데이터 샘플:", recentOrders[0])

            // 총 주문 수
            userStats.total_orders = ordersData.length

            // 총 사용 금액 계산 (환불 고려)
            userStats.total_spent = ordersData.reduce((sum, order) => {
              if (order.status === "refunded") {
                return sum + 0 // 전액 환불된 주문은 0원
              } else if (order.status === "partial_refund") {
                return sum + (order.total_amount - (order.refunded_amount || 0)) // 부분 환불
              } else if (order.status === "cancelled") {
                return sum + 0 // 취소된 주문은 0원
              } else {
                return sum + (order.total_amount || 0) // 일반 주문
              }
            }, 0)
          } else {
            console.log("주문 데이터가 없습니다. 샘플 데이터를 사용합니다.")

            // 샘플 주문 데이터 생성
            recentOrders = [
              {
                id: 1,
                order_number: "ORD-1",
                service: "인스타그램 팔로워",
                package_name: "프리미엄 패키지",
                quantity: 1000,
                amount: 30000,
                status: "completed",
                date: new Date().toISOString(),
                refunded_amount: 0,
                refunded_quantity: 0,
              },
              {
                id: 2,
                order_number: "ORD-2",
                service: "유튜브 구독자",
                package_name: "스탠다드 패키지",
                quantity: 500,
                amount: 25000,
                status: "processing",
                date: new Date(Date.now() - 86400000).toISOString(), // 1일 전
                refunded_amount: 0,
                refunded_quantity: 0,
              },
              {
                id: 3,
                order_number: "ORD-3",
                service: "페이스북 좋아요",
                package_name: "베이직 패키지",
                quantity: 200,
                amount: 15000,
                status: "partial_refund",
                date: new Date(Date.now() - 172800000).toISOString(), // 2일 전
                refunded_amount: 5000,
                refunded_quantity: 50,
              },
            ]

            // 샘플 데이터로 통계 업데이트
            userStats.total_orders = recentOrders.length
            userStats.total_spent = recentOrders.reduce((sum, order) => {
              if (order.status === "refunded") {
                return sum + 0
              } else if (order.status === "partial_refund") {
                return sum + (order.amount - (order.refunded_amount || 0))
              } else if (order.status === "cancelled") {
                return sum + 0
              } else {
                return sum + (order.amount || 0)
              }
            }, 0)
          }
        }
      } catch (error) {
        console.error("주문 데이터 요청 중 예외 발생:", error)
        // 오류가 발생해도 계속 진행
      }

      try {
        // 모든 주문 내역 가져와서 통계 계산
        const { data: allOrdersData, error: allOrdersError } = await supabase
          .from("orders")
          .select("id, total_amount, status, refunded_amount")
          .eq("user_id", userId)

        if (allOrdersError) {
          console.error("전체 주문 내역 조회 오류:", allOrdersError)
        } else if (allOrdersData && allOrdersData.length > 0) {
          userStats.total_orders = allOrdersData.length

          // 총 사용 금액 계산 (환불 고려)
          userStats.total_spent = allOrdersData.reduce((sum, order) => {
            if (order.status === "refunded") {
              return sum + 0 // 전액 환불된 주문은 0원
            } else if (order.status === "partial_refund") {
              return sum + (order.total_amount - (order.refunded_amount || 0)) // 부분 환불
            } else if (order.status === "cancelled") {
              return sum + 0 // 취소된 주문은 0원
            } else {
              return sum + (order.total_amount || 0) // 일반 주문
            }
          }, 0)
        }
      } catch (error) {
        console.error("전체 주문 내역 요청 중 예외 발생:", error)
      }
    } else {
      console.log("로그인되지 않은 사용자입니다. 샘플 데이터를 사용합니다.")

      // 로그인되지 않은 경우 샘플 데이터 사용
      recentOrders = [
        {
          id: 1,
          order_number: "ORD-1",
          service: "인스타그램 팔로워",
          package_name: "프리미엄 패키지",
          quantity: 1000,
          amount: 30000,
          status: "completed",
          date: new Date().toISOString(),
          refunded_amount: 0,
          refunded_quantity: 0,
        },
        {
          id: 2,
          order_number: "ORD-2",
          service: "유튜브 구독자",
          package_name: "스탠다드 패키지",
          quantity: 500,
          amount: 25000,
          status: "processing",
          date: new Date(Date.now() - 86400000).toISOString(), // 1일 전
          refunded_amount: 0,
          refunded_quantity: 0,
        },
      ]

      // 샘플 데이터로 통계 업데이트
      userStats.total_orders = recentOrders.length
      userStats.total_spent = recentOrders.reduce((sum, order) => sum + (order.amount || 0), 0)
      userStats.balance = 50000 // 샘플 잔액
    }

    // 활동 그래프 데이터
    const activityData = {
      spending: [],
      orders: [],
    }

    if (recentOrders.length > 0) {
      try {
        // 주문 데이터에서 날짜별 지출 계산
        const spendingByDate = recentOrders.reduce((acc, order) => {
          // 환불을 고려한 실제 지출액 계산
          let amount = 0
          if (order.status === "refunded") {
            amount = 0 // 완전 환불된 주문은 0원
          } else if (order.status === "partial_refund") {
            amount = order.amount - (order.refunded_amount || 0) // 부분 환불
          } else if (order.status === "cancelled") {
            amount = 0 // 취소된 주문은 0원
          } else {
            amount = order.amount || 0 // 일반 주문
          }

          const date = new Date(order.date).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })
          if (!acc[date]) {
            acc[date] = 0
          }
          acc[date] += amount
          return acc
        }, {})

        activityData.spending = Object.entries(spendingByDate).map(([date, amount]) => ({
          date,
          amount,
        }))

        // 날짜별 주문 수 계산
        const ordersByDate = recentOrders.reduce((acc, order) => {
          const date = new Date(order.date).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })
          if (!acc[date]) {
            acc[date] = 0
          }
          acc[date] += 1
          return acc
        }, {})

        activityData.orders = Object.entries(ordersByDate).map(([date, count]) => ({
          date,
          count,
        }))
      } catch (error) {
        console.error("활동 데이터 처리 중 오류 발생:", error)
      }
    }

    // 알림 데이터
    let notifications = []

    // 알림 테이블이 존재하는지 확인하는 함수
    async function checkTableExists(tableName: string): Promise<boolean> {
      try {
        // 테이블 존재 여부 확인을 위한 쿼리
        const { error } = await supabase.from(tableName).select("id").limit(1)

        // 테이블이 없는 경우 특정 오류 코드 반환
        if (error && (error.code === "42P01" || error.message.includes("does not exist"))) {
          return false
        }

        return true
      } catch (error) {
        console.error(`테이블 확인 중 오류: ${error}`)
        return false
      }
    }

    if (userId) {
      // 알림 테이블이 존재하는지 확인
      const notificationsTableExists = await checkTableExists("notifications")

      if (notificationsTableExists) {
        try {
          const { data: notificationsData, error: notificationsError } = await supabase
            .from("notifications")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(3)

          if (notificationsError) {
            console.error("알림 데이터 조회 오류:", notificationsError)
          } else if (notificationsData && notificationsData.length > 0) {
            notifications = notificationsData.map((notification) => ({
              id: notification.id,
              title: notification.title,
              description: notification.content || notification.description,
              time: formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: ko }),
            }))
          }
        } catch (error) {
          console.error("알림 데이터 처리 중 오류 발생:", error)
        }
      } else {
        console.log("알림 테이블이 존재하지 않습니다. 샘플 데이터를 사용합니다.")
        // 테이블이 없는 경우 샘플 데이터 사용
        notifications = [
          {
            id: 1,
            title: "포인트 충전 완료",
            description: "10,000 포인트가 충전되었습니다.",
            time: "방금 전",
          },
          {
            id: 2,
            title: "주문 처리 완료",
            description: "주문 #12345가 성공적으로 처리되었습니다.",
            time: "1시간 전",
          },
          {
            id: 3,
            title: "신규 서비스 출시",
            description: "인스타그램 팔로워 증가 서비스가 새롭게 출시되었습니다.",
            time: "1일 전",
          },
        ]
      }
    } else {
      // 로그인되지 않은 경우 샘플 알림 데이터
      notifications = [
        {
          id: 1,
          title: "로그인 안내",
          description: "로그인하시면 더 많은 기능을 이용하실 수 있습니다.",
          time: "방금 전",
        },
        {
          id: 2,
          title: "신규 서비스 출시",
          description: "인스타그램 팔로워 증가 서비스가 새롭게 출시되었습니다.",
          time: "1일 전",
        },
      ]
    }

    // 서비스 카테고리 통계
    let categoryStats = []

    if (recentOrders.length > 0) {
      try {
        // 서비스별 주문 수 계산
        const serviceCount = recentOrders.reduce((acc, item) => {
          const service = item.service || "기타"
          if (!acc[service]) {
            acc[service] = 0
          }
          acc[service] += 1
          return acc
        }, {})

        const totalOrders = Object.values(serviceCount).reduce((sum: number, count: number) => sum + count, 0)

        categoryStats = Object.entries(serviceCount).map(([service, count]) => ({
          platform: service, // platform 필드를 유지하되 서비스명 사용
          percentage: Math.round(((count as number) / totalOrders) * 100),
        }))
      } catch (error) {
        console.error("카테고리 통계 처리 중 오류 발생:", error)
      }
    }

    // 카테고리별 색상 매핑
    const platformColors = {
      인스타그램: "rose-500",
      유튜브: "blue-500",
      페이스북: "green-500",
      틱톡: "purple-500",
      트위터: "sky-500",
      기타: "gray-500",
    }

    // 인기 서비스 데이터
    let popularServices = []

    if (recentOrders.length > 0) {
      try {
        // 서비스별 주문 수 계산
        const serviceCount = recentOrders.reduce((acc, item) => {
          const service = item.service || "기타"
          if (!acc[service]) {
            acc[service] = 0
          }
          acc[service] += 1
          return acc
        }, {})

        popularServices = Object.entries(serviceCount)
          .map(([name, count]) => ({ name, count, growth: `+${Math.floor(Math.random() * 20) + 5}%` }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 4)
      } catch (error) {
        console.error("인기 서비스 데이터 처리 중 오류 발생:", error)
      }
    }

    // 예정된 이벤트 데이터 - 실제 데이터가 없으므로 빈 배열 사용
    const upcomingEvents = []

    // 디버깅 정보 출력
    console.log("최종 주문 데이터:", recentOrders.length, "건")
    console.log("최종 통계 데이터:", userStats)

    return (
      <div className="w-full p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">대시보드</h1>
          <p className="text-muted-foreground">계정 활동 및 주문 내역을 확인하세요.</p>
        </div>

        {/* 공지사항 - 상단으로 이동 */}
        <Suspense fallback={<Skeleton className="h-[120px] w-full" />}>
          <DynamicNoticeCard />
        </Suspense>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
          <div className="md:col-span-2 lg:col-span-3 space-y-6">
            {/* 통계 카드 */}
            <Suspense
              fallback={
                <div className="grid gap-6 grid-cols-3">
                  <Skeleton className="h-[100px]" />
                  <Skeleton className="h-[100px]" />
                  <Skeleton className="h-[100px]" />
                </div>
              }
            >
              <DynamicStatsCards
                balance={userStats.balance}
                totalSpent={userStats.total_spent}
                totalOrders={userStats.total_orders}
              />
            </Suspense>

            {/* 활동 그래프 */}
            <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
              <DynamicSimpleActivityChart data={activityData} />
            </Suspense>

            {/* 최근 주문 내역 */}
            <Suspense fallback={<Skeleton className="h-[250px] w-full" />}>
              <DynamicRecentOrders orders={recentOrders} />
            </Suspense>

            {/* 추가: 서비스 카테고리 통계 */}
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base">서비스 카테고리 통계</CardTitle>
                <CardDescription>카테고리별 주문 비율</CardDescription>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="space-y-3">
                  {categoryStats.length > 0 ? (
                    categoryStats.map((category, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-3 h-3 rounded-full bg-${platformColors[category.platform] || "gray-500"}`}
                            ></div>
                            <span className="text-sm font-medium">{category.platform}</span>
                          </div>
                          <span className="text-sm">{category.percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`bg-${platformColors[category.platform] || "gray-500"} h-2 rounded-full`}
                            style={{ width: `${category.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">주문 데이터가 없습니다</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 추가: 예정된 이벤트 */}
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-base">예정된 이벤트</CardTitle>
                  <CardDescription>다가오는 이벤트 및 프로모션</CardDescription>
                </div>
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="space-y-3">
                  {upcomingEvents.length > 0 ? (
                    upcomingEvents.map((event) => (
                      <div key={event.id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted">
                        <div className="flex flex-col items-center justify-center bg-rose-100 text-rose-600 rounded-md p-1 w-10 h-10">
                          <span className="text-xs">
                            {new Date(event.date).toLocaleDateString("ko-KR", { month: "short" })}
                          </span>
                          <span className="text-lg font-bold">{new Date(event.date).getDate()}</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">{event.title}</h4>
                          <p className="text-xs text-muted-foreground">{event.description}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">예정된 이벤트가 없습니다</div>
                  )}
                  <Button variant="outline" size="sm" className="w-full">
                    모든 이벤트 보기
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 오른쪽 사이드바 컨텐츠 */}
          <div className="space-y-6">
            {/* 빠른 액션 버튼 */}
            <Suspense fallback={<Skeleton className="h-[150px] w-full" />}>
              <DynamicQuickActions />
            </Suspense>

            {/* 추천 서비스 */}
            <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
              <DynamicRecommendedServices />
            </Suspense>

            {/* 추가: 알림 */}
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-base">최근 알림</CardTitle>
                  <CardDescription>최근 활동 및 알림</CardDescription>
                </div>
                <Bell className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="space-y-3">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div key={notification.id} className="border rounded-lg p-2">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm">{notification.title}</p>
                          <Badge variant="outline" className="text-xs">
                            {notification.time}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{notification.description}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">새로운 알림이 없습니다</div>
                  )}
                  <Button variant="outline" size="sm" className="w-full">
                    모든 알림 보기
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 추가: 인기 서비스 */}
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-base">인기 서비스</CardTitle>
                  <CardDescription>가장 많이 주문한 서비스</CardDescription>
                </div>
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="space-y-3">
                  {popularServices.length > 0 ? (
                    popularServices.map((service, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                            {i + 1}
                          </div>
                          <div>
                            <div className="font-medium text-sm">{service.name}</div>
                            <div className="text-xs text-muted-foreground">{service.count}건 주문</div>
                          </div>
                        </div>
                        <div className="text-sm text-green-600">{service.growth}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">주문 데이터가 없습니다</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error("대시보드 페이지 로드 중 오류 발생:", error)

    // 오류 발생 시 기본 UI 반환
    return (
      <div className="w-full p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">대시보드</h1>
          <p className="text-muted-foreground">데이터를 불러오는 중 오류가 발생했습니다.</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-md p-4 my-4">
          <p className="text-red-700">서버 연결에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.</p>
        </div>
      </div>
    )
  }
}
