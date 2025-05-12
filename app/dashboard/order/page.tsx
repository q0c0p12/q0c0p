export default function OrderPage() {
  return (
    <div className="w-full max-w-full space-y-5">
      <h1 className="text-2xl font-bold tracking-tight">서비스 주문</h1>
      <p className="text-muted-foreground">서비스 주문은 메인 페이지에서 원하는 서비스를 선택하여 진행해주세요.</p>
      <div className="flex justify-center py-8">
        <a href="/" className="text-rose-600 hover:underline">
          메인 페이지로 이동하여 서비스 둘러보기
        </a>
      </div>
    </div>
  )
}
