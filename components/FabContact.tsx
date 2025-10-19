"use client";
import { useState, useEffect } from "react";

export default function FabContact() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // 偵測行動裝置橫跨轉向
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 820);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // FAB主鈕及視窗內容
  return (
    <>
      {/* 懸浮主按鈕 */}
      <button
        type="button"
        title="名片製作/數位化"
        aria-label="名片製作"
        onClick={() => setIsOpen(true)}
        className="fixed z-50 right-6 bottom-7 bg-blue-600 w-16 h-16 rounded-full shadow-xl flex items-center justify-center text-3xl text-white hover:bg-blue-700 active:scale-95 transition-all"
        style={{
          boxShadow:
            "0 2px 8px rgba(39,102,173,0.14), 0 8px 24px 2px rgba(0,0,0,.16)"
        }}>
        <span className="sr-only">名片製作</span>
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="16" fill="#2563EB" />
          <text x="16" y="22" textAnchor="middle" fontSize="16" fill="#fff" fontWeight="bold">卡</text>
        </svg>
      </button>

      {/* 彈出視窗 */}
      {isOpen && (
        <div
          className={`fixed z-50 inset-0 bg-black/50 transition-all flex ${
            isMobile
              ? "items-end"
              : "items-center"
          } justify-center`}
          onClick={() => setIsOpen(false)}
        >
          <div
            className={
              isMobile
                ? "w-full rounded-t-3xl bg-white p-6 pb-12 animate-fadeInUp"
                : "w-[370px] rounded-2xl bg-white p-8 shadow-2xl animate-fadeIn"
            }
            style={{
              maxWidth: isMobile ? "100vw" : "",
              minHeight: isMobile ? "48vh" : "auto",
              marginBottom: isMobile ? "4vh" : ""
            }}
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-blue-700 mb-1 text-center">
              想製作或數位化名片嗎？
            </h2>
            <ul className="space-y-3 my-6">
              <li>
                <a
                  href="https://line.me/R/ti/p/@你的LINE_ID"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-green-500 hover:bg-green-600 text-white py-3 px-5 rounded-lg font-bold text-base text-center transition"
                >
                  🔹 立即用 LINE 聯絡
                </a>
              </li>
              <li>
                <a
                  href="/contact-form" // 請換成你的表單頁面
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
      {/* 動畫CSS，直接寫入全域或globals.css */}
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform: translateY(40px);} to{opacity:1; transform:none;}}
        @keyframes fadeInUp { from { opacity:0; transform: translateY(60px);} to{opacity:1; transform:none;}}
        .animate-fadeIn{ animation: fadeIn 0.26s both;}
        .animate-fadeInUp{ animation: fadeInUp 0.26s both;}
      `}
      </style>
    </>
  );
}
