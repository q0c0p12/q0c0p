"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

// 단일 주문 상태 업데이트
export async function updateOrderStatus(orderId: string, newStatus: string) {
  try {
    const supabase = createAdminClient()

    // 주문 정보 가져오기
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", orderId)
      .single()

    if (orderError) {
      console.error("주문 정보 조회 오류:", orderError)
      return { success: false, error: "주문 정보를 조회할 수 없습니다." }
    }

    // 주문 상태 업데이트
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)

    if (updateError) {
      console.error("주문 상태 업데이트 오류:", updateError)
      return { success: false, error: "주문 상태를 업데이트할 수 없습니다." }
    }

    // 주문 항목 상태도 함께 업데이트
    if (order.order_items && order.order_items.length > 0) {
      const orderItemIds = order.order_items.map((item) => item.id)

      const { error: itemsUpdateError } = await supabase
        .from("order_items")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .in("id", orderItemIds)

      if (itemsUpdateError) {
        console.error("주문 항목 상태 업데이트 오류:", itemsUpdateError)
        // 주문 항목 업데이트 실패는 전체 실패로 처리하지 않음
      }
    }

    // 취소 처리인 경우 포인트 환불 처리
    if (newStatus === "cancelled" && order.total_amount > 0) {
      // 사용자 정보 조회
      const { data: user, error: userError } = await supabase
        .from("profiles")
        .select("points")
        .eq("id", order.user_id)
        .single()

      if (!userError && user) {
        // 새로운 잔액 계산
        const newBalance = user.points + order.total_amount

        // 포인트 환불
        const { error: pointsError } = await supabase
          .from("profiles")
          .update({
            points: newBalance,
            updated_at: new Date().toISOString(),
          })
          .eq("id", order.user_id)

        if (pointsError) {
          console.error("포인트 환불 오류:", pointsError)
        } else {
          // 포인트 내역 기록
          const { error: historyError } = await supabase.from("point_history").insert({
            user_id: order.user_id,
            amount: order.total_amount,
            type: "refund",
            description: `주문 #${orderId} 취소 환불`,
            created_at: new Date().toISOString(),
            balance_after: newBalance, // 환불 후 잔액 추가
          })

          if (historyError) {
            console.error("포인트 내역 기록 오류:", historyError)
          }
        }
      }
    }

    // 캐시 무효화
    revalidatePath(`/admin/orders/${orderId}`)
    revalidatePath("/admin/orders")

    return { success: true }
  } catch (error) {
    console.error("주문 상태 업데이트 중 오류 발생:", error)
    return { success: false, error: "주문 상태 업데이트 중 오류가 발생했습니다." }
  }
}

// 다중 주문 상태 업데이트
export async function updateMultipleOrderStatus(orderIds: string[], newStatus: string) {
  try {
    const supabase = createAdminClient()
    const results = []
    let successCount = 0
    let failCount = 0

    // 각 주문에 대해 상태 업데이트 수행
    for (const orderId of orderIds) {
      const result = await updateOrderStatus(orderId, newStatus)
      results.push({ orderId, ...result })

      if (result.success) {
        successCount++
      } else {
        failCount++
      }
    }

    // 캐시 무효화
    revalidatePath("/admin/orders")

    return {
      success: failCount === 0,
      results,
      summary: {
        total: orderIds.length,
        success: successCount,
        fail: failCount,
      },
    }
  } catch (error) {
    console.error("다중 주문 상태 업데이트 중 오류 발생:", error)
    return {
      success: false,
      error: "다중 주문 상태 업데이트 중 오류가 발생했습니다.",
      summary: {
        total: orderIds.length,
        success: 0,
        fail: orderIds.length,
      },
    }
  }
}

