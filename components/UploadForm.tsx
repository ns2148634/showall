"use client";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function UploadForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const referrer_id = searchParams.get("referrer_id") || null; // ✅ App Router 正確取法

  // 初始化表單
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    category: "",
    city: "",
    area: "",
    mobile: "",
    line: "",
    intro: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // 準備要上傳至 Supabase 的資料
      const cardData = { ...form, referrer_id };

      const { data, error } = await supabase
        .from("cards")
        .insert([cardData])
        .select();

      if (error) throw error;

      // 若成功寫入
      if (data && data.length > 0) {
        const cardUrl = `https://abcd.com/card/${data[0].url_slug}`;
        // 傳送電子郵件
        await fetch("/api/sendMail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: form.email,
            subject: "您的 ABCD 百業名片專屬連結",
            html: `
              <div>您的名片已成功上傳！</div>
              <div>點此瀏覽專屬頁面：<a href="${cardUrl}">${cardUrl}</a></div>
            `,
          }),
        });
        alert("上傳成功！已寄出通知信。");
        router.push(`/card/${data[0].url_slug}`); // 可直接導向專屬名片頁
      }
    } catch (err) {
      console.error("上傳或寄信錯誤:", err);
      alert("上傳失敗，請稍後再試。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      className="space-y-4 p-6 bg-white rounded shadow-md"
    >
      <input
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="姓名"
        className="border rounded p-2 w-full"
        required
      />
      <input
        name="email"
        type="email"
        value={form.email}
        onChange={handleChange}
        placeholder="Email"
        className="border rounded p-2 w-full"
        required
      />
      <input
        name="company"
        value={form.company}
        onChange={handleChange}
        placeholder="公司/組織"
        className="border rounded p-2 w-full"
      />
      <textarea
        name="intro"
        value={form.intro}
        onChange={handleChange}
        placeholder="自我簡介"
        className="border rounded p-2 w-full h-24"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition"
      >
        {loading ? "上傳中..." : "送出"}
      </button>
    </form>
  );
}
