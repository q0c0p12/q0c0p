import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { ConsultationManagement } from "@/components/admin/consultation-management"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const metadata: Metadata = {
  title: "상담신청 관리 | 관리자 대시보드",
  description: "상담신청 내역을 관리합니다.",
}

export default async function ConsultationsPage() {
  const supabase = createClient()

  let consultations = []
  let categories = []
  let error = null

  try {
    // 카테고리 정보 가져오기
    const { data: categoriesData, error: categoriesError } = await supabase.from("categories").select("id, name")

    if (categoriesError) {
      console.error("카테고리 데이터 조회 오류:", categoriesError)
    } else {
      categories = categoriesData || []
    }

    // 상담신청 데이터 가져오기
    const { data, error: fetchError } = await supabase
      .from("consultations")
      .select("*")
      .order("created_at", { ascending: false })

    if (fetchError) {
      console.error("상담신청 데이터 조회 오류:", fetchError)
      error = fetchError
    } else {
      consultations = data || []
    }
  } catch (err) {
    console.error("데이터 조회 중 예외 발생:", err)
    error = {
      message: err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.",
    }
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">상담신청 관리</h1>
        <p className="text-muted-foreground mt-2">고객으로부터 접수된 상담신청 내역을 확인하고 관리합니다.</p>
      </div>

      {error ? (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>데이터 조회 오류</AlertTitle>
          <AlertDescription>상담신청 데이터를 조회하는 중 오류가 발생했습니다: {error.message}</AlertDescription>
        </Alert>
      ) : consultations.length > 0 ? (
        <ConsultationManagement consultations={consultations} categories={categories} />
      ) : (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>상담신청 내역이 없습니다</AlertTitle>
          <AlertDescription>
            <p className="mb-4">아직 접수된 상담신청이 없습니다.</p>
            <Button asChild>
              <Link href="/consultation">상담신청 페이지로 이동</Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
