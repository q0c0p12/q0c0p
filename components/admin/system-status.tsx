"use client"

import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"

export function SystemStatus() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 0,
    uptime: 0,
  })

  useEffect(() => {
    // 실제로는 서버에서 시스템 상태를 가져와야 하지만,
    // 여기서는 데모 목적으로 임의의 값을 생성합니다.
    const fetchSystemStats = () => {
      setLoading(true)

      // 임의의 시스템 상태 생성
      const mockStats = {
        cpuUsage: Math.floor(Math.random() * 60) + 10, // 10-70%
        memoryUsage: Math.floor(Math.random() * 50) + 20, // 20-70%
        diskUsage: Math.floor(Math.random() * 30) + 40, // 40-70%
        uptime: Math.floor(Math.random() * 30) + 1, // 1-30일
      }

      setStats(mockStats)
      setLoading(false)
    }

    fetchSystemStats()

    // 10초마다 업데이트
    const interval = setInterval(fetchSystemStats, 10000)

    return () => clearInterval(interval)
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
      <div>
        <div className="flex justify-between mb-1">
          <p className="text-sm font-medium">CPU 사용량</p>
          <p className="text-sm font-medium">{stats.cpuUsage}%</p>
        </div>
        <Progress value={stats.cpuUsage} className="h-2" />
      </div>

      <div>
        <div className="flex justify-between mb-1">
          <p className="text-sm font-medium">메모리 사용량</p>
          <p className="text-sm font-medium">{stats.memoryUsage}%</p>
        </div>
        <Progress value={stats.memoryUsage} className="h-2" />
      </div>

      <div>
        <div className="flex justify-between mb-1">
          <p className="text-sm font-medium">디스크 사용량</p>
          <p className="text-sm font-medium">{stats.diskUsage}%</p>
        </div>
        <Progress value={stats.diskUsage} className="h-2" />
      </div>

      <div className="pt-2">
        <p className="text-sm font-medium text-muted-foreground">시스템 가동 시간</p>
        <p className="text-xl font-bold">{stats.uptime}일</p>
      </div>
    </div>
  )
}
