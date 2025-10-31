"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ContactPage() {
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    // 新增聯絡資料到 Supabase
    const { error } = await supabase
      .from("contacts")
      .insert([{
        email,
        content,
        created_at: new Date().toISOString()
      }]);
    if (error) {
      setError("送出失敗，請稍後重試或聯絡客服。");
    } else {
      setSubmitted(true);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-16">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-xl">
        <h1 className="text-2xl font-bold mb-6 text-blue-700 text-center">請填寫表單</h1>
        {submitted ? (
          <div className="text-green-600 text-center py-12 font-bold">
            已送出！我們會儘快回覆<br />
            <span className="text-gray-500 text-sm">（本訊息已記錄在後台）</span><br />
            您也可直接 Email: <a href="mailto:service@showall.tw" className="underline text-blue-700">service@showall.tw</a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-600 mb-2">您的 Email</label>
              <input
                type="email"
                required
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="example@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-2">詢問內容</label>
              <textarea
                required
                className="w-full p-2 border border-gray-300 rounded h-24 resize-none"
                placeholder="請輸入您的問題或建議"
                value={content}
                onChange={e => setContent(e.target.value)}
              />
            </div>
            {error && <div className="text-red-500 text-center">{error}</div>}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white rounded py-2 font-bold text-lg hover:bg-blue-700 transition"
            >
              送出
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
