"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"

interface AdminOrderPaginationProps {
  currentPage: number
  totalPages: number
  hasPrevPage: boolean
  hasNextPage: boolean
}

export function AdminOrderPagination({ currentPage, totalPages, hasPrevPage, hasNextPage }: AdminOrderPaginationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createPageURL = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams)
    params.set("page", pageNumber.toString())
    return `${pathname}?${params.toString()}`
  }

  return (
    <div className="flex items-center justify-between mt-4 px-1">
      <div className="text-sm text-muted-foreground">
        페이지 {currentPage} / {totalPages}
      </div>
      <div className="flex items-center space-x-2">
        <button
          className={`px-3 py-1 rounded text-sm ${
            hasPrevPage
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          }`}
          disabled={!hasPrevPage}
          onClick={() => {
            if (hasPrevPage) {
              router.push(createPageURL(currentPage - 1))
            }
          }}
        >
          이전
        </button>
        <button
          className={`px-3 py-1 rounded text-sm ${
            hasNextPage
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          }`}
          disabled={!hasNextPage}
          onClick={() => {
            if (hasNextPage) {
              router.push(createPageURL(currentPage + 1))
            }
          }}
        >
          다음
        </button>
      </div>
    </div>
  )
}
