"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range"
import { Search, X } from "lucide-react"

interface Service {
  id: number
  title: string
}

interface AdminOrderFiltersProps {
  services: Service[]
}

export function AdminOrderFilters({ services }: AdminOrderFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [status, setStatus] = useState(searchParams.get("status") || "")
  const [service, setService] = useState(searchParams.get("service") || "")
  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({
    from: searchParams.get("dateFrom") ? new Date(searchParams.get("dateFrom") as string) : undefined,
    to: searchParams.get("dateTo") ? new Date(searchParams.get("dateTo") as string) : undefined,
  })

  // 필터 적용
  const applyFilters = () => {
    const params = new URLSearchParams()

    if (status) params.set("status", status)
    if (service) params.set("service", service)
    if (search) params.set("search", search)

    if (dateRange.from && dateRange.to) {
      const from = dateRange.from.toISOString().split("T")[0]
      const to = dateRange.to.toISOString().split("T")[0]
      params.set("dateRange", `${from}:${to}`)
    }

    router.push(`/admin/orders?${params.toString()}`)
  }

  // 필터 초기화
  const resetFilters = () => {
    setStatus("")
    setService("")
    setSearch("")
    setDateRange({ from: undefined, to: undefined })
    router.push("/admin/orders")
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">주문 상태</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger id="status">
              <SelectValue placeholder="모든 상태" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모든 상태</SelectItem>
              <SelectItem value="pending">대기중</SelectItem>
              <SelectItem value="processing">진행중</SelectItem>
              <SelectItem value="completed">완료</SelectItem>
              <SelectItem value="cancelled">취소</SelectItem>
              <SelectItem value="refunded">환불</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="service">서비스</Label>
          <Select value={service} onValueChange={setService}>
            <SelectTrigger id="service">
              <SelectValue placeholder="모든 서비스" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모든 서비스</SelectItem>
              {services.map((service) => (
                <SelectItem key={service.id} value={String(service.id)}>
                  {service.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>날짜 범위</Label>
          <DatePickerWithRange date={dateRange} setDate={setDateRange} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="search">검색</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="주문번호 또는 이메일"
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={resetFilters}>
          <X className="mr-2 h-4 w-4" />
          필터 초기화
        </Button>
        <Button onClick={applyFilters}>필터 적용</Button>
      </div>
    </div>
  )
}
