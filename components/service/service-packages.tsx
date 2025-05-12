"use client"

import { CheckCircle, Clock } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useState, useEffect } from "react"

interface ServicePackage {
  id: string | number
  name: string
  description: string
  price: number
  delivery_time: number | string
  features: string[] | string
  service_id: number | string
}

interface ServicePackagesProps {
  packages: ServicePackage[]
  serviceId: number | string
}

export function ServicePackages({ packages, serviceId }: ServicePackagesProps) {
  const [showDebug, setShowDebug] = useState(false)

  // 컴포넌트 마운트 시 로깅
  useEffect(() => {
    console.log("ServicePackages 컴포넌트 마운트")
    console.log("서비스 ID:", serviceId, "타입:", typeof serviceId)
    console.log("전달받은 패키지 수:", packages?.length || 0)

    if (packages && packages.length > 0) {
      console.log("패키지 목록:", packages)
    } else {
      console.log("패키지가 없습니다.")
    }
  }, [packages, serviceId])

  // 패키지 데이터 준비 및 features 필드 처리
  const processedPackages = packages.map((pkg) => {
    // features가 문자열인 경우 배열로 변환
    let features = pkg.features
    if (typeof features === "string") {
      try {
        // JSON 문자열인 경우 파싱
        features = JSON.parse(features)
      } catch (e) {
        // 파싱 실패 시 쉼표로 분리
        features = features.split(",").map((f) => f.trim())
      }
    }
    // features가 없는 경우 빈 배열 설정
    if (!features) {
      features = ["기본 서비스"]
    }

    return {
      ...pkg,
      features,
    }
  })

  console.log("처리된 패키지 수:", processedPackages.length)

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">패키지 정보</h3>
        <button onClick={() => setShowDebug(!showDebug)} className="text-sm text-gray-500 hover:text-gray-700">
          {showDebug ? "디버깅 정보 숨기기" : "디버깅 정보 보기"}
        </button>
      </div>

      {showDebug && (
        <div className="bg-yellow-50 p-4 mb-4 rounded-md">
          <h4 className="font-bold mb-2">패키지 디버깅 정보</h4>
          <p>
            서비스 ID: {serviceId} (타입: {typeof serviceId})
          </p>
          <p>원본 패키지 수: {packages?.length || 0}</p>
          <p>처리된 패키지 수: {processedPackages.length}</p>
          <pre className="text-xs mt-2 bg-gray-100 p-2 rounded overflow-auto max-h-40">
            {JSON.stringify(packages, null, 2)}
          </pre>
        </div>
      )}

      {processedPackages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {processedPackages.map((pkg) => (
            <div key={pkg.id} className="border rounded-lg p-4">
              <h3 className="font-bold text-lg mb-2">{pkg.name}</h3>
              <p className="text-muted-foreground mb-4">{pkg.description}</p>
              <div className="text-xl font-bold mb-2">{Number(pkg.price).toLocaleString()}원</div>
              <div className="flex items-center text-muted-foreground mb-4">
                <Clock className="h-4 w-4 mr-1" />
                <span>{pkg.delivery_time}일 내 제공</span>
              </div>
              <div className="space-y-2">
                {Array.isArray(pkg.features) &&
                  pkg.features.map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Alert>
          <AlertTitle>패키지 정보</AlertTitle>
          <AlertDescription>
            등록된 패키지가 없습니다. 관리자에게 패키지 등록을 요청해주세요.
            <br />
            현재 서비스 ID: {serviceId}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
