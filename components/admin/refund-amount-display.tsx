interface RefundAmountDisplayProps {
  order: any
  formatCurrency: (amount: number) => string
}

export function RefundAmountDisplay({ order, formatCurrency }: RefundAmountDisplayProps) {
  // 환불 금액 계산 - 이제 refunded_amount 필드를 직접 사용
  const refundAmount = order.refunded_amount || 0
  const originalAmount = order.total_amount || 0
  const remainingAmount = originalAmount - refundAmount

  return (
    <div className="space-y-1">
      <p className="text-sm">
        <span className="font-medium">원래 금액:</span>{" "}
        <span className="line-through">{formatCurrency(originalAmount)}</span>
      </p>
      <p className="text-sm">
        <span className="font-medium">환불 금액:</span>{" "}
        <span className="text-red-600">{formatCurrency(refundAmount)}</span>
      </p>
      <p className="text-sm">
        <span className="font-medium">최종 결제 금액:</span>{" "}
        <span className="text-green-600 font-semibold">{formatCurrency(remainingAmount)}</span>
      </p>
    </div>
  )
}
