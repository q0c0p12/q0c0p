import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, CreditCard, ShoppingBag } from "lucide-react"

interface StatsCardsProps {
  balance: number
  totalSpent: number
  totalOrders: number
}

export function StatsCards({ balance, totalSpent, totalOrders }: StatsCardsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
      <Card className="w-full overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium">현재 보유 잔액</CardTitle>
            <CardDescription>사용 가능한 잔액입니다</CardDescription>
          </div>
          <Wallet className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{balance.toLocaleString()}원</div>
          {balance > 0 ? (
            <p className="text-xs text-muted-foreground mt-1">충전 가능한 포인트입니다</p>
          ) : (
            <p className="text-xs text-muted-foreground mt-1">포인트를 충전하여 서비스를 이용해보세요</p>
          )}
        </CardContent>
      </Card>

      <Card className="w-full overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium">총 사용 잔액</CardTitle>
            <CardDescription>환불 제외 실제 사용 금액</CardDescription>
          </div>
          <CreditCard className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalSpent.toLocaleString()}원</div>
          {totalSpent > 0 ? (
            <p className="text-xs text-muted-foreground mt-1">환불 및 취소된 주문 제외 금액</p>
          ) : (
            <p className="text-xs text-muted-foreground mt-1">아직 사용한 내역이 없습니다</p>
          )}
        </CardContent>
      </Card>

      <Card className="w-full overflow-hidden sm:col-span-2 lg:col-span-1 xl:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium">총 주문 건수</CardTitle>
            <CardDescription>지금까지 주문한 총 건수입니다</CardDescription>
          </div>
          <ShoppingBag className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalOrders}건</div>
          {totalOrders > 0 ? (
            <p className="text-xs text-muted-foreground mt-1">지금까지 주문한 총 건수입니다</p>
          ) : (
            <p className="text-xs text-muted-foreground mt-1">아직 주문한 내역이 없습니다</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
