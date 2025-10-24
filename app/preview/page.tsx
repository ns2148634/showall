"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function PreviewPage() {
  const router = useRouter();
  const [form, setForm] = useState<any>(null);
  const [previewFront, setPreviewFront] = useState("");
  const [previewBack, setPreviewBack] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const formStr = window.sessionStorage.getItem("previewForm");
    const front = window.sessionStorage.getItem("previewFront");
    const back = window.sessionStorage.getItem("previewBack");

    if (formStr) setForm(JSON.parse(formStr));
    if (front) setPreviewFront(front);
    if (back) setPreviewBack(back);
  }, []);

  async function handlePublish() {
    if (!form || !previewFront) {
      setMsg("資料不完整，請返回重新填寫");
      return;
    }

    setLoading(true);
    setMsg("");

    try {
      // 這裡加上實際上架邏輯（上傳圖片到 storage、寫入 cards table）
      // 範例省略，你可以根據需求補充

      setMsg("上架成功！");
      setTimeout(() => {
        router.push("/"); // 或導向其他頁面
      }, 1500);
    } catch (err) {
      console.error(err);
      setMsg("上架失敗，請稍後再試");
    } finally {
      setLoading(false);
    }
  }

  function handleBack() {
    // 返回 upload 頁，sessionStorage 保留資料
    router.push("/upload");
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-700 mb-4">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <main className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-center mb-6">名片預覽</h2>

          {/* 預覽區域 */}
          <div 
            className="border rounded-lg p-6 mb-6" 
            style={{ backgroundColor: form.theme_color || "#FFFFFF" }}
          >
            {previewFront && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">名片正面</p>
                <img src={previewFront} alt="正面" className="w-full max-w-md mx-auto rounded shadow" />
              </div>
            )}
            {previewBack && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">名片背面</p>
                <img src={previewBack} alt="背面" className="w-full max-w-md mx-auto rounded shadow" />
              </div>
            )}

            {/* 顯示表單資料 */}
            <div className="mt-6 space-y-2 text-sm text-gray-700">
              {form.name && <p><strong>姓名：</strong>{form.name}</p>}
              {form.company && <p><strong>公司：</strong>{form.company}</p>}
              {form.email && <p><strong>電子信箱信箱：</strong>{form.email}</p>}
              {form.mobile && <p><strong>手機：</strong>{form.mobile}</p>}
              {form.line && <p><strong>LINE：</strong>{form.line}</p>}
              {form.contact_other && <p><strong>其他聯絡：</strong>{form.contact_other}</p>}
              {form.citys && <p><strong>地區：</strong>{form.citys} {form.area !== "全部" && form.area}</p>}
              {form.tag1 && <p><strong>經營項目：</strong>{form.tag1} {form.tag2} {form.tag3} {form.tag4}</p>}
              {form.intro && <p><strong>簡介：</strong>{form.intro}</p>}
            </div>
          </div>

          {/* 按鈕區 */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleBack}
              className="flex-1 py-3 rounded bg-gray-500 text-white text-lg font-bold hover:bg-gray-600 transition"
            >
              返回修改
            </button>
            <button
              type="button"
              onClick={handlePublish}
              disabled={loading}
              className="flex-1 py-3 rounded bg-green-600 text-white text-lg font-bold hover:bg-green-700 transition disabled:opacity-50"
            >
              {loading ? "上架中..." : "確認上架"}
            </button>
          </div>

          {msg && (
            <div className={`mt-4 text-center font-bold ${msg.includes('成功') ? "text-green-600" : "text-red-500"}`}>
              {msg}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
