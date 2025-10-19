"use client";
import React from "react";
import { useRouter } from "next/navigation";

export default function ProfileCard({ data }) {
  const router = useRouter();
  return (
    <section className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 relative">
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <img
            src={data.imgFront}
            alt="名片正面"
            className="w-full h-48 object-cover rounded-xl shadow-md"
          />
          <p className="text-xs text-center mt-2 text-blue-700">正面</p>
        </div>
        <div>
          <img
            src={data.imgBack}
            alt="名片反面"
            className="w-full h-48 object-cover rounded-xl shadow-md"
          />
          <p className="text-xs text-center mt-2 text-blue-700">反面</p>
        </div>
      </div>
      <h1 className="text-2xl font-bold mb-2 text-blue-800">{data.name}</h1>
      <p className="text-sm text-blue-600 mb-1">{data.category}</p>
      <p className="text-sm text-gray-600 mb-3">{data.region}</p>
      <div className="mb-4 text-base text-gray-700">{data.about}</div>
      {/* 分享連結按鈕 — 灰階不可點擊 */}
      <button
        className="w-full py-2 px-4 rounded-lg bg-gray-300 text-white font-semibold mb-3 opacity-50 cursor-not-allowed"
        disabled
        title="預覽頁不支援分享"
      >
        分享/複製專屬頁連結（預覽不可點）
      </button>
      {/* 返回修改 */}
      <button
        className="w-full py-2 px-4 rounded-lg bg-yellow-400 text-gray-900 font-semibold mb-3 hover:bg-yellow-500"
        onClick={() => router.push("/upload")}
      >
        返回修改
      </button>
      {/* 付費按鈕 */}
      <button
        className="w-full py-2 px-4 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700"
        onClick={() => router.push("/payment")}
      >
        只要 100 元，馬上上架一年
      </button>
    </section>
  );
}
