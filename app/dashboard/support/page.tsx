import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { AlertCircle, MessageSquare, Clock, CheckCircle, HelpCircle } from "lucide-react"

export default function SupportPage() {
  // 더미 데이터
  const tickets = [
    {
      id: "TKT-001",
      subject: "결제 오류 문의",
      status: "open",
      date: "2025-05-01",
      lastUpdate: "2025-05-02",
    },
    {
      id: "TKT-002",
      subject: "서비스 지연 문의",
      status: "closed",
      date: "2025-04-28",
      lastUpdate: "2025-04-30",
    },
    {
      id: "TKT-003",
      subject: "환불 요청",
      status: "pending",
      date: "2025-05-03",
      lastUpdate: "2025-05-03",
    },
  ]

  // 상태에 따른 배지 스타일
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge className="bg-green-500">처리중</Badge>
      case "pending":
        return <Badge className="bg-yellow-500">대기중</Badge>
      case "closed":
        return <Badge variant="outline">완료</Badge>
      default:
        return <Badge variant="outline">기타</Badge>
    }
  }

  // FAQ 데이터
  const faqs = [
    {
      question: "서비스 주문 후 얼마나 기다려야 하나요?",
      answer:
        "일반적으로 서비스는 주문 후 24-48시간 내에 시작됩니다. 서비스 유형에 따라 완료 시간이 다를 수 있으며, 대부분의 서비스는 1-3일 내에 완료됩니다.",
    },
    {
      question: "주문한 서비스가 예상보다 적게 제공되었습니다. 어떻게 해야 하나요?",
      answer:
        "일부 서비스는 소셜 미디어 플랫폼의 정책 변경이나 기술적 문제로 인해 일부 손실이 발생할 수 있습니다. 주문 후 30일 이내에 발생한 손실에 대해서는 무료로 보충해 드립니다. 고객 지원 티켓을 통해 문의해 주세요.",
    },
    {
      question: "결제는 어떤 방식으로 이루어지나요?",
      answer:
        "신용카드, 계좌이체, 가상 계좌 등 다양한 결제 방식을 지원합니다. 모든 결제는 안전한 결제 게이트웨이를 통해 처리되며, 개인정보는 암호화되어 보호됩니다.",
    },
    {
      question: "환불 정책은 어떻게 되나요?",
      answer:
        "서비스가 시작되기 전에는 100% 환불이 가능합니다. 서비스가 시작된 후에는 제공된 서비스 비율에 따라 부분 환불이 가능합니다. 자세한 내용은 이용약관을 참조하거나 고객 지원팀에 문의해 주세요.",
    },
    {
      question: "API를 통해 대량 주문을 할 수 있나요?",
      answer:
        "네, API를 통해 대량 주문이 가능합니다. API 키를 발급받아 프로그래밍 방식으로 주문을 자동화할 수 있습니다. 자세한 내용은 API 문서를 참조하세요.",
    },
  ]

  // 지원 통계
  const supportStats = [
    { title: "평균 응답 시간", value: "2시간", icon: Clock },
    { title: "해결률", value: "95%", icon: CheckCircle },
    { title: "만족도", value: "4.8/5", icon: MessageSquare },
  ]

  return (
    <div className="w-full p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">고객 지원</h1>
        <p className="text-muted-foreground">문의사항이나 도움이 필요하신 경우 티켓을 생성하세요.</p>
      </div>

      {/* 공지사항 */}
      <Card className="border-yellow-200 bg-yellow-50 w-full overflow-hidden mb-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
          <div className="space-y-0.5">
            <CardTitle className="text-sm font-medium">고객센터 운영 안내</CardTitle>
            <CardDescription>중요 안내</CardDescription>
          </div>
          <AlertCircle className="h-5 w-5 text-yellow-600" />
        </CardHeader>
        <CardContent className="py-1">
          <div className="space-y-1">
            <p className="text-sm font-medium">고객센터 운영 시간 변경</p>
            <p className="text-sm text-muted-foreground">
              2025년 5월부터 고객센터 운영 시간이 평일 09:00~18:00로 변경됩니다. 주말 및 공휴일은 휴무입니다.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <div className="md:col-span-2 lg:col-span-3 space-y-6">
          {/* 지원 통계 */}
          <div className="grid grid-cols-3 gap-6">
            {supportStats.map((stat, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
                  <div className="space-y-0.5">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  </div>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="new-ticket">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="new-ticket">새 티켓 생성</TabsTrigger>
              <TabsTrigger value="my-tickets">내 티켓</TabsTrigger>
              <TabsTrigger value="faq">자주 묻는 질문</TabsTrigger>
            </TabsList>
            <TabsContent value="new-ticket" className="space-y-4 pt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>새 티켓 생성</CardTitle>
                  <CardDescription>문의사항을 작성하여 티켓을 생성하세요</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">제목</Label>
                    <Input id="subject" placeholder="문의 제목을 입력하세요" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">카테고리</Label>
                    <select
                      id="category"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">카테고리 선택</option>
                      <option value="order">주문 문의</option>
                      <option value="payment">결제 문의</option>
                      <option value="refund">환불 요청</option>
                      <option value="technical">기술 지원</option>
                      <option value="other">기타</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">내용</Label>
                    <Textarea id="message" placeholder="문의 내용을 자세히 작성해주세요" rows={5} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="attachment">첨부 파일 (선택사항)</Label>
                    <Input id="attachment" type="file" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-rose-600 hover:bg-rose-700">티켓 제출</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="my-tickets" className="space-y-4 pt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>내 티켓</CardTitle>
                  <CardDescription>생성한 티켓 목록입니다</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto -mx-4 px-4">
                    <div className="min-w-[640px]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>티켓 번호</TableHead>
                            <TableHead>제목</TableHead>
                            <TableHead>상태</TableHead>
                            <TableHead>생성일</TableHead>
                            <TableHead>마지막 업데이트</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {tickets.map((ticket) => (
                            <TableRow key={ticket.id}>
                              <TableCell className="font-medium">{ticket.id}</TableCell>
                              <TableCell>{ticket.subject}</TableCell>
                              <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                              <TableCell>{ticket.date}</TableCell>
                              <TableCell>{ticket.lastUpdate}</TableCell>
                              <TableCell>
                                <Button variant="outline" size="sm">
                                  보기
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="faq" className="space-y-4 pt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>자주 묻는 질문</CardTitle>
                  <CardDescription>일반적인 질문에 대한 답변입니다</CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger>{faq.question}</AccordionTrigger>
                        <AccordionContent>{faq.answer}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
                <CardFooter className="flex justify-center border-t pt-4">
                  <p className="text-sm text-muted-foreground">
                    원하는 답변을 찾지 못하셨나요?{" "}
                    <Button variant="link" className="h-auto p-0 text-rose-600">
                      새 티켓 생성하기
                    </Button>
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* 오른쪽 사이드바 컨텐츠 */}
        <div className="space-y-6">
          {/* 빠른 링크 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
              <div>
                <CardTitle className="text-base">빠른 링크</CardTitle>
                <CardDescription>자주 찾는 도움말</CardDescription>
              </div>
              <HelpCircle className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start text-left" asChild>
                  <a href="#">주문 취소 방법</a>
                </Button>
                <Button variant="outline" className="w-full justify-start text-left" asChild>
                  <a href="#">환불 정책</a>
                </Button>
                <Button variant="outline" className="w-full justify-start text-left" asChild>
                  <a href="#">API 사용 가이드</a>
                </Button>
                <Button variant="outline" className="w-full justify-start text-left" asChild>
                  <a href="#">계정 보안 설정</a>
                </Button>
                <Button variant="outline" className="w-full justify-start text-left" asChild>
                  <a href="#">서비스 이용약관</a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 연락처 정보 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
              <div>
                <CardTitle className="text-base">연락처 정보</CardTitle>
                <CardDescription>고객 지원팀 연락처</CardDescription>
              </div>
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="font-medium">이메일</p>
                  <p className="text-sm">support@smmkmong.com</p>
                </div>
                <div className="space-y-1">
                  <p className="font-medium">전화번호</p>
                  <p className="text-sm">02-123-4567</p>
                </div>
                <div className="space-y-1">
                  <p className="font-medium">운영 시간</p>
                  <p className="text-sm">평일 09:00 - 18:00</p>
                  <p className="text-xs text-muted-foreground">주말 및 공휴일 휴무</p>
                </div>
                <Button className="w-full bg-rose-600 hover:bg-rose-700">채팅 상담 시작하기</Button>
              </div>
            </CardContent>
          </Card>

          {/* 최근 공지사항 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
              <div>
                <CardTitle className="text-base">최근 공지사항</CardTitle>
                <CardDescription>중요 안내 및 업데이트</CardDescription>
              </div>
              <AlertCircle className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="space-y-3">
                <div className="border rounded-lg p-3">
                  <p className="font-medium text-sm">서비스 점검 안내</p>
                  <p className="text-xs text-muted-foreground">2025-05-10</p>
                  <p className="text-sm mt-1">5월 10일 오전 2시부터 4시까지 시스템 점검이 예정되어 있습니다.</p>
                </div>
                <div className="border rounded-lg p-3">
                  <p className="font-medium text-sm">신규 서비스 출시</p>
                  <p className="text-xs text-muted-foreground">2025-05-05</p>
                  <p className="text-sm mt-1">틱톡 댓글 서비스가 새롭게 출시되었습니다. 지금 확인해보세요!</p>
                </div>
                <div className="border rounded-lg p-3">
                  <p className="font-medium text-sm">결제 시스템 업데이트</p>
                  <p className="text-xs text-muted-foreground">2025-05-01</p>
                  <p className="text-sm mt-1">더 안전하고 편리한 결제를 위해 결제 시스템이 업데이트되었습니다.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
