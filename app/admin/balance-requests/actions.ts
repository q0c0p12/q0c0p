"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// 충전 요청 승인 액션
export async function approveBalanceRequest(formData: FormData) {
  const supabase = createClient()

  // 세션 확인
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return {
      success: false,
      message: "로그인이 필요합니다.",
    }
  }

  // 관리자 권한 확인
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", session.user.id).single()

  if (!profile?.is_admin) {
    return {
      success: false,
      message: "관리자 권한이 필요합니다.",
    }
  }

  const requestId = formData.get("requestId") as string
  const userId = formData.get("userId") as string
  const amount = Number(formData.get("amount"))

  if (!requestId || !userId || !amount) {
    return {
      success: false,
      message: "필수 정보가 누락되었습니다.",
    }
  }

  try {
    // 트랜잭션 시작
    const { error: updateError } = await supabase
      .from("balance_requests")
      .update({
        status: "approved",
        reviewed_at: new Date().toISOString(),
        reviewed_by: session.user.id,
      })
      .eq("id", requestId)

    if (updateError) {
      console.error("Error updating balance request:", updateError)
      return {
        success: false,
        message: "충전 요청 상태 업데이트 중 오류가 발생했습니다.",
      }
    }

    // 사용자 잔액 업데이트
    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("balance, total_charged")
      .eq("id", userId)
      .single()

    if (userError) {
      console.error("Error fetching user data:", userError)
      return {
        success: false,
        message: "사용자 정보를 불러오는 중 오류가 발생했습니다.",
      }
    }

    const currentBalance = userData.balance || 0
    const totalCharged = userData.total_charged || 0

    const { error: balanceError } = await supabase
      .from("profiles")
      .update({
        balance: currentBalance + amount,
        total_charged: totalCharged + amount,
      })
      .eq("id", userId)

    if (balanceError) {
      console.error("Error updating user balance:", balanceError)
      return {
        success: false,
        message: "사용자 잔액 업데이트 중 오류가 발생했습니다.",
      }
    }

    // 포인트 내역 추가
    const { error: historyError } = await supabase.from("point_history").insert({
      user_id: userId,
      amount: amount,
      type: "charge",
      description: "포인트 충전",
      balance_after: currentBalance + amount,
    })

    if (historyError) {
      console.error("Error creating point history:", historyError)
      // 내역 추가 실패해도 충전은 성공으로 처리
    }

    // 사용자에게 알림 생성
    const { error: notificationError } = await supabase.from("notifications").insert({
      user_id: userId,
      title: "포인트 충전 완료",
      content: `${amount.toLocaleString()}원이 충전되었습니다. 현재 잔액: ${(currentBalance + amount).toLocaleString()}원`,
      type: "balance",
      is_read: false,
    })

    if (notificationError) {
      console.error("Error creating notification:", notificationError)
      // 알림 생성 실패해도 충전은 성공으로 처리
    }

    // 캐시 갱신
    revalidatePath("/admin/balance-requests")
    revalidatePath("/dashboard/balance")
    revalidatePath("/dashboard/notifications")

    return {
      success: true,
      message: "충전 요청이 승인되었습니다.",
    }
  } catch (error) {
    console.error("Balance request approval error:", error)
    return {
      success: false,
      message: "충전 요청 승인 중 오류가 발생했습니다.",
    }
  }
}

// 충전 요청 거절 액션
export async function rejectBalanceRequest(formData: FormData) {
  const supabase = createClient()

  // 세션 확인
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return {
      success: false,
      message: "로그인이 필요합니다.",
    }
  }

  // 관리자 권한 확인
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", session.user.id).single()

  if (!profile?.is_admin) {
    return {
      success: false,
      message: "관리자 권한이 필요합니다.",
    }
  }

  const requestId = formData.get("requestId") as string

  if (!requestId) {
    return {
      success: false,
      message: "요청 ID가 누락되었습니다.",
    }
  }

  try {
    // 충전 요청 정보 가져오기
    const { data: requestData, error: requestError } = await supabase
      .from("balance_requests")
      .select("user_id, amount")
      .eq("id", requestId)
      .single()

    if (requestError) {
      console.error("Error fetching request data:", requestError)
      return {
        success: false,
        message: "충전 요청 정보를 불러오는 중 오류가 발생했습니다.",
      }
    }

    // 충전 요청 상태 업데이트
    const { error: updateError } = await supabase
      .from("balance_requests")
      .update({
        status: "rejected",
        reviewed_at: new Date().toISOString(),
        reviewed_by: session.user.id,
      })
      .eq("id", requestId)

    if (updateError) {
      console.error("Error updating balance request:", updateError)
      return {
        success: false,
        message: "충전 요청 상태 업데이트 중 오류가 발생했습니다.",
      }
    }

    // 사용자에게 알림 생성
    const { error: notificationError } = await supabase.from("notifications").insert({
      user_id: requestData.user_id,
      title: "포인트 충전 요청 거절",
      content: `${requestData.amount.toLocaleString()}원 충전 요청이 거절되었습니다. 자세한 내용은 고객센터로 문의해주세요.`,
      type: "balance",
      is_read: false,
    })

    if (notificationError) {
      console.error("Error creating notification:", notificationError)
      // 알림 생성 실패해도 거절은 성공으로 처리
    }

    // 캐시 갱신
    revalidatePath("/admin/balance-requests")
    revalidatePath("/dashboard/notifications")

    return {
      success: true,
      message: "충전 요청이 거절되었습니다.",
    }
  } catch (error) {
    console.error("Balance request rejection error:", error)
    return {
      success: false,
      message: "충전 요청 거절 중 오류가 발생했습니다.",
    }
  }
}
