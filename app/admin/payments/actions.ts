"use server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

// 충전 요청 승인 함수
export async function approveBalanceRequest(id: string) {
  try {
    // 1. 충전 요청 정보 가져오기
    const { data: request, error: requestError } = await supabaseAdmin
      .from("balance_requests")
      .select("user_id, amount, status")
      .eq("id", id)
      .single()

    if (requestError) {
      console.error("충전 요청 정보 조회 실패:", requestError)
      return { success: false, message: `충전 요청 정보 조회 실패: ${requestError.message}` }
    }

    // 이미 처리된 요청인지 확인
    if (request.status !== "pending") {
      return {
        success: false,
        message: `이미 ${request.status === "approved" ? "승인" : "거절"}된 요청입니다.`,
      }
    }

    // 2. 사용자 포인트 정보 가져오기
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("points")
      .eq("id", request.user_id)
      .single()

    if (profileError) {
      console.error("사용자 정보 조회 실패:", profileError)
      return { success: false, message: `사용자 정보 조회 실패: ${profileError.message}` }
    }

    const currentPoints = profile?.points || 0
    const newPoints = currentPoints + request.amount

    // 3. 사용자 포인트 업데이트
    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ points: newPoints })
      .eq("id", request.user_id)

    if (updateError) {
      console.error("사용자 포인트 업데이트 실패:", updateError)
      return { success: false, message: `사용자 포인트 업데이트 실패: ${updateError.message}` }
    }

    // 4. 충전 요청 상태 업데이트
    const { error: statusError } = await supabaseAdmin
      .from("balance_requests")
      .update({
        status: "approved",
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (statusError) {
      console.error("충전 요청 상태 업데이트 실패:", statusError)
      return { success: false, message: `충전 요청 상태 업데이트 실패: ${statusError.message}` }
    }

    // 5. 페이지 갱신
    revalidatePath("/admin/payments")
    revalidatePath("/dashboard/balance")

    return { success: true, message: "충전 요청이 승인되었습니다." }
  } catch (error) {
    console.error("충전 요청 승인 중 오류 발생:", error)
    return { success: false, message: `충전 요청 승인 중 오류 발생: ${String(error)}` }
  }
}

// 충전 요청 거절 함수
export async function rejectBalanceRequest(id: string) {
  try {
    // 요청 상태 확인
    const { data: request, error: requestError } = await supabaseAdmin
      .from("balance_requests")
      .select("status")
      .eq("id", id)
      .single()

    if (requestError) {
      console.error("충전 요청 정보 조회 실패:", requestError)
      return { success: false, message: `충전 요청 정보 조회 실패: ${requestError.message}` }
    }

    // 이미 처리된 요청인지 확인
    if (request.status !== "pending") {
      return {
        success: false,
        message: `이미 ${request.status === "approved" ? "승인" : "거절"}된 요청입니다.`,
      }
    }

    const { error } = await supabaseAdmin
      .from("balance_requests")
      .update({
        status: "rejected",
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) {
      console.error("충전 요청 거절 실패:", error)
      return { success: false, message: `충전 요청 거절 실패: ${error.message}` }
    }

    revalidatePath("/admin/payments")
    revalidatePath("/dashboard/balance")

    return { success: true, message: "충전 요청이 거절되었습니다." }
  } catch (error) {
    console.error("충전 요청 거절 중 오류 발생:", error)
    return { success: false, message: `충전 요청 거절 중 오류 발생: ${String(error)}` }
  }
}

// 사용자 포인트 직접 수정 함수
export async function updateUserPoints(formData: FormData) {
  try {
    const userId = formData.get("userId") as string
    const amount = Number.parseInt(formData.get("amount") as string)
    const description = (formData.get("description") as string) || "관리자 포인트 조정"

    if (!userId) {
      return { success: false, message: "사용자 ID를 입력해주세요." }
    }

    if (isNaN(amount) || amount === 0) {
      return { success: false, message: "유효한 금액을 입력해주세요." }
    }

    // 사용자 프로필 정보 가져오기
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("points")
      .eq("id", userId)
      .single()

    if (profileError) {
      console.error("사용자 프로필 조회 오류:", profileError)
      return { success: false, message: "사용자 정보를 찾을 수 없습니다." }
    }

    // 현재 포인트 계산
    const currentPoints = profile?.points || 0
    const newPoints = currentPoints + amount

    // 포인트가 음수가 되는지 확인
    if (newPoints < 0) {
      return { success: false, message: "포인트가 부족합니다. 차감할 수 없습니다." }
    }

    // 사용자 포인트 업데이트
    const { error: updateError } = await supabaseAdmin.from("profiles").update({ points: newPoints }).eq("id", userId)

    if (updateError) {
      console.error("포인트 업데이트 오류:", updateError)
      return { success: false, message: "포인트 업데이트 중 오류가 발생했습니다." }
    }

    // 포인트 내역 기록 (point_history 테이블이 있는 경우)
    try {
      await supabaseAdmin.from("point_history").insert({
        user_id: userId,
        amount: amount,
        type: amount > 0 ? "admin_add" : "admin_subtract",
        description: description,
        balance_after: newPoints,
      })
    } catch (error) {
      console.error("포인트 내역 기록 오류:", error)
      // 포인트 내역 기록 실패는 치명적인 오류가 아니므로 계속 진행
    }

    // 캐시 갱신
    revalidatePath("/admin/payments")
    revalidatePath("/dashboard/balance")

    return {
      success: true,
      message: `사용자 포인트가 ${amount > 0 ? "추가" : "차감"}되었습니다.`,
    }
  } catch (error) {
    console.error("포인트 수정 오류:", error)
    return { success: false, message: "포인트 수정 중 오류가 발생했습니다." }
  }
}

// 이전 함수들과의 호환성을 위한 별칭
export const approveChargeRequest = approveBalanceRequest
export const rejectChargeRequest = rejectBalanceRequest
