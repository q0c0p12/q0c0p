import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })

  // 로그아웃 처리
  await supabase.auth.signOut()

  return NextResponse.redirect(new URL("/", request.url), {
    status: 302,
  })
}
