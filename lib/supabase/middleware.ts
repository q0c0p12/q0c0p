import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export function createClient(request: any) {
  const cookieStore = cookies()

  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        try {
          cookies().set({ name, value, ...options })
        } catch (error) {
          // 쿠키 설정 오류 무시
        }
      },
      remove(name: string, options: any) {
        try {
          cookies().set({ name, value: "", ...options })
        } catch (error) {
          // 쿠키 삭제 오류 무시
        }
      },
    },
  })

  return {
    supabase,
    response: new Response(null, {
      status: 200,
      headers: {
        "cache-control": "no-store",
      },
    }),
  }
}
