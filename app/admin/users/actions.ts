"use server"

import { createAdminClient } from "@/lib/supabase/admin"

// 관리자 권한으로 사용자 목록 가져오기
export async function getUsers() {
  try {
    const supabase = createAdminClient()

    // 인증 사용자 목록 가져오기
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()

    if (authError) {
      console.error("인증 사용자 목록 조회 오류:", authError)
      throw new Error(`인증 사용자 목록 조회 오류: ${authError.message}`)
    }

    // 프로필 정보 가져오기
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, created_at, updated_at, is_admin")

    if (profilesError) {
      console.error("프로필 목록 조회 오류:", profilesError)
      throw new Error(`프로필 목록 조회 오류: ${profilesError.message}`)
    }

    // 사용자 정보와 프로필 정보 결합
    const users = authUsers.users.map((authUser) => {
      const profile = profiles.find((p) => p.id === authUser.id) || {
        id: authUser.id,
        is_admin: false,
        created_at: authUser.created_at,
        updated_at: authUser.updated_at,
      }

      return {
        id: authUser.id,
        email: authUser.email,
        created_at: profile.created_at || authUser.created_at,
        updated_at: profile.updated_at || authUser.updated_at,
        is_admin: profile.is_admin || false,
        last_sign_in_at: authUser.last_sign_in_at,
      }
    })

    return { users, error: null }
  } catch (error) {
    console.error("사용자 목록 조회 오류:", error)
    return { users: [], error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다." }
  }
}

// 사용자 권한 변경
export async function updateUserAdmin(userId: string, isAdmin: boolean) {
  try {
    const supabase = createAdminClient()

    // 프로필 테이블에 is_admin 필드가 없는 경우 추가
    try {
      await supabase.rpc("add_is_admin_column_if_not_exists")
    } catch (error) {
      console.log("is_admin 컬럼 추가 시도:", error)
      // 이미 컬럼이 존재하는 경우 무시
    }

    // 프로필 업데이트
    const { error } = await supabase.from("profiles").update({ is_admin: isAdmin }).eq("id", userId)

    if (error) {
      throw new Error(`사용자 권한 변경 오류: ${error.message}`)
    }

    return { success: true, error: null }
  } catch (error) {
    console.error("사용자 권한 변경 오류:", error)
    return { success: false, error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다." }
  }
}

// 사용자 삭제
export async function deleteUser(userId: string) {
  try {
    const supabase = createAdminClient()

    // 사용자 삭제
    const { error } = await supabase.auth.admin.deleteUser(userId)

    if (error) {
      throw new Error(`사용자 삭제 오류: ${error.message}`)
    }

    return { success: true, error: null }
  } catch (error) {
    console.error("사용자 삭제 오류:", error)
    return { success: false, error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다." }
  }
}

// 새 사용자 초대
export async function inviteUser(email: string, isAdmin = false) {
  try {
    const supabase = createAdminClient()

    // 사용자 초대
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email)

    if (error) {
      throw new Error(`사용자 초대 오류: ${error.message}`)
    }

    // 초대된 사용자의 프로필에 관리자 권한 설정
    if (isAdmin && data.user) {
      await supabase.from("profiles").update({ is_admin: true }).eq("id", data.user.id)
    }

    return { success: true, user: data.user, error: null }
  } catch (error) {
    console.error("사용자 초대 오류:", error)
    return {
      success: false,
      user: null,
      error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
    }
  }
}
