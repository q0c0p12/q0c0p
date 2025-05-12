"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export function AuthForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [resetSent, setResetSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // URL 파라미터에서 탭 정보 가져오기
  const defaultTab = searchParams.get("tab") || "signin"

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Supabase 클라이언트 생성
      const supabase = createClient()

      console.log("로그인 시도:", { email })

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("로그인 오류:", error)
        throw error
      }

      console.log("로그인 성공:", data)

      toast({
        title: "로그인 성공",
        description: "환영합니다!",
      })

      // 세션 확인
      const { data: sessionData } = await supabase.auth.getSession()
      console.log("세션 정보:", sessionData)

      // 페이지 새로고침 및 리디렉션
      router.refresh()
      router.push("/dashboard")
    } catch (error: any) {
      console.error("로그인 처리 중 오류:", error)
      setError(error.message || "로그인 중 오류가 발생했습니다.")
      toast({
        title: "로그인 실패",
        description: error.message || "로그인 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      console.log("회원가입 시도:", { email, fullName })

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) {
        console.error("회원가입 오류:", error)
        throw error
      }

      console.log("회원가입 성공:", data)

      if (data.user) {
        // 프로필 테이블에 사용자 정보 추가
        const { error: profileError } = await supabase.from("profiles").insert({
          id: data.user.id,
          full_name: fullName,
        })

        if (profileError) {
          console.error("프로필 생성 오류:", profileError)
        }

        toast({
          title: "회원가입 성공",
          description: "이메일 확인을 통해 가입을 완료해주세요.",
        })
      }
    } catch (error: any) {
      console.error("회원가입 처리 중 오류:", error)
      setError(error.message || "회원가입 중 오류가 발생했습니다.")
      toast({
        title: "회원가입 실패",
        description: error.message || "회원가입 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      console.log("비밀번호 재설정 시도:", { email })

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        console.error("비밀번호 재설정 오류:", error)
        throw error
      }

      setResetSent(true)
      toast({
        title: "비밀번호 재설정 이메일 발송",
        description: "이메일을 확인하여 비밀번호를 재설정하세요.",
      })
    } catch (error: any) {
      console.error("비밀번호 재설정 처리 중 오류:", error)
      setError(error.message || "이메일 발송 중 오류가 발생했습니다.")
      toast({
        title: "이메일 발송 실패",
        description: error.message || "이메일 발송 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <Tabs defaultValue={defaultTab}>
        <CardHeader>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="signin">로그인</TabsTrigger>
            <TabsTrigger value="signup">회원가입</TabsTrigger>
            <TabsTrigger value="reset">비밀번호 찾기</TabsTrigger>
          </TabsList>
        </CardHeader>
        <TabsContent value="signin">
          <form onSubmit={handleSignIn}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && <div className="text-sm text-red-500 mt-2">{error}</div>}
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full bg-rose-600 hover:bg-rose-700" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 로그인 중...
                  </>
                ) : (
                  "로그인"
                )}
              </Button>
              <div className="text-center text-sm">
                <Link href="/auth?tab=reset" className="text-rose-600 hover:underline">
                  비밀번호를 잊으셨나요?
                </Link>
              </div>
            </CardFooter>
          </form>
        </TabsContent>
        <TabsContent value="signup">
          <form onSubmit={handleSignUp}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">이름</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="홍길동"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-signup">이메일</Label>
                <Input
                  id="email-signup"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-signup">비밀번호</Label>
                <Input
                  id="password-signup"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && <div className="text-sm text-red-500 mt-2">{error}</div>}
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full bg-rose-600 hover:bg-rose-700" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 가입 중...
                  </>
                ) : (
                  "회원가입"
                )}
              </Button>
              <div className="text-center text-sm">
                이미 계정이 있으신가요?{" "}
                <Link href="/auth?tab=signin" className="text-rose-600 hover:underline">
                  로그인
                </Link>
              </div>
            </CardFooter>
          </form>
        </TabsContent>
        <TabsContent value="reset">
          {!resetSent ? (
            <form onSubmit={handleResetPassword}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-reset">이메일</Label>
                  <Input
                    id="email-reset"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                {error && <div className="text-sm text-red-500 mt-2">{error}</div>}
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full bg-rose-600 hover:bg-rose-700" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 처리 중...
                    </>
                  ) : (
                    "비밀번호 재설정 이메일 받기"
                  )}
                </Button>
                <div className="text-center text-sm">
                  <Link href="/auth?tab=signin" className="text-rose-600 hover:underline">
                    로그인으로 돌아가기
                  </Link>
                </div>
              </CardFooter>
            </form>
          ) : (
            <CardContent className="space-y-4 text-center py-6">
              <div className="text-green-600 font-medium">비밀번호 재설정 이메일이 발송되었습니다!</div>
              <p className="text-muted-foreground">이메일을 확인하여 비밀번호 재설정 링크를 클릭하세요.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setResetSent(false)
                  setEmail("")
                }}
              >
                다시 시도
              </Button>
            </CardContent>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  )
}
