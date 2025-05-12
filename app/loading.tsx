import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-10 w-10 animate-spin text-rose-600" />
        <p className="text-lg font-medium text-gray-700">로딩 중...</p>
      </div>
    </div>
  )
}
