import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { DynamicProfileForm, DynamicSecurityForm } from "@/lib/dynamic-imports"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, User, Shield, Bell, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default async function ProfilePage() {
  const supabase = createClient()

  // 사용자 세션 가져오기
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // 사용자 프로필 정보 가져오기
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session?.user.id).single()

  // 계정 활동 데이터
  const accountActivity = [
    { action: "로그인", device: "Windows PC", location: "서울, 대한민국", time: "2025-05-05 14:32:45" },
    { action: "비밀번호 변경", device: "iPhone", location: "서울, 대한민국", time: "2025-05-01 10:15:22" },
    { action: "로그인", device: "Android Phone", location: "부산, 대한민국", time: "2025-04-28 18:45:12" },
  ]

  return (
    <div className="w-full p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">내 정보</h1>
        <p className="text-muted-foreground">계정 정보를 관리하고 보안 설정을 변경하세요.</p>
      </div>

      {/* 공지사항 */}
      <Card className="border-yellow-200 bg-yellow-50 w-full overflow-hidden mb-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
          <div className="space-y-0.5">
            <CardTitle className="text-sm font-medium">보안 알림</CardTitle>
            <CardDescription>중요 안내</CardDescription>
          </div>
          <AlertCircle className="h-5 w-5 text-yellow-600" />
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <div className="space-y-1">
            <p className="text-sm font-medium">정기 비밀번호 변경 안내</p>
            <p className="text-sm text-muted-foreground">
              계정 보안을 위해 3개월마다 비밀번호를 변경하는 것이 좋습니다. 마지막 변경일: 2025-05-01
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <div className="md:col-span-2 lg:col-span-3 space-y-6">
          {/* 계정 요약 */}
          <div className="grid grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
                <div className="space-y-0.5">
                  <CardTitle className="text-sm font-medium">계정 상태</CardTitle>
                  <CardDescription>현재 계정 상태</CardDescription>
                </div>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-500">활성</Badge>
                  <span className="text-sm">정상 이용 중</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
                <div className="space-y-0.5">
                  <CardTitle className="text-sm font-medium">보안 수준</CardTitle>
                  <CardDescription>계정 보안 상태</CardDescription>
                </div>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <div className="flex items-center gap-2">
                  <Badge className="bg-yellow-500">보통</Badge>
                  <span className="text-sm">2단계 인증 권장</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
                <div className="space-y-0.5">
                  <CardTitle className="text-sm font-medium">가입일</CardTitle>
                  <CardDescription>계정 생성일</CardDescription>
                </div>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <div className="text-sm">2025년 1월 15일</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="profile">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">프로필</TabsTrigger>
              <TabsTrigger value="security">보안</TabsTrigger>
            </TabsList>
            <TabsContent value="profile" className="space-y-4 pt-4">
              <Suspense fallback={<Skeleton className="h-[500px] w-full" />}>
                <DynamicProfileForm user={profile || session?.user} />
              </Suspense>
            </TabsContent>
            <TabsContent value="security" className="space-y-4 pt-4">
              <Suspense fallback={<Skeleton className="h-[500px] w-full" />}>
                <DynamicSecurityForm />
              </Suspense>
            </TabsContent>
          </Tabs>
        </div>

        {/* 오른쪽 사이드바 컨텐츠 */}
        <div className="space-y-6">
          {/* 알림 설정 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
              <div>
                <CardTitle className="text-base">알림 설정</CardTitle>
                <CardDescription>알림 수신 설정</CardDescription>
              </div>
              <Bell className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">이메일 알림</p>
                    <p className="text-xs text-muted-foreground">주문 상태 및 중요 알림</p>
                  </div>
                  <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-green-500 transition-colors">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6"></span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">SMS 알림</p>
                    <p className="text-xs text-muted-foreground">긴급 알림 및 보안 코드</p>
                  </div>
                  <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-green-500 transition-colors">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6"></span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">마케팅 알림</p>
                    <p className="text-xs text-muted-foreground">프로모션 및 이벤트 정보</p>
                  </div>
                  <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1"></span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 계정 활동 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
              <div>
                <CardTitle className="text-base">계정 활동</CardTitle>
                <CardDescription>최근 계정 활동 내역</CardDescription>
              </div>
              <Clock className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="space-y-3">
                {accountActivity.map((activity, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{activity.action}</p>
                      <Badge variant="outline" className="text-xs">
                        {activity.device}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{activity.location}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 연결된 계정 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
              <div>
                <CardTitle className="text-base">연결된 계정</CardTitle>
                <CardDescription>소셜 계정 연동 상태</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                      f
                    </div>
                    <span className="text-sm">Facebook</span>
                  </div>
                  <Badge variant="outline">연결됨</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center text-white font-bold">
                      t
                    </div>
                    <span className="text-sm">Twitter</span>
                  </div>
                  <Badge variant="outline" className="bg-gray-100">
                    연결 안됨
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white font-bold">
                      g
                    </div>
                    <span className="text-sm">Google</span>
                  </div>
                  <Badge variant="outline">연결됨</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
