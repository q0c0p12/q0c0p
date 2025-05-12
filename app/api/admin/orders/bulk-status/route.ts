import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { orderIds, status } = await request.json()

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0 || !status) {
      return NextResponse.json({ success: false, error: "주문 ID 배열과 상태가 필요합니다." }, { status: 400 })
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

    // 주문 상태 일괄 업데이트
    const { data, error } = await supabase
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .in("id", orderIds)
      .select()

    if (error) {
      console.error("주문 상태 일괄 업데이트 오류:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data,
      summary: {
        success: data.length,
        fail: orderIds.length - data.length,
      },
    })
  } catch (error: any) {
    console.error("주문 상태 일괄 변경 API 오류:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
