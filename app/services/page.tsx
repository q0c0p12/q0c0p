import { createClient } from "@/lib/supabase/server"
import ServicesClient from "@/components/services/services-client"

interface SearchParams {
  category?: string
  search?: string
  sort?: string
}

export default async function ServicesPage({ searchParams }: { searchParams: SearchParams }) {
  const { category, search, sort = "newest" } = searchParams

  const supabase = createClient()

  // 카테고리 목록 가져오기
  const { data: categories } = await supabase.from("categories").select("id, name").order("name")

  // 서비스 쿼리 구성
  let query = supabase.from("services").select(`
      id, 
      title, 
      description, 
      base_price, 
      image_url, 
      delivery_time,
      slug,
      categories(id, name)
    `)

  // 카테고리 필터 적용
  if (category) {
    const { data: categoryData } = await supabase.from("categories").select("id").eq("name", category).single()

    if (categoryData) {
      query = query.eq("category_id", categoryData.id)
    }
  }

  // 검색어 필터 적용
  if (search) {
    query = query.ilike("title", `%${search}%`)
  }

  // 정렬 적용
  if (sort === "newest") {
    query = query.order("id", { ascending: false })
  } else if (sort === "price_low") {
    query = query.order("base_price", { ascending: true })
  } else if (sort === "price_high") {
    query = query.order("base_price", { ascending: false })
  }

  const { data: services, error } = await query

  if (error) {
    console.error("서비스 조회 오류:", error)
  }

  return (
    <ServicesClient
      services={services || []}
      categories={categories || []}
      currentCategory={category}
      currentSearch={search}
      currentSort={sort}
      error={error ? error.message : null}
    />
  )
}
