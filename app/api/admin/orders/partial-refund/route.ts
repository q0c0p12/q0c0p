import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { orderId, refundQuantity } = await request.json()

    if (!orderId || refundQuantity === undefined) {
      return NextResponse.json({ success: false, error: "주문 ID와 환불 수량이 필요합니다." }, { status: 400 })
    }

    const supabase = createRouteHandlerClient({ cookies })

    // 관리자 권한 확인
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: "인증되지 않은 사용자입니다." }, { status: 401 })
    }

    // 관리자 권한 확인
    const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()

    if (!profile || !profile.is_admin) {
      return NextResponse.json({ success: false, error: "관리자 권한이 없습니다." }, { status: 403 })
    }

    // 주문 정보 조회
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*, orderItems(*)")
      .eq("id", orderId)
      .single()

    if (orderError || !order) {
      console.error("주문 조회 오류:", orderError)
      return NextResponse.json(
        { success: false, error: orderError?.message || "주문을 찾을 수 없습니다." },
        { status: 404 },
      )
    }

    // 환불 금액 계산
    let totalQuantity = 1
    let unitPrice = 0

    if (order.orderItems && order.orderItems.length > 0) {
      const item = order.orderItems[0]
      totalQuantity = item.quantity || 1
      unitPrice = item.price || order.total_amount / totalQuantity
    } else {
      totalQuantity = order.quantity || 1
      unitPrice = order.total_amount / totalQuantity
    }

    // 환불 수량 유효성 검사
    if (refundQuantity <= 0 || refundQuantity > totalQuantity) {
      return NextResponse.json({ success: false, error: "유효하지 않은 환불 수량입니다." }, { status: 400 })
    }

    // 환불 금액 계산
    const refundAmount = unitPrice * refundQuantity

    // 환불 상태 결정
    const newStatus = refundQuantity === totalQuantity ? "refunded" : "partial_refund"

    // 트랜잭션 시작
    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("points")
      .eq("id", order.user_id)
      .single()

    if (userError) {
      console.error("사용자 정보 조회 오류:", userError)
      return NextResponse.json({ success: false, error: userError.message }, { status: 500 })
    }

    // 포인트 환불
    const { error: pointsError } = await supabase
      .from("profiles")
      .update({ points: (userData.points || 0) + refundAmount })
      .eq("id", order.user_id)

    if (pointsError) {
      console.error("포인트 환불 오류:", pointsError)
      return NextResponse.json({ success: false, error: pointsError.message }, { status: 500 })
    }

    // 포인트 내역 추가
    const { error: historyError } = await supabase.from("point_history").insert({
      user_id: order.user_id,
      amount: refundAmount,
      type: "refund",
      description: `주문 #${orderId} 환불`,
      order_id: orderId,
    })

    if (historyError) {
      console.error("포인트 내역 추가 오류:", historyError)
      return NextResponse.json({ success: false, error: historyError.message }, { status: 500 })
    }

    // 주문 상태 업데이트
    const { data: updatedOrder, error: updateError } = await supabase
      .from("orders")
      .update({
        status: newStatus,
        refunded_amount: refundAmount,
        refunded_quantity: refundQuantity,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .select()

    if (updateError) {
      console.error("주문 상태 업데이트 오류:", updateError)
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: updatedOrder[0],
      message: `주문 #${orderId}에 대한 ${refundQuantity}개 환불이 처리되었습니다.`,
    })
  } catch (error: any) {
    console.error("부분 환불 API 오류:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
