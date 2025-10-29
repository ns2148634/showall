const onPay = async () => {
  const res = await fetch("/api/payment/opay", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount, email, card_id }),
  });
  const { html } = await res.json();
  document.body.insertAdjacentHTML("beforeend", html); // 插入並自動送出
};
