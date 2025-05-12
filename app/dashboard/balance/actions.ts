"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { supabaseAdmin } from "@/lib/supabase/admin"

// 사용자 통계 정보 가져오기
export async function getUserStats() {
  const supabase = createClient()

  // 세션 확인
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return {
      success: false,
      data: {},
      message: "로그인이 필요합니다.",
    }
  }

  try {
    // 사용자 프로필 정보 가져오기 (실제 존재하는 컬럼만 선택)
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, balance, points")
      .eq("id", session.user.id)
      .single()

    if (profileError) {
      console.error("사용자 프로필 조회 오류:", profileError)
      return {
        success: false,
        data: {
          balance: 0,
          total_spent: 0,
          total_charged: 0,
        },
        message: "사용자 프로필을 조회하는 중 오류가 발생했습니다.",
      }
    }

    // 충전 내역에서 총 충전액 계산
    const { data: chargeRequests, error: chargeError } = await supabase
      .from("balance_requests")
      .select("amount")
      .eq("user_id", session.user.id)
      .eq("status", "approved")

    if (chargeError) {
      console.error("충전 내역 조회 오류:", chargeError)
    }

    const totalCharged = chargeRequests?.reduce((sum, req) => sum + req.amount, 0) || 0

    // 주문 내역에서 총 사용액 계산 (total_price 대신 total_amount 사용)
    console.log("주문 내역 조회 시작 - 사용자 ID:", session.user.id)

    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("id, total_amount, status, refunded_amount, refunded_quantity")
      .eq("user_id", session.user.id)

    if (ordersError) {
      console.error("주문 내역 조회 오류:", ordersError)
    } else {
      console.log("주문 내역 조회 결과:", orders?.length || 0, "건")
      console.log(
        "주문 상태 분포:",
        orders?.reduce((acc, order) => {
          acc[order.status] = (acc[order.status] || 0) + 1
          return acc
        }, {}),
      )
    }

    // 환불을 제외한 실제 지출 금액 계산
    const totalSpent =
      orders?.reduce((sum, order) => {
        // 환불된 주문은 total_amount - refunded_amount 값을 사용
        if (order.status === "refunded") {
          return sum + 0 // 완전 환불된 주문은 0원 처리
        } else if (order.status === "partial_refund") {
          // 부분 환불된 주문은 total_amount - refunded_amount 사용
          const actualPaid = order.total_amount - (order.refunded_amount || 0)
          return sum + actualPaid
        } else if (order.status === "cancelled") {
          return sum + 0 // 취소된 주문은 0원 처리
        } else {
          return sum + (order.total_amount || 0) // 그 외 주문은 total_amount 사용
        }
      }, 0) || 0

    console.log("계산된 총 사용액 (환불 제외):", totalSpent)

    // 완료된 주문만의 총액 계산 (참고용)
    const completedTotalSpent =
      orders
        ?.filter((order) => order.status === "completed")
        .reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0
    console.log("완료된 주문의 총 사용액:", completedTotalSpent)

    return {
      success: true,
      data: {
        balance: profile?.balance || profile?.points || 0,
        total_spent: totalSpent,
        total_charged: totalCharged,
      },
      message: "",
    }
  } catch (error) {
    console.error("사용자 통계 정보 조회 오류:", error)
    return {
      success: false,
      data: {
        balance: 0,
        total_spent: 0,
        total_charged: 0,
      },
      message: "사용자 정보를 조회하는 중 오류가 발생했습니다.",
    }
  }
}

