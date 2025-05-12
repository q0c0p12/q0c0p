"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

// 더미 데이터
const platforms = [
  { id: "instagram", name: "인스타그램" },
  { id: "youtube", name: "유튜브" },
  { id: "facebook", name: "페이스북" },
  { id: "tiktok", name: "틱톡" },
  { id: "twitter", name: "트위터" },
]

const servicesByPlatform: Record<string, any[]> = {
  instagram: [
    { id: "followers", name: "팔로워 증가" },
    { id: "likes", name: "좋아요" },
    { id: "comments", name: "댓글" },
  ],
  youtube: [
    { id: "subscribers", name: "구독자 확보" },
    { id: "views", name: "조회수 증가" },
    { id: "likes", name: "좋아요" },
  ],
  facebook: [
    { id: "page_likes", name: "페이지 좋아요" },
    { id: "post_likes", name: "게시물 좋아요" },
    { id: "followers", name: "팔로워 증가" },
  ],
  tiktok: [
    { id: "followers", name: "팔로워 증가" },
    { id: "likes", name: "좋아요" },
    { id: "views", name: "조회수 증가" },
  ],
  twitter: [
    { id: "followers", name: "팔로워 증가" },
    { id: "retweets", name: "리트윗" },
    { id: "likes", name: "좋아요" },
  ],
}

const detailsByService: Record<string, any[]> = {
  followers: [
    { id: "basic", name: "기본 패키지", price: 25 },
    { id: "premium", name: "프리미엄 패키지", price: 40 },
    { id: "vip", name: "VIP 패키지", price: 60 },
  ],
  likes: [
    { id: "basic", name: "기본 패키지", price: 15 },
    { id: "premium", name: "프리미엄 패키지", price: 25 },
    { id: "vip", name: "VIP 패키지", price: 40 },
  ],
  comments: [
    { id: "basic", name: "기본 패키지", price: 30 },
    { id: "premium", name: "프리미엄 패키지", price: 50 },
    { id: "vip", name: "VIP 패키지", price: 80 },
  ],
  subscribers: [
    { id: "basic", name: "기본 패키지", price: 35 },
    { id: "premium", name: "프리미엄 패키지", price: 60 },
    { id: "vip", name: "VIP 패키지", price: 100 },
  ],
  views: [
    { id: "basic", name: "기본 패키지", price: 20 },
    { id: "premium", name: "프리미엄 패키지", price: 35 },
    { id: "vip", name: "VIP 패키지", price: 55 },
  ],
  page_likes: [
    { id: "basic", name: "기본 패키지", price: 18 },
    { id: "premium", name: "프리미엄 패키지", price: 30 },
    { id: "vip", name: "VIP 패키지", price: 50 },
  ],
  post_likes: [
    { id: "basic", name: "기본 패키지", price: 15 },
    { id: "premium", name: "프리미엄 패키지", price: 25 },
    { id: "vip", name: "VIP 패키지", price: 40 },
  ],
  retweets: [
    { id: "basic", name: "기본 패키지", price: 22 },
    { id: "premium", name: "프리미엄 패키지", price: 38 },
    { id: "vip", name: "VIP 패키지", price: 60 },
  ],
}

export function OrderForm() {
  const [platform, setPlatform] = useState("")
  const [service, setService] = useState("")
  const [detail, setDetail] = useState("")
  const [link, setLink] = useState("")
  const [quantity, setQuantity] = useState(1000)
  const [totalPrice, setTotalPrice] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  // 서비스 선택에 따른 가격 계산
  useEffect(() => {
    if (detail && quantity) {
      const selectedDetail = detailsByService[service]?.find((d) => d.id === detail)
      if (selectedDetail) {
        const price = selectedDetail.price * (quantity / 1000)
        setTotalPrice(price)
      }
    } else {
      setTotalPrice(0)
    }
  }, [detail, quantity, service])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!platform || !service || !detail || !link || !quantity) {
      toast({
        title: "모든 필드를 입력해주세요",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // 주문 처리 시뮬레이션
    setTimeout(() => {
      toast({
        title: "주문이 성공적으로 접수되었습니다",
        description: `주문번호: ORD-${Math.floor(Math.random() * 1000)}`,
      })

      // 폼 초기화
      setPlatform("")
      setService("")
      setDetail("")
      setLink("")
      setQuantity(1000)
      setTotalPrice(0)

      setIsLoading(false)
    }, 1500)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>서비스 주문</CardTitle>
        <CardDescription>원하는 서비스를 선택하고 주문하세요</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="platform">플랫폼</Label>
              <Select
                value={platform}
                onValueChange={(value) => {
                  setPlatform(value)
                  setService("")
                  setDetail("")
                }}
              >
                <SelectTrigger id="platform">
                  <SelectValue placeholder="플랫폼 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>플랫폼</SelectLabel>
                    {platforms.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="service">서비스</Label>
              <Select
                value={service}
                onValueChange={(value) => {
                  setService(value)
                  setDetail("")
                }}
                disabled={!platform}
              >
                <SelectTrigger id="service">
                  <SelectValue placeholder="서비스 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>서비스</SelectLabel>
                    {platform &&
                      servicesByPlatform[platform]?.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="detail">상세 서비스</Label>
              <Select value={detail} onValueChange={setDetail} disabled={!service}>
                <SelectTrigger id="detail">
                  <SelectValue placeholder="상세 서비스 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>상세 서비스</SelectLabel>
                    {service &&
                      detailsByService[service]?.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name} ({d.price}원/1000개)
                        </SelectItem>
                      ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="link">링크</Label>
            <Input
              id="link"
              placeholder="https://www.instagram.com/yourusername"
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">수량</Label>
            <Input
              id="quantity"
              type="number"
              min="1000"
              step="1000"
              value={quantity}
              onChange={(e) => setQuantity(Number.parseInt(e.target.value))}
            />
          </div>

          <div className="rounded-lg bg-muted p-4">
            <div className="text-sm font-medium">예상 금액</div>
            <div className="mt-2 text-2xl font-bold">{totalPrice.toLocaleString()}원</div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full bg-rose-600 hover:bg-rose-700"
            disabled={isLoading || !platform || !service || !detail || !link || !quantity}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 주문 처리 중...
              </>
            ) : (
              "주문하기"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
