"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Plus, Trash2, Save } from "lucide-react"
import { createService, updateService } from "@/app/admin/services/actions"

const serviceSchema = z.object({
  title: z.string().min(3, { message: "제목은 3자 이상이어야 합니다." }),
  description: z.string().min(10, { message: "설명은 10자 이상이어야 합니다." }),
  base_price: z.coerce.number().min(1000, { message: "기본 가격은 1,000원 이상이어야 합니다." }),
  delivery_time: z.coerce.number().min(1, { message: "배송 시간은 1일 이상이어야 합니다." }),
  category_id: z.string().min(1, { message: "카테고리를 선택해주세요." }),
  image_url: z.string().optional(),
  is_featured: z.boolean().default(false),
  is_active: z.boolean().default(true),
  slug: z.string().min(3, { message: "슬러그는 3자 이상이어야 합니다." }),
})

type ServiceFormValues = z.infer<typeof serviceSchema>

interface ServicePackage {
  id?: string
  name: string
  description: string
  price: number
  delivery_time: number
  features: string[]
  service_id?: number
}

interface ServiceFaq {
  id?: string
  question: string
  answer: string
  display_order: number
  service_id?: number
}

interface Category {
  id: string
  name: string
}

interface ServiceManagementProps {
  serviceId?: string
}

