import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/middleware"

export async function middleware(request: NextRequest) {
  try {
    const { supabase, response } = createClient(request)

    // 세션 가져오기
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("세션 가져오기 오류:", sessionError)
      // 세션 오류 발생 시 로그인 페이지로 리디렉션
      return NextResponse.redirect(new URL("/auth?tab=signin", request.url))
    }

    // 관리자 영역 접근 제한
    if (request.nextUrl.pathname.startsWith("/admin")) {
      if (!session) {
        // 로그인되지 않은 경우 로그인 페이지로 리디렉션
        return NextResponse.redirect(new URL("/auth?tab=signin", request.url))
      }

      // 관리자 권한 확인
      try {
        // 메타데이터에서 role 확인
        const isAdminByMeta = session.user.user_metadata?.role === "admin"

        // 데이터베이스에서 is_admin 확인
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", session.user.id)
          .single()

        if (profileError) {
          console.error("프로필 조회 오류:", profileError)
          throw profileError
        }

        const isAdminByDb = profile?.is_admin === true

        // 디버깅 로그 추가
        console.log("Admin check:", {
          userId: session.user.id,
          isAdminByMeta,
          isAdminByDb,
          metadata: session.user.user_metadata,
          profile,
        })

        // 둘 중 하나라도 관리자면 접근 허용
        if (isAdminByMeta || isAdminByDb) {
          return response
        }

        // 관리자가 아니면 대시보드로 리디렉션
        return NextResponse.redirect(new URL("/dashboard", request.url))
      } catch (error) {
        console.error("Error checking admin status in middleware:", error)
        // 오류 발생 시 대시보드로 리디렉션
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
    }

    // 대시보드 접근 제한
    if (request.nextUrl.pathname.startsWith("/dashboard")) {
      if (!session) {
        // 로그인되지 않은 경우 로그인 페이지로 리디렉션
        return NextResponse.redirect(new URL("/auth?tab=signin", request.url))
      }
    }

    return response
  } catch (error) {
    console.error("Middleware error:", error)
    // 오류 발생 시 로그인 페이지로 리디렉션
    return NextResponse.redirect(new URL("/auth?tab=signin", request.url))
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
}
