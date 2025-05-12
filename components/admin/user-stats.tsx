"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowUp, ArrowDown } from "lucide-react"

export function UserStats() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    newUsersThisMonth: 0,
    activeUsersThisMonth: 0,
    userGrowth: 0,
  })
  const supabase = createClient()

  useEffect(() => {
    async function fetchUserStats() {
      try {
        setLoading(true)

        // 현재 날짜 계산
        const now = new Date()
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
        const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()

        // 총 사용자 수
        const { count: totalUsers } = await supabase.from("profiles").select("*", { count: "exact", head: true })

        // 이번 달 새 사용자 수
        const { count: newUsersThisMonth } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .gte("created_at", firstDayOfMonth)

        // 지난 달 새 사용자 수
        const { count: newUsersLastMonth } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .gte("created_at", firstDayOfLastMonth)
          .lt("created_at", firstDayOfMonth)

        // 사용자 증가율 계산
        const userGrowth = newUsersLastMonth ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100 : 0

        // 활성 사용자 수 (이번 달 로그인한 사용자)
        const { count: activeUsersThisMonth } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .gte("last_sign_in_at", firstDayOfMonth)

        setStats({
          totalUsers: totalUsers || 0,
          newUsersThisMonth: newUsersThisMonth || 0,
          activeUsersThisMonth: activeUsersThisMonth || 0,
          userGrowth,
        })
      } catch (error) {
        console.error("Error fetching user stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserStats()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm font-medium text-muted-foreground">총 사용자</p>
          <p className="text-xl font-bold">{stats.totalUsers.toLocaleString()}</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm font-medium text-muted-foreground">이번 달 신규 사용자</p>
          <p className="text-xl font-bold">{stats.newUsersThisMonth.toLocaleString()}</p>
        </div>
        <div className="flex items-center">
          {stats.userGrowth > 0 ? (
            <>
              <ArrowUp className="h-4 w-4 text-green-500" />
              <span className="text-xs text-green-500">{Math.abs(stats.userGrowth).toFixed(1)}%</span>
            </>
          ) : stats.userGrowth < 0 ? (
            <>
              <ArrowDown className="h-4 w-4 text-red-500" />
              <span className="text-xs text-red-500">{Math.abs(stats.userGrowth).toFixed(1)}%</span>
            </>
          ) : (
            <span className="text-xs text-gray-500">0%</span>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm font-medium text-muted-foreground">이번 달 활성 사용자</p>
          <p className="text-xl font-bold">{stats.activeUsersThisMonth.toLocaleString()}</p>
        </div>
        <div className="flex items-center">
          <span className="text-xs text-gray-500">
            {stats.totalUsers ? ((stats.activeUsersThisMonth / stats.totalUsers) * 100).toFixed(1) : 0}%
          </span>
        </div>
      </div>
    </div>
  )
}
