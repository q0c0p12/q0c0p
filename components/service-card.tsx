import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { Star, Clock } from "lucide-react"

interface ServiceCardProps {
  id: number
  title: string
  description: string
  price: number
  rating: number
  reviews: number
  image: string
  seller: string
  delivery: string
  category: string
  slug?: string
  isNew?: boolean
  isRecommended?: boolean
  discountRate?: number
}

export default function ServiceCard({
  id,
  title,
  description,
  price,
  rating,
  reviews,
  image,
  seller,
  delivery,
  category,
  slug,
  isNew,
  isRecommended,
  discountRate,
}: ServiceCardProps) {
  const originalPrice = discountRate ? Math.round(price * (100 / (100 - discountRate))) : price

  return (
    <Link href={`/services/${slug || id}`}>
      <Card className="overflow-hidden border border-gray-200 hover:shadow-md transition-all duration-300 hover:border-red-200 h-full group">
        <div className="relative">
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image
              src={image || "/placeholder.svg"}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          {isRecommended && (
            <Badge className="absolute top-2 left-2 bg-gradient-to-r from-red-600 to-rose-500 text-white border-none text-xs">
              추천
            </Badge>
          )}
          {isNew && (
            <Badge className="absolute top-2 left-2 bg-gradient-to-r from-blue-600 to-indigo-500 text-white border-none text-xs">
              NEW
            </Badge>
          )}
          {discountRate && (
            <Badge className="absolute top-2 left-2 bg-gradient-to-r from-orange-500 to-red-500 text-white border-none text-xs">
              {discountRate}% 할인
            </Badge>
          )}
        </div>
        <CardContent className="p-3">
          <div className="flex items-center mb-1">
            <Badge variant="outline" className="text-xs bg-red-50 text-red-600 border-red-100 px-1.5 py-0">
              {category}
            </Badge>
            <div className="flex items-center ml-auto">
              <Star className="h-3 w-3 fill-current text-yellow-400" />
              <span className="text-xs text-gray-600 ml-0.5">{rating.toFixed(1)}</span>
              {reviews > 0 && <span className="text-xs text-gray-500 ml-0.5">({reviews})</span>}
            </div>
          </div>
          <h3 className="font-medium text-sm text-gray-900 mb-0.5 line-clamp-2 group-hover:text-red-600 transition-colors duration-300">
            {title}
          </h3>
          <p className="text-xs text-gray-500 mb-2 line-clamp-1">{description}</p>
        </CardContent>
        <CardFooter className="p-3 pt-0 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-500 flex items-center">
            <Clock className="h-3 w-3 mr-0.5" /> {delivery}
          </span>
          <div className="text-right">
            {discountRate && (
              <span className="text-xs text-gray-500 line-through">{originalPrice.toLocaleString()}원</span>
            )}
            <span className={`block font-bold text-red-600 text-sm ${discountRate ? "mt-0" : ""}`}>
              {price.toLocaleString()}원~
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
