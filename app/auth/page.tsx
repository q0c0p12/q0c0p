import { AuthForm } from "@/components/auth/auth-form"

export default function AuthPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">계정 접속</h1>
          <p className="text-sm text-muted-foreground">이메일과 비밀번호를 입력하여 로그인하거나 새 계정을 만드세요.</p>
        </div>
        <AuthForm />
      </div>
    </div>
  )
}
