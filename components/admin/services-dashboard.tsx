"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Eye, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Service {
  id: number
  title: string
  slug: string
}

export function ServicesDashboard() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchServices() {
      try {
        setLoading(true)

        const { data, error } = await supabase
          .from("services")
          .select("id, title, slug")
          .order("id", { ascending: false })

        if (error) {
          throw new Error(`서비스 데이터를 불러오는 중 오류가 발생했습니다: ${error.message}`)
        }

        setServices(data || [])
      } catch (err: any) {
        console.error("서비스 데이터 로딩 오류:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [supabase])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 text-red-800 rounded-md">
        <p className="font-medium">오류가 발생했습니다</p>
        <p>{error}</p>
      </div>
    )
  }

  if (services.length === 0) {
    return (
      <div className="p-8 text-center border border-dashed rounded-lg">
        <p className="text-muted-foreground mb-4">등록된 서비스가 없습니다</p>
        <Button asChild>
          <Link href="/admin/services">서비스 추가하기</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {services.map((service) => (
        <Card key={service.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg font-bold line-clamp-2">{service.title}</CardTitle>
              <Badge variant="outline">ID: {service.id}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              <span className="font-medium">Slug:</span> {service.slug}
            </p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/services/${service.slug}`}>
                  <Eye className="h-4 w-4 mr-1" />
                  보기
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/services?edit=${service.id}`}>
                  <Edit className="h-4 w-4 mr-1" />
                  수정
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700">
                <Trash2 className="h-4 w-4 mr-1" />
                삭제
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
