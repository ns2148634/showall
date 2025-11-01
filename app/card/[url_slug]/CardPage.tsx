"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Card = {
  id: number;
  name: string;
  company?: string;
  email: string;
  line?: string;
  mobile?: string;
  citys?: string;
  area?: string;
  contact_other?: string;
  intro?: string;
  image_url_front?: string;
  image_url_back?: string;
  url_slug: string;
  theme_color?: string;
  tag1?: string;
  tag2?: string;
  tag3?: string;
  tag4?: string;
  views?: number;
};

export default function CardPage({ url_slug }: { url_slug: string }) {
  const decodedSlug = decodeURIComponent(url_slug);
  const [card, setCard] = useState<Card | null>(null);
  const [msg, setMsg] = useState("");

  // 新增--申請修改驗證流程用 state
  const [question, setQuestion] = useState<{ field: string, label: string, answer: string } | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [loadingEditMail, setLoadingEditMail] = useState(false);

  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const router = useRouter();

  const cardUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/card/${card?.url_slug ?? ""}`
      : "";

  useEffect(() => {
    if (!decodedSlug) {
      setMsg("查無此名片或參數錯誤");
      return;
    }
    async function fetchCard() {
      const { data, error } = await supabase
        .from("cards")
        .select("*")
        .eq("url_slug", decodedSlug)
        .eq("published", true)
        .single();
      if (error || !data) {
        setMsg("查無此名片或尚未發佈");
        return;
      }
      setCard(data);

      // 新增 —— 計次
      await supabase
        .from("cards")
        .update({ views: (data.views || 0) + 1 })
        .eq("id", data.id);
    }
    fetchCard();
  }, [decodedSlug]);

  const referralUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/upload?referrer=${card?.url_slug ?? ""}`
      : "";

  function handleShare() {
    window.open(referralUrl, "_blank");
  }
  function copyUrl() {
    navigator.clipboard.writeText(referralUrl);
    setMsg("✅ 已複製推薦連結！邀請朋友上傳成功，抽獎機會+1");
    setTimeout(() => setMsg(""), 3000);
  }
  function handleShareCardUrl() {
    if (navigator.share) {
      navigator.share({
        title: `${card?.name} 的名片`,
        text: `這是我的名片，歡迎聯絡！`,
        url: cardUrl,
      });
      setMsg("已開啟分享面板！");
    } else {
      navigator.clipboard.writeText(cardUrl);
      setMsg("✅ 已複製名片網址，可貼給朋友");
      setTimeout(() => setMsg(""), 3000);
    }
  }

  // 新增--申請修改流程
  function handleRequestEdit() {
    if (!card) return;
    const qa: { field: string, label: string, answer: string }[] = [
      { field: "name", label: "請輸入本名", answer: card.name ?? "" },
      { field: "mobile", label: "請輸入手機號碼", answer: card.mobile ?? "" },
      { field: "company", label: "請輸入公司名稱", answer: card.company ?? "" },
      { field: "line", label: "請輸入LINE ID", answer: card.line ?? "" },
      { field: "email", label: "請輸入Email", answer: card.email ?? "" },
      { field: "citys", label: "請輸入城市/縣市", answer: card.citys ?? "" }
    ].filter(q => q.answer);
    if (qa.length === 0) {
      setMsg("沒有足夠的驗證資料欄位");
      return;
    }
    const randIdx = Math.floor(Math.random() * qa.length);
    const pick = qa[randIdx];
    setQuestion(pick);
    setUserAnswer("");
    setMsg("");
  }

  async function handleCheckAnswer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!card || !question) return;
    if (userAnswer.trim() === question.answer) {
      setLoadingEditMail(true);
      setMsg("驗證成功！已寄送修改連結至信箱，請查收");
      await fetch("/api/sendEditMail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: card.email, slug: card.url_slug }),
      });
      setLoadingEditMail(false);
      setQuestion(null);
      setUserAnswer("");
    } else {
      setMsg("答案錯誤，請確認再試！");
    }
  }

  if (msg && !card)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-500 font-bold">{msg}</div>
      </div>
    );
  if (!card)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-gray-400">載入中...</div>
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-blue-100 to-white py-8 px-4">
      <div
        className="rounded-lg shadow-2xl p-6 w-full max-w-md mx-auto border border-gray-200"
        style={{ background: card.theme_color || "#fff" }}
      >
        {/* 名片圖片 */}
        <div className="space-y-4 mb-6">
          {card.image_url_front && (
            <div>
              <div className="font-bold mb-2 text-gray-700">名片正面</div>
              <img
                src={card.image_url_front}
                alt="名片正面"
                className="rounded shadow w-full object-contain"
                style={{ maxHeight: 300, background: "#fff" }}
              />
            </div>
          )}
          {card.image_url_back && (
            <div>
              <div className="font-bold mb-2 text-gray-700">名片背面</div>
              <img
                src={card.image_url_back}
                alt="名片背面"
                className="rounded shadow w-full object-contain"
                style={{ maxHeight: 300, background: "#fff" }}
              />
            </div>
          )}
        </div>
        {/* 基本資訊 */}
        <div className="space-y-3 mb-6">
          <div className="text-xl font-bold text-gray-800">{card.name}</div>
          {card.company && (
            <div className="text-gray-600">
              <strong>公司/組織：</strong>
              {card.company}
            </div>
          )}
          <div className="text-gray-600">
            <strong>Email：</strong>
            {card.email}
          </div>
          {(card.citys || card.area) && (
            <div className="text-gray-600">
              <strong>所在地區：</strong>
              {card.citys}
              {card.area && card.area !== "全部" && `・${card.area}`}
            </div>
          )}
          {card.line && (
            <div className="text-gray-600">
              <strong>LINE：</strong>
              {card.line}
            </div>
          )}
          {card.mobile && (
            <div className="text-gray-600">
              <strong>手機：</strong>
              {card.mobile}
            </div>
          )}
          {card.contact_other && (
            <div className="text-gray-600">
              <strong>其他聯絡：</strong>
              {card.contact_other}
            </div>
          )}
        </div>

        {/* 新增瀏覽次數顯示 */}
        <div className="text-xs text-gray-400 mb-2">
          👁️ 瀏覽次數：{card.views ?? 0}
        </div>

        {/* 關鍵字標籤 */}
        {(card.tag1 || card.tag2 || card.tag3 || card.tag4) && (
          <div className="mb-6">
            <div className="font-bold text-gray-700 mb-2">經營項目</div>
            <div className="flex flex-wrap gap-2">
              {card.tag1 && (
                <span className="px-3 py-1 rounded-full bg-cyan-100 text-cyan-700 text-sm">{card.tag1}</span>
              )}
              {card.tag2 && (
                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm">{card.tag2}</span>
              )}
              {card.tag3 && (
                <span className="px-3 py-1 rounded-full bg-teal-100 text-teal-700 text-sm">{card.tag3}</span>
              )}
              {card.tag4 && (
                <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm">{card.tag4}</span>
              )}
            </div>
          </div>
        )}
        {/* 自我簡介 */}
        {card.intro && (
          <div className="mb-6">
            <div className="font-bold text-gray-700 mb-2">關於我</div>
            <p className="text-gray-600 whitespace-pre-wrap">{card.intro}</p>
          </div>
        )}
      </div>
      {/* 推薦邀請區塊（原區塊不動） */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-5 mt-6 w-full max-w-md">
        <h3 className="font-bold text-blue-900 text-lg mb-2">💰 邀請朋友上傳名片</h3>
        <p className="text-gray-700 text-sm mb-4">
          分享此連結邀請朋友上傳，成功推薦一人即可獲得 <strong className="text-red-600">抽獎機會+1</strong>！
        </p>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={referralUrl}
            readOnly
            className="flex-1 border rounded px-3 py-2 text-sm bg-white text-gray-600"
          />
          <button
            onClick={copyUrl}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-bold whitespace-nowrap"
          >
            複製連結
          </button>
        </div>
        <button
          onClick={handleShare}
          className="w-full py-3 rounded-lg bg-green-600 text-white font-bold text-lg hover:bg-green-700 transition"
        >
          我也要上傳
        </button>
        {/* QR Code */}
        <div className="mt-6 flex flex-col items-center gap-2 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="text-sm text-gray-700 font-bold mb-2">推薦連結 QR Code</div>
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=170x170&data=${encodeURIComponent(referralUrl)}`}
            alt="推薦QR Code"
            width={170}
            height={170}
            className="rounded bg-white shadow"
            style={{ maxWidth: 170, maxHeight: 170 }}
          />
          <div className="text-xs text-gray-500 mt-1 text-center">
            直接掃碼即連到「推薦上傳」頁，或手機長按儲存分享給朋友
          </div>
        </div>
      </div>

      {/* 修改申請流程（新增區塊，mail驗證） */}
      <div className="mt-8 w-full max-w-md">
        {!question ? (
          <button
            className="block w-full bg-purple-700 hover:bg-purple-900 text-white font-bold rounded-lg py-3 text-lg transition"
            onClick={handleRequestEdit}
          >
            申請資料修改
          </button>
        ) : (
          <form onSubmit={handleCheckAnswer} className="bg-white shadow p-4 rounded-lg mt-4">
            <div className="mb-2 text-gray-700 font-bold">{question.label}</div>
            <input
              value={userAnswer}
              onChange={e => setUserAnswer(e.target.value)}
              className="border p-2 rounded w-full mb-3"
              autoFocus
            />
            <button type="submit" className="bg-blue-600 text-white font-bold rounded px-4 py-2" disabled={loadingEditMail}>
              {loadingEditMail ? "寄送中..." : "送出驗證"}
            </button>
          </form>
        )}
        {msg && <div className="mt-2 font-bold text-green-700 bg-green-50 px-3 py-2 rounded">{msg}</div>}
      </div>
      {/* 返回上一頁 */}
      <button
        onClick={() => router.back()}
        className="mt-8 text-white hover:underline font-medium"
      >
        ⬅️ 返回上一頁
      </button>
    </div>
  );
}