// 부분 환불 처리 함수 개선
// 정확한 환불 금액 계산 및 데이터 업데이트
export async function processPartialRefund(orderId: string, refundQuantity: number) {
  try {
    const supabase = createAdminClient()

    // 주문 정보 가져오기
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", orderId)
      .single()

    if (orderError) {
      console.error("주문 정보 조회 오류:", orderError)
      return { success: false, error: "주문 정보를 조회할 수 없습니다." }
    }

    // 주문 항목 확인
    if (!order.order_items || order.order_items.length === 0) {
      return { success: false, error: "주문 항목이 없습니다." }
    }

    // 첫 번째 주문 항목 사용 (일반적으로 하나의 주문에 하나의 항목만 있음)
    const orderItem = order.order_items[0]
    const totalQuantity = orderItem.quantity || 1

    // 환불 수량 검증
    if (refundQuantity <= 0 || refundQuantity > totalQuantity) {
      return { success: false, error: "유효하지 않은 환불 수량입니다." }
    }

    // 단가 계산
    const unitPrice = orderItem.price || order.total_amount / totalQuantity

    // 환불 금액 계산
    const refundAmount = unitPrice * refundQuantity

    // 환불 후 남은 결제 금액 계산
    const remainingAmount = order.total_amount - refundAmount

    // 사용자 정보 조회
    const { data: user, error: userError } = await supabase
      .from("profiles")
      .select("points")
      .eq("id", order.user_id)
      .single()

    if (userError) {
      console.error("사용자 정보 조회 오류:", userError)
      return { success: false, error: "사용자 정보를 조회할 수 없습니다." }
    }

    // 새로운 잔액 계산
    const newBalance = user.points + refundAmount

    // 포인트 환불 및 총 지출 금액 업데이트
    const { error: pointsError } = await supabase
      .from("profiles")
      .update({
        points: newBalance,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.user_id)

    if (pointsError) {
      console.error("포인트 환불 오류:", pointsError)
      return { success: false, error: "포인트 환불 처리 중 오류가 발생했습니다." }
    }

    // 포인트 내역 기록
    const { error: historyError } = await supabase.from("point_history").insert({
      user_id: order.user_id,
      amount: refundAmount,
      type: "refund",
      description: `주문 #${orderId} 부분 환불 (${refundQuantity}개)`,
      created_at: new Date().toISOString(),
      balance_after: newBalance,
    })

    if (historyError) {
      console.error("포인트 내역 기록 오류:", historyError)
      // 내역 기록 실패는 전체 실패로 처리하지 않음
    }

    // 주문 상태 업데이트 (전체 환불 여부에 따라 상태 결정)
    const newStatus = refundQuantity === totalQuantity ? "refunded" : "partial_refund"

    // 주문 테이블 업데이트 - 환불 금액과 수량 정보 추가
    try {
      const { error: updateOrderError } = await supabase
        .from("orders")
        .update({
          status: newStatus,
          refunded_amount: refundAmount, // 환불 금액 저장
          refunded_quantity: refundQuantity, // 환불 수량 저장
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)

      if (updateOrderError) {
        console.error("주문 상태 업데이트 오류:", updateOrderError)
        return { success: false, error: "주문 상태를 업데이트할 수 없습니다." }
      }
    } catch (error) {
      console.error("주문 업데이트 중 예외 발생:", error)
      return { success: false, error: "주문 상태를 업데이트할 수 없습니다." }
    }

    // 주문 항목 업데이트 시도 - 최소한의 필드만 업데이트
    try {
      const { error: updateItemError } = await supabase
        .from("order_items")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderItem.id)

      if (updateItemError) {
        console.error("주문 항목 업데이트 오류:", updateItemError)
        // 주문 항목 업데이트 실패는 전체 실패로 처리하지 않음
      }
    } catch (error) {
      console.error("주문 항목 업데이트 중 예외 발생:", error)
      // 주문 항목 업데이트 실패는 전체 실패로 처리하지 않음
    }

    // 캐시 무효화
    revalidatePath(`/admin/orders/${orderId}`)
    revalidatePath("/admin/orders")
    revalidatePath("/dashboard/balance")
    revalidatePath("/dashboard")

    return {
      success: true,
      refundAmount,
      remainingAmount,
      newStatus,
      message: `${refundQuantity}개에 대한 환불 처리가 완료되었습니다. (${refundAmount.toLocaleString()}원)`,
    }
  } catch (error) {
    console.error("부분 환불 처리 중 오류 발생:", error)
    return { success: false, error: "부분 환불 처리 중 오류가 발생했습니다." }
  }
}
