import { createAdminClient } from "@/lib/supabase/admin"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Clock, CheckCircle, XCircle, AlertTriangle, Mail, RotateCcw } from "lucide-react"
import Link from "next/link"
import { updateOrderStatus } from "./actions"

// 주문 상태에 따른 배지 색상
const statusColors: Record<string, string> = {
  pending: "bg-yellow-500",
  processing: "bg-blue-500",
  completed: "bg-green-500",
  cancelled: "bg-red-500",
  refunded: "bg-purple-500",
  partial_refund: "bg-orange-500",
}

// 주문 상태 한글 표시
const statusLabels: Record<string, string> = {
  pending: "대기중",
  processing: "처리중",
  completed: "완료",
  cancelled: "취소됨",
  refunded: "환불됨",
  partial_refund: "부분환불",
}

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const supabase = createAdminClient()
  const orderId = params.id

  // 주문 정보 가져오기
  const { data: order, error } = await supabase.from("orders").select("*").eq("id", orderId).single()

  if (error || !order) {
    console.error("주문 조회 오류:", error)
    notFound()
  }

  // 주문 항목 정보 가져오기
  const { data: orderItems, error: orderItemsError } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderId)

  if (orderItemsError) {
    console.error("주문 항목 조회 오류:", orderItemsError)
  }

  // 첫 번째 주문 항목에서 서비스 ID 가져오기
  const firstOrderItem = orderItems && orderItems.length > 0 ? orderItems[0] : null
  const serviceId = firstOrderItem?.service_id

  // 사용자 프로필 정보 가져오기
  const { data: userProfile, error: userError } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, points, created_at")
    .eq("id", order.user_id)
    .single()

  if (userError) {
    console.error("사용자 프로필 정보 조회 오류:", userError)
  }

  // 사용자 이메일 정보 가져오기
  let userEmail = null
  try {
    const { data: authUser, error: authUserError } = await supabase.auth.admin.getUserById(order.user_id)

    if (authUserError) {
      console.error("사용자 인증 정보 조회 오류:", authUserError)
    } else if (authUser) {
      userEmail = authUser.user.email
    }
  } catch (error) {
    console.error("사용자 인증 정보 조회 중 오류 발생:", error)
  }

  // 서비스 정보 가져오기
  let serviceDetail = null
  if (serviceId) {
    const { data: service, error: serviceError } = await supabase
      .from("services")
      .select("id, title, description, base_price, category_id")
      .eq("id", serviceId)
      .single()

    if (serviceError) {
      console.error("서비스 정보 조회 오류:", serviceError)
    } else {
      serviceDetail = service
    }
  }

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    if (!dateString) return "날짜 없음"
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  // 금액 포맷팅
  const formatCurrency = (amount: number) => {
    if (amount === undefined || amount === null) return "금액 없음"
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(amount)
  }

  // 주문 상태에 따른 아이콘
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "processing":
        return <Clock className="h-5 w-5 text-blue-500" />
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "refunded":
        return <AlertTriangle className="h-5 w-5 text-purple-500" />
      case "partial_refund":
        return <RotateCcw className="h-5 w-5 text-orange-500" />
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />
    }
  }

  return (
    <div className="w-full p-6">
      <div className="flex items-center mb-6">
        <Button variant="outline" size="sm" asChild className="mr-4">
          <Link href="/admin/orders">
            <ArrowLeft className="h-4 w-4 mr-2" />
            주문 목록으로
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">주문 상세 정보</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* 주문 상세 정보 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>주문 #{order.id}</CardTitle>
                <CardDescription>주문 상세 정보</CardDescription>
              </div>
              <Badge className={statusColors[order.status] || "bg-gray-500"}>
                {statusLabels[order.status] || order.status}
              </Badge>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="details">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="details">기본 정보</TabsTrigger>
                  <TabsTrigger value="timeline">타임라인</TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">주문 ID</p>
                      <p>{order.id}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">주문 상태</p>
                      <div className="flex items-center">
                        {getStatusIcon(order.status)}
                        <span className="ml-2">{statusLabels[order.status] || order.status}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">주문 날짜</p>
                      <p>{formatDate(order.created_at)}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">최종 업데이트</p>
                      <p>{formatDate(order.updated_at)}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">서비스</p>
                      <p>
                        {serviceDetail ? (
                          <span className="font-medium">{serviceDetail.title}</span>
                        ) : (
                          <span className="text-muted-foreground">서비스 정보 없음</span>
                        )}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">금액</p>
                      <p className="font-semibold">{formatCurrency(order.total_amount)}</p>
                    </div>
                    {order.refunded_quantity > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">환불 수량</p>
                        <p>{order.refunded_quantity}개</p>
                      </div>
                    )}
                    {order.refunded_amount > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">환불 금액</p>
                        <p>{formatCurrency(order.refunded_amount)}</p>
                      </div>
                    )}
                  </div>

                  {serviceDetail && (
                    <div className="space-y-2 pt-2 border-t mt-4">
                      <p className="text-sm font-medium">서비스 정보</p>
                      <div className="rounded-md border p-3 text-sm">
                        <p className="font-medium">{serviceDetail.title}</p>
                        <p className="text-muted-foreground mt-1">{serviceDetail.description || "설명 없음"}</p>
                        <p className="mt-2">기본 가격: {formatCurrency(serviceDetail.base_price)}</p>
                      </div>
                    </div>
                  )}

                  {orderItems && orderItems.length > 0 && (
                    <div className="space-y-2 pt-2 border-t mt-4">
                      <p className="text-sm font-medium">주문 항목</p>
                      <div className="rounded-md border overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                항목 ID
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                수량
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                가격
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                상태
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {orderItems.map((item) => (
                              <tr key={item.id}>
                                <td className="px-3 py-2 whitespace-nowrap text-sm">{item.id}</td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm">{item.quantity || 1}</td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm">
                                  {formatCurrency(item.price || 0)}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm">
                                  <Badge className={statusColors[item.status] || "bg-gray-500"}>
                                    {statusLabels[item.status] || item.status || "대기중"}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {firstOrderItem?.requirements && (
                    <div className="space-y-2 pt-2">
                      <p className="text-sm font-medium">요구사항</p>
                      <div className="rounded-md border p-3 text-sm">{firstOrderItem.requirements}</div>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="timeline" className="pt-4">
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="mr-4 mt-1">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100">
                          <Clock className="h-4 w-4 text-blue-600" />
                        </div>
                      </div>
                      <div>
                        <p className="font-medium">주문 생성</p>
                        <p className="text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
                        <p className="text-sm mt-1">주문이 생성되었습니다.</p>
                      </div>
                    </div>

                    {order.updated_at && order.updated_at !== order.created_at && (
                      <div className="flex items-start">
                        <div className="mr-4 mt-1">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </div>
                        </div>
                        <div>
                          <p className="font-medium">주문 상태 업데이트</p>
                          <p className="text-sm text-muted-foreground">{formatDate(order.updated_at)}</p>
                          <p className="text-sm mt-1">주문 상태가 {statusLabels[order.status]}(으)로 변경되었습니다.</p>
                        </div>
                      </div>
                    )}

                    {order.refunded_quantity > 0 && (
                      <div className="flex items-start">
                        <div className="mr-4 mt-1">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100">
                            <RotateCcw className="h-4 w-4 text-orange-600" />
                          </div>
                        </div>
                        <div>
                          <p className="font-medium">부분 환불 처리</p>
                          <p className="text-sm text-muted-foreground">{formatDate(order.updated_at)}</p>
                          <p className="text-sm mt-1">
                            {order.refunded_quantity}개에 대한 부분 환불이 처리되었습니다. (
                            {formatCurrency(order.refunded_amount || 0)})
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* 사용자 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>사용자 정보</CardTitle>
              <CardDescription>주문한 사용자에 대한 정보입니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                  {userProfile?.avatar_url ? (
                    <img
                      src={userProfile.avatar_url || "/placeholder.svg"}
                      alt="프로필 이미지"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      <Mail className="h-6 w-6" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium">{userEmail || userProfile?.full_name || "사용자 " + order.user_id}</p>
                  <p className="text-sm text-muted-foreground">ID: {order.user_id}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <p className="text-sm">현재 포인트</p>
                  <p className="font-medium">{userProfile?.points?.toLocaleString() || 0} P</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm">주문 건수</p>
                  <p className="font-medium">1건</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm">가입일</p>
                  <p className="font-medium">
                    {userProfile?.created_at ? formatDate(userProfile.created_at) : "알 수 없음"}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href={`/admin/users?search=${order.user_id}`}>사용자 관리로 이동</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 주문 액션 */}
          <Card>
            <CardHeader>
              <CardTitle>주문 액션</CardTitle>
              <CardDescription>주문에 대한 액션을 수행합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.status !== "completed" && (
                <form
                  action={async () => {
                    "use server"
                    await updateOrderStatus(order.id.toString(), "completed")
                  }}
                >
                  <Button className="w-full bg-green-600 hover:bg-green-700" type="submit">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    완료 처리
                  </Button>
                </form>
              )}

              {order.status !== "processing" && order.status !== "completed" && (
                <form
                  action={async () => {
                    "use server"
                    await updateOrderStatus(order.id.toString(), "processing")
                  }}
                >
                  <Button className="w-full bg-blue-600 hover:bg-blue-700" type="submit">
                    <Clock className="mr-2 h-4 w-4" />
                    처리중으로 변경
                  </Button>
                </form>
              )}

              {order.status !== "cancelled" && (
                <form
                  action={async () => {
                    "use server"
                    await updateOrderStatus(order.id.toString(), "cancelled")
                  }}
                >
                  <Button variant="destructive" className="w-full" type="submit">
                    <XCircle className="mr-2 h-4 w-4" />
                    취소 처리
                  </Button>
                </form>
              )}

              {/* 부분 환불 버튼 추가 - 취소되거나 환불된 주문이 아닌 경우 표시 */}
              {order.status !== "cancelled" && order.status !== "refunded" && (
                <Link href={`/admin/orders/${order.id}/partial-refund`} passHref>
                  <Button className="w-full bg-orange-600 hover:bg-orange-700" asChild>
                    <span>
                      <RotateCcw className="mr-2 h-4 w-4" />
                      부분 환불
                    </span>
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
