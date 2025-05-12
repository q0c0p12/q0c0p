import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wallet } from "lucide-react"

interface BalanceCardProps {
  balance: number
}

export function BalanceCard({ balance }: BalanceCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-sm font-medium">현재 보유 잔액</CardTitle>
          <CardDescription>사용 가능한 잔액입니다</CardDescription>
        </div>
        <Wallet className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{balance.toLocaleString()}원</div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full bg-rose-600 hover:bg-rose-700">
          <Link href="/dashboard/balance">충전하기</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
