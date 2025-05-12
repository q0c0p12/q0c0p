import { Badge } from "@/components/ui/badge"

export function RefundSimulation() {
  return (
    <div className="border rounded-md p-6 bg-white">
      <h2 className="text-xl font-bold mb-4">부분 환불 후 주문 표시 시뮬레이션</h2>

      <div className="border rounded-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">사용자</th>
              <th className="p-3 text-left">서비스 정보</th>
              <th className="p-3 text-left">금액</th>
              <th className="p-3 text-left">상태</th>
              <th className="p-3 text-left">날짜</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="p-3 font-medium">1234</td>
              <td className="p-3">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-xs">사</span>
                  </div>
                  <span className="text-sm">사용자123</span>
                </div>
              </td>
              <td className="p-3">
                <div className="space-y-1">
                  <div className="text-sm font-medium">인스타그램 팔로워 늘리기</div>
                  <div className="text-sm text-gray-500">₩10,000 x 7</div>
                </div>
              </td>
              <td className="p-3">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">결제:</span>
                    <span className="line-through text-muted-foreground">₩70,000</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">실제 결제:</span>
                    <span className="text-green-600 font-medium">₩60,000</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">환불:</span>
                    <span className="text-red-600 font-medium">₩10,000</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">환불 수량: 1개 / 7개</div>
                </div>
              </td>
              <td className="p-3">
                <Badge className="bg-orange-500">부분환불</Badge>
              </td>
              <td className="p-3 text-sm">2023년 5월 9일 오후 4:30</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-8 border rounded-md p-4 bg-gray-50">
        <h3 className="font-semibold mb-2">환불 상세 정보 (펼쳤을 때)</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-2">주문 정보</h4>
            <p>
              <span className="font-medium">주문 ID:</span> 1234
            </p>
            <p>
              <span className="font-medium">사용자 ID:</span> user_789
            </p>
            <p>
              <span className="font-medium">이메일:</span> user@example.com
            </p>
            <p>
              <span className="font-medium">총 금액:</span> ₩70,000
            </p>

            <div className="mt-2 p-3 bg-gray-100 rounded-md">
              <h5 className="font-medium mb-1">환불 정보</h5>
              <p>
                <span className="font-medium">환불 금액:</span> ₩10,000
              </p>
              <p className="text-sm mt-1">
                <span className="font-medium">환불 수량:</span> 1개
              </p>
              <p className="text-sm mt-1">
                <span className="font-medium">환불 사유:</span> 고객 요청
              </p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2">상태 정보</h4>
            <p>
              <span className="font-medium">현재 상태:</span> 부분환불
            </p>
            <p>
              <span className="font-medium">생성 날짜:</span> 2023년 5월 9일 오후 2:15
            </p>
            <p>
              <span className="font-medium">업데이트 날짜:</span> 2023년 5월 9일 오후 4:30
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="font-semibold mb-2">환불 처리 과정</h3>
        <ol className="list-decimal pl-5 space-y-2">
          <li>주문 목록에서 신규 주문을 찾습니다.</li>
          <li>해당 주문의 오른쪽 끝에 있는 "..." 메뉴를 클릭합니다.</li>
          <li>드롭다운 메뉴에서 "부분 환불" 옵션을 선택합니다.</li>
          <li>부분 환불 다이얼로그에서 환불할 수량을 입력합니다 (예: 7개 중 1개).</li>
          <li>"환불 처리" 버튼을 클릭합니다.</li>
          <li>환불이 처리되고 성공 메시지가 표시됩니다.</li>
          <li>페이지가 새로고침되고 주문 상태가 "부분환불"로 변경됩니다.</li>
        </ol>
      </div>

      <div className="mt-8 border rounded-md p-4 bg-blue-50">
        <h3 className="font-semibold mb-2 text-blue-800">부분 환불 다이얼로그</h3>
        <div className="bg-white p-4 rounded-md border">
          <div className="mb-4">
            <h4 className="text-lg font-bold">부분 환불 처리</h4>
            <p className="text-sm text-gray-500">
              주문 #1234에 대한 부분 환불을 처리합니다. 환불할 수량을 입력해주세요.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-100 rounded-md mb-4">
            <div>
              <p className="text-sm font-medium">주문 ID</p>
              <p>#1234</p>
            </div>
            <div>
              <p className="text-sm font-medium">총 금액</p>
              <p className="font-semibold">₩70,000</p>
            </div>
            <div>
              <p className="text-sm font-medium">주문 상태</p>
              <p>처리중</p>
            </div>
            <div>
              <p className="text-sm font-medium">총 수량</p>
              <p>7개</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">환불 수량</label>
              <div className="flex items-center space-x-2">
                <div className="w-24 h-9 border rounded-md flex items-center justify-center">1</div>
                <span className="text-sm text-gray-500">/ 7개</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">단가</label>
              <div className="text-sm">₩10,000 / 개</div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">환불 금액</label>
              <div className="text-lg font-semibold text-red-500">₩10,000</div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">환불 후 결제 금액</label>
              <div className="text-lg font-semibold text-green-600">₩60,000</div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t flex justify-end space-x-2">
            <button className="px-4 py-2 border rounded-md">취소</button>
            <button className="px-4 py-2 rounded-md bg-orange-600 text-white">환불 처리</button>
          </div>
        </div>
      </div>
    </div>
  )
}
