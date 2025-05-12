import type { Metadata } from "next"
import { getUsers } from "./actions"
import { AdminUserManagement } from "@/components/admin/user-management"

export const metadata: Metadata = {
  title: "사용자 관리 - 관리자 패널",
  description: "사용자 계정 관리 및 권한 설정",
}

export default async function AdminUsersPage() {
  const { users, error } = await getUsers()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">사용자 관리</h1>
        <p className="text-muted-foreground">사용자 계정 관리 및 권한을 설정합니다.</p>
      </div>

      {error ? (
        <div className="p-4 border rounded-md bg-red-50">
          <p className="text-red-600">사용자 목록을 불러오는 중 오류가 발생했습니다: {error}</p>
        </div>
      ) : (
        <AdminUserManagement initialUsers={users} />
      )}
    </div>
  )
}
