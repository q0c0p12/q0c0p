import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { CategoryManagement } from "@/components/admin/category-management"

export default function CategoriesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">카테고리 관리</h1>
        <p className="text-muted-foreground">서비스 카테고리를 관리합니다.</p>
      </div>

      <Suspense fallback={<Skeleton className="h-[500px] w-full" />}>
        <CategoryManagement />
      </Suspense>
    </div>
  )
}
