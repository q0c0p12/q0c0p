import { createClient } from "@/lib/supabase/server"
import { createClient as createClientBrowser } from "@/lib/supabase/client"

export async function checkAdminAccess(userId: string): Promise<boolean> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.from("profiles").select("is_admin").eq("id", userId).single()

    if (error) {
      console.error("Error checking admin access:", error)
      return false
    }

    return data?.is_admin === true
  } catch (error) {
    console.error("Error in checkAdminAccess:", error)
    return false
  }
}

// 통합 관리자 확인 함수 (데이터베이스 + 메타데이터)
export async function isAdminComprehensive(): Promise<boolean> {
  try {
    const supabase = createClientBrowser()

    // 세션 확인
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      console.log("세션 없음, 관리자 아님")
      return false
    }

    // 메타데이터에서 role 확인
    const isAdminMeta = session.user.user_metadata?.role === "admin"
    console.log("메타데이터 관리자 확인:", isAdminMeta, "메타데이터:", session.user.user_metadata)

    // 데이터베이스에서 is_admin 확인
    const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", session.user.id).single()

    const isAdminDb = profile?.is_admin === true
    console.log("데이터베이스 관리자 확인:", isAdminDb, "프로필:", profile)

    // 둘 중 하나라도 관리자면 true 반환
    return isAdminMeta || isAdminDb
  } catch (error) {
    console.error("Error in comprehensive admin check:", error)
    return false
  }
}

export async function isAdmin(): Promise<boolean> {
  try {
    const supabase = createClientBrowser()

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return false
    }

    const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", session.user.id).single()

    return profile?.is_admin === true
  } catch (error) {
    console.error("Error checking admin status:", error)
    return false
  }
}
