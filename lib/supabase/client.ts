import { createBrowserClient } from "@supabase/ssr"

export const createClient = () => {
  // 환경 변수가 제대로 로드되었는지 확인
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase 환경 변수가 설정되지 않았습니다.")
    throw new Error("Supabase 환경 변수가 설정되지 않았습니다.")
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
