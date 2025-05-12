import { Suspense } from "react"
import { ServiceManagement } from "@/components/admin/service-management"
import { Skeleton } from "@/components/ui/skeleton"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default function ServicesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">서비스 관리</h1>
      <Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
        <ServiceManagement />
      </Suspense>
    </div>
  )
}
