"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Eye, Mail, Phone, CheckCircle, Clock, AlertCircle, XCircle, Save } from "lucide-react"
import { updateConsultationStatus, updateConsultationNotes } from "@/app/admin/consultations/actions"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// 상담신청 타입 정의
type Consultation = {
  id: number
  name: string
  email: string
  phone: string
  company?: string
  service_type?: string
  message: string
  status: string
  admin_notes?: string
  created_at: string
  updated_at: string
}

// 카테고리 타입 정의
type Category = {
  id: number
  name: string
}

interface ConsultationManagementProps {
  consultations: Consultation[]
  categories?: Category[]
}

export function ConsultationManagement({ consultations, categories = [] }: ConsultationManagementProps) {
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null)
  const [categoryMap, setCategoryMap] = useState<Record<string, string>>({})
  const [isUpdating, setIsUpdating] = useState(false)
  const [isSavingNotes, setIsSavingNotes] = useState(false)
  const [localStatus, setLocalStatus] = useState<string>("")
  const [adminNotes, setAdminNotes] = useState<string>("")
  const { toast } = useToast()

  // 상태 옵션
  const statusOptions = [
    { value: "pending", label: "대기중", icon: <Clock className="h-4 w-4 mr-2" /> },
    { value: "in_progress", label: "처리중", icon: <AlertCircle className="h-4 w-4 mr-2" /> },
    { value: "completed", label: "완료", icon: <CheckCircle className="h-4 w-4 mr-2" /> },
    { value: "rejected", label: "거절", icon: <XCircle className="h-4 w-4 mr-2" /> },
  ]

  // 카테고리 맵 생성
  useEffect(() => {
    const map: Record<string, string> = {}
    categories.forEach((category) => {
      map[category.id.toString()] = category.name
    })
    setCategoryMap(map)
  }, [categories])

  // 상담신청 상태에 따른 배지 색상
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="h-4 w-4 mr-1" />
            대기중
          </Badge>
        )
      case "in_progress":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <AlertCircle className="h-4 w-4 mr-1" />
            처리중
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-4 w-4 mr-1" />
            완료
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="h-4 w-4 mr-1" />
            거절
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // 서비스 유형 이름 가져오기
  const getServiceTypeName = (type?: string) => {
    if (!type) return "미지정"

    // 데이터베이스의 카테고리 ID를 사용하여 이름 가져오기
    if (categoryMap[type]) {
      return categoryMap[type]
    }

    // 기존 매핑 유지 (하위 호환성)
    if (!isNaN(Number(type))) {
      const serviceTypesByNumber: Record<string, string> = {
        "1": "인스타그램 마케팅",
        "2": "페이스북 마케팅",
        "3": "유튜브 마케팅",
        "4": "틱톡 마케팅",
        "5": "트위터 마케팅",
        "6": "링크드인 마케팅",
        "7": "종합 소셜 미디어 마케팅",
        "8": "기타",
      }
      return serviceTypesByNumber[type] || `서비스 유형 ${type}`
    }

    const serviceTypes: Record<string, string> = {
      instagram: "인스타그램 마케팅",
      facebook: "페이스북 마케팅",
      youtube: "유튜브 마케팅",
      tiktok: "틱톡 마케팅",
      twitter: "트위터 마케팅",
      linkedin: "링크드인 마케팅",
      comprehensive: "종합 소셜 미디어 마케팅",
      other: "기타",
    }

    return serviceTypes[type] || type
  }

  // 상담신청 상세 정보 모달 열기
  const openConsultationDetail = (consultation: Consultation) => {
    setSelectedConsultation(consultation)
    setLocalStatus(consultation.status)
    setAdminNotes(consultation.admin_notes || "")
  }

  // 상담신청 상세 정보 모달 닫기
  const closeConsultationDetail = () => {
    setSelectedConsultation(null)
  }

  // 상담신청 상태 변경
  const handleStatusChange = async () => {
    if (!selectedConsultation || isUpdating || localStatus === selectedConsultation.status) return

    setIsUpdating(true)

    try {
      const result = await updateConsultationStatus(selectedConsultation.id, localStatus)

      if (result.success) {
        toast({
          title: "상태 변경 성공",
          description: result.message,
        })

        // 로컬 상태 업데이트
        const updatedConsultation = { ...selectedConsultation, status: localStatus }
        setSelectedConsultation(updatedConsultation)

        // 목록에서도 상태 업데이트
        const index = consultations.findIndex((c) => c.id === selectedConsultation.id)
        if (index !== -1) {
          consultations[index].status = localStatus
        }
      } else {
        toast({
          variant: "destructive",
          title: "상태 변경 실패",
          description: result.message,
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "상태 변경 실패",
        description: "상담신청 상태를 변경하는 중 오류가 발생했습니다.",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  // 관리자 메모 저장
  const handleSaveNotes = async () => {
    if (!selectedConsultation || isSavingNotes) return

    setIsSavingNotes(true)

    try {
      const result = await updateConsultationNotes(selectedConsultation.id, adminNotes)

      if (result.success) {
        toast({
          title: "메모 저장 성공",
          description: result.message,
        })

        // 로컬 상태 업데이트
        const updatedConsultation = { ...selectedConsultation, admin_notes: adminNotes }
        setSelectedConsultation(updatedConsultation)

        // 목록에서도 메모 업데이트
        const index = consultations.findIndex((c) => c.id === selectedConsultation.id)
        if (index !== -1) {
          consultations[index].admin_notes = adminNotes
        }
      } else {
        toast({
          variant: "destructive",
          title: "메모 저장 실패",
          description: result.message,
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "메모 저장 실패",
        description: "관리자 메모를 저장하는 중 오류가 발생했습니다.",
      })
    } finally {
      setIsSavingNotes(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>상담신청 목록</CardTitle>
        <CardDescription>총 {consultations.length}건의 상담신청이 있습니다.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">번호</TableHead>
                <TableHead>이름</TableHead>
                <TableHead>서비스 유형</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>신청일</TableHead>
                <TableHead className="text-right">상세보기</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {consultations.map((consultation) => (
                <TableRow key={consultation.id}>
                  <TableCell className="font-medium">{consultation.id}</TableCell>
                  <TableCell>{consultation.name}</TableCell>
                  <TableCell>{getServiceTypeName(consultation.service_type)}</TableCell>
                  <TableCell>{getStatusBadge(consultation.status)}</TableCell>
                  <TableCell>{format(new Date(consultation.created_at), "yyyy년 MM월 dd일", { locale: ko })}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => openConsultationDetail(consultation)}>
                      <Eye className="h-4 w-4 mr-2" />
                      상세보기
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* 상담신청 상세 정보 모달 */}
        <Dialog open={!!selectedConsultation} onOpenChange={closeConsultationDetail}>
          {selectedConsultation && (
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>상담신청 상세 정보</DialogTitle>
                <DialogDescription>
                  {format(new Date(selectedConsultation.created_at), "yyyy년 MM월 dd일 HH:mm", { locale: ko })}에 접수된
                  상담신청입니다.
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="details">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="details">상담 정보</TabsTrigger>
                  <TabsTrigger value="admin-notes">관리자 메모</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <div className="font-medium">상태</div>
                    <div className="col-span-3">
                      <Select value={localStatus} onValueChange={setLocalStatus}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="상태 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center">
                                {option.icon}
                                {option.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <div className="font-medium">이름</div>
                    <div className="col-span-3">{selectedConsultation.name}</div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <div className="font-medium">이메일</div>
                    <div className="col-span-3 flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      <a href={`mailto:${selectedConsultation.email}`} className="text-blue-600 hover:underline">
                        {selectedConsultation.email}
                      </a>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <div className="font-medium">전화번호</div>
                    <div className="col-span-3 flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <a href={`tel:${selectedConsultation.phone}`} className="text-blue-600 hover:underline">
                        {selectedConsultation.phone}
                      </a>
                    </div>
                  </div>
                  {selectedConsultation.company && (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <div className="font-medium">회사명</div>
                      <div className="col-span-3">{selectedConsultation.company}</div>
                    </div>
                  )}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <div className="font-medium">서비스 유형</div>
                    <div className="col-span-3">{getServiceTypeName(selectedConsultation.service_type)}</div>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="font-medium">문의 내용</div>
                    <div className="col-span-3 whitespace-pre-wrap bg-gray-50 p-3 rounded-md">
                      {selectedConsultation.message}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={handleStatusChange}
                      disabled={isUpdating || localStatus === selectedConsultation.status}
                    >
                      {isUpdating ? "처리 중..." : "상태 변경"}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="admin-notes" className="space-y-4 py-4">
                  <div className="space-y-2">
                    <div className="font-medium">관리자 메모</div>
                    <div className="text-sm text-muted-foreground mb-2">
                      이 메모는 관리자만 볼 수 있습니다. 상담 처리 과정이나 특이사항을 기록하세요.
                    </div>
                    <Textarea
                      placeholder="상담 처리 과정이나 특이사항을 기록하세요."
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      className="min-h-[200px]"
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSaveNotes} disabled={isSavingNotes}>
                      {isSavingNotes ? (
                        "저장 중..."
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          메모 저장
                        </>
                      )}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button variant="outline" onClick={closeConsultationDetail}>
                  닫기
                </Button>
              </DialogFooter>
            </DialogContent>
          )}
        </Dialog>
      </CardContent>
    </Card>
  )
}
