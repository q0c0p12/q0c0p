import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Clock, AlertCircle } from "lucide-react"

interface OrderTimelineProps {
  order: any
}

export function OrderTimeline({ order }: OrderTimelineProps) {
  // 주문 날짜 가져오기 (없으면 현재 시간 사용)
  const orderDate = order.created_at ? new Date(order.created_at) : new Date()

  // 주문 처리 단계
  const timeline = [
    {
      status: "주문 접수",
      date: orderDate,
      completed: true,
      description: "주문이 성공적으로 접수되었습니다.",
    },
    {
      status: "결제 완료",
      date: new Date(orderDate.getTime() + 1000 * 60 * 5), // 5분 후
      completed: true,
      description: "결제가 완료되었습니다.",
    },
    {
      status: "처리 중",
      date: new Date(orderDate.getTime() + 1000 * 60 * 30), // 30분 후
      completed: order.status !== "pending",
      description: "주문이 처리 중입니다.",
    },
    {
      status: "완료",
      date: new Date(orderDate.getTime() + 1000 * 60 * 60 * 2), // 2시간 후
      completed: order.status === "completed",
      description: order.status === "completed" ? "주문이 성공적으로 완료되었습니다." : "처리 대기 중입니다.",
    },
  ]

  // 상태에 따른 아이콘
  const getStatusIcon = (completed: boolean, isLast: boolean) => {
    if (completed) {
      return <CheckCircle className="h-5 w-5 text-green-500" />
    } else if (isLast && order.status === "failed") {
      return <AlertCircle className="h-5 w-5 text-red-500" />
    } else {
      return <Clock className="h-5 w-5 text-yellow-500" />
    }
  }

  return (
    <Card>
      <CardHeader className="px-3 sm:px-6 py-3 sm:py-4">
        <CardTitle>주문 처리 현황</CardTitle>
        <CardDescription>주문 처리 단계별 진행 상황입니다</CardDescription>
      </CardHeader>
      <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
        <div className="relative">
          {/* 타임라인 선 */}
          <div className="absolute left-[15px] sm:left-[19px] top-0 bottom-0 w-[2px] bg-gray-100"></div>

          <div className="space-y-6">
            {timeline.map((item, index) => (
              <div key={index} className="relative pl-9 sm:pl-12">
                <div className="absolute left-0 top-0 flex items-center justify-center bg-white">
                  {getStatusIcon(item.completed, index === timeline.length - 1)}
                </div>
                <div className="space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <h4 className="text-sm font-medium">{item.status}</h4>
                    <time className="text-xs text-muted-foreground">{item.date.toLocaleString()}</time>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
