"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function submitConsultation(formData: FormData) {
  try {
    const supabase = createClient()

    // 폼 데이터 추출
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string
    const company = (formData.get("company") as string) || null
    const serviceType = formData.get("serviceType") as string
    const message = formData.get("message") as string

    // 데이터 유효성 검사
    if (!name || !email || !phone || !serviceType || !message) {
      return { success: false, error: "모든 필수 필드를 입력해주세요." }
    }

    // 상담신청 데이터 저장
    const { error: insertError } = await supabase.from("consultations").insert({
      name,
      email,
      phone,
      company,
      service_type: serviceType,
      message,
      status: "pending",
    })

    if (insertError) {
      console.error("상담신청 저장 오류:", insertError)
      return { success: false, error: "상담신청 저장에 실패했습니다." }
    }

    revalidatePath("/admin/consultations")
    return { success: true }
  } catch (err) {
    console.error("상담신청 처리 중 예외 발생:", err)
    return {
      success: false,
      error: err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.",
    }
  }
}
