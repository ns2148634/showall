export async function POST(request) {
  const { amount, email, card_id } = await request.json();

  // 你的付款串接與 html 生成邏輯
  // 例如調用 OPay API 返回 html 字串

  // 這裡舉例返回一個假 html
  const html = `<form action="xxx" method="POST">...</form>`;

  return new Response(JSON.stringify({ html }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
}
