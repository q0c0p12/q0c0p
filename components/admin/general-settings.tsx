"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"

export function AdminGeneralSettings() {
  const [settings, setSettings] = useState({
    siteName: "SMM크몽",
    siteDescription: "소셜 미디어 마케팅 서비스",
    maintenanceMode: false,
    noticeEnabled: true,
    noticeMessage: "현재 시스템 업데이트가 진행 중입니다. 일부 서비스에 제한이 있을 수 있습니다.",
    contactEmail: "support@smm-kmong.com",
    orderPrefix: "SMM-",
  })

  const handleChange = (field: string, value: string | boolean) => {
    setSettings({
      ...settings,
      [field]: value,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // 여기에 설정 저장 로직 추가
    toast({
      title: "설정 저장 완료",
      description: "시스템 설정이 성공적으로 저장되었습니다.",
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="siteName">사이트 이름</Label>
          <Input id="siteName" value={settings.siteName} onChange={(e) => handleChange("siteName", e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactEmail">연락처 이메일</Label>
          <Input
            id="contactEmail"
            type="email"
            value={settings.contactEmail}
            onChange={(e) => handleChange("contactEmail", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="siteDescription">사이트 설명</Label>
          <Textarea
            id="siteDescription"
            value={settings.siteDescription}
            onChange={(e) => handleChange("siteDescription", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="orderPrefix">주문 번호 접두사</Label>
          <Input
            id="orderPrefix"
            value={settings.orderPrefix}
            onChange={(e) => handleChange("orderPrefix", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">유지보수 모드</h3>
            <p className="text-sm text-muted-foreground">활성화하면 사용자는 사이트에 접근할 수 없습니다</p>
          </div>
          <Switch
            checked={settings.maintenanceMode}
            onCheckedChange={(checked) => handleChange("maintenanceMode", checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">공지사항 표시</h3>
            <p className="text-sm text-muted-foreground">사이트 전체에 공지사항을 표시합니다</p>
          </div>
          <Switch
            checked={settings.noticeEnabled}
            onCheckedChange={(checked) => handleChange("noticeEnabled", checked)}
          />
        </div>

        {settings.noticeEnabled && (
          <div className="space-y-2">
            <Label htmlFor="noticeMessage">공지사항 메시지</Label>
            <Textarea
              id="noticeMessage"
              value={settings.noticeMessage}
              onChange={(e) => handleChange("noticeMessage", e.target.value)}
            />
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="submit">설정 저장</Button>
      </div>
    </form>
  )
}
