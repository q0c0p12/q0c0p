"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { submitConsultation } from "@/app/consultation/actions"

// 카테고리 타입 정의
type Category = {
  id: string
  name: string
  slug: string
}

const consultationFormSchema = z.object({
  name: z.string().min(2, {
    message: "이름은 2글자 이상이어야 합니다.",
  }),
  email: z.string().email({
    message: "유효한 이메일 주소를 입력해주세요.",
  }),
  phone: z.string().min(10, {
    message: "유효한 전화번호를 입력해주세요.",
  }),
  company: z.string().optional(),
  serviceType: z.string({
    required_error: "서비스 유형을 선택해주세요.",
  }),
  message: z.string().min(10, {
    message: "문의 내용은 10글자 이상이어야 합니다.",
  }),
})

type ConsultationFormValues = z.infer<typeof consultationFormSchema>

interface ConsultationFormProps {
  categories: Category[]
}

export function ConsultationForm({ categories = [] }: ConsultationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const router = useRouter()

  const form = useForm<ConsultationFormValues>({
    resolver: zodResolver(consultationFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      serviceType: "",
      message: "",
    },
  })

  async function onSubmit(data: ConsultationFormValues) {
    setIsSubmitting(true)
    setFormError(null)

    try {
      // FormData 객체 생성
      const formData = new FormData()
      formData.append("name", data.name)
      formData.append("email", data.email)
      formData.append("phone", data.phone)
      if (data.company) formData.append("company", data.company)
      formData.append("serviceType", data.serviceType)
      formData.append("message", data.message)

      // 서버 액션 호출
      const result = await submitConsultation(formData)

      if (result.success) {
        // 성공 메시지 표시
        toast({
          title: "상담신청이 완료되었습니다",
          description: "빠른 시일 내에 답변 드리겠습니다.",
        })

        // 폼 초기화
        form.reset()

        // 3초 후 홈페이지로 리다이렉트
        setTimeout(() => {
          router.push("/")
        }, 3000)
      } else {
        // 오류 메시지 표시
        setFormError(result.error || "상담신청 처리 중 오류가 발생했습니다")
        toast({
          title: "오류가 발생했습니다",
          description: result.error || "잠시 후 다시 시도해주세요.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("상담신청 제출 오류:", error)
      setFormError("상담신청 처리 중 오류가 발생했습니다")
      toast({
        title: "오류가 발생했습니다",
        description: "잠시 후 다시 시도해주세요.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // 기본 서비스 유형 목록
  const defaultServiceTypes = [
    { id: "instagram", name: "인스타그램 마케팅" },
    { id: "facebook", name: "페이스북 마케팅" },
    { id: "youtube", name: "유튜브 마케팅" },
    { id: "tiktok", name: "틱톡 마케팅" },
    { id: "twitter", name: "트위터 마케팅" },
    { id: "linkedin", name: "링크드인 마케팅" },
    { id: "comprehensive", name: "종합 소셜 미디어 마케팅" },
    { id: "other", name: "기타" },
  ]

  // 사용할 서비스 유형 목록 (카테고리가 있으면 카테고리, 없으면 기본 목록)
  const serviceTypes = categories.length > 0 ? categories : defaultServiceTypes

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>이름 *</FormLabel>
                    <FormControl>
                      <Input placeholder="홍길동" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>이메일 *</FormLabel>
                    <FormControl>
                      <Input placeholder="example@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>전화번호 *</FormLabel>
                    <FormControl>
                      <Input placeholder="01012345678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>회사명 (선택)</FormLabel>
                    <FormControl>
                      <Input placeholder="회사명을 입력해주세요" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="serviceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>서비스 유형 *</FormLabel>
                  <FormControl>
                    <select
                      className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                      value={field.value}
                    >
                      <option value="" disabled>
                        서비스 유형을 선택해주세요
                      </option>
                      {serviceTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                      {!serviceTypes.some((type) => type.id === "other") && <option value="other">기타</option>}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>문의 내용 *</FormLabel>
                  <FormControl>
                    <Textarea placeholder="문의하실 내용을 자세히 적어주세요." className="min-h-[120px]" {...field} />
                  </FormControl>
                  <FormDescription>구체적인 내용을 작성해주시면 더 정확한 답변을 받으실 수 있습니다.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-center">
              <Button type="submit" className="w-full md:w-1/2 bg-rose-600 hover:bg-rose-700" disabled={isSubmitting}>
                {isSubmitting ? "제출 중..." : "상담 신청하기"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
