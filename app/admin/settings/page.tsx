import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminGeneralSettings } from "@/components/admin/general-settings"
import { AdminServiceSettings } from "@/components/admin/service-settings"
import { AdminUserManagement } from "@/components/admin/user-management"

export default function AdminSettingsPage() {
  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">시스템 설정</h1>
        <p className="text-muted-foreground">시스템 설정을 관리하고 구성하세요.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>설정</CardTitle>
          <CardDescription>시스템 설정을 관리합니다</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general">
            <TabsList className="mb-4">
              <TabsTrigger value="general">일반 설정</TabsTrigger>
              <TabsTrigger value="services">서비스 관리</TabsTrigger>
              <TabsTrigger value="users">사용자 관리</TabsTrigger>
            </TabsList>
            <TabsContent value="general">
              <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                <AdminGeneralSettings />
              </Suspense>
            </TabsContent>
            <TabsContent value="services">
              <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                <AdminServiceSettings />
              </Suspense>
            </TabsContent>
            <TabsContent value="users">
              <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                <AdminUserManagement />
              </Suspense>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
