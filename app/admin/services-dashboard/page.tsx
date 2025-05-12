import { Suspense } from "react"
import { ServicesDashboard } from "@/components/admin/services-dashboard"
import { Skeleton } from "@/components/ui/skeleton"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default function ServicesDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">서비스 대시보드</h1>
      </div>
      <p className="text-muted-foreground">
        등록된 모든 서비스 목록입니다. 각 서비스의 기본 정보를 확인하고 관리할 수 있습니다.
      </p>

      <Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
        <ServicesDashboard />
      </Suspense>
    </div>
  )
}
