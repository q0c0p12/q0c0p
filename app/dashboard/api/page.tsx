import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Code, Copy, RefreshCw, AlertCircle, BarChart2, Lock, Shield } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

export default function ApiPage() {
  // API 사용량 데이터
  const apiUsage = {
    total: 1250,
    limit: 2000,
    percentage: 62.5,
  }

  // 최근 API 호출 데이터
  const recentApiCalls = [
    { id: 1, endpoint: "/v1/order", method: "POST", status: 200, time: "2025-05-05 14:32:45" },
    { id: 2, endpoint: "/v1/order/ORD-123", method: "GET", status: 200, time: "2025-05-05 14:30:12" },
    { id: 3, endpoint: "/v1/balance", method: "GET", status: 200, time: "2025-05-05 14:28:55" },
    { id: 4, endpoint: "/v1/orders", method: "GET", status: 429, time: "2025-05-05 14:25:33" },
  ]

  return (
    <div className="w-full p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">API 정보</h1>
        <p className="text-muted-foreground">API를 통해 서비스를 자동화하고 통합하세요.</p>
      </div>

      {/* 공지사항 */}
      <Card className="border-yellow-200 bg-yellow-50 w-full overflow-hidden mb-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
          <div className="space-y-0.5">
            <CardTitle className="text-sm font-medium">API 업데이트 안내</CardTitle>
            <CardDescription>중요 안내</CardDescription>
          </div>
          <AlertCircle className="h-5 w-5 text-yellow-600" />
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <div className="space-y-1">
            <p className="text-sm font-medium">새로운 API 버전 출시</p>
            <p className="text-sm text-muted-foreground">
              2025년 6월 1일부터 API v2가 출시됩니다. 기존 v1은 2025년 12월까지 지원됩니다.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <div className="md:col-span-2 lg:col-span-3 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
              <CardTitle>API 키</CardTitle>
              <CardDescription>API 키를 사용하여 서비스에 접근하세요</CardDescription>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="api-key">API 키</Label>
                  <div className="flex">
                    <Input
                      id="api-key"
                      value="sk_live_51NxXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                      readOnly
                      className="rounded-r-none"
                    />
                    <Button variant="outline" className="rounded-l-none" title="복사">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <RefreshCw className="h-4 w-4" />
                    <span>API 키 재발급</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
              <CardTitle>API 문서</CardTitle>
              <CardDescription>API 사용 방법 및 예제 코드</CardDescription>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <Tabs defaultValue="curl">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="curl">cURL</TabsTrigger>
                  <TabsTrigger value="node">Node.js</TabsTrigger>
                  <TabsTrigger value="python">Python</TabsTrigger>
                  <TabsTrigger value="php">PHP</TabsTrigger>
                </TabsList>
                <TabsContent value="curl" className="space-y-4 pt-4">
                  <div className="rounded-md bg-muted p-4">
                    <pre className="text-sm">
                      <code>
                        {`curl -X POST https://api.smmkmong.com/v1/order \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "service": "instagram_followers",
    "link": "https://www.instagram.com/username",
    "quantity": 1000
  }'`}
                      </code>
                    </pre>
                  </div>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Copy className="h-4 w-4" />
                    <span>복사</span>
                  </Button>
                </TabsContent>
                <TabsContent value="node" className="space-y-4 pt-4">
                  <div className="rounded-md bg-muted p-4">
                    <pre className="text-sm">
                      <code>
                        {`const axios = require('axios');

const apiKey = 'YOUR_API_KEY';
const url = 'https://api.smmkmong.com/v1/order';

const data = {
  service: 'instagram_followers',
  link: 'https://www.instagram.com/username',
  quantity: 1000
};

axios.post(url, data, {
  headers: {
    'Authorization': \`Bearer \${apiKey}\`,
    'Content-Type': 'application/json'
  }
})
.then(response => console.log(response.data))
.catch(error => console.error(error));`}
                      </code>
                    </pre>
                  </div>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Copy className="h-4 w-4" />
                    <span>복사</span>
                  </Button>
                </TabsContent>
                <TabsContent value="python" className="space-y-4 pt-4">
                  <div className="rounded-md bg-muted p-4">
                    <pre className="text-sm">
                      <code>
                        {`import requests

api_key = 'YOUR_API_KEY'
url = 'https://api.smmkmong.com/v1/order'

headers = {
    'Authorization': f'Bearer {api_key}',
    'Content-Type': 'application/json'
}

data = {
    'service': 'instagram_followers',
    'link': 'https://www.instagram.com/username',
    'quantity': 1000
}

response = requests.post(url, json=data, headers=headers)
print(response.json())`}
                      </code>
                    </pre>
                  </div>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Copy className="h-4 w-4" />
                    <span>복사</span>
                  </Button>
                </TabsContent>
                <TabsContent value="php" className="space-y-4 pt-4">
                  <div className="rounded-md bg-muted p-4">
                    <pre className="text-sm">
                      <code>
                        {`<?php
$api_key = 'YOUR_API_KEY';
$url = 'https://api.smmkmong.com/v1/order';

$data = array(
    'service' => 'instagram_followers',
    'link' => 'https://www.instagram.com/username',
    'quantity' => 1000
);

$options = array(
    'http' => array(
        'header'  => "Authorization: Bearer $api_key\\r\\nContent-type: application/json\\r\\n",
        'method'  => 'POST',
        'content' => json_encode($data)
    )
);

$context  = stream_context_create($options);
$result = file_get_contents($url, false, $context);

echo $result;
?>`}
                      </code>
                    </pre>
                  </div>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Copy className="h-4 w-4" />
                    <span>복사</span>
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
              <CardTitle>API 엔드포인트</CardTitle>
              <CardDescription>사용 가능한 API 엔드포인트 목록</CardDescription>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="space-y-4">
                <div className="rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="rounded bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">POST</span>
                      <span className="font-mono text-sm">/v1/order</span>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Code className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">새로운 주문을 생성합니다</p>
                </div>
                <div className="rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="rounded bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">GET</span>
                      <span className="font-mono text-sm">/v1/order/{"{order_id}"}</span>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Code className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">특정 주문의 상태를 조회합니다</p>
                </div>
                <div className="rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="rounded bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">GET</span>
                      <span className="font-mono text-sm">/v1/orders</span>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Code className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">모든 주문 목록을 조회합니다</p>
                </div>
                <div className="rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="rounded bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">GET</span>
                      <span className="font-mono text-sm">/v1/balance</span>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Code className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">현재 계정 잔액을 조회합니다</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 오른쪽 사이드바 컨텐츠 */}
        <div className="space-y-6">
          {/* API 사용량 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
              <div>
                <CardTitle className="text-base">API 사용량</CardTitle>
                <CardDescription>이번 달 API 호출 횟수</CardDescription>
              </div>
              <BarChart2 className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="space-y-4">
                <div className="text-2xl font-bold">
                  {apiUsage.total} / {apiUsage.limit}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-rose-600 h-2.5 rounded-full" style={{ width: `${apiUsage.percentage}%` }}></div>
                </div>
                <p className="text-sm text-muted-foreground">남은 API 호출 횟수: {apiUsage.limit - apiUsage.total}회</p>
                <Button variant="outline" size="sm" className="w-full">
                  API 사용량 업그레이드
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 최근 API 호출 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
              <div>
                <CardTitle className="text-base">최근 API 호출</CardTitle>
                <CardDescription>최근 API 요청 기록</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="space-y-3">
                {recentApiCalls.map((call) => (
                  <div key={call.id} className="flex items-center justify-between p-2 border rounded-lg text-sm">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={
                            call.method === "GET"
                              ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                              : "bg-green-100 text-green-800 hover:bg-green-100"
                          }
                        >
                          {call.method}
                        </Badge>
                        <span className="font-mono">{call.endpoint}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{call.time}</p>
                    </div>
                    <Badge
                      className={
                        call.status === 200
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : "bg-red-100 text-red-800 hover:bg-red-100"
                      }
                    >
                      {call.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* API 보안 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
              <div>
                <CardTitle className="text-base">API 보안</CardTitle>
                <CardDescription>보안 설정 상태</CardDescription>
              </div>
              <Shield className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-green-600" />
                    <span className="text-sm">IP 제한</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">활성화</Badge>
                </div>
                <div className="flex items-center justify-between p-2 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-green-600" />
                    <span className="text-sm">2단계 인증</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">활성화</Badge>
                </div>
                <div className="flex items-center justify-between p-2 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-red-600" />
                    <span className="text-sm">요청 로깅</span>
                  </div>
                  <Badge className="bg-red-100 text-red-800 hover:bg-red-100">비활성화</Badge>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  보안 설정 관리
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Alert className="mt-6">
        <AlertTitle>API 사용 제한</AlertTitle>
        <AlertDescription>
          API 요청은 분당 60회로 제한됩니다. 제한을 초과할 경우 429 상태 코드가 반환됩니다.
        </AlertDescription>
      </Alert>
    </div>
  )
}
