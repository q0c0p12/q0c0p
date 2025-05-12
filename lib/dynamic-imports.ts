import dynamic from "next/dynamic"

// 대시보드 컴포넌트 동적 임포트
export const DynamicBalanceCard = dynamic(
  () => import("@/components/dashboard/balance-card").then((mod) => ({ default: mod.BalanceCard })),
  {
    loading: () => <div className="h-[180px] rounded-lg border bg-card text-card-foreground shadow-sm animate-pulse" />,
  },
)

export const DynamicNoticeCard = dynamic(
  () => import("@/components/dashboard/notice-card").then((mod) => ({ default: mod.NoticeCard })),
  {
    loading: () => <div className="h-[180px] rounded-lg border bg-card text-card-foreground shadow-sm animate-pulse" />,
  },
)

export const DynamicOrderForm = dynamic(
  () => import("@/components/dashboard/order-form").then((mod) => ({ default: mod.OrderForm })),
  {
    loading: () => <div className="h-[400px] rounded-lg border bg-card text-card-foreground shadow-sm animate-pulse" />,
  },
)

export const DynamicRecentOrders = dynamic(
  () => import("@/components/dashboard/recent-orders").then((mod) => ({ default: mod.RecentOrders })),
  {
    loading: () => <div className="h-[300px] rounded-lg border bg-card text-card-foreground shadow-sm animate-pulse" />,
  },
)

// 새로운 통계 및 그래프 컴포넌트
export const DynamicStatsCards = dynamic(
  () => import("@/components/dashboard/stats-cards").then((mod) => ({ default: mod.StatsCards })),
  {
    loading: () => (
      <div className="grid gap-4 md:grid-cols-3">
        <div className="h-[120px] rounded-lg border bg-card text-card-foreground shadow-sm animate-pulse" />
        <div className="h-[120px] rounded-lg border bg-card text-card-foreground shadow-sm animate-pulse" />
        <div className="h-[120px] rounded-lg border bg-card text-card-foreground shadow-sm animate-pulse" />
      </div>
    ),
  },
)

export const DynamicSimpleActivityChart = dynamic(
  () => import("@/components/dashboard/simple-activity-chart").then((mod) => ({ default: mod.SimpleActivityChart })),
  {
    loading: () => <div className="h-[350px] rounded-lg border bg-card text-card-foreground shadow-sm animate-pulse" />,
  },
)

// 새로 추가된 컴포넌트
export const DynamicQuickActions = dynamic(
  () => import("@/components/dashboard/quick-actions").then((mod) => ({ default: mod.QuickActions })),
  {
    loading: () => <div className="h-[180px] rounded-lg border bg-card text-card-foreground shadow-sm animate-pulse" />,
  },
)

export const DynamicRecommendedServices = dynamic(
  () => import("@/components/dashboard/recommended-services").then((mod) => ({ default: mod.RecommendedServices })),
  {
    loading: () => <div className="h-[400px] rounded-lg border bg-card text-card-foreground shadow-sm animate-pulse" />,
  },
)

// 프로필 관련 컴포넌트 동적 임포트
export const DynamicProfileForm = dynamic(
  () => import("@/components/dashboard/profile-form").then((mod) => ({ default: mod.ProfileForm })),
  {
    loading: () => <div className="h-[500px] rounded-lg border bg-card text-card-foreground shadow-sm animate-pulse" />,
  },
)

export const DynamicSecurityForm = dynamic(
  () => import("@/components/dashboard/security-form").then((mod) => ({ default: mod.SecurityForm })),
  {
    loading: () => <div className="h-[500px] rounded-lg border bg-card text-card-foreground shadow-sm animate-pulse" />,
  },
)

// 헤더와 사이드바는 중요한 UI 요소이므로 사전 로드
export const DynamicDashboardHeader = dynamic(
  () => import("@/components/dashboard/header").then((mod) => ({ default: mod.DashboardHeader })),
  {
    ssr: true,
  },
)

export const DynamicDashboardSidebar = dynamic(
  () => import("@/components/dashboard/sidebar").then((mod) => ({ default: mod.DashboardSidebar })),
  {
    ssr: true,
  },
)
