"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ActivityPage() {
  const [cardCount, setCardCount] = useState<number | null>(null);

  useEffect(() => {
    async function fetchTotalCards() {
      const { count, error } = await supabase
        .from("cards")
        .select("id", { count: "exact", head: true })
        .eq("published", true);
      if (!error) setCardCount(count ?? 0);
      else setCardCount(0);
    }
    fetchTotalCards();
  }, []);

  const totalNeed = 1000;
  const remain = typeof cardCount === "number" ? Math.max(0, totalNeed - cardCount) : "...";
  return (
    <div className="min-h-screen bg-yellow-50">
      <div className="max-w-2xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold text-yellow-700 mb-5 text-center">🎁 上傳名片抽 iPhone 17！越多人上傳越快開獎！</h1>
        <div className="bg-white rounded-lg shadow p-6 text-lg font-medium mb-6">
          <p><span className="font-bold text-blue-700">SHOWALL 名片+</span>邀你一起上傳名片、拓展人脈、拿好禮！</p>
          <p className="mt-4">📱 當全站累積上架名片 <b className="text-pink-600">滿 1000 張</b>，我們就會抽出一位幸運得主，<br />送出 <span className="text-red-700 font-bold">最新款 iPhone 17</span> 一支！</p>
          <h2 className="text-xl font-bold text-yellow-600 mt-6 mb-3">參加方式：</h2>
          <ul className="space-y-2 ml-4">
            <li>1️⃣ 上傳自己的名片頁，即可獲得一次抽獎資格。</li>
            <li>2️⃣ 使用你的「專屬推薦連結」邀請朋友上傳名片，<br />　每成功一位，再加一次抽獎機會！（無上限）</li>
            <li>3️⃣ 當全站名片總數達 1000 張，即開獎抽出 iPhone 17 幸運得主！</li>
          </ul>
          <h2 className="text-xl font-bold text-yellow-600 mt-6 mb-3">目前進度：</h2>
          <p>
            📊 已上傳名片：
            <b className="text-blue-700">{cardCount !== null ? cardCount : "..."}</b>
             / 1000 張
            <span className="text-xs text-gray-400 ml-2">(每小時更新一次)</span>
            <br/>
            <span className="text-yellow-600 text-base">距離開獎只差 <b>{remain}</b> 張！</span>
          </p>
          <h2 className="text-xl font-bold text-gray-600 mt-7 mb-2">注意事項：</h2>
          <ul className="ml-5 list-disc text-base text-gray-700 space-y-1">
            <li>抽獎資格以上傳成功時間為準。</li>
            <li>若名片資料重複、內容不實或違規，將取消資格。</li>
            <li>活動結束後7日內於官網公布得主。</li>
          </ul>
        </div>
        <Link href="/" className="block mt-8 text-yellow-600 text-center font-bold text-lg underline">← 回首頁</Link>
      </div>
    </div>
  );
}
