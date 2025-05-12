import Image from "next/image"
import Link from "next/link"

interface CategoryCardProps {
  title: string
  icon: string
  count: number
}

export default function CategoryCard({ title, icon, count }: CategoryCardProps) {
  return (
    <Link
      href={`/services?category=${encodeURIComponent(title)}`}
      className="group bg-white rounded-lg p-3 text-center hover:shadow-sm transition-all duration-300 border border-gray-100 hover:border-red-100 hover:bg-red-50/30"
    >
      <div className="flex justify-center mb-2">
        <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 rounded-full group-hover:from-red-100 group-hover:to-red-200 transition-colors duration-300">
          <Image
            src={icon || "/generic-icon.png"}
            alt={title}
            width={20}
            height={20}
            className="w-5 h-5 group-hover:scale-110 transition-transform duration-300"
          />
        </div>
      </div>
      <p className="font-medium text-sm text-gray-900 line-clamp-1 group-hover:text-red-600 transition-colors duration-300">
        {title}
      </p>
      <p className="text-xs text-gray-500 mt-0.5">{count}개 서비스</p>
    </Link>
  )
}
