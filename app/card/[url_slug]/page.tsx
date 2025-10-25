"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
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
};

export default function CardPage({ params }: { params: { url_slug: string } }) {
  const [card, setCard] = useState<Card | null>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    async function fetchCard() {
      const { data, error } = await supabase
        .from("cards")
        .select("*")
        .eq("url_slug", params.url_slug)
        .eq("published", true)
        .single();

      if (error || !data) {
        setMsg("查無此名片或尚未發佈");
        return;
      }
      setCard(data);
    }
    fetchCard();
  }, [params.url_slug]);

  if (msg) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center text-red-500 font-bold">{msg}</div>
    </div>
  );

  if (!card) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center text-gray-400">載入中...</div>
    </div>
  );

  const referralUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/upload?referrer=${card.url_slug}`;

  function handleShare() {
    window.open(referralUrl, "_blank");
  }

  function copyUrl() {
    navigator.clipboard.writeText(referralUrl);
    setMsg("✅ 已複製推薦連結！分享給朋友即可獲得 50 元回饋");
    setTimeout(() => setMsg(""), 3000);
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-blue-100 to-white py-8 px-4">
      <div
        className="rounded-lg shadow-2xl p-6 w-full max-w-md mx-auto border border-gray-200"
        style={{ background: card.theme_color || "#fff" }}
      >
        {/* 基本資訊 */}
        <div className="space-y-3 mb-6">
          <div className="text-xl font-bold text-gray-800">{card.name}</div>
          {card.company && <div className="text-gray-600"><strong>公司：</strong>{card.company}</div>}
          <div className="text-gray-600"><strong>Email：</strong>{card.email}</div>
          {(card.citys || card.area) && (
            <div className="text-gray-600">
              <strong>地區：</strong>
              {card.citys} {card.area && card.area !== "全部" && `・${card.area}`}
            </div>
          )}
          {card.line && <div className="text-gray-600"><strong>LINE：</strong>{card.line}</div>}
          {card.mobile && <div className="text-gray-600"><strong>手機：</strong>{card.mobile}</div>}
          {card.contact_other && <div className="text-gray-600"><strong>其他聯絡：</strong>{card.contact_other}</div>}
        </div>

        {/* 關鍵字標籤 */}
        {(card.tag1 || card.tag2 || card.tag3 || card.tag4) && (
          <div className="mb-6">
            <div className="font-bold text-gray-700 mb-2">經營項目</div>
            <div className="flex flex-wrap gap-2">
              {card.tag1 && <span className="px-3 py-1 rounded-full bg-cyan-100 text-cyan-700 text-sm">{card.tag1}</span>}
              {card.tag2 && <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm">{card.tag2}</span>}
              {card.tag3 && <span className="px-3 py-1 rounded-full bg-teal-100 text-teal-700 text-sm">{card.tag3}</span>}
              {card.tag4 && <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm">{card.tag4}</span>}
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
      </div>

      {/* 推薦邀請區塊 */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-5 mt-6 w-full max-w-md">
        <h3 className="font-bold text-blue-900 text-lg mb-2">💰 邀請朋友上傳名片</h3>
        <p className="text-gray-700 text-sm mb-4">
          分享此連結邀請朋友註冊，成功推薦一人即可獲得 <strong className="text-red-600">50元回饋</strong>！
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
      </div>

      {/* 提示訊息 */}
      {msg && (
        <div className="mt-4 text-center font-bold text-green-700 bg-green-100 px-4 py-2 rounded">
          {msg}
        </div>
      )}

      {/* 返回首頁 */}
      <Link href="/" className="mt-8 text-blue-600 hover:underline font-medium">
        ⬅️ 回首頁
      </Link>
      <Link
        href={`/my-referrals?slug=${card.url_slug}`}
        className="block w-full text-center py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium mt-3"
      >
        📊 查看我的推薦統計
      </Link>

    </div>
  );
}