// 거래 내역 가져오기
export async function getTransactionHistory() {
  const supabase = createClient()

  // 세션 확인
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return {
      success: false,
      data: [],
      message: "로그인이 필요합니다.",
    }
  }

  try {
    console.log("거래 내역 조회 시작 - 사용자 ID:", session.user.id)

    // 충전 요청 내역 가져오기
    const { data: chargeRequests, error: chargeRequestsError } = await supabase
      .from("balance_requests")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })

    if (chargeRequestsError) {
      console.error("충전 요청 내역 조회 오류:", chargeRequestsError)
    } else {
      console.log("충전 요청 내역 조회 결과:", chargeRequests?.length || 0, "건")
    }

    // 주문 내역 가져오기
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(10)

    if (ordersError) {
      console.error("주문 내역 조회 오류:", ordersError)
    } else {
      console.log("주문 내역 조회 결과:", orders?.length || 0, "건")
    }

    // 충전 요청 내역을 거래 내역 형식으로 변환
    const chargeTransactions = chargeRequests
      ? chargeRequests.map((request) => ({
          id: request.id,
          user_id: request.user_id,
          amount: request.amount,
          description: `포인트 충전 ${request.status === "pending" ? "요청" : request.status === "approved" ? "완료" : "거절"}`,
          content: request.description || `결제방법: ${request.payment_method || "계좌이체"}`,
          created_at: request.created_at,
          status: request.status,
          type: "charge",
        }))
      : []

    // 주문 내역을 거래 내역 형식으로 변환
    const orderTransactions = orders
      ? orders.map((order) => ({
          id: order.id,
          user_id: order.user_id,
          amount: order.total_amount || 0,
          description: `서비스 주문: ${order.service_id ? `#${order.service_id}` : "알 수 없는 서비스"}`,
          content: `상태: ${order.status || "처리중"}`,
          created_at: order.created_at,
          status: order.status || "completed",
          type: "payment",
        }))
      : []

    // 모든 거래 내역 합치기
    const allTransactions = [...chargeTransactions, ...orderTransactions].sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    console.log("최종 거래 내역:", allTransactions.length, "건")

    return {
      success: true,
      data: allTransactions,
      message: "",
    }
  } catch (error) {
    console.error("거래 내역 조회 중 예외 발생:", error)
    return {
      success: false,
      data: [],
      message: "거래 내역을 조회하는 중 오류가 발생했습니다.",
    }
  }
}

// 잔액 충전 요청 액션
export async function requestBalanceCharge(formData: FormData) {
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

  const amount = formData.get("amount")
  const paymentMethod = formData.get("paymentMethod") as string
  const depositor = formData.get("depositor") as string

  // 입력값 검증
  if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
    return {
      success: false,
      message: "유효한 금액을 입력해주세요.",
    }
  }

  if (Number(amount) < 10000) {
    return {
      success: false,
      message: "최소 충전 금액은 10,000원입니다.",
    }
  }

  if (!depositor) {
    return {
      success: false,
      message: "입금자명을 입력해주세요.",
    }
  }

  try {
    // 사용자 프로필 확인
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("id", session.user.id)
      .single()

    // 프로필이 없으면 생성
    if (profileError || !profile) {
      console.log("프로필이 없어 새로 생성합니다.")
      const { error: createProfileError } = await supabaseAdmin.from("profiles").insert({
        id: session.user.id,
        full_name: session.user.email?.split("@")[0] || `사용자`,
        balance: 0,
        points: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (createProfileError) {
        console.error("프로필 생성 오류:", createProfileError)
        return {
          success: false,
          message: "사용자 프로필을 생성하는 중 오류가 발생했습니다: " + createProfileError.message,
        }
      }
    }

    // balance_requests 테이블에 충전 요청 저장
    const { error } = await supabase.from("balance_requests").insert({
      user_id: session.user.id,
      amount: Number(amount),
      status: "pending",
      payment_method: paymentMethod,
      description: `입금자명: ${depositor}`,
    })

    if (error) {
      console.error("충전 요청 저장 오류:", error)
      return {
        success: false,
        message: "충전 요청을 저장하는 중 오류가 발생했습니다: " + error.message,
      }
    }

    // 캐시 갱신
    revalidatePath("/dashboard/balance")
    revalidatePath("/admin/payments")

    return {
      success: true,
      message: "충전 요청이 성공적으로 접수되었습니다. 관리자 승인 후 잔액이 충전됩니다.",
    }
  } catch (error) {
    console.error("충전 요청 오류:", error)
    return {
      success: false,
      message: "충전 요청 중 오류가 발생했습니다. 다시 시도해주세요.",
    }
  }
}
