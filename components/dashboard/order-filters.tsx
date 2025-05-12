"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter, X, CalendarIcon, Search, SlidersHorizontal } from "lucide-react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface Service {
  id: string | number
  title?: string
}

interface OrderFiltersProps {
  isAdmin?: boolean
  services?: Service[]
}

export function OrderFilters({ isAdmin = false, services = [] }: OrderFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // 안전하게 파라미터 가져오기
  const getParam = (name: string): string => {
    const value = searchParams.get(name)
    return value !== null ? value : ""
  }

  // 현재 URL의 검색 파라미터 가져오기
  const status = getParam("status")
  const platform = getParam("platform")
  const minAmount = getParam("minAmount")
  const maxAmount = getParam("maxAmount")
  const fromDate = getParam("fromDate")
  const toDate = getParam("toDate")
  const search = getParam("search")

  // 상태 관리
  const [searchValue, setSearchValue] = useState(search)
  const [statusFilter, setStatusFilter] = useState(status)
  const [platformFilter, setPlatformFilter] = useState(platform)
  const [minAmountFilter, setMinAmountFilter] = useState(minAmount)
  const [maxAmountFilter, setMaxAmountFilter] = useState(maxAmount)
  const [fromDateFilter, setFromDateFilter] = useState<Date | undefined>(fromDate ? new Date(fromDate) : undefined)
  const [toDateFilter, setToDateFilter] = useState<Date | undefined>(toDate ? new Date(toDate) : undefined)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  // 활성화된 필터 개수 계산
  const activeFilterCount = [
    statusFilter,
    platformFilter,
    minAmountFilter,
    maxAmountFilter,
    fromDateFilter,
    toDateFilter,
  ].filter(Boolean).length

  // 필터 적용 함수
  const applyFilters = () => {
    const params = new URLSearchParams()

    if (searchValue) params.set("search", searchValue)
    if (statusFilter && statusFilter !== "all") params.set("status", statusFilter)
    if (platformFilter && platformFilter !== "all") params.set("platform", platformFilter)
    if (minAmountFilter) params.set("minAmount", minAmountFilter)
    if (maxAmountFilter) params.set("maxAmount", maxAmountFilter)
    if (fromDateFilter) {
      params.set("fromDate", fromDateFilter.toISOString().split("T")[0])
    }
    if (toDateFilter) {
      params.set("toDate", toDateFilter.toISOString().split("T")[0])
    }

    router.push(`/dashboard/orders?${params.toString()}`)
  }

  // 필터 초기화 함수
  const resetFilters = () => {
    setSearchValue("")
    setStatusFilter("")
    setPlatformFilter("")
    setMinAmountFilter("")
    setMaxAmountFilter("")
    setFromDateFilter(undefined)
    setToDateFilter(undefined)
    router.push("/dashboard/orders")
  }

  // 검색 실행 함수
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    applyFilters()
  }

  // 단일 필터 제거 함수
  const removeFilter = (type: string) => {
    // 새 URLSearchParams 객체 생성
    const params = new URLSearchParams()

    // 현재 searchParams에서 필요한 값만 복사
    searchParams.forEach((value, key) => {
      // 제거할 필터가 아닌 경우에만 복사
      if (
        (type !== "status" || key !== "status") &&
        (type !== "platform" || key !== "platform") &&
        (type !== "amount" || (key !== "minAmount" && key !== "maxAmount")) &&
        (type !== "date" || (key !== "fromDate" && key !== "toDate"))
      ) {
        params.set(key, value)
      }
    })

    // 상태 업데이트
    switch (type) {
      case "status":
        setStatusFilter("")
        break
      case "platform":
        setPlatformFilter("")
        break
      case "amount":
        setMinAmountFilter("")
        setMaxAmountFilter("")
        break
      case "date":
        setFromDateFilter(undefined)
        setToDateFilter(undefined)
        break
    }

    router.push(`/dashboard/orders?${params.toString()}`)
  }

  // 활성화된 필터 표시
  const renderActiveFilters = () => {
    const filters = []

    if (statusFilter && statusFilter !== "all") {
      const statusLabels: Record<string, string> = {
        completed: "완료",
        pending: "처리중",
        failed: "실패",
        processing: "진행중",
        cancelled: "취소됨",
        refunded: "환불됨",
        partial_refund: "부분환불",
      }

      const statusLabel = statusLabels[statusFilter] || statusFilter

      filters.push(
        <Badge key="status" variant="outline" className="flex items-center gap-1">
          상태: {statusLabel}
          <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter("status")} />
        </Badge>,
      )
    }

    if (platformFilter && platformFilter !== "all") {
      filters.push(
        <Badge key="platform" variant="outline" className="flex items-center gap-1">
          플랫폼: {platformFilter}
          <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter("platform")} />
        </Badge>,
      )
    }

    if (minAmountFilter || maxAmountFilter) {
      const minValue = Number.parseInt(minAmountFilter) || 0
      const maxValue = Number.parseInt(maxAmountFilter) || 0

      let amountText = "금액: "
      if (minAmountFilter && maxAmountFilter) {
        amountText += `${minValue.toLocaleString()}원 ~ ${maxValue.toLocaleString()}원`
      } else if (minAmountFilter) {
        amountText += `최소 ${minValue.toLocaleString()}원`
      } else if (maxAmountFilter) {
        amountText += `최대 ${maxValue.toLocaleString()}원`
      }

      filters.push(
        <Badge key="amount" variant="outline" className="flex items-center gap-1">
          {amountText}
          <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter("amount")} />
        </Badge>,
      )
    }

    if (fromDateFilter || toDateFilter) {
      let dateText = "날짜: "

      if (fromDateFilter && toDateFilter) {
        dateText += `${format(fromDateFilter, "yyyy.MM.dd")} ~ ${format(toDateFilter, "yyyy.MM.dd")}`
      } else if (fromDateFilter) {
        dateText += `${format(fromDateFilter, "yyyy.MM.dd")} 이후`
      } else if (toDateFilter) {
        dateText += `${format(toDateFilter, "yyyy.MM.dd")} 이전`
      }

      filters.push(
        <Badge key="date" variant="outline" className="flex items-center gap-1">
          {dateText}
          <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter("date")} />
        </Badge>,
      )
    }

    return filters
  }

  // 날짜 포맷 함수 (안전하게)
  const formatDateSafe = (date: Date | undefined): string => {
    if (!date) return ""
    try {
      return format(date, "yyyy.MM.dd", { locale: ko })
    } catch (e) {
      return ""
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2 justify-between">
        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="주문번호, 서비스명 검색..."
              className="pl-8 w-full"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>
          <Button type="submit" size="sm" className="shrink-0">
            검색
          </Button>
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1 w-full sm:w-auto">
                <Filter className="h-4 w-4" />
                <span>필터</span>
                {activeFilterCount > 0 && (
                  <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] sm:w-[320px] p-4" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">필터 옵션</h4>
                  <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8 px-2 text-xs">
                    초기화
                  </Button>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="status">주문 상태</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="모든 상태" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">모든 상태</SelectItem>
                      <SelectItem value="completed">완료</SelectItem>
                      <SelectItem value="pending">처리중</SelectItem>
                      <SelectItem value="processing">진행중</SelectItem>
                      <SelectItem value="failed">실패</SelectItem>
                      <SelectItem value="cancelled">취소됨</SelectItem>
                      <SelectItem value="refunded">환불됨</SelectItem>
                      <SelectItem value="partial_refund">부분환불</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="platform">플랫폼</Label>
                  <Select value={platformFilter} onValueChange={setPlatformFilter}>
                    <SelectTrigger id="platform">
                      <SelectValue placeholder="모든 플랫폼" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">모든 플랫폼</SelectItem>
                      <SelectItem value="인스타그램">인스타그램</SelectItem>
                      <SelectItem value="유튜브">유튜브</SelectItem>
                      <SelectItem value="페이스북">페이스북</SelectItem>
                      <SelectItem value="틱톡">틱톡</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 관리자만 금액 필터 표시 */}
                {isAdmin && (
                  <div className="space-y-2">
                    <Label>금액 범위</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder="최소"
                        value={minAmountFilter}
                        onChange={(e) => setMinAmountFilter(e.target.value)}
                        className="w-full"
                      />
                      <span>~</span>
                      <Input
                        type="number"
                        placeholder="최대"
                        value={maxAmountFilter}
                        onChange={(e) => setMaxAmountFilter(e.target.value)}
                        className="w-full"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>주문 날짜</Label>
                  <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !fromDateFilter && !toDateFilter && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {fromDateFilter && toDateFilter ? (
                          <>
                            {formatDateSafe(fromDateFilter)} ~ {formatDateSafe(toDateFilter)}
                          </>
                        ) : fromDateFilter ? (
                          `${formatDateSafe(fromDateFilter)} 이후`
                        ) : toDateFilter ? (
                          `${formatDateSafe(toDateFilter)} 이전`
                        ) : (
                          "날짜 선택"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <div className="space-y-2 p-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">시작일</Label>
                            <Calendar
                              mode="single"
                              selected={fromDateFilter}
                              onSelect={setFromDateFilter}
                              initialFocus
                              disabled={(date) => (toDateFilter ? date > toDateFilter : false)}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">종료일</Label>
                            <Calendar
                              mode="single"
                              selected={toDateFilter}
                              onSelect={setToDateFilter}
                              initialFocus
                              disabled={(date) => (fromDateFilter ? date < fromDateFilter : false)}
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setFromDateFilter(undefined)
                              setToDateFilter(undefined)
                            }}
                          >
                            초기화
                          </Button>
                          <Button size="sm" onClick={() => setIsCalendarOpen(false)}>
                            적용
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                <Button className="w-full" onClick={applyFilters}>
                  필터 적용
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* 관리자만 정렬 옵션 표시 */}
          {isAdmin && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="px-2 sm:px-3">
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="sr-only sm:not-sr-only sm:ml-1.5">정렬</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px]" align="end">
                <div className="space-y-2">
                  <Label className="text-xs">정렬 기준</Label>
                  <Select defaultValue="date-desc">
                    <SelectTrigger>
                      <SelectValue placeholder="정렬 기준" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date-desc">최신순</SelectItem>
                      <SelectItem value="date-asc">오래된순</SelectItem>
                      <SelectItem value="amount-desc">금액 높은순</SelectItem>
                      <SelectItem value="amount-asc">금액 낮은순</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>

      {/* 활성화된 필터 표시 */}
      {(statusFilter || platformFilter || minAmountFilter || maxAmountFilter || fromDateFilter || toDateFilter) && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground">적용된 필터:</span>
          {renderActiveFilters()}
          <Button variant="ghost" size="sm" onClick={resetFilters} className="h-7 px-2 text-xs">
            모두 초기화
          </Button>
        </div>
      )}
    </div>
  )
}
