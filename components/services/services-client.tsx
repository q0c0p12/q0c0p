"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import ServiceCard from "@/components/service-card"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface Category {
  id: number
  name: string
}

interface Service {
  id: number
  title: string
  description: string
  base_price: number
  image_url: string
  delivery_time: number
  slug: string
  categories: {
    id: number
    name: string
  }
}

interface ServicesClientProps {
  services: Service[]
  categories: Category[]
  currentCategory?: string
  currentSearch?: string
  currentSort?: string
  error: string | null
}

export default function ServicesClient({
  services,
  categories,
  currentCategory,
  currentSearch,
  currentSort = "newest",
  error,
}: ServicesClientProps) {
  const router = useRouter()
  const [search, setSearch] = useState(currentSearch || "")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (currentCategory) params.set("category", currentCategory)
    if (currentSort) params.set("sort", currentSort)

    router.push(`/services?${params.toString()}`)
  }

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams()
    if (currentSearch) params.set("search", currentSearch)
    if (currentCategory) params.set("category", currentCategory)
    params.set("sort", e.target.value)

    router.push(`/services?${params.toString()}`)
  }

  const handleCategoryClick = (category?: string) => {
    const params = new URLSearchParams()
    if (currentSearch) params.set("search", currentSearch)
    if (category) params.set("category", category)
    if (currentSort) params.set("sort", currentSort)

    router.push(`/services?${params.toString()}`)
  }

  return (
    <div className="container-fluid px-2 py-2">
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold">서비스 목록</h1>
          <p className="text-sm text-muted-foreground">다양한 소셜 미디어 마케팅 서비스를 찾아보세요</p>
        </div>

        {/* 검색 및 필터 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-2">
            <form className="flex gap-2" onSubmit={handleSearch}>
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="서비스 검색..."
                className="flex-1"
              />
              <Button type="submit">검색</Button>
            </form>
          </div>
          <div className="flex gap-2">
            <select value={currentSort} onChange={handleSortChange} className="w-full p-2 border rounded-md">
              <option value="newest">최신순</option>
              <option value="price_low">가격 낮은순</option>
              <option value="price_high">가격 높은순</option>
            </select>
          </div>
        </div>

        {/* 카테고리 필터 */}
        <div className="flex flex-wrap gap-2">
          <Button variant={!currentCategory ? "default" : "outline"} size="sm" onClick={() => handleCategoryClick()}>
            전체
          </Button>

          {categories &&
            categories.map((cat) => (
              <Button
                key={cat.id}
                variant={currentCategory === cat.name ? "default" : "outline"}
                size="sm"
                onClick={() => handleCategoryClick(cat.name)}
              >
                {cat.name}
              </Button>
            ))}
        </div>

        {/* 서비스 목록 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 mt-2">
          {error ? (
            <div className="col-span-full text-center py-12">
              <h3 className="text-lg font-medium mb-2">오류가 발생했습니다</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button asChild variant="outline">
                <a href="/services">새로고침</a>
              </Button>
            </div>
          ) : services && services.length > 0 ? (
            services.map((service) => (
              <ServiceCard
                key={service.id}
                id={service.id}
                title={service.title}
                description={service.description}
                price={service.base_price}
                rating={4.7} // 임시 평점 (추후 실제 리뷰 데이터로 대체)
                reviews={0} // 임시 리뷰 수 (추후 실제 리뷰 데이터로 대체)
                image={service.image_url || "/placeholder.svg?height=200&width=300"}
                seller={"판매자"} // 추후 실제 판매자 정보로 대체
                delivery={`${service.delivery_time}일`}
                category={service.categories?.name || "기타"}
                slug={service.slug}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <h3 className="text-lg font-medium mb-2">검색 결과가 없습니다</h3>
              <p className="text-muted-foreground mb-4">다른 검색어나 필터를 사용해보세요</p>
              <Button asChild variant="outline">
                <a href="/services">모든 서비스 보기</a>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
