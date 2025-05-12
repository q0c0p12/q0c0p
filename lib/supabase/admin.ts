import { createClient } from "@supabase/supabase-js"

// Service role keys bypass RLS, so don't expose it to the client!
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const createAdminClient = () => {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// 싱글톤 인스턴스 생성
export const supabaseAdmin = createAdminClient()
