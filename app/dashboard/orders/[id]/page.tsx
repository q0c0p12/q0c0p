import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { OrderDetails } from "@/components/dashboard/order-details"
import { OrderTimeline } from "@/components/dashboard/order-timeline"
import { OrderActions } from "@/components/dashboard/order-actions"
import { isAdmin } from "@/lib/auth-utils"

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const adminClient = createAdminClient()
  const orderId = params.id

  // 관리자 여부 확인
  const adminUser = await isAdmin()

  // 현재 로그인한 사용자 정보 가져오기
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const userId = session?.user?.id

  if (!userId) {
    return notFound()
  }

  // 주문 정보 가져오기
  const { data: order, error } = await supabase.from("orders").select("*").eq("id", orderId).single()

  if (error || !order) {
    console.error("주문 조회 오류:", error)
    return notFound()
  }

  // 관리자가 아니고 자신의 주문이 아닌 경우 접근 불가
  if (!adminUser && order.user_id !== userId) {
    return notFound()
  }

  // 주문 항목 정보 가져오기
  const { data: orderItems, error: orderItemsError } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderId)

  if (orderItemsError) {
    console.error("주문 항목 조회 오류:", orderItemsError)
  }

  // 주문 항목에서 서비스 ID 추출
  const serviceIds = orderItems?.map((item) => item.service_id).filter(Boolean) || []

  // 서비스 정보 가져오기 (관리자 권한으로)
  let services = []
  if (serviceIds.length > 0) {
    const { data: servicesData, error: servicesError } = await adminClient
      .from("services")
      .select("*")
      .in("id", serviceIds)

    if (servicesError) {
      console.error("서비스 정보 조회 오류:", servicesError)
    } else {
      services = servicesData || []
    }
  }

  // 패키지 ID 추출
  const packageIds = orderItems?.map((item) => item.package_id).filter(Boolean) || []

  // 패키지 정보 가져오기 (관리자 권한으로)
  let packages = []
  if (packageIds.length > 0) {
    const { data: packagesData, error: packagesError } = await adminClient
      .from("service_packages")
      .select("*")
      .in("id", packageIds)

    if (packagesError) {
      console.error("패키지 정보 조회 오류:", packagesError)
    } else {
      packages = packagesData || []
    }
  }

  // 서비스 및 패키지 정보를 ID를 키로 하는 맵으로 변환
  const serviceMap = services.reduce((acc, service) => {
    acc[service.id] = service
    return acc
  }, {})

  const packageMap = packages.reduce((acc, pkg) => {
    acc[pkg.id] = pkg
    return acc
  }, {})

  // 주문 항목에 서비스 및 패키지 정보 추가
  const processedOrderItems = (orderItems || []).map((item) => {
    const serviceInfo = serviceMap[item.service_id] || {}
    const packageInfo = packageMap[item.package_id] || {}

    return {
      ...item,
      service: serviceInfo,
      service_title: serviceInfo.title || item.service_title || "서비스 정보 없음",
      package: packageInfo,
      package_name: packageInfo.name || item.package_name || "패키지 정보 없음",
    }
  })

  // 주문 데이터 처리 - 주문 항목 정보 추가
  const processedOrder = {
    ...order,
    orderItems: processedOrderItems,
  }

  // 디버깅 정보 출력
  console.log("서비스 IDs:", serviceIds)
  console.log("서비스 맵:", serviceMap)
  console.log("패키지 IDs:", packageIds)
  console.log("패키지 맵:", packageMap)
  console.log("처리된 주문 항목:", processedOrderItems)

  return (
    <div className="w-full p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">주문 상세</h1>
        <p className="text-muted-foreground">주문 #{orderId}에 대한 상세 정보입니다.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>주문 정보</CardTitle>
              <CardDescription>주문에 대한 상세 정보입니다</CardDescription>
            </CardHeader>
            <CardContent>
              <OrderDetails order={processedOrder} isAdmin={adminUser} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>주문 타임라인</CardTitle>
              <CardDescription>주문 상태 변경 내역</CardDescription>
            </CardHeader>
            <CardContent>
              <OrderTimeline order={processedOrder} />
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>주문 작업</CardTitle>
              <CardDescription>주문에 대한 작업을 수행하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <OrderActions order={processedOrder} isAdmin={adminUser} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
