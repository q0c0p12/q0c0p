import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Star, Clock } from "lucide-react"
import Image from "next/image"
import { ServiceOrderForm } from "@/components/services/service-order-form"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { ServicePackages } from "@/components/service/service-packages"
import { DebugPanel } from "@/components/service/debug-panel"

export default async function ServiceDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const supabase = createClient()

  // 1. 먼저 ID가 숫자인지 확인
  const isNumericId = !isNaN(Number(id))
  let serviceId = isNumericId ? Number(id) : 0
  let service = null
  let serviceError = null

  console.log("URL 파라미터:", id)
  console.log("숫자 ID 여부:", isNumericId)
  console.log("초기 서비스 ID:", serviceId)

  // 2. ID가 숫자인 경우 직접 ID로 서비스 조회
  if (isNumericId) {
    const { data, error } = await supabase
      .from("services")
      .select(`
        id, 
        title, 
        description, 
        base_price, 
        image_url, 
        delivery_time,
        slug,
        categories(id, name)
      `)
      .eq("id", serviceId)
      .single()

    service = data
    serviceError = error
    console.log("숫자 ID로 조회:", serviceId, "결과:", data ? "성공" : "실패")
  }
  // 3. ID가 숫자가 아닌 경우 슬러그로 서비스 조회
  else {
    const { data, error } = await supabase
      .from("services")
      .select(`
        id, 
        title, 
        description, 
        base_price, 
        image_url, 
        delivery_time,
        slug,
        categories(id, name)
      `)
      .eq("slug", id)
      .single()

    service = data
    serviceError = error

    if (data) {
      serviceId = data.id
      console.log("슬러그로 조회 후 서비스 ID 업데이트:", serviceId)
    }

    console.log("슬러그로 조회:", id, "결과:", data ? "성공" : "실패")
  }

  // 4. 서비스가 없으면 404 페이지 표시
  if (serviceError || !service) {
    console.error("서비스 조회 오류:", serviceError)
    notFound()
  }

  console.log("조회된 서비스:", service)
  console.log("서비스 ID:", serviceId, "타입:", typeof serviceId)

  // 5. 서비스 ID로 패키지 조회 - 간단하게 직접 쿼리 사용
  console.log("패키지 조회 시작 - 서비스 ID:", serviceId, "타입:", typeof serviceId)

  const { data: packages, error: packagesError } = await supabase
    .from("service_packages")
    .select("*")
    .eq("service_id", serviceId)

  console.log("패키지 조회 완료 - 결과:", packages ? `${packages.length}개 패키지 조회됨` : "패키지 없음")

  if (packagesError) {
    console.error("패키지 조회 오류:", packagesError)
  }

  // 패키지 데이터 로깅
  if (packages && packages.length > 0) {
    console.log("조회된 패키지 목록:")
    packages.forEach((pkg, index) => {
      console.log(`패키지 ${index + 1}:`, {
        id: pkg.id,
        name: pkg.name,
        service_id: pkg.service_id,
        service_id_type: typeof pkg.service_id,
      })
    })
  } else {
    console.log("조회된 패키지가 없습니다.")
  }

  // 9. 서비스 FAQ 조회
  const { data: faqs } = await supabase
    .from("service_faqs")
    .select("*")
    .eq("service_id", serviceId)
    .order("display_order")

  // 10. 임시 리뷰 데이터
  const reviews = []

  // 디버깅 데이터 준비
  const debugData = {
    urlParam: id,
    isNumericId,
    serviceId,
    serviceIdType: typeof serviceId,
    packagesCount: packages?.length || 0,
    packagesData: packages,
    packagesError: packagesError ? packagesError.message : null,
  }

  return (
    <div className="container py-8">
      {/* 디버깅 정보 */}
      <DebugPanel debugData={debugData} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 서비스 정보 */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-4">{service.title}</h1>
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <Badge variant="outline">{service.categories?.name || "기타"}</Badge>
              <div className="flex items-center text-amber-500">
                <Star className="h-4 w-4 fill-current mr-1" />
                <span>4.8</span>
                <span className="text-muted-foreground ml-1">(0)</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <Clock className="h-4 w-4 mr-1" />
                <span>{service.delivery_time}일 내 제공</span>
              </div>
            </div>
          </div>

          <div className="aspect-video relative rounded-lg overflow-hidden">
            <Image
              src={service.image_url || "/social-media-marketing.png"}
              alt={service.title}
              fill
              className="object-cover"
              priority
            />
          </div>

          <Tabs defaultValue="description">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="description">서비스 설명</TabsTrigger>
              <TabsTrigger value="packages">패키지 정보</TabsTrigger>
              <TabsTrigger value="faq">자주 묻는 질문</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="space-y-4">
              <div className="prose max-w-none">
                <p>{service.description}</p>
              </div>
            </TabsContent>
            <TabsContent value="packages" className="space-y-4">
              <ServicePackages packages={packages || []} serviceId={serviceId} />
            </TabsContent>
            <TabsContent value="faq" className="space-y-4">
              {faqs && faqs.length > 0 ? (
                <div className="space-y-4">
                  {faqs.map((faq) => (
                    <div key={faq.id} className="border rounded-lg p-4">
                      <h3 className="font-bold mb-2">Q: {faq.question}</h3>
                      <p className="text-muted-foreground">A: {faq.answer}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">등록된 FAQ가 없습니다.</p>
              )}
            </TabsContent>
          </Tabs>

          <div>
            <h2 className="text-2xl font-bold mb-4">리뷰</h2>
            {reviews && reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border rounded-lg p-4">
                    {/* 리뷰 내용 */}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">아직 리뷰가 없습니다.</p>
            )}
          </div>
        </div>

        {/* 주문 폼 */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <ServiceOrderForm
              serviceId={serviceId}
              title={service.title}
              basePrice={service.base_price}
              packages={packages || []}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
