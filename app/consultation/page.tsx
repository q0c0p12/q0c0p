import type { Metadata } from "next"
import { ConsultationForm } from "@/components/consultation/consultation-form"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "상담신청 | SMM크몽",
  description: "SMM크몽에 상담을 신청하세요. 전문가가 빠르게 답변해드립니다.",
}

export default async function ConsultationPage() {
  // 데이터베이스에서 카테고리 가져오기
  const supabase = createClient()
  let categories = []

  try {
    const { data, error } = await supabase.from("categories").select("id, name, slug").order("name")

    if (!error && data) {
      categories = data
    } else {
      console.error("카테고리 조회 오류:", error)
    }
  } catch (err) {
    console.error("카테고리 조회 중 예외 발생:", err)
  }

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-2">상담신청</h1>
          <p className="text-muted-foreground">
            소셜 미디어 마케팅에 관한 궁금한 점이 있으신가요? 아래 양식을 작성해 주시면 전문가가 빠르게 답변해드립니다.
          </p>
        </div>
        <ConsultationForm categories={categories} />
      </div>
    </div>
  )
}
