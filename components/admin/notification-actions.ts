"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

interface NotificationData {
  title: string
  content: string
  type: string
  user_id?: string
}

// 알림 테이블 생성 함수
async function ensureNotificationsTableExists(supabase: any) {
  try {
    // 테이블이 존재하는지 확인
    const { data, error } = await supabase.from("notifications").select("id").limit(1)

    if (error && error.code === "42P01") {
      // 테이블이 존재하지 않는 경우
      console.log("알림 테이블이 존재하지 않습니다. 테이블을 생성합니다.")

      // 직접 SQL 쿼리를 실행하여 테이블 생성
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS public.notifications (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          type TEXT NOT NULL,
          user_id UUID,
          created_by UUID,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          is_read BOOLEAN DEFAULT FALSE
        );
        
        -- 인덱스 생성
        CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
        CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
        CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);
      `

      const { error: createError } = await supabase.rpc("exec_sql", { sql: createTableQuery })

      if (createError) {
        console.error("알림 테이블 생성 중 오류:", createError)
        return false
      }

      console.log("알림 테이블이 성공적으로 생성되었습니다.")
      return true
    }

    return true // 테이블이 이미 존재함
  } catch (error) {
    console.error("테이블 확인 중 오류:", error)
    return false
  }
}

// 알림 생성 함수
export async function createNotification(data: NotificationData) {
  try {
    const supabase = createClient()

    // 세션 확인
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("세션 확인 중 오류:", sessionError)
      return { success: false, error: "세션 확인 중 오류가 발생했습니다." }
    }

    if (!sessionData.session) {
      return { success: false, error: "인증되지 않은 요청입니다." }
    }

    // 관리자 권한 확인
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", sessionData.session.user.id)
      .single()

    if (profileError) {
      console.error("프로필 확인 중 오류:", profileError)
      return { success: false, error: "프로필 확인 중 오류가 발생했습니다." }
    }

    const isAdmin = profile?.is_admin === true || sessionData.session.user.user_metadata?.role === "admin"

    if (!isAdmin) {
      return { success: false, error: "관리자 권한이 필요합니다." }
    }

    // 테이블 확인 및 생성 단계 건너뛰기
    // 테이블이 없는 경우 직접 생성
    try {
      // 알림 생성
      const { data: notification, error: insertError } = await supabase
        .from("notifications")
        .insert({
          title: data.title,
          content: data.content,
          type: data.type,
          user_id: data.user_id,
          created_by: sessionData.session.user.id,
          created_at: new Date().toISOString(),
          is_read: false,
        })
        .select()

      if (insertError) {
        console.error("알림 생성 중 오류:", insertError)

        // 테이블이 없는 경우 직접 생성
        if (insertError.code === "42P01") {
          // 직접 SQL 쿼리를 실행하여 테이블 생성
          const createTableQuery = `
            CREATE TABLE IF NOT EXISTS public.notifications (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              title TEXT NOT NULL,
              content TEXT NOT NULL,
              type TEXT NOT NULL,
              user_id UUID,
              created_by UUID,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              is_read BOOLEAN DEFAULT FALSE
            );
          `

          // 관리자 권한으로 직접 SQL 실행
          const { error: sqlError } = await supabase.rpc("exec_sql", { sql: createTableQuery })

          if (sqlError) {
            console.error("테이블 생성 중 오류:", sqlError)
            return { success: false, error: "알림 테이블을 생성할 수 없습니다." }
          }

          // 테이블 생성 후 다시 시도
          const { data: retryData, error: retryError } = await supabase
            .from("notifications")
            .insert({
              title: data.title,
              content: data.content,
              type: data.type,
              user_id: data.user_id,
              created_by: sessionData.session.user.id,
              created_at: new Date().toISOString(),
              is_read: false,
            })
            .select()

          if (retryError) {
            console.error("재시도 중 오류:", retryError)
            return { success: false, error: `알림 생성 중 오류가 발생했습니다: ${retryError.message}` }
          }

          revalidatePath("/admin/notifications")
          return { success: true, notification: retryData }
        }

        return { success: false, error: `알림 생성 중 오류가 발생했습니다: ${insertError.message}` }
      }

      revalidatePath("/admin/notifications")
      return { success: true, notification }
    } catch (error) {
      console.error("알림 생성 중 예외 발생:", error)
      return { success: false, error: `알림 생성 중 예외가 발생했습니다: ${(error as Error).message}` }
    }
  } catch (error) {
    console.error("알림 생성 중 예외 발생:", error)
    return { success: false, error: `알림 생성 중 예외가 발생했습니다: ${(error as Error).message}` }
  }
}

// 알림 삭제 함수
export async function deleteNotification(id: string) {
  try {
    const supabase = createClient()

    // 세션 확인
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("세션 확인 중 오류:", sessionError)
      return { success: false, error: "세션 확인 중 오류가 발생했습니다." }
    }

    if (!sessionData.session) {
      return { success: false, error: "인증되지 않은 요청입니다." }
    }

    // 관리자 권한 확인
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", sessionData.session.user.id)
      .single()

    if (profileError) {
      console.error("프로필 확인 중 오류:", profileError)
      return { success: false, error: "프로필 확인 중 오류가 발생했습니다." }
    }

    const isAdmin = profile?.is_admin === true || sessionData.session.user.user_metadata?.role === "admin"

    if (!isAdmin) {
      return { success: false, error: "관리자 권한이 필요합니다." }
    }

    // 알림 삭제
    const { error: deleteError } = await supabase.from("notifications").delete().eq("id", id)

    if (deleteError) {
      console.error("알림 삭제 중 오류:", deleteError)
      return { success: false, error: `알림 삭제 중 오류가 발생했습니다: ${deleteError.message}` }
    }

    revalidatePath("/admin/notifications")
    return { success: true }
  } catch (error) {
    console.error("알림 삭제 중 예외 발생:", error)
    return { success: false, error: `알림 삭제 중 예외가 발생했습니다: ${(error as Error).message}` }
  }
}
