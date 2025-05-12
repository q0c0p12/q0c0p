import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { ChevronRight, Star } from "lucide-react"
import { HeroSection } from "@/components/ui/hero-section"
import ServiceCard from "@/components/service-card"
import CategoryCard from "@/components/category-card"

// 정적 데이터 (API 오류 시 사용)
const staticCategories = [
  { id: 1, name: "인스타그램", icon_url: "/instagram-icon.png" },
  { id: 2, name: "유튜브", icon_url: "/youtube-icon.png" },
  { id: 3, name: "페이스북", icon_url: "/facebook-icon.png" },
  { id: 4, name: "틱톡", icon_url: "/tiktok-icon.png" },
  { id: 5, name: "트위터", icon_url: "/twitter-icon.png" },
  { id: 6, name: "링크드인", icon_url: "/linkedin-icon.png" },
]

const staticServices = Array(24)
  .fill(null)
  .map((_, index) => ({
    id: index + 1,
    title: `소셜 미디어 서비스 ${index + 1}`,
    description: "소셜 미디어 마케팅 서비스입니다.",
    base_price: 50000 + index * 10000,
    image_url:
      index % 6 === 0
        ? "/instagram-icon.png"
        : index % 6 === 1
          ? "/youtube-icon.png"
          : index % 6 === 2
            ? "/facebook-icon.png"
            : index % 6 === 3
              ? "/tiktok-icon.png"
              : index % 6 === 4
                ? "/twitter-icon.png"
                : "/linkedin-icon.png",
    delivery_time: 3 + (index % 5),
    slug: `service-${index + 1}`,
    categories: { name: "소셜 미디어" },
  }))

// 인기 검색어 (정적 데이터)
const popularSearches = [
  "인스타그램 팔로워",
  "유튜브 구독자",
  "페이스북 좋아요",
  "틱톡 팔로워",
  "트위터 홍보",
  "소셜미디어 패키지",
]

