"use client"

import type React from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Category {
  id: number
  name: string
  slug: string
  icon_url: string
  created_at: string
  updated_at: string
}

export function CategoryManagement() {
  const router = useRouter()
  const supabase = createClient()

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    icon_url: "",
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("categories").select("*").order("id", { ascending: true })

      if (error) throw error

      setCategories(data || [])
    } catch (error) {
      console.error("Error fetching categories:", error)
      toast({
        title: "오류 발생",
        description: "카테고리를 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddCategory = () => {
    setCurrentCategory(null)
    setFormData({
      name: "",
      slug: "",
      icon_url: "",
    })
    setIsDialogOpen(true)
  }

  const handleEditCategory = (category: Category) => {
    setCurrentCategory(category)
    setFormData({
      name: category.name,
      slug: category.slug,
      icon_url: category.icon_url || "",
    })
    setIsDialogOpen(true)
  }

  const handleDeleteCategory = async (id: number) => {
    if (!confirm("정말로 이 카테고리를 삭제하시겠습니까?")) return

    try {
      const { error } = await supabase.from("categories").delete().eq("id", id)

      if (error) throw error

      setCategories(categories.filter((category) => category.id !== id))
      toast({
        title: "카테고리 삭제됨",
        description: "카테고리가 성공적으로 삭제되었습니다.",
      })
    } catch (error) {
      console.error("Error deleting category:", error)
      toast({
        title: "오류 발생",
        description: "카테고리를 삭제하는 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  const handleMoveCategory = async (id: number, direction: "up" | "down") => {
    const currentIndex = categories.findIndex((c) => c.id === id)
    if (currentIndex === -1) return

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= categories.length) return

    // 카테고리 순서 변경 (로컬 상태만 변경)
    const newCategories = [...categories]
    ;[newCategories[currentIndex], newCategories[newIndex]] = [newCategories[newIndex], newCategories[currentIndex]]
    setCategories(newCategories)

    toast({
      title: "카테고리 순서 변경됨",
      description: "카테고리 순서가 성공적으로 변경되었습니다.",
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // 이름이 변경되면 자동으로 슬러그 생성
    if (name === "name" && !currentCategory) {
      setFormData((prev) => ({
        ...prev,
        slug: value
          .toLowerCase()
          .replace(/[^\w\s]/gi, "")
          .replace(/\s+/g, "-"),
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (currentCategory) {
        // 카테고리 수정
        const { error } = await supabase
          .from("categories")
          .update({
            name: formData.name,
            slug: formData.slug,
            icon_url: formData.icon_url,
            updated_at: new Date().toISOString(),
          })
          .eq("id", currentCategory.id)

        if (error) throw error

        setCategories(
          categories.map((category) =>
            category.id === currentCategory.id
              ? {
                  ...category,
                  name: formData.name,
                  slug: formData.slug,
                  icon_url: formData.icon_url,
                  updated_at: new Date().toISOString(),
                }
              : category,
          ),
        )

        toast({
          title: "카테고리 수정됨",
          description: "카테고리가 성공적으로 수정되었습니다.",
        })
      } else {
        // 새 카테고리 추가
        const { data, error } = await supabase
          .from("categories")
          .insert({
            name: formData.name,
            slug: formData.slug,
            icon_url: formData.icon_url,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()

        if (error) throw error

        setCategories([...categories, data[0]])

        toast({
          title: "카테고리 추가됨",
          description: "새 카테고리가 성공적으로 추가되었습니다.",
        })
      }

      setIsDialogOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Error saving category:", error)
      toast({
        title: "오류 발생",
        description: "카테고리를 저장하는 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>카테고리 목록</CardTitle>
          <CardDescription>서비스 카테고리를 관리합니다.</CardDescription>
        </div>
        <Button onClick={handleAddCategory}>
          <Plus className="mr-2 h-4 w-4" />
          카테고리 추가
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>순서</TableHead>
                <TableHead>이름</TableHead>
                <TableHead>슬러그</TableHead>
                <TableHead>생성일</TableHead>
                <TableHead className="text-right">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    카테고리가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category, index) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{index + 1}</span>
                        <div className="flex flex-col">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={() => handleMoveCategory(category.id, "up")}
                            disabled={index === 0}
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={() => handleMoveCategory(category.id, "down")}
                            disabled={index === categories.length - 1}
                          >
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{category.name}</TableCell>
                    <TableCell>{category.slug}</TableCell>
                    <TableCell>{new Date(category.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditCategory(category)}>
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">수정</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(category.id)}>
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">삭제</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">총 {categories.length}개의 카테고리</div>
      </CardFooter>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentCategory ? "카테고리 수정" : "카테고리 추가"}</DialogTitle>
            <DialogDescription>
              {currentCategory ? "카테고리 정보를 수정하세요." : "새 카테고리를 추가하세요."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">카테고리 이름</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="slug">슬러그</Label>
                <Input id="slug" name="slug" value={formData.slug} onChange={handleInputChange} required />
                <p className="text-xs text-muted-foreground">
                  URL에 사용될 고유 식별자입니다. 소문자, 숫자, 하이픈(-)만 사용하세요.
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="icon_url">아이콘 URL</Label>
                <Input id="icon_url" name="icon_url" value={formData.icon_url} onChange={handleInputChange} />
              </div>
            </div>

            <DialogFooter>
              <Button type="submit">{currentCategory ? "수정" : "추가"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
