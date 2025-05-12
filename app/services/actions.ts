"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

// 사용자 포인트 조회
export async function getUserPoints(userId: string) {
  const supabase = createAdminClient()

  const { data, error } = await supabase.from("profiles").select("points").eq("id", userId).single()

  if (error) {
    console.error("포인트 조회 오류:", error)
    throw new Error("사용자 포인트를 조회하는 중 오류가 발생했습니다.")
  }

  return data?.points || 0
}

// 사용자 포인트 업데이트
export async function updateUserPoints(userId: string, points: number) {
  const supabase = createAdminClient()

  const { error } = await supabase.from("profiles").update({ points }).eq("id", userId)

  if (error) {
    console.error("포인트 업데이트 오류:", error)
    throw new Error("사용자 포인트를 업데이트하는 중 오류가 발생했습니다.")
  }

  return true
}

// 주문 생성
export async function createOrder(userId: string, totalAmount: number, serviceId: number) {
  const supabase = createAdminClient()

  try {
    // 필수 필드만 포함하여 주문 데이터 준비
    const order = {
      user_id: userId,
      total_amount: totalAmount,
      status: "pending",
      service_id: serviceId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // 주문 저장
    const { data, error } = await supabase.from("orders").insert(order).select()

    if (error) {
      console.error("주문 생성 오류:", error)
      throw new Error(`주문을 생성하는 중 오류가 발생했습니다: ${error.message}`)
    }

    // 캐시 무효화
    revalidatePath("/dashboard/orders")
    revalidatePath("/admin/orders")

    return data[0]
  } catch (error: any) {
    console.error("주문 생성 중 예외 발생:", error)
    throw new Error(`주문 생성 중 예외 발생: ${error.message}`)
  }
}

// 주문 항목 생성 함수 추가
export async function createOrderItem(
  orderId: number,
  serviceId: number,
  serviceTitle: string,
  packageId: number,
  packageName: string, // 추가된 매개변수
  quantity: number,
  price: number,
  requirements?: string,
) {
  const supabase = createAdminClient()

  try {
    // 스키마에 맞게 필드 이름 수정
    const orderItem = {
      order_id: orderId,
      service_id: serviceId,
      service_title: serviceTitle,
      package_id: packageId,
      package_name: packageName, // 추가된 필드
      quantity: quantity,
      price: price,
      requirements: requirements || "",
      status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase.from("order_items").insert(orderItem).select()

    if (error) {
      console.error("주문 항목 생성 오류:", error)
      throw new Error(`주문 항목을 생성하는 중 오류가 발생했습니다: ${error.message}`)
    }

    return data[0]
  } catch (error: any) {
    console.error("주문 항목 생성 중 예외 발생:", error)
    throw new Error(`주문 항목 생성 중 예외 발생: ${error.message}`)
  }
}

// 주문 처리 함수
export async function processOrder(formData: FormData) {
  const supabase = createClient()

  try {
    // 세션 확인
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      redirect("/auth?tab=signin")
    }

    const userId = session.user.id

    // 폼 데이터 파싱
    const serviceId = Number(formData.get("serviceId"))
    const packageId = Number(formData.get("packageId") || 0)
    const packageName = (formData.get("packageName") as string) || "기본 패키지" // 패키지 이름 추가
    const price = Number(formData.get("price"))
    const quantity = Number(formData.get("quantity"))
    const totalAmount = price * quantity
    const requirements = formData.get("instructions") as string

    // 값 검증
    if (!serviceId || !price || !quantity || !totalAmount) {
      return {
        success: false,
        message: "주문 정보가 올바르지 않습니다.",
      }
    }

    // 사용자 포인트 확인
    const currentPoints = await getUserPoints(userId)

    // 포인트 부족 확인
    if (currentPoints < totalAmount) {
      return {
        success: false,
        message: "포인트가 부족합니다. 충전 후 다시 시도해주세요.",
        insufficientPoints: true,
        requiredPoints: totalAmount,
        currentPoints,
      }
    }

    // 주문 생성 - 필수 필드만 포함
    const order = await createOrder(userId, totalAmount, serviceId)

    // 서비스 정보 가져오기 - name 대신 title 사용
    const { data: serviceData } = await supabase.from("services").select("title").eq("id", serviceId).single()

    const serviceTitle = serviceData?.title || "알 수 없는 서비스"

    // 주문 항목 생성
    try {
      await createOrderItem(
        order.id,
        serviceId,
        serviceTitle,
        packageId,
        packageName, // 패키지 이름 전달
        quantity,
        price,
        requirements,
      )
    } catch (itemError: any) {
      console.error("주문 항목 생성 오류:", itemError)
      // 주문 항목 생성 실패해도 주문은 계속 진행
    }

    // 포인트 차감
    const newPoints = currentPoints - totalAmount
    await updateUserPoints(userId, newPoints)

    return {
      success: true,
      message: "주문이 성공적으로 접수되었습니다.",
      orderId: order.id,
      newPoints,
    }
  } catch (error: any) {
    console.error("주문 처리 오류:", error)
    return {
      success: false,
      message: error.message || "주문 처리 중 오류가 발생했습니다.",
    }
  }
}