export default function Home() {
  // 기본적으로 정적 데이터 사용
  const categories = staticCategories
  const services = staticServices
  const categoryCountMap = new Map(staticCategories.map((cat) => [cat.id, 10]))

  // 추천 서비스 (서비스 중 일부를 추천으로 표시)
  const recommendedServices = services.slice(0, 8)

  // 신규 서비스 (서비스 중 일부를 신규로 표시)
  const newServices = services.slice(8, 16)

  // 특가 서비스 (서비스 중 일부를 특가로 표시)
  const discountServices = services.slice(16, 24)

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* 히어로 섹션 */}
      <HeroSection popularSearches={popularSearches} categories={categories} />

      {/* 카테고리 섹션 */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">카테고리</h2>
            <Link href="/services" className="text-sm text-gray-600 hover:text-red-500 flex items-center">
              전체보기 <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                title={category.name}
                icon={category.icon_url || "/generic-icon.png"}
                count={categoryCountMap.get(category.id) || 0}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 요즘 인기있어요 섹션 */}
      <section className="py-8 border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <h2 className="text-xl font-bold text-gray-900">요즘 인기있어요</h2>
              <Badge className="ml-2 bg-red-100 text-red-600 hover:bg-red-200">HOT</Badge>
            </div>
            <Link href="/services?sort=popular" className="text-sm text-gray-600 hover:text-red-500 flex items-center">
              전체보기 <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {recommendedServices.map((service) => (
              <ServiceCard
                key={service.id}
                id={service.id}
                title={service.title}
                description={service.description}
                price={service.base_price}
                rating={4.9}
                reviews={Math.floor(Math.random() * 100)}
                image={service.image_url || "/placeholder.svg?key=oj0rw"}
                seller="판매자"
                delivery={`${service.delivery_time}일`}
                category={service.categories?.name || "기타"}
                slug={service.slug}
                isRecommended={service.id % 3 === 0}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 최근 본 서비스 섹션 */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <h2 className="text-xl font-bold text-gray-900">최근 본 서비스</h2>
            </div>
            <Link href="/history" className="text-sm text-gray-600 hover:text-red-500 flex items-center">
              전체보기 <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {newServices.map((service) => (
              <ServiceCard
                key={service.id}
                id={service.id}
                title={service.title}
                description={service.description}
                price={service.base_price}
                rating={4.8}
                reviews={Math.floor(Math.random() * 50)}
                image={service.image_url || "/placeholder.svg?key=oj0rw"}
                seller="판매자"
                delivery={`${service.delivery_time}일`}
                category={service.categories?.name || "기타"}
                slug={service.slug}
                isNew={service.id % 4 === 0}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 맞춤형 서비스 섹션 */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <h2 className="text-xl font-bold text-gray-900">맞춤형 서비스</h2>
              <Badge className="ml-2 bg-blue-100 text-blue-600 hover:bg-blue-200">추천</Badge>
            </div>
            <Link
              href="/services?recommended=true"
              className="text-sm text-gray-600 hover:text-red-500 flex items-center"
            >
              전체보기 <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {discountServices.map((service, index) => {
              // 임의의 할인율 생성 (실제로는 DB에서 가져와야 함)
              const discountRate = [15, 20, 30, 25][index % 4]

              return (
                <ServiceCard
                  key={service.id}
                  id={service.id}
                  title={service.title}
                  description={service.description}
                  price={service.base_price}
                  rating={4.7}
                  reviews={Math.floor(Math.random() * 30)}
                  image={service.image_url || "/placeholder.svg?key=oj0rw"}
                  seller="판매자"
                  delivery={`${service.delivery_time}일`}
                  category={service.categories?.name || "기타"}
                  slug={service.slug}
                  discountRate={discountRate}
                />
              )
            })}
          </div>
        </div>
      </section>

      {/* 비즈니스 섹션 */}
      <section className="py-12 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">믿을 수 있는 비즈니스 파트너</h2>
            <p className="text-gray-300 text-lg mb-8">기업 맞춤형 아웃소싱 솔루션</p>
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold">비즈니스 시작하기</Button>
          </div>
        </div>
      </section>

      {/* 이용 방법 섹션 */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-10">쉽고, 간편한, 안전하게</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-red-500">1</span>
              </div>
              <h3 className="text-lg font-bold mb-2">서비스 찾기</h3>
              <p className="text-gray-600">원하는 서비스를 검색하고 전문가를 찾아보세요</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-red-500">2</span>
              </div>
              <h3 className="text-lg font-bold mb-2">의뢰하기</h3>
              <p className="text-gray-600">원하는 서비스를 요청하고 견적을 받아보세요</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-red-500">3</span>
              </div>
              <h3 className="text-lg font-bold mb-2">안전 결제</h3>
              <p className="text-gray-600">Q0c0P 안전결제로 믿고 거래하세요</p>
            </div>
          </div>
        </div>
      </section>

      {/* 고객 후기 섹션 */}
      <section className="py-10 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">고객 후기</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "김지민",
                role: "패션 브랜드 마케팅 담당자",
                image: "/testimonial-1.png",
                content:
                  "Q0c0P의 인스타그램 마케팅 서비스를 통해 팔로워가 3개월 만에 2배 이상 증가했습니다. 판매량도 30% 상승했어요. 정말 만족스러운 결과였습니다!",
              },
              {
                name: "이준호",
                role: "스타트업 CEO",
                image: "/testimonial-2.png",
                content:
                  "유튜브 채널 성장에 어려움을 겪고 있었는데, Q0c0P의 전문가들 덕분에 구독자가 빠르게 늘어났습니다. 콘텐츠 전략부터 SEO까지 모든 면에서 큰 도움이 되었어요.",
              },
              {
                name: "박서연",
                role: "프리랜서 디자이너",
                image: "/testimonial-3.png",
                content:
                  "페이스북과 인스타그램 광고 캠페인을 Q0c0P를 통해 진행했는데, ROI가 예상보다 훨씬 높았습니다. 타겟팅과 콘텐츠 퀄리티가 정말 좋았어요.",
              },
            ].map((review, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-200"
              >
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden mr-4">
                    <Image
                      src={review.image || `/placeholder.svg?height=48&width=48&query=person`}
                      alt={review.name}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{review.name}</h4>
                    <p className="text-sm text-gray-600">{review.role}</p>
                  </div>
                </div>
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700">{review.content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="py-12 bg-gradient-to-r from-red-500 to-red-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">지금 바로 시작하세요</h2>
            <p className="text-white/90 text-lg mb-8">
              Q0c0P에서 소셜 미디어 마케팅의 새로운 경험을 만나보세요. 지금 가입하고 특별 할인 혜택을 받아보세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-red-600 hover:bg-gray-100 rounded-md">
                <Link href="/services">서비스 둘러보기</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white/10 rounded-md"
              >
                <Link href="/auth?tab=signup">회원가입하기</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <span className="text-red-500 mr-2">Q0c0P</span>
              </h3>
              <p className="text-gray-400 mb-4">소셜 미디어 마케팅 서비스를 한 곳에서 쉽고 빠르게 이용하세요.</p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">서비스</h3>
              <ul className="space-y-2 text-gray-400">
                {categories.slice(0, 5).map((category) => (
                  <li key={category.id}>
                    <Link
                      href={`/services?category=${encodeURIComponent(category.name)}`}
                      className="hover:text-red-400 transition-colors"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">고객지원</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-red-400 transition-colors">
                    자주 묻는 질문
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-red-400 transition-colors">
                    이용 가이드
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-red-400 transition-colors">
                    문의하기
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-red-400 transition-colors">
                    이용약관
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-red-400 transition-colors">
                    개인정보처리방침
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">뉴스레터 구독</h3>
              <p className="text-gray-400 mb-4">최신 소식과 프로모션 정보를 받아보세요.</p>
              <div className="flex gap-2">
                <Input
                  placeholder="이메일 주소"
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-red-500 focus:ring-red-500"
                />
                <Button className="bg-red-600 hover:bg-red-700">구독</Button>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2025 Q0c0P. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
