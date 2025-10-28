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
  const [showModal, setShowModal] = useState(false);
  const [totalCards, setTotalCards] = useState<number | null>(null);

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

  useEffect(() => {
    async function fetchTotalCards() {
      const { count, error } = await supabase
        .from("cards")
        .select("id", { count: "exact", head: true })
        .eq("published", true);
      if (!error) setTotalCards(count ?? 0);
    }
    fetchTotalCards();
  }, []);

  // 彈窗只跳一次
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!localStorage.getItem("modal_shown")) {
        setTimeout(() => setShowModal(true), 1000);
        localStorage.setItem("modal_shown", "1");
      }
    }
  }, []);

  const handleCloseModal = (e: React.MouseEvent<HTMLButtonElement>) => {
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-3xl mx-auto py-10">
        {/* 活動 banner */}
        <div className="mb-7">
          <Link href="/activity" className="block">
            <div
              className="bg-yellow-300 rounded-lg px-6 py-4 text-xl font-bold text-gray-900 flex items-center justify-between hover:bg-yellow-400 shadow-lg"
              style={{ border: "2px dashed #FFD600" }}
            >
              <span>
                🎉 上傳名片抽 iPhone 17！距離開獎只差{" "}
                <span className="text-red-700">
                  {Math.max(0, 1000 - (totalCards ?? 0))}
                </span>{" "}
                張！
              </span>
              <span className="text-lg bg-white px-2 py-1 rounded font-bold text-yellow-600">
                活動說明
              </span>
            </div>
          </Link>
        </div>

        {/* 彈跳視窗：名片上架提醒 */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-8 text-gray-800 relative">
              <button
                className="absolute top-3 right-4 text-2xl text-gray-400 hover:text-red-600"
                onClick={handleCloseModal}
                title="關閉"
              >
                ×
              </button>
              <h2 className="text-2xl font-bold mb-4 text-blue-700 text-center">
                🪪 名片上架小提醒
              </h2>

              <p className="text-center text-gray-700 mb-5">
                上架費用：<span className="font-bold text-red-600">100 元 / 年</span>
                <br />
                一次上架，全年曝光！
              </p>

              <ul className="mb-6 space-y-3 text-base leading-relaxed">
                <li>
                  1️⃣ <span className="font-bold">個人簡介與經營項目要明確：</span>
                  寫出你的服務專長、特色與關鍵字（例：健康管理、美甲、保險、設計），
                  越明確越容易被搜尋。
                </li>
                <li>
                  2️⃣ <span className="font-bold">聯絡方式要完整：</span>
                  建議填寫 Email、手機、LINE、Facebook、Instagram 等，
                  讓客戶能快速聯絡到你。
                </li>
                <li>
                  3️⃣ <span className="font-bold">地區分類選精確：</span>
                  多數用戶會依地區搜尋，地點選越細，曝光機會越高。
                </li>
                <li>
                  4️⃣ <span className="font-bold">填得越完整，推薦越優先：</span>
                  系統會優先推薦內容詳實、專業清晰的名片。
                </li>
              </ul>

              <button
                className="block w-full py-2 mt-4 rounded bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 transition"
                onClick={handleCloseModal}
              >
                知道了，開始探索
              </button>
            </div>
          </div>
        )}

        {/* 功能入口按鈕 */}
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
                100元上架名片
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
                <Image
                  src={card.image_url_front}
                  alt="名片正面"
                  width={180}
                  height={110}
                  className="mx-auto object-cover rounded"
                  style={{
                    boxShadow: "none",
                    borderRadius: "10px",
                    background: "#fff",
                    maxHeight: 140,
                  }}
                />
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-400 py-12">
              暫無名片
            </div>
          )}
        </div>
      </main>

      <footer className="text-center text-gray-400 text-sm py-6 border-t mt-12">
        &copy; 2025 SHOWALL 名片+
      </footer>
    </div>
  );
}