export function ServiceManagement({ serviceId }: ServiceManagementProps) {
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [packages, setPackages] = useState<ServicePackage[]>([])
  const [faqs, setFaqs] = useState<ServiceFaq[]>([])
  const [newFeature, setNewFeature] = useState<string>("")
  const [activeTab, setActiveTab] = useState<string>("general")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      title: "",
      description: "",
      base_price: 10000,
      delivery_time: 3,
      category_id: "",
      image_url: "",
      is_featured: false,
      is_active: true,
      slug: "",
    },
  })

  // 카테고리 목록 가져오기
  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase.from("categories").select("id, name").order("name")
      if (data) {
        setCategories(data)
      }
    }

    fetchCategories()
  }, [supabase])

  // 서비스 ID가 있는 경우 서비스 정보 가져오기
  useEffect(() => {
    async function fetchService() {
      if (!serviceId) return

      setIsLoading(true)
      const { data: service } = await supabase.from("services").select("*").eq("id", serviceId).single()

      if (service) {
        form.reset({
          title: service.title,
          description: service.description,
          base_price: service.base_price,
          delivery_time: service.delivery_time,
          category_id: service.category_id,
          image_url: service.image_url,
          is_featured: service.is_featured,
          is_active: service.is_active,
          slug: service.slug,
        })

        if (service.image_url) {
          setImagePreview(service.image_url)
        }

        // 패키지 가져오기
        const { data: packageData } = await supabase
          .from("service_packages")
          .select("*")
          .eq("service_id", serviceId)
          .order("price")

        if (packageData) {
          setPackages(
            packageData.map((pkg) => ({
              ...pkg,
              features: Array.isArray(pkg.features) ? pkg.features : JSON.parse(pkg.features || "[]"),
            })),
          )
        }

        // FAQ 가져오기
        const { data: faqData } = await supabase
          .from("service_faqs")
          .select("*")
          .eq("service_id", serviceId)
          .order("display_order")

        if (faqData) {
          setFaqs(faqData)
        }
      }
      setIsLoading(false)
    }

    fetchService()
  }, [serviceId, supabase, form])

  // 이미지 업로드 처리
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // 패키지 추가
  const addPackage = () => {
    setPackages([
      ...packages,
      {
        name: "새 패키지",
        description: "패키지 설명을 입력하세요.",
        price: form.getValues("base_price") || 10000,
        delivery_time: form.getValues("delivery_time") || 3,
        features: ["기본 서비스"],
      },
    ])
  }

  // 패키지 삭제
  const removePackage = (index: number) => {
    setPackages(packages.filter((_, i) => i !== index))
  }

  // 패키지 필드 업데이트
  const updatePackageField = (index: number, field: keyof ServicePackage, value: any) => {
    const updatedPackages = [...packages]
    updatedPackages[index] = { ...updatedPackages[index], [field]: value }
    setPackages(updatedPackages)
  }

  // 패키지 기능 추가
  const addFeatureToPackage = (index: number) => {
    if (!newFeature.trim()) return

    const updatedPackages = [...packages]
    updatedPackages[index] = {
      ...updatedPackages[index],
      features: [...updatedPackages[index].features, newFeature],
    }
    setPackages(updatedPackages)
    setNewFeature("")
  }

  // 패키지 기능 삭제
  const removeFeatureFromPackage = (packageIndex: number, featureIndex: number) => {
    const updatedPackages = [...packages]
    updatedPackages[packageIndex].features = updatedPackages[packageIndex].features.filter((_, i) => i !== featureIndex)
    setPackages(updatedPackages)
  }

  // FAQ 추가
  const addFaq = () => {
    setFaqs([
      ...faqs,
      {
        question: "새 질문",
        answer: "답변을 입력하세요.",
        display_order: faqs.length + 1,
      },
    ])
  }

  // FAQ 삭제
  const removeFaq = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index))
  }

  // FAQ 필드 업데이트
  const updateFaqField = (index: number, field: keyof ServiceFaq, value: any) => {
    const updatedFaqs = [...faqs]
    updatedFaqs[index] = { ...updatedFaqs[index], [field]: value }
    setFaqs(updatedFaqs)
  }

  // 서비스 저장
  const onSubmit = async (data: ServiceFormValues) => {
    setIsLoading(true)

    try {
      let imageUrl = data.image_url

      // 이미지 파일이 있으면 업로드
      if (imageFile) {
        const fileName = `service-${Date.now()}-${imageFile.name}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("service-images")
          .upload(fileName, imageFile)

        if (uploadError) {
          throw new Error(`이미지 업로드 오류: ${uploadError.message}`)
        }

        const { data: urlData } = supabase.storage.from("service-images").getPublicUrl(fileName)
        imageUrl = urlData.publicUrl
      }

      // 서비스 데이터 준비
      const serviceData = {
        ...data,
        image_url: imageUrl,
      }

      // 서비스 생성 또는 업데이트
      const formData = new FormData()
      Object.entries(serviceData).forEach(([key, value]) => {
        formData.append(key, String(value))
      })

      if (serviceId) {
        formData.append("id", serviceId)
        const result = await updateService(formData)
        if (result.success) {
          toast({
            title: "서비스가 업데이트되었습니다.",
            description: "서비스 정보가 성공적으로 업데이트되었습니다.",
          })

          // 패키지 저장
          await savePackages(Number(serviceId))

          // FAQ 저장
          await saveFaqs(Number(serviceId))
        } else {
          toast({
            title: "서비스 업데이트 오류",
            description: result.message,
            variant: "destructive",
          })
        }
      } else {
        const result = await createService(formData)
        if (result.success) {
          toast({
            title: "서비스가 생성되었습니다.",
            description: "새 서비스가 성공적으로 생성되었습니다.",
          })

          // 패키지 저장
          if (result.id) {
            await savePackages(result.id)
            await saveFaqs(result.id)
          }

          // 폼 초기화
          form.reset()
          setPackages([])
          setFaqs([])
          setImageFile(null)
          setImagePreview("")
        } else {
          toast({
            title: "서비스 생성 오류",
            description: result.message,
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error("서비스 저장 오류:", error)
      toast({
        title: "오류가 발생했습니다.",
        description: "서비스를 저장하는 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 패키지 저장
  const savePackages = async (serviceId: number) => {
    try {
      // 기존 패키지 삭제
      await supabase.from("service_packages").delete().eq("service_id", serviceId)

      // 새 패키지 추가
      for (const pkg of packages) {
        // 패키지 저장 전 디버깅 정보 출력
        console.log("패키지 저장 전 데이터:", {
          ...pkg,
          service_id: serviceId,
          features: JSON.stringify(pkg.features),
        })

        const { error } = await supabase.from("service_packages").insert({
          ...pkg,
          service_id: serviceId,
          features: JSON.stringify(pkg.features),
        })

        if (error) {
          console.error("패키지 저장 오류:", error)
          throw new Error(`패키지 저장 오류: ${error.message}`)
        }
      }

      toast({
        title: "패키지가 저장되었습니다.",
        description: `${packages.length}개의 패키지가 서비스 ID ${serviceId}에 성공적으로 저장되었습니다.`,
      })
    } catch (error) {
      console.error("패키지 저장 오류:", error)
      toast({
        title: "패키지 저장 오류",
        description: "패키지를 저장하는 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  // FAQ 저장
  const saveFaqs = async (serviceId: number) => {
    try {
      // 기존 FAQ 삭제
      await supabase.from("service_faqs").delete().eq("service_id", serviceId)

      // 새 FAQ 추가
      for (const faq of faqs) {
        const { error } = await supabase.from("service_faqs").insert({
          ...faq,
          service_id: serviceId,
        })

        if (error) {
          console.error("FAQ 저장 오류:", error)
          throw new Error(`FAQ 저장 오류: ${error.message}`)
        }
      }

      toast({
        title: "FAQ가 저장되었습니다.",
        description: `${faqs.length}개의 FAQ가 성공적으로 저장되었습니다.`,
      })
    } catch (error) {
      console.error("FAQ 저장 오류:", error)
      toast({
        title: "FAQ 저장 오류",
        description: "FAQ를 저장하는 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{serviceId ? "서비스 수정" : "새 서비스 추가"}</h2>
        <Button
          type="button"
          onClick={form.handleSubmit(onSubmit)}
          disabled={isLoading}
          className="bg-rose-600 hover:bg-rose-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 저장 중...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" /> 서비스 저장
            </>
          )}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="general">기본 정보</TabsTrigger>
          <TabsTrigger value="packages">패키지</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>기본 정보</CardTitle>
              <CardDescription>서비스의 기본 정보를 입력하세요.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">서비스 제목</Label>
                  <Input
                    id="title"
                    placeholder="서비스 제목을 입력하세요"
                    {...form.register("title")}
                    disabled={isLoading}
                  />
                  {form.formState.errors.title && (
                    <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">슬러그 (URL)</Label>
                  <Input id="slug" placeholder="url-friendly-slug" {...form.register("slug")} disabled={isLoading} />
                  {form.formState.errors.slug && (
                    <p className="text-sm text-red-500">{form.formState.errors.slug.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">서비스 설명</Label>
                <Textarea
                  id="description"
                  placeholder="서비스에 대한 상세 설명을 입력하세요"
                  rows={5}
                  {...form.register("description")}
                  disabled={isLoading}
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="base_price">기본 가격 (원)</Label>
                  <Input
                    id="base_price"
                    type="number"
                    placeholder="10000"
                    {...form.register("base_price")}
                    disabled={isLoading}
                  />
                  {form.formState.errors.base_price && (
                    <p className="text-sm text-red-500">{form.formState.errors.base_price.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="delivery_time">배송 시간 (일)</Label>
                  <Input
                    id="delivery_time"
                    type="number"
                    placeholder="3"
                    {...form.register("delivery_time")}
                    disabled={isLoading}
                  />
                  {form.formState.errors.delivery_time && (
                    <p className="text-sm text-red-500">{form.formState.errors.delivery_time.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category_id">카테고리</Label>
                  <Select
                    value={form.watch("category_id")}
                    onValueChange={(value) => form.setValue("category_id", value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="카테고리 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.category_id && (
                    <p className="text-sm text-red-500">{form.formState.errors.category_id.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">서비스 이미지</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Input id="image" type="file" accept="image/*" onChange={handleImageChange} disabled={isLoading} />
                    <p className="text-sm text-muted-foreground mt-1">권장 크기: 1200 x 800 픽셀, 최대 5MB</p>
                  </div>
                  {imagePreview && (
                    <div className="relative aspect-video rounded-md overflow-hidden">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Preview"
                        className="object-cover w-full h-full"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:gap-8">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_featured"
                    checked={form.watch("is_featured")}
                    onCheckedChange={(checked) => form.setValue("is_featured", checked)}
                    disabled={isLoading}
                  />
                  <Label htmlFor="is_featured">추천 서비스로 표시</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={form.watch("is_active")}
                    onCheckedChange={(checked) => form.setValue("is_active", checked)}
                    disabled={isLoading}
                  />
                  <Label htmlFor="is_active">활성화</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="packages" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>서비스 패키지</CardTitle>
                  <CardDescription>서비스에 제공할 패키지를 추가하세요.</CardDescription>
                </div>
                <Button type="button" onClick={addPackage} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" /> 패키지 추가
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {packages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">패키지가 없습니다. 패키지를 추가해주세요.</div>
              ) : (
                packages.map((pkg, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">패키지 #{index + 1}</h3>
                      <Button
                        type="button"
                        onClick={() => removePackage(index)}
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`package-name-${index}`}>패키지 이름</Label>
                        <Input
                          id={`package-name-${index}`}
                          value={pkg.name}
                          onChange={(e) => updatePackageField(index, "name", e.target.value)}
                          disabled={isLoading}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`package-price-${index}`}>가격 (원)</Label>
                        <Input
                          id={`package-price-${index}`}
                          type="number"
                          value={pkg.price}
                          onChange={(e) => updatePackageField(index, "price", Number(e.target.value))}
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`package-description-${index}`}>설명</Label>
                      <Textarea
                        id={`package-description-${index}`}
                        value={pkg.description}
                        onChange={(e) => updatePackageField(index, "description", e.target.value)}
                        rows={2}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`package-delivery-${index}`}>배송 시간 (일)</Label>
                      <Input
                        id={`package-delivery-${index}`}
                        type="number"
                        value={pkg.delivery_time}
                        onChange={(e) => updatePackageField(index, "delivery_time", Number(e.target.value))}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>제공 사항</Label>
                      <ul className="space-y-2">
                        {pkg.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Checkbox checked disabled />
                              <span>{feature}</span>
                            </div>
                            <Button
                              type="button"
                              onClick={() => removeFeatureFromPackage(index, featureIndex)}
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </li>
                        ))}
                      </ul>

                      <div className="flex mt-2">
                        <Input
                          placeholder="새 제공 사항 추가"
                          value={newFeature}
                          onChange={(e) => setNewFeature(e.target.value)}
                          className="rounded-r-none"
                          disabled={isLoading}
                        />
                        <Button
                          type="button"
                          onClick={() => addFeatureToPackage(index)}
                          className="rounded-l-none"
                          disabled={!newFeature.trim() || isLoading}
                        >
                          추가
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faq" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>자주 묻는 질문 (FAQ)</CardTitle>
                  <CardDescription>서비스에 대한 자주 묻는 질문을 추가하세요.</CardDescription>
                </div>
                <Button type="button" onClick={addFaq} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" /> FAQ 추가
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {faqs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">FAQ가 없습니다. FAQ를 추가해주세요.</div>
              ) : (
                faqs.map((faq, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">FAQ #{index + 1}</h3>
                      <Button
                        type="button"
                        onClick={() => removeFaq(index)}
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`faq-question-${index}`}>질문</Label>
                      <Input
                        id={`faq-question-${index}`}
                        value={faq.question}
                        onChange={(e) => updateFaqField(index, "question", e.target.value)}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`faq-answer-${index}`}>답변</Label>
                      <Textarea
                        id={`faq-answer-${index}`}
                        value={faq.answer}
                        onChange={(e) => updateFaqField(index, "answer", e.target.value)}
                        rows={3}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`faq-order-${index}`}>표시 순서</Label>
                      <Input
                        id={`faq-order-${index}`}
                        type="number"
                        value={faq.display_order}
                        onChange={(e) => updateFaqField(index, "display_order", Number(e.target.value))}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
