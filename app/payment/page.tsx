"use client";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const BANK_INFO = {
  bank: "玉山銀行",
  code: "808",
  account: "0532979018399",
};

function PaymentPageInner() {
  const searchParams = useSearchParams();
  const cardId = searchParams.get("card_id");  // ← 接收 card_id

  const [method, setMethod] = useState<"opay" | "bank">("bank");
  const [remit, setRemit] = useState<{
    email: string;
    amount: number;
    code: string;
    time: string;
    receipt: null | File;
  }>({
    email: "",
    amount: 100,
    code: "",
    time: "",
    receipt: null,
  });

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setRemit((r) => ({ ...r, [e.target.name]: e.target.value }));
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      setRemit((r) => ({ ...r, receipt: file }));
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!remit.email.match(/.+@.+\..+/)) {
      setMsg("請正確填寫 Email！");
      return;
    }
    if (remit.code.length !== 5 || !/^[0-9]+$/.test(remit.code)) {
      setMsg("請輸入匯款帳號後五碼（數字）");
      return;
    }
    if (!remit.time) {
      setMsg("請填匯款時間");
      return;
    }

    setLoading(true);
    let receipt_url = "";

    // 上傳圖片（可選）
    if (remit.receipt) {
      const { data, error } = await supabase.storage
        .from("receipts")
        .upload(`receipt-${remit.email}-${Date.now()}`, remit.receipt, {
          upsert: true,
        });
      if (data && data.path) {
        receipt_url = supabase.storage
          .from("receipts")
          .getPublicUrl(data.path).data.publicUrl;
      }
    }

    // 寫入 payments table
    const { error } = await supabase.from("payments").insert([
      {
        card_id: cardId ? parseInt(cardId) : null,  // ← 加上 card_id
        email: remit.email,
        amount: remit.amount,
        method: "bank",
        code: remit.code,
        time: remit.time,
        receipt_url,
        created_at: new Date().toISOString(),
        status: "pending",
      },
    ]);

    setLoading(false);

    if (!error) {
      setSubmitted(true);
      setMsg("匯款資料已提交！請靜待 1-2 個工作日審核。");

      // Email 通知站長
      await fetch("/api/sendMail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: "service@showall.tw",
          subject: "新的匯款資料已提交",
          html: `
            <div>匯款通知如下：</div>
            <div>名片 ID: ${cardId || "無"}</div>
            <div>Email: ${remit.email}</div>
            <div>金額: ${remit.amount}</div>
            <div>帳號後五碼: ${remit.code}</div>
            <div>匯款時間: ${remit.time}</div>
            ${receipt_url ? `<div>憑證: <a href="${receipt_url}" target="_blank">查看圖片</a></div>` : ""}
          `,
        }),
      });

      // Email 通知用戶
      await fetch("/api/sendMail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: remit.email,
          subject: "匯款資料已收到，請靜待審核",
          html: `
            <div>親愛會員您好：</div>
            <div>我們已收到您的匯款資料（金額100元），請靜待1-2個工作日審核。</div>
            <div>審核通過後，您的名片將自動上線。</div>
            <div>有問題請回覆此信或聯絡客服。</div>
          `,
          replyTo: "service@showall.tw",
        }),
      });
    } else {
      setMsg("發生錯誤，請重試或聯絡客服");
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg p-8 flex flex-col gap-5">
        <h2 className="text-2xl font-bold text-blue-800 text-center mb-2">
          馬上打開你的人脈網！
        </h2>

        <div className="flex gap-3 justify-center mb-3">
          <button
            className={`py-2 px-6 rounded-lg font-bold border ${method === "opay"
                ? "bg-blue-300 border-blue-500 text-white"
                : "bg-gray-200 border-gray-400 text-gray-700"
              }`}
            onClick={() => setMethod("opay")}
            disabled
            title="尚未開放"
          >
            線上付款（即將開放）
          </button>
          <button
            className={`py-2 px-6 rounded-lg font-bold border ${method === "bank"
                ? "bg-green-500 border-green-700 text-white"
                : "bg-gray-200 border-gray-400 text-gray-700"
              }`}
            onClick={() => setMethod("bank")}
          >
            銀行匯款
          </button>
        </div>

        {method === "opay" && (
          <div className="bg-blue-100 text-blue-600 rounded px-4 py-6 text-center mb-4">
            歐付寶線上付款功能即將開放！
          </div>
        )}

        {method === "bank" && (
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
              <label className="font-bold text-gray-700 block mb-1">
                上架時填寫的 Email
                <span className="text-red-500">*</span>
              </label>
              <input
                name="email"
                type="email"
                className="border rounded px-3 py-2 w-full"
                value={remit.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="bg-gray-50 px-3 py-3 rounded-lg my-1">
              <div className="mb-1 text-gray-700">請匯款至：</div>
              <div className="font-bold text-lg text-gray-900">
                【{BANK_INFO.bank}】{BANK_INFO.code}
              </div>
              <div className="font-mono text-base select-all text-blue-700">
                {BANK_INFO.account}
              </div>
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">
                匯款金額
              </label>
              <input
                name="amount"
                className="border rounded px-3 py-2 w-full"
                type="number"
                value={remit.amount}
                disabled
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">
                匯款帳號後五碼<span className="text-red-500">*</span>
              </label>
              <input
                name="code"
                className="border rounded px-3 py-2 w-full"
                maxLength={5}
                value={remit.code}
                inputMode="numeric"
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">
                匯款時間（必填）
              </label>
              <input
                name="time"
                className="border rounded px-3 py-2 w-full"
                type="datetime-local"
                value={remit.time}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">
                上傳匯款憑證（可選）
              </label>
              <input type="file" accept="image/*" onChange={handleFile} />
              {preview && (
                <img
                  src={preview}
                  alt="匯款憑證"
                  className="mt-2 rounded shadow w-36"
                />
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-green-600 text-white font-bold text-lg hover:bg-green-700 transition mt-2"
              disabled={loading}
            >
              {loading ? "提交中..." : "提交匯款資料"}
            </button>

            {msg && (
              <div
                className={`text-center mt-2 font-bold ${submitted ? "text-green-600" : "text-red-500"
                  }`}
              >
                {msg}
              </div>
            )}
          </form>
        )}

        <div className="text-center text-gray-400 text-sm pt-4 border-t mt-6">
          若有任何問題請聯繫客服：
          <a href="mailto:service@showall.tw" className="text-blue-600 hover:underline">
            service@showall.tw
          </a>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="text-center py-10">載入中...</div>}>
      <PaymentPageInner />
    </Suspense>
  );
}
