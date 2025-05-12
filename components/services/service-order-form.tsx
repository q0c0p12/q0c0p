"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, Loader2, AlertCircle } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"
import { processOrder } from "@/app/services/actions"

interface ServicePackage {
  id: string | number
  name: string
  description: string
  price: number
  delivery_time: number | string
  features: string[] | string
  service_id?: number | string
  created_at?: string
  updated_at?: string
}

interface ServiceOrderFormProps {
  serviceId: string | number
  title: string
  basePrice?: number
  packages: ServicePackage[]
}

export function ServiceOrderForm({ serviceId, title, basePrice, packages }: ServiceOrderFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [selectedPackage, setSelectedPackage] = useState<string>("")
  const [quantity, setQuantity] = useState<number>(1)
  const [link, setLink] = useState<string>("")
  const [instructions, setInstructions] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [userPoints, setUserPoints] = useState<number>(0)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
  const [insufficientPoints, setInsufficientPoints] = useState<boolean>(false)
  const [requiredPoints, setRequiredPoints] = useState<number>(0)

  // 디버깅: 패키지 데이터 확인
  useEffect(() => {
    console.log("ServiceOrderForm - 패키지 데이터:", packages)
    console.log("ServiceOrderForm - 서비스 ID:", serviceId)
    console.log("ServiceOrderForm - 제목:", title)
    console.log("ServiceOrderForm - 기본 가격:", basePrice)
  }, [packages, serviceId, title, basePrice])

  // 패키지 데이터 준비
  const availablePackages =
    packages && packages.length > 0
      ? packages.map((pkg) => {
          // features가 문자열인 경우 배열로 변환
          let features = pkg.features
          if (typeof features === "string") {
            try {
              // JSON 문자열인 경우 파싱
              features = JSON.parse(features)
            } catch (e) {
              // 파싱 실패 시 쉼표로 분리
              features = features.split(",").map((f: string) => f.trim())
            }
          }
          // features가 없는 경우 빈 배열 설정
          if (!features) {
            features = ["기본 서비스"]
          }

          return {
            ...pkg,
            id: String(pkg.id), // ID를 문자열로 변환
            features,
          }
        })
      : []

  // 컴포넌트 마운트 시 첫 번째 패키지 선택
  useEffect(() => {
    console.log("사용 가능한 패키지:", availablePackages)
    if (availablePackages.length > 0 && !selectedPackage) {
      setSelectedPackage(String(availablePackages[0].id))
      console.log("선택된 패키지:", availablePackages[0].id)
    }
  }, [availablePackages, selectedPackage])

  // 현재 선택된 패키지 찾기
  const currentPackage = availablePackages.find((pkg) => String(pkg.id) === selectedPackage) || availablePackages[0]
  const totalPrice = currentPackage ? currentPackage.price * quantity : 0

  // 사용자 세션 및 포인트 정보 가져오기
  useEffect(() => {
    async function getUserSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setIsLoggedIn(!!session)

      if (session) {
        // 사용자 포인트 정보 가져오기
        const { data } = await supabase.from("profiles").select("points").eq("id", session.user.id).single()

        setUserPoints(data?.points || 0)
      }
    }

    getUserSession()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setInsufficientPoints(false)

    try {
      if (!isLoggedIn) {
        toast({
          title: "로그인이 필요합니다",
          description: "서비스를 주문하려면 로그인해주세요.",
          variant: "destructive",
        })
        router.push("/auth?tab=signin")
        return
      }

      if (!link) {
        toast({
          title: "링크를 입력해주세요",
          description: "서비스를 적용할 소셜 미디어 링크가 필요합니다.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      if (!currentPackage) {
        toast({
          title: "패키지를 선택해주세요",
          description: "주문할 패키지를 선택해주세요.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // 폼 데이터 생성
      const formData = new FormData()
      formData.append("serviceId", String(serviceId))
      formData.append("serviceTitle", title)
      formData.append("packageId", String(currentPackage.id))
      formData.append("packageName", currentPackage.name)
      formData.append("price", String(currentPackage.price))
      formData.append("quantity", String(quantity))
      formData.append("link", link)
      formData.append("instructions", instructions)

      console.log("주문 제출 - 패키지:", currentPackage.name)
      console.log("주문 제출 - 패키지 ID:", currentPackage.id)

      // 서버 액션 호출
      const result = await processOrder(formData)

      if (result.success) {
        toast({
          title: "주문이 성공적으로 접수되었습니다",
          description: "주문 내역은 대시보드에서 확인하실 수 있습니다.",
        })
        // 포인트 업데이트
        setUserPoints(result.newPoints)
        router.push("/dashboard/orders")
      } else {
        if (result.insufficientPoints) {
          setInsufficientPoints(true)
          setRequiredPoints(result.requiredPoints)
        }

        toast({
          title: "주문 처리 중 오류가 발생했습니다",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("주문 처리 오류:", error)
      toast({
        title: "주문 처리 중 오류가 발생했습니다",
        description: "잠시 후 다시 시도해주세요.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 패키지가 없는 경우 메시지 표시
  if (availablePackages.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>서비스 패키지</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-6">
            <p className="text-muted-foreground">등록된 패키지가 없습니다.</p>
            <p className="text-sm text-muted-foreground mt-1">관리자에게 패키지 등록을 요청해주세요.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">서비스 패키지</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue={selectedPackage || String(availablePackages[0]?.id)} onValueChange={setSelectedPackage}>
          <TabsList
            className={`grid w-full ${
              availablePackages.length > 3 ? "grid-cols-4" : `grid-cols-${availablePackages.length}`
            }`}
          >
            {availablePackages.map((pkg) => (
              <TabsTrigger key={pkg.id} value={String(pkg.id)}>
                {pkg.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {availablePackages.map((pkg) => (
            <TabsContent key={pkg.id} value={String(pkg.id)} className="p-4 pt-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">{pkg.name}</h3>
                  <div className="font-bold text-lg">{Number(pkg.price).toLocaleString()}원</div>
                </div>
                <p className="text-sm text-muted-foreground">{pkg.description}</p>
                <div className="text-sm">
                  <div className="font-medium mb-2">제공 사항:</div>
                  <ul className="space-y-1">
                    {Array.isArray(pkg.features) &&
                      pkg.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>{feature}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pt-4">
          {isLoggedIn && (
            <div className="bg-muted p-2 rounded-md text-sm">
              <p>
                현재 보유 포인트: <span className="font-bold">{userPoints.toLocaleString()}P</span>
              </p>
            </div>
          )}

          {insufficientPoints && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>포인트 부족</AlertTitle>
              <AlertDescription>
                주문에 필요한 포인트({requiredPoints.toLocaleString()}P)가 부족합니다. 현재 보유 포인트:{" "}
                {userPoints.toLocaleString()}P
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="quantity">수량</Label>
            <div className="flex items-center">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="rounded-r-none"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                -
              </Button>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number.parseInt(e.target.value) || 1)}
                className="rounded-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="rounded-l-none"
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="link">소셜 미디어 링크</Label>
            <Input
              id="link"
              placeholder="https://www.instagram.com/yourusername"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions">추가 요청사항 (선택사항)</Label>
            <Textarea
              id="instructions"
              placeholder="서비스 제공자에게 전달할 특별한 요청사항이 있으면 입력해주세요."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={3}
            />
          </div>

          <div className="rounded-lg bg-muted p-4">
            <div className="flex justify-between items-center">
              <div className="text-sm font-medium">총 결제 금액</div>
              <div className="text-xl font-bold">{totalPrice.toLocaleString()}원</div>
            </div>
            <div className="text-xs text-muted-foreground mt-1">VAT 포함</div>
          </div>
        </CardContent>

        <CardFooter>
          <Button type="submit" className="w-full bg-rose-600 hover:bg-rose-700" disabled={isLoading}>
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
