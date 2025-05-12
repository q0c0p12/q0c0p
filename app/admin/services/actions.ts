"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

// 서비스 관련 타입 정의
interface ServiceData {
  title: string
  slug: string
  description: string
  category_id: number
  image_url: string
  delivery_time: number
  base_price: number
  created_at?: string
  updated_at: string
}

interface ServicePackageData {
  service_id: number
  name: string
  description: string
  price: number
  delivery_time: number
  features: string[]
  display_order?: number
}

interface ServiceFAQData {
  service_id: number
  question: string
  answer: string
  display_order: number
}

// 서비스 목록 조회
export async function getServices() {
  const supabase = createAdminClient()

  const { data, error } = await supabase.from("services").select("*").order("id", { ascending: false })

  if (error) {
    console.error("서비스 조회 오류:", error)
    throw new Error("서비스 목록을 불러오는 중 오류가 발생했습니다.")
  }

  return data
}

// 카테고리 목록 조회
export async function getCategories() {
  const supabase = createAdminClient()

  const { data, error } = await supabase.from("categories").select("id, name").order("name")

  if (error) {
    console.error("카테고리 조회 오류:", error)
    throw new Error("카테고리 목록을 불러오는 중 오류가 발생했습니다.")
  }

  return data
}

// 서비스 패키지 조회
export async function getServicePackages(serviceId: number) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("service_packages")
    .select("*")
    .eq("service_id", serviceId)
    .order("id", { ascending: true })

  if (error) {
    console.error("패키지 조회 오류:", error)
    throw new Error("서비스 패키지를 불러오는 중 오류가 발생했습니다.")
  }

  return data
}

// 서비스 FAQ 조회
export async function getServiceFAQs(serviceId: number) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("service_faqs")
    .select("*")
    .eq("service_id", serviceId)
    .order("display_order")

  if (error) {
    console.error("FAQ 조회 오류:", error)
    throw new Error("서비스 FAQ를 불러오는 중 오류가 발생했습니다.")
  }

  return data
}

// 서비스 추가
export async function createService(serviceData: FormData) {
  const supabase = createAdminClient()

  try {
    const title = serviceData.get("title") as string
    const slug = serviceData.get("slug") as string
    const description = serviceData.get("description") as string
    const category_id = Number(serviceData.get("category_id"))
    const image_url = serviceData.get("image_url") as string
    const delivery_time = Number(serviceData.get("delivery_time"))
    const base_price = Number(serviceData.get("base_price"))
    const is_featured = serviceData.get("is_featured") === "true"
    const is_active = serviceData.get("is_active") === "true"

    const { data, error } = await supabase
      .from("services")
      .insert([
        {
          title,
          slug,
          description,
          category_id,
          image_url,
          delivery_time,
          base_price,
          is_featured,
          is_active,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("서비스 추가 오류:", error)
      throw new Error(`서비스를 추가하는 중 오류가 발생했습니다: ${error.message}`)
    }

    revalidatePath("/admin/services")
    return { success: true, id: data.id }
  } catch (error: any) {
    console.error("서비스 추가 예외:", error)
    throw new Error(`서비스 추가 중 예외 발생: ${error.message}`)
  }
}

// 서비스 수정
export async function updateService(serviceData: FormData) {
  const supabase = createAdminClient()

  try {
    const id = Number(serviceData.get("id"))
    const title = serviceData.get("title") as string
    const slug = serviceData.get("slug") as string
    const description = serviceData.get("description") as string
    const category_id = Number(serviceData.get("category_id"))
    const image_url = serviceData.get("image_url") as string
    const delivery_time = Number(serviceData.get("delivery_time"))
    const base_price = Number(serviceData.get("base_price"))
    const is_featured = serviceData.get("is_featured") === "true"
    const is_active = serviceData.get("is_active") === "true"

    const { error } = await supabase
      .from("services")
      .update({
        title,
        slug,
        description,
        category_id,
        image_url,
        delivery_time,
        base_price,
        is_featured,
        is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) {
      console.error("서비스 수정 오류:", error)
      throw new Error(`서비스를 수정하는 중 오류가 발생했습니다: ${error.message}`)
    }

    revalidatePath("/admin/services")
    return { success: true }
  } catch (error: any) {
    console.error("서비스 수정 예외:", error)
    return { success: false, message: error.message }
  }
}

// 서비스 삭제
export async function deleteService(id: number) {
  const supabase = createAdminClient()

  const { error } = await supabase.from("services").delete().eq("id", id)

  if (error) {
    console.error("서비스 삭제 오류:", error)
    throw new Error(`서비스를 삭제하는 중 오류가 발생했습니다: ${error.message}`)
  }

  revalidatePath("/admin/services")
  return true
}

// 패키지 추가
export async function addServicePackage(packageData: ServicePackageData) {
  const supabase = createAdminClient()

  console.log("패키지 데이터 추가 시도:", packageData)

  const { data, error } = await supabase.from("service_packages").insert(packageData).select()

  if (error) {
    console.error("패키지 추가 오류:", error)
    throw new Error(`패키지를 추가하는 중 오류가 발생했습니다: ${error.message}`)
  }

  revalidatePath("/admin/services")
  return data[0]
}

// 패키지 수정
export async function updateServicePackage(id: number, packageData: ServicePackageData) {
  const supabase = createAdminClient()

  console.log("패키지 데이터 수정 시도:", packageData)

  const { error } = await supabase.from("service_packages").update(packageData).eq("id", id)

  if (error) {
    console.error("패키지 수정 오류:", error)
    throw new Error(`패키지를 수정하는 중 오류가 발생했습니다: ${error.message}`)
  }

  revalidatePath("/admin/services")
  return true
}

// 패키지 삭제
export async function deleteServicePackage(id: number) {
  const supabase = createAdminClient()

  const { error } = await supabase.from("service_packages").delete().eq("id", id)

  if (error) {
    console.error("패키지 삭제 오류:", error)
    throw new Error(`패키지를 삭제하는 중 오류가 발생했습니다: ${error.message}`)
  }

  revalidatePath("/admin/services")
  return true
}

// FAQ 추가
export async function addServiceFAQ(faqData: ServiceFAQData) {
  const supabase = createAdminClient()

  const { data, error } = await supabase.from("service_faqs").insert(faqData).select()

  if (error) {
    console.error("FAQ 추가 오류:", error)
    throw new Error(`FAQ를 추가하는 중 오류가 발생했습니다: ${error.message}`)
  }

  revalidatePath("/admin/services")
  return data[0]
}

// FAQ 수정
export async function updateServiceFAQ(id: number, faqData: ServiceFAQData) {
  const supabase = createAdminClient()

  const { error } = await supabase.from("service_faqs").update(faqData).eq("id", id)

  if (error) {
    console.error("FAQ 수정 오류:", error)
    throw new Error(`FAQ를 수정하는 중 오류가 발생했습니다: ${error.message}`)
  }

  revalidatePath("/admin/services")
  return true
}

// FAQ 삭제
export async function deleteServiceFAQ(id: number) {
  const supabase = createAdminClient()

  const { error } = await supabase.from("service_faqs").delete().eq("id", id)

  if (error) {
    console.error("FAQ 삭제 오류:", error)
    throw new Error(`FAQ를 삭제하는 중 오류가 발생했습니다: ${error.message}`)
  }

  revalidatePath("/admin/services")
  return true
}
