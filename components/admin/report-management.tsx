"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Download, BarChart, PieChartIcon, LineChart, Users, Package } from "lucide-react"
import { BarChart as BarChartComponent, LineChart as LineChartComponent, PieChart } from "@/components/ui/charts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface Order {
  id: string
  user_id: string
  service_id: string
  package_id: string
  status: string
  total_price: number
  created_at: string
}

interface User {
  id: string
  email: string
  full_name?: string
  points: number
  created_at: string
}

interface Service {
  id: string
  title: string
  price: number
  category_id: string
}

export function ReportManagement({ orders, users, services }: { orders: Order[]; users: User[]; services: Service[] }) {
  const [activeTab, setActiveTab] = useState("revenue")

  // 매출 데이터 계산
  const calculateRevenueData = () => {
    const monthlyRevenue: Record<string, number> = {}

    orders.forEach((order) => {
      const date = new Date(order.created_at)
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

      if (!monthlyRevenue[monthYear]) {
        monthlyRevenue[monthYear] = 0
      }

      monthlyRevenue[monthYear] += order.total_price || 0
    })

    return Object.entries(monthlyRevenue)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }

  // 사용자 등록 데이터 계산
  const calculateUserRegistrationData = () => {
    const monthlyRegistrations: Record<string, number> = {}

    users.forEach((user) => {
      const date = new Date(user.created_at)
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

      if (!monthlyRegistrations[monthYear]) {
        monthlyRegistrations[monthYear] = 0
      }

      monthlyRegistrations[monthYear] += 1
    })

    return Object.entries(monthlyRegistrations)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }

  // 서비스별 주문 데이터 계산
  const calculateServiceOrderData = () => {
    const serviceOrders: Record<string, number> = {}

    orders.forEach((order) => {
      if (!serviceOrders[order.service_id]) {
        serviceOrders[order.service_id] = 0
      }

      serviceOrders[order.service_id] += 1
    })

    return Object.entries(serviceOrders)
      .map(([serviceId, count]) => {
        const service = services.find((s) => s.id === serviceId)
        return {
          name: service ? service.title : `서비스 ${serviceId}`,
          value: count,
        }
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 5) // 상위 5개만
  }

  // 주문 상태별 데이터 계산
  const calculateOrderStatusData = () => {
    const statusCounts: Record<string, number> = {}

    orders.forEach((order) => {
      if (!statusCounts[order.status]) {
        statusCounts[order.status] = 0
      }

      statusCounts[order.status] += 1
    })

    return Object.entries(statusCounts).map(([status, count]) => ({
      name:
        status === "pending"
          ? "대기 중"
          : status === "processing"
            ? "처리 중"
            : status === "completed"
              ? "완료됨"
              : status === "cancelled"
                ? "취소됨"
                : status,
      value: count,
    }))
  }

  // CSV 다운로드 함수
  const downloadCSV = (data: any[], filename: string) => {
    if (data.length === 0) return

    const headers = Object.keys(data[0])
    const csvRows = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => {
            const cell = row[header]
            return typeof cell === "string" ? `"${cell.replace(/"/g, '""')}"` : cell
          })
          .join(","),
      ),
    ]

    const csvString = csvRows.join("\n")
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    link.style.visibility = "hidden"

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // 데이터 준비
  const revenueData = calculateRevenueData()
  const userRegistrationData = calculateUserRegistrationData()
  const serviceOrderData = calculateServiceOrderData()
  const orderStatusData = calculateOrderStatusData()

  return (
    <div className="space-y-4">
      <Tabs defaultValue="revenue" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="revenue">매출 보고서</TabsTrigger>
          <TabsTrigger value="users">사용자 보고서</TabsTrigger>
          <TabsTrigger value="services">서비스 보고서</TabsTrigger>
        </TabsList>

        {/* 매출 보고서 */}
        <TabsContent value="revenue">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>월별 매출</CardTitle>
                  <CardDescription>월별 총 매출액 추이</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => downloadCSV(revenueData, "월별_매출.csv")}>
                  <Download className="mr-2 h-4 w-4" />
                  CSV 다운로드
                </Button>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <BarChartComponent
                    data={revenueData}
                    index="date"
                    categories={["amount"]}
                    colors={["blue"]}
                    valueFormatter={(value) => `₩${value.toLocaleString()}`}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>주문 상태</CardTitle>
                <CardDescription>상태별 주문 수</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-60">
                  <PieChart
                    data={orderStatusData}
                    index="name"
                    category="value"
                    valueFormatter={(value) => `${value}건`}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <div className="text-sm text-muted-foreground">총 {orders.length}건의 주문이 있습니다.</div>
              </CardFooter>
            </Card>

            <Card className="col-span-3">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>최근 주문</CardTitle>
                  <CardDescription>최근 10건의 주문 내역</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>주문 ID</TableHead>
                      <TableHead>사용자 ID</TableHead>
                      <TableHead>서비스</TableHead>
                      <TableHead>금액</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>주문일</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.slice(0, 10).map((order) => {
                      const service = services.find((s) => s.id === order.service_id)
                      return (
                        <TableRow key={order.id}>
                          <TableCell>{order.id}</TableCell>
                          <TableCell>{order.user_id}</TableCell>
                          <TableCell>{service ? service.title : `서비스 ${order.service_id}`}</TableCell>
                          <TableCell>₩{order.total_price?.toLocaleString() || 0}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                order.status === "pending"
                                  ? "outline"
                                  : order.status === "processing"
                                    ? "secondary"
                                    : order.status === "completed"
                                      ? "default"
                                      : "destructive"
                              }
                            >
                              {order.status === "pending"
                                ? "대기 중"
                                : order.status === "processing"
                                  ? "처리 중"
                                  : order.status === "completed"
                                    ? "완료됨"
                                    : "취소됨"}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(order.created_at).toLocaleString()}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 사용자 보고서 */}
        <TabsContent value="users">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>월별 사용자 등록</CardTitle>
                  <CardDescription>월별 신규 사용자 등록 추이</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadCSV(userRegistrationData, "월별_사용자_등록.csv")}
                >
                  <Download className="mr-2 h-4 w-4" />
                  CSV 다운로드
                </Button>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <LineChartComponent
                    data={userRegistrationData}
                    index="date"
                    categories={["count"]}
                    colors={["green"]}
                    valueFormatter={(value) => `${value}명`}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>사용자 통계</CardTitle>
                <CardDescription>전체 사용자 통계</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>총 사용자 수</span>
                    </div>
                    <span className="font-bold">{users.length}명</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <BarChart className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>평균 포인트</span>
                    </div>
                    <span className="font-bold">
                      {users.length > 0
                        ? `₩${Math.round(
                            users.reduce((sum, user) => sum + (user.points || 0), 0) / users.length,
                          ).toLocaleString()}`
                        : "₩0"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <LineChart className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>최근 30일 신규 사용자</span>
                    </div>
                    <span className="font-bold">
                      {
                        users.filter(
                          (user) => new Date(user.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                        ).length
                      }
                      명
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>최근 등록 사용자</CardTitle>
                  <CardDescription>최근 10명의 등록 사용자</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>사용자 ID</TableHead>
                      <TableHead>이메일</TableHead>
                      <TableHead>이름</TableHead>
                      <TableHead>포인트</TableHead>
                      <TableHead>등록일</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users
                      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                      .slice(0, 10)
                      .map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.id}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.full_name || "-"}</TableCell>
                          <TableCell>₩{user.points?.toLocaleString() || 0}</TableCell>
                          <TableCell>{new Date(user.created_at).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 서비스 보고서 */}
        <TabsContent value="services">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>인기 서비스</CardTitle>
                  <CardDescription>주문 수 기준 상위 5개 서비스</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => downloadCSV(serviceOrderData, "인기_서비스.csv")}>
                  <Download className="mr-2 h-4 w-4" />
                  CSV 다운로드
                </Button>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <BarChartComponent
                    data={serviceOrderData}
                    index="name"
                    categories={["value"]}
                    colors={["purple"]}
                    valueFormatter={(value) => `${value}건`}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>서비스 통계</CardTitle>
                <CardDescription>전체 서비스 통계</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Package className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>총 서비스 수</span>
                    </div>
                    <span className="font-bold">{services.length}개</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <BarChart className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>평균 가격</span>
                    </div>
                    <span className="font-bold">
                      {services.length > 0
                        ? `₩${Math.round(
                            services.reduce((sum, service) => sum + (service.price || 0), 0) / services.length,
                          ).toLocaleString()}`
                        : "₩0"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <PieChartIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>주문당 평균 금액</span>
                    </div>
                    <span className="font-bold">
                      {orders.length > 0
                        ? `₩${Math.round(
                            orders.reduce((sum, order) => sum + (order.total_price || 0), 0) / orders.length,
                          ).toLocaleString()}`
                        : "₩0"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>서비스 목록</CardTitle>
                  <CardDescription>모든 서비스 목록</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>서비스 ID</TableHead>
                      <TableHead>제목</TableHead>
                      <TableHead>가격</TableHead>
                      <TableHead>카테고리 ID</TableHead>
                      <TableHead>주문 수</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {services.map((service) => {
                      const orderCount = orders.filter((order) => order.service_id === service.id).length
                      return (
                        <TableRow key={service.id}>
                          <TableCell>{service.id}</TableCell>
                          <TableCell>{service.title}</TableCell>
                          <TableCell>₩{service.price?.toLocaleString() || 0}</TableCell>
                          <TableCell>{service.category_id}</TableCell>
                          <TableCell>{orderCount}건</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
