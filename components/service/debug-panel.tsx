"use client"

import { useState } from "react"

interface DebugInfoProps {
  debugData: any
}

export function DebugPanel({ debugData }: DebugInfoProps) {
  const [isVisible, setIsVisible] = useState(false)

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
      <pre className="text-sm">{JSON.stringify(debugData, null, 2)}</pre>
      <button
        className="mt-3 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
        onClick={() => {
          window.location.reload()
        }}
      >
        페이지 새로고침
      </button>
    </div>
  )
}
