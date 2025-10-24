"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Card = {
  id: number;
  image_url_front: string;
  url_slug: string;
};

export default function Home() {
  const [cards, setCards] = useState<Card[]>([]);

  useEffect(() => {
    async function fetchCards() {
      const { data, error } = await supabase
        .from("cards")
        .select("id, image_url_front, url_slug")
        .eq("published", true)
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) console.error("載入名片錯誤:", error.message);
      if (data) setCards(data);
    }
    fetchCards();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-3xl mx-auto py-10">
        {/* 入口按鈕，僅剩兩個 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <Link href="/search" className="block">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl px-0 py-8 shadow-2xl flex flex-col items-center transition-transform hover:scale-105 active:scale-95 cursor-pointer">
              <span className="text-4xl mb-3 drop-shadow">🔍</span>
              <span className="text-lg font-bold tracking-wide mb-1 text-white">
                找名片
              </span>
              <span className="text-xs text-cyan-100 text-center">
                快速搜尋、找人找公司
              </span>
            </div>
          </Link>
          <Link href="/upload" className="block">
            <div className="bg-gradient-to-br from-yellow-400 to-pink-400 rounded-2xl px-0 py-8 shadow-2xl flex flex-col items-center transition-transform hover:scale-105 active:scale-95 cursor-pointer">
              <span className="text-4xl mb-3 drop-shadow">⏫</span>
              <span className="text-lg font-bold tracking-wide mb-1 text-white">
                上傳名片
              </span>
              <span className="text-xs text-pink-100 text-center">
                新創、商家與個人都能刊登
              </span>
            </div>
          </Link>
        </div>

        {/* 最新推薦名片 */}
        <h3 className="text-lg font-bold mb-6 text-gray-700">最新推薦名片</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
          {cards.length > 0 ? (
            cards.map((card) => (
              <Link href={`/card/${card.url_slug}`} key={card.id} className="block">
                <div className="rounded shadow hover:shadow-lg transition text-center p-0">
                  <Image
                    src={card.image_url_front}
                    alt="名片正面"
                    width={180}
                    height={110}
                    className="mx-auto rounded object-cover"
                  />
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-3 text-center text-gray-400">暫無資料</div>
          )}
        </div>
      </main>
      <footer className="text-center text-gray-400 text-sm py-6 border-t mt-12">
        &copy; 2025 SHOWALL 百業名片網
      </footer>
    </div>
  );
}
