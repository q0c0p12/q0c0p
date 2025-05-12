import { createClient } from "@/lib/supabase/server"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { ko } from "date-fns/locale"
import { Bell, CheckCircle, AlertCircle, CreditCard, Clock } from "lucide-react"

// 알림 타입 정의
type NotificationType = "system" | "payment" | "order" | "balance"

interface Notification {
  id: string
  user_id: string
  title: string
  content: string
  type: NotificationType
  is_read: boolean
  created_at: string
}

// 알림 아이콘 컴포넌트
function NotificationIcon({ type }: { type: NotificationType }) {
  switch (type) {
    case "system":
      return <Bell className="h-5 w-5 text-blue-500" />
    case "payment":
      return <CreditCard className="h-5 w-5 text-green-500" />
    case "order":
      return <CheckCircle className="h-5 w-5 text-purple-500" />
    case "balance":
      return <Clock className="h-5 w-5 text-orange-500" />
    default:
      return <AlertCircle className="h-5 w-5 text-gray-500" />
  }
}

// 알림 타입에 따른 배지 컴포넌트
function NotificationBadge({ type }: { type: NotificationType }) {
  switch (type) {
    case "system":
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          시스템
        </Badge>
      )
    case "payment":
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          결제
        </Badge>
      )
    case "order":
      return (
        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
          주문
        </Badge>
      )
    case "balance":
      return (
        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
          잔액
        </Badge>
      )
    default:
      return <Badge variant="outline">기타</Badge>
  }
}

// 알림 목록 컴포넌트
async function NotificationsList() {
  const supabase = createClient()

  // 세션 확인
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">로그인이 필요합니다.</p>
        </CardContent>
      </Card>
    )
  }

  // 사용자의 알림 목록 가져오기
  const { data: notifications, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching notifications:", error)
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-red-500">알림을 불러오는 중 오류가 발생했습니다.</p>
        </CardContent>
      </Card>
    )
  }

  if (!notifications || notifications.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">새로운 알림이 없습니다.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification: Notification) => (
        <Card key={notification.id} className={notification.is_read ? "border-gray-200" : "border-blue-300 bg-blue-50"}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <NotificationIcon type={notification.type} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium">{notification.title}</h3>
                  <NotificationBadge type={notification.type} />
                </div>
                <p className="text-sm text-gray-600 mb-2">{notification.content}</p>
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: ko })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// 스켈레톤 로딩 컴포넌트
function NotificationsLoading() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Skeleton className="h-6 w-6 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function NotificationsPage() {
  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">알림</h1>
        <p className="text-muted-foreground">시스템 알림 및 주문 관련 알림을 확인하세요.</p>
      </div>

      <Suspense fallback={<NotificationsLoading />}>
        <NotificationsList />
      </Suspense>
    </div>
  )
}
