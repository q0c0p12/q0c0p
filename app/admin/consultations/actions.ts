"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateConsultationStatus(id: number, status: string) {
  try {
    const supabase = createClient()

    const { error } = await supabase
      .from("consultations")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)

    if (error) {
      console.error("상담신청 상태 업데이트 오류:", error)
      return { success: false, message: "상담신청 상태 업데이트에 실패했습니다" }
    }

    revalidatePath("/admin/consultations")
    return { success: true, message: "상담신청 상태가 업데이트되었습니다" }
  } catch (e) {
    console.error("상담신청 상태 업데이트 중 예외 발생:", e)
    return { success: false, message: "서버 오류가 발생했습니다" }
  }
}

export async function updateConsultationNotes(id: number, adminNotes: string) {
  try {
    const supabase = createClient()

    const { error } = await supabase
      .from("consultations")
      .update({ admin_notes: adminNotes, updated_at: new Date().toISOString() })
      .eq("id", id)

    if (error) {
      console.error("관리자 메모 업데이트 오류:", error)
      return { success: false, message: "관리자 메모 업데이트에 실패했습니다" }
    }

    revalidatePath("/admin/consultations")
    return { success: true, message: "관리자 메모가 저장되었습니다" }
  } catch (e) {
    console.error("관리자 메모 업데이트 중 예외 발생:", e)
    return { success: false, message: "서버 오류가 발생했습니다" }
  }
}
