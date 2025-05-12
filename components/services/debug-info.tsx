"use client"

import { useState } from "react"

interface Package {
  id: string | number
  name: string
  service_id: string | number
  description?: string
  price?: number
  delivery_time?: number | string
  features?: string[]
}

interface DebugInfoProps {
  serviceId: string | number
  packages: Package[]
}

export function DebugInfo({ serviceId, packages }: DebugInfoProps) {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) {
    return (
      <button
        className="bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 mb-4"
        onClick={() => setIsVisible(true)}
      >
        디버깅 정보 표시
      </button>
    )
  }

  return (
    <div className="bg-yellow-100 p-4 mb-4 rounded-md">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-bold">디버깅 정보</h2>
        <button className="text-gray-500 hover:text-gray-700" onClick={() => setIsVisible(false)}>
          닫기
        </button>
      </div>
      <p>
        서비스 ID: {serviceId} (타입: {typeof serviceId})
      </p>
      <p>패키지 수: {packages?.length || 0}</p>
      {packages && packages.length > 0 ? (
        <div className="mt-2">
          <p className="font-semibold">패키지 정보:</p>
          <ul className="list-disc pl-5">
            {packages.map((pkg) => (
              <li key={pkg.id}>
                ID: {pkg.id}, 이름: {pkg.name}, 서비스 ID: {pkg.service_id} (타입: {typeof pkg.service_id}), 일치 여부:{" "}
                {Number(pkg.service_id) === Number(serviceId) ? "✅" : "❌"}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-red-500">패키지가 없습니다.</p>
      )}
      <button
        className="mt-3 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
        onClick={() => {
          // 페이지 새로고침
          window.location.reload()
        }}
      >
        페이지 새로고침
      </button>
    </div>
  )
}
