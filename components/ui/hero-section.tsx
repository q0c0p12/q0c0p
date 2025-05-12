"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import Link from "next/link"
import { Search } from "lucide-react"

// 애니메이션 스타일 정의
const animationStyles = `
  @keyframes fadeIn {
    0% { opacity: 0; transform: translateY(10px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  .animate-fadeIn {
    animation: fadeIn 0.8s ease-out forwards;
  }
`

interface Category {
  id: number
  name: string
  icon_url?: string
}

interface HeroSectionProps {
  popularSearches: string[]
  categories: Category[]
}

export function HeroSection({ popularSearches, categories }: HeroSectionProps) {
  return (
    <section className="relative bg-white text-gray-900">
      <style jsx global>
        {animationStyles}
      </style>

      {/* 메인 검색 영역 */}
      <div className="container mx-auto px-4 py-8 flex flex-col items-center animate-fadeIn">
        <div className="max-w-2xl w-full">
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              placeholder="어떤 서비스가 필요하세요?"
              className="w-full bg-white border-gray-300 rounded-full pl-10 pr-4 py-6 text-gray-900 placeholder:text-gray-500 focus:ring-red-500 focus:border-red-500"
            />
          </div>
        </div>

        {/* 인기 검색어 */}
        <div className="flex flex-wrap gap-2 mt-4 justify-center">
          <span className="text-gray-500 text-sm">인기 검색어:</span>
          {popularSearches.map((term, index) => (
            <Link
              key={index}
              href={`/services?search=${encodeURIComponent(term)}`}
              className="text-sm text-gray-700 hover:text-red-500 transition-colors"
            >
              {term}
              {index < popularSearches.length - 1 && ","}
            </Link>
          ))}
        </div>
      </div>

      {/* 카테고리 영역 */}
      <div className="container mx-auto px-4 py-6 animate-fadeIn" style={{ animationDelay: "0.2s" }}>
        <div className="flex justify-center flex-wrap gap-4 md:gap-6">
          {categories.slice(0, 10).map((category) => (
            <Link
              href={`/services?category=${encodeURIComponent(category.name)}`}
              key={category.id}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center bg-gray-100 rounded-full group-hover:bg-red-50 transition-colors">
                <Image
                  src={category.icon_url || "/generic-icon.png"}
                  alt={category.name}
                  width={24}
                  height={24}
                  className="w-6 h-6 md:w-7 md:h-7 group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <span className="text-xs text-center group-hover:text-red-500 transition-colors">{category.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* 배너 영역 */}
      <div className="container mx-auto px-4 py-4 animate-fadeIn" style={{ animationDelay: "0.4s" }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 flex items-center">
            <div className="text-white">
              <h3 className="text-xl font-bold">성공이 필요한 순간,</h3>
              <p className="text-lg font-bold mt-1">딱 맞는 전문가를 찾아보세요</p>
              <Button className="mt-4 bg-white text-red-600 hover:bg-gray-100">시작하기</Button>
            </div>
            <div className="ml-auto">
              <Image src="/service-selection.png" alt="서비스 선택" width={120} height={120} />
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-6 flex flex-col justify-center">
            <Badge className="bg-blue-500 text-white w-fit mb-2">NEW</Badge>
            <h3 className="text-lg font-bold text-gray-900">비즈니스 솔루션</h3>
            <p className="text-sm text-gray-600 mt-1">기업 맞춤형 서비스를 만나보세요</p>
            <Button variant="outline" className="mt-4 border-blue-500 text-blue-500 hover:bg-blue-50">
              자세히 보기
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
