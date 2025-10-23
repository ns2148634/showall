"use client";
import { useState, useEffect } from "react";

export default function SideFabContact() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 820);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <>
      {/* 懸浮直式按鈕 */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed z-50 right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-3 rounded-l-2xl rounded-r-lg shadow-lg flex flex-col items-center transition-all"
        style={{
          writingMode: "vertical-rl",
          letterSpacing: "0.12em",
          fontWeight: 700,
          fontSize: "1.1rem",
          minHeight: 110,
          minWidth: 40,
          boxShadow: "0 2px 8px rgba(39,102,173,0.14), 0 8px 24px 2px rgba(0,0,0,.16)"
        }}
        aria-label="定制名片"
        title="定制名片"
      >
        定制名片
      </button>

      {/* 彈出modal內容同前一組可複用 */}
      {isOpen && (
        <div
          className={`fixed z-50 inset-0 bg-black/50 transition-all flex ${
            isMobile ? "items-end" : "items-center"
          } justify-center`}
          onClick={() => setIsOpen(false)}
        >
          <div
            className={
              isMobile
                ? "w-full rounded-t-3xl bg-white p-6 pb-12 animate-fadeInUp"
                : "w-[370px] rounded-2xl bg-white p-8 shadow-2xl animate-fadeIn"
            }
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-blue-700 mb-1 text-center">
              想製作或數位化名片嗎？
            </h2>
            <ul className="space-y-3 my-6">
              <li>
                <a
                  href="https://lin.ee/P979vm2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-green-500 hover:bg-green-600 text-white py-3 px-5 rounded-lg font-bold text-base text-center transition"
                >
                  🔹 立即用 LINE 聯絡
                </a>
              </li>
              <li>
                <a
                  href="/contact-form"
                  className="block w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-5 rounded-lg font-bold text-base text-center transition"
                >
                  🔹 填寫線上需求表
                </a>
              </li>
              <li>
                <a
                  href="/pricing"
                  className="block w-full bg-gray-200 hover:bg-blue-200 text-blue-800 py-3 px-5 rounded-lg font-bold text-base text-center transition"
                >
                  🔹 了解收費方案
                </a>
              </li>
            </ul>
            <button
              className="block mx-auto mt-1 text-gray-400 hover:text-blue-800 text-sm"
              onClick={() => setIsOpen(false)}
            >
              關閉
            </button>
          </div>
        </div>
      )}
      {/* 動畫css同上 */}
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform: translateY(40px);} to{opacity:1; transform:none;}}
        @keyframes fadeInUp { from { opacity:0; transform: translateY(60px);} to{opacity:1; transform:none;}}
        .animate-fadeIn{ animation: fadeIn 0.23s both;}
        .animate-fadeInUp{ animation: fadeInUp 0.23s both;}
      `}
      </style>
    </>
  );
}
