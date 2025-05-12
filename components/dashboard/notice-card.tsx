import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

export function NoticeCard() {
  return (
    <Card className="border-yellow-200 bg-yellow-50 w-full overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
        <div className="space-y-0.5">
          <CardTitle className="text-sm font-medium">공지사항</CardTitle>
          <CardDescription>중요 안내</CardDescription>
        </div>
        <AlertCircle className="h-5 w-5 text-yellow-600" />
      </CardHeader>
      <CardContent className="py-1">
        <div className="space-y-1">
          <p className="text-sm font-medium">시스템 점검 안내</p>
          <p className="text-sm text-muted-foreground">
            2025년 5월 10일 오전 2시부터 4시까지 시스템 점검이 예정되어 있습니다. 해당 시간 동안에는 Q0c0P 서비스 이용이
            제한될 수 있습니다.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
