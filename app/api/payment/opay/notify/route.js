import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);



export async function POST(request) {
  const form = await request.formData()
  const MerchantOrderNo = form.get('MerchantOrderNo')
  const TradeAmt = form.get('TradeAmt')
  const PaymentType = form.get('PaymentType')
  const TradeNo = form.get('TradeNo')
  const PaymentDate = form.get('PaymentDate')

  // 1. 更新付款狀態至 paid
  const { data, error } = await supabase
    .from("payments")
    .update({
      status: "paid",
      opay_trade_no: TradeNo,
      paid_at: PaymentDate,
      method: PaymentType,
      amount: TradeAmt
    })
    .eq('order_no', MerchantOrderNo)
    .select("card_id, email, amount")

  const payment = data?.[0]
  const cardId = payment?.card_id

  // 2. 名片自動上架（狀態改為 active 並記錄上架時間）
  if (cardId) {
    await supabase
      .from("cards")
      .update({ status: "active", published_at: new Date().toISOString() })
      .eq("id", cardId)
  }

  // 3. 自動寄 Email 通知用戶和客服（用 fetch 呼叫 sendmail API）
  if (payment) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.showall.tw";
    const payloadUser = {
      to: payment.email,
      subject: "SHOWALL名片+付款完成通知",
      html: `
        <div>親愛的會員您好，</div>
        <div>您的付款已完成，名片已自動上架！感謝您的支持。</div>
      `
    };
    await fetch(`${siteUrl}/api/sendmail`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payloadUser)
    });

    const payloadAdmin = {
      to: "service@showall.tw",
      subject: "用戶完成付款（SHOWALL名片+）",
      html: `
        <div>用戶Email：${payment.email}</div>
        <div>名片ID：${cardId}</div>
        <div>金額：${payment.amount}，已成功付款。</div>
      `
    };
    await fetch(`${siteUrl}/api/sendmail`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payloadAdmin)
    });
  }

  // OPay 必須收到 "SUCCESS" 才不會重複呼叫
  return new Response("SUCCESS", { status: 200 })
}
