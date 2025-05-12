"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

// 더미 데이터
const initialServices = [
  { id: "1", name: "인스타그램 팔로워", price: 10000, active: true, category: "인스타그램" },
  { id: "2", name: "유튜브 구독자", price: 15000, active: true, category: "유튜브" },
  { id: "3", name: "페이스북 좋아요", price: 8000, active: true, category: "페이스북" },
  { id: "4", name: "틱톡 팔로워", price: 12000, active: true, category: "틱톡" },
  { id: "5", name: "트위터 팔로워", price: 9000, active: false, category: "트위터" },
]

export function AdminServiceSettings() {
  const [services, setServices] = useState(initialServices)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentService, setCurrentService] = useState<any>(null)

  const handleToggleActive = (id: string) => {
    setServices(services.map((service) => (service.id === id ? { ...service, active: !service.active } : service)))
  }

  const handleEditService = (service: any) => {
    setCurrentService(service)
    setIsDialogOpen(true)
  }

  const handleAddService = () => {
    setCurrentService(null)
    setIsDialogOpen(true)
  }

  const handleDeleteService = (id: string) => {
    if (confirm("정말로 이 서비스를 삭제하시겠습니까?")) {
      setServices(services.filter((service) => service.id !== id))
      toast({
        title: "서비스 삭제됨",
        description: "서비스가 성공적으로 삭제되었습니다.",
      })
    }
  }

  const handleSaveService = (formData: FormData) => {
    const name = formData.get("name") as string
    const category = formData.get("category") as string
    const price = Number.parseInt(formData.get("price") as string)

    if (currentService) {
      // 기존 서비스 수정
      setServices(
        services.map((service) => (service.id === currentService.id ? { ...service, name, category, price } : service)),
      )
      toast({
        title: "서비스 수정됨",
        description: "서비스가 성공적으로 수정되었습니다.",
      })
    } else {
      // 새 서비스 추가
      const newService = {
        id: Date.now().toString(),
        name,
        category,
        price,
        active: true,
      }
      setServices([...services, newService])
      toast({
        title: "서비스 추가됨",
        description: "새 서비스가 성공적으로 추가되었습니다.",
      })
    }

    setIsDialogOpen(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">서비스 관리</h3>
        <Button onClick={handleAddService}>
          <Plus className="mr-2 h-4 w-4" />
          서비스 추가
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>서비스명</TableHead>
              <TableHead>카테고리</TableHead>
              <TableHead className="text-right">가격</TableHead>
              <TableHead>상태</TableHead>
              <TableHead className="w-[100px]">관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((service) => (
              <TableRow key={service.id}>
                <TableCell>{service.name}</TableCell>
                <TableCell>{service.category}</TableCell>
                <TableCell className="text-right">₩{service.price.toLocaleString()}</TableCell>
                <TableCell>
                  <Switch checked={service.active} onCheckedChange={() => handleToggleActive(service.id)} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEditService(service)}>
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">수정</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteService(service.id)}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">삭제</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentService ? "서비스 수정" : "서비스 추가"}</DialogTitle>
            <DialogDescription>
              {currentService ? "서비스 정보를 수정하세요" : "새 서비스를 추가하세요"}
            </DialogDescription>
          </DialogHeader>

          <form action={handleSaveService} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">서비스명</Label>
              <Input id="name" name="name" defaultValue={currentService?.name || ""} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">카테고리</Label>
              <Input id="category" name="category" defaultValue={currentService?.category || ""} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">가격 (원)</Label>
              <Input id="price" name="price" type="number" defaultValue={currentService?.price || ""} required />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                취소
              </Button>
              <Button type="submit">저장</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
