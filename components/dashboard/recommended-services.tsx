import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

export function RecommendedServices() {
  // 추천 서비스 더미 데이터
  const services = [
    {
      id: "1",
      title: "인스타그램 팔로워 증가 패키지",
      price: 25000,
      image: "/instagram-app-interface.png",
    },
    {
      id: "2",
      title: "유튜브 구독자 확보 서비스",
      price: 35000,
      image: "/youtube-homepage.png",
    },
    {
      id: "3",
      title: "페이스북 페이지 좋아요 늘리기",
      price: 18000,
      image: "/social-media-network.png",
    },
  ]

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">추천 서비스</CardTitle>
        <CardDescription>인기 있는 서비스를 확인해보세요</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {services.map((service) => (
          <div key={service.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted">
            <div className="w-16 h-16 relative rounded-md overflow-hidden flex-shrink-0">
              <Image src={service.image || "/placeholder.svg"} alt={service.title} fill className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm line-clamp-2">{service.title}</h4>
              <p className="text-rose-600 font-bold mt-1">{service.price.toLocaleString()}원~</p>
            </div>
          </div>
        ))}
        <Button variant="outline" className="w-full" asChild>
          <Link href="/services">모든 서비스 보기</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
