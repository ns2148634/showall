"use client";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function UploadForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const referrer_id = searchParams.get("referrer_id") || null;

  // 初始化表單
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    city: "",
    area: "",
    mobile: "",
    line: "",
    tag1: "",
    tag2: "",
    tag3: "",
    tag4: "",
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
            subject: "您的 SHOWALL 百業名片專屬連結",
            html: `
              <div>您的名片已成功上傳！</div>
              <div>點此瀏覽專屬頁面：<a href="${cardUrl}">${cardUrl}</a></div>
            `,
          }),
        });
        alert("上傳成功！已寄出通知信。");
        router.push(`/card/${data[0].url_slug}`);
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
      <input
        name="city"
        value={form.city}
        onChange={handleChange}
        placeholder="城市"
        className="border rounded p-2 w-full"
      />
      <input
        name="area"
        value={form.area}
        onChange={handleChange}
        placeholder="地區"
        className="border rounded p-2 w-full"
      />
      <input
        name="mobile"
        value={form.mobile}
        onChange={handleChange}
        placeholder="手機"
        className="border rounded p-2 w-full"
      />
      <input
        name="line"
        value={form.line}
        onChange={handleChange}
        placeholder="LINE ID"
        className="border rounded p-2 w-full"
      />

      {/* 四個 tag 關鍵字 */}
      <input
        name="tag1"
        value={form.tag1}
        onChange={handleChange}
        placeholder="主關鍵字（例：美甲、美睫、美髮）"
        maxLength={10}
        className="border rounded p-2 w-full"
      />
      <input
        name="tag2"
        value={form.tag2}
        onChange={handleChange}
        placeholder="次關鍵字一（例：人壽保險、產物保險）"
        maxLength={10}
        className="border rounded p-2 w-full"
      />
      <input
        name="tag3"
        value={form.tag3}
        onChange={handleChange}
        placeholder="次關鍵字二（例：水電、木工）"
        maxLength={10}
        className="border rounded p-2 w-full"
      />
      <input
        name="tag4"
        value={form.tag4}
        onChange={handleChange}
        placeholder="次關鍵字三（例：健康管理、家教、教練）"
        maxLength={10}
        className="border rounded p-2 w-full"
      />

      {/* 自我簡介 */}
      <textarea
        name="intro"
        value={form.intro}
        onChange={handleChange}
        placeholder="請簡短描述您的服務與特色"
        maxLength={300}
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
