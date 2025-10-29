import crypto from "crypto";

const MerchantID = "1424735";
const HashKey = "8XFI6CZWkd6xuxZA";
const HashIV = "2ICDTyCbciF5dx4Z";
const AioCheckOutURL = "https://cashier.opay.tw/Cashier/AioCheckOut/V5"; // 正式域名

function genCheckValue(params) {
  // 按照官方規定，組參數字串並 URL encode
  const sorted = Object.keys(params).sort().map(key => `${key}=${params[key]}`).join("&");
  const raw = `HashKey=${HashKey}&${sorted}&HashIV=${HashIV}`;
  const urlEncoded = encodeURIComponent(raw).toLowerCase()
    .replace(/%20/g, "+")
    .replace(/'/g, "%27")  // 官方要求特殊符號處理
    .replace(/~/g, "%7e")
    .replace(/%21/g, "!")
    .replace(/%28/g, "(")
    .replace(/%29/g, ")");
  // SHA256 加密
  const hash = crypto.createHash("sha256").update(urlEncoded).digest("hex").toUpperCase();
  return hash;
}

export async function POST(request) {
  const body = await request.json();
  const { amount, email, card_id } = body;

  const MerchantOrderNo = `SW${Date.now()}`; // 可自訂規則
  const TimeStamp = Math.floor(Date.now() / 1000);

  const params = {
    MerchantID,
    RespondType: "JSON",
    TimeStamp,
    Version: "1.5",
    MerchantOrderNo,
    Amt: amount,
    ItemDesc: "SHOWALL 名片+付款",
    Email: email,
    ReturnURL: "https://www.showall.tw/api/payment/opay/notify", // 實際付款完成通知網址
    ClientBackURL: "https://www.showall/pay-success?card_id=" + card_id, // 付款完跳回
    // 若需分期/超商/ATM可增修
  };
  // 產生 CheckValue
  params.CheckValue = genCheckValue(params);

  // 傳送到前端
  return Response.json({
    action: AioCheckOutURL,
    method: "POST",
    params,
    html: `<form id="opayform" method="POST" action="${AioCheckOutURL}">
      ${Object.entries(params)
        .map(([k, v]) =>
          `<input type="hidden" name="${k}" value="${v}" />`
        )
        .join("\n")}
      <button type="submit">前往歐付寶付款</button>
    </form>
    <script>document.getElementById('opayform').submit();</script>
    `
  });
}
