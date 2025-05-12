"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // 오류 로깅
    console.error("페이지 오류:", error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">오류가 발생했습니다</h1>
        <p className="text-lg text-gray-600 mb-8">
          페이지를 로드하는 중 문제가 발생했습니다. 다시 시도하거나 홈페이지로 이동해주세요.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={reset} variant="default" className="bg-rose-600 hover:bg-rose-700">
            다시 시도
          </Button>
          <Button asChild variant="outline">
            <Link href="/">홈페이지로 이동</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
