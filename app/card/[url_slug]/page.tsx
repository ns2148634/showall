"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

type Card = {
  id: number;
  name: string;
  company: string;
  email: string;
  line?: string;
  mobile?: string;
  citys?: string;
  area?: string;
  contact_other?: string;
  intro?: string;
  image_url_front?: string;
  image_url_back?: string;
  category_main?: string;
  category_sub?: string;
  category_detail?: string;
  url_slug: string;
  referral_code?: string;
  theme_color?: string;
};

export default function CardPage({ params }: { params: { url_slug: string } }) {
  const [card, setCard] = useState<Card | null>(null);
  const [msg, setMsg] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function fetchCard() {
      const { data, error } = await supabase
        .from("cards")
        .select("*")
        .eq("url_slug", params.url_slug)
        .eq("published", true)
        .single();
      if (error) setMsg("查無此名片");
      setCard(data);
    }
    fetchCard();
  }, [params.url_slug]);

  if (msg) return <div className="text-center mt-12 text-red-500 font-bold">{msg}</div>;
  if (!card) return <div className="text-center mt-12 text-gray-400">載入中...</div>;

  // 分享按鈕（帶推薦碼 ?referrer=referral_code）
  function handleShare() {
    const url = `${window.location.origin}/upload?referrer=${card.referral_code || card.url_slug}`;
    window.open(url, "_blank");
  }
  function copyUrl() {
    navigator.clipboard.writeText(
      `${window.location.origin}/upload?referrer=${card.referral_code || card.url_slug}`
    );
    setMsg("已複製上傳連結，可分享給朋友！");
    setTimeout(() => setMsg(""), 1800);
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center bg-gradient-to-b from-blue-100 to-white py-8"
    >
      <h2 className="text-3xl font-bold mb-6 text-blue-800 tracking-wider">個人名片頁</h2>
      <div
        className="rounded-lg shadow-2xl p-8 w-full max-w-md mx-auto border border-gray-200"
        style={{ background: card.theme_color || "#fff" }}
      >
        <div className="mb-2 text-lg">
          <strong>姓名：</strong>{card.name}
        </div>
        <div className="mb-2 text-lg">
          <strong>公司：</strong>{card.company}
        </div>
        <div className="mb-2 text-lg">
          <strong>Email：</strong>{card.email}
        </div>
        <div className="mb-2">
          <strong>分類：</strong>
          <span className="mr-1 text-blue-700">{card.category_main}</span>
          <span className="mr-1 text-blue-500">{card.category_sub}</span>
          <span className="text-blue-400">{card.category_detail}</span>
        </div>
        <div className="mb-2 text-lg">
          <strong>地區：</strong>
          <span className="mr-1">{card.citys}</span>
          <span>{card.area}</span>
        </div>
        <div className="mb-2">
          <strong>Line：</strong>{card.line}
        </div>
        <div className="mb-2">
          <strong>手機：</strong>{card.mobile}
        </div>
        <div className="mb-2">
          <strong>其他聯絡：</strong>{card.contact_other}
        </div>
        <div className="mb-2">
          <strong>自我簡介：</strong>{card.intro}
        </div>
        {/* 圖片 */}
        <div className="flex flex-col gap-4 my-6">
          <div>
            <div className="font-bold mb-1 text-gray-600">正面</div>
            {card.image_url_front && (
              <img
                src={card.image_url_front}
                alt="名片正面"
                className="rounded shadow w-full object-contain"
                style={{ maxHeight: 240, background: "#fff" }}
              />
            )}
          </div>
          <div>
            <div className="font-bold mb-1 text-gray-600">背面</div>
            {card.image_url_back && (
              <img
                src={card.image_url_back}
                alt="名片背面"
                className="rounded shadow w-full object-contain"
                style={{ maxHeight: 240, background: "#fff" }}
              />
            )}
          </div>
        </div>
        {/* 分享按鈕 */}
        <div className="flex gap-4 my-6 justify-center">
          <button
            className="px-5 py-2 rounded bg-pink-500 text-white hover:bg-pink-700 font-bold"
            onClick={handleShare}
          >
            直接開啟推薦上傳網址
          </button>
          <button
            className="px-5 py-2 rounded bg-blue-600 text-white hover:bg-blue-800 font-bold"
            onClick={copyUrl}
          >
            複製推薦網址
          </button>
        </div>
        {msg && <div className="text-center font-bold text-green-700">{msg}</div>}
      </div>
      {/* 回首頁 */}
      <Link href="/" className="mt-8 text-blue-600 hover:underline">
        ⬅️ 回首頁
      </Link>
    </div>
  );
}
