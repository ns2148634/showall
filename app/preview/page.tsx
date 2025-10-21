"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function PreviewPage() {
  const router = useRouter();
  const [form, setForm] = useState<any>({});
  const [previewFront, setPreviewFront] = useState("");
  const [previewBack, setPreviewBack] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    setForm(JSON.parse(window.sessionStorage.getItem("previewForm") || "{}"));
    setPreviewFront(window.sessionStorage.getItem("previewFront") || "");
    setPreviewBack(window.sessionStorage.getItem("previewBack") || "");
  }, []);

  // 上架（寫入資料、跳付款頁）
  async function handlePublish() {
    setMsg(""); setLoading(true);
    // 先上傳圖片（有再處理、沒就跳過）
    let image_url_front = form.image_url_front;
    let image_url_back = form.image_url_back;
    // 假設在 form 無 storage url時才要上傳
    if (previewFront && !image_url_front) {
      const front_blob = await (await fetch(previewFront)).blob();
      const fname = `front/${Date.now()}.jpg`;
      const { error: frontError } = await supabase.storage.from('card-images').upload(fname, front_blob, { upsert: true });
      if (frontError) { setMsg("正面圖片上傳失敗"); setLoading(false); return; }
      image_url_front = supabase.storage.from('card-images').getPublicUrl(fname).data.publicUrl;
    }
    if (previewBack && !image_url_back) {
      const back_blob = await (await fetch(previewBack)).blob();
      const fname = `back/${Date.now()}.jpg`;
      const { error: backError } = await supabase.storage.from('card-images').upload(fname, back_blob, { upsert: true });
      if (backError) { setMsg("背面圖片上傳失敗"); setLoading(false); return; }
      image_url_back = supabase.storage.from('card-images').getPublicUrl(fname).data.publicUrl;
    }
    // 上傳卡片資料
    const { error, data } = await supabase
  .from("cards")
  .insert([{
    ...form,
    image_url_front,
    image_url_back,
    created_at: new Date().toISOString()
  }])
  .select()
  .single();

    setLoading(false);
    if (error) {
      setMsg("資料上架失敗: " + error.message);
      return;
    }
    setMsg("資料已提交，前往付款..."); // 可以做 loading 狀態提示
    // 跳轉到付款頁 (帶卡片 id 或其它所需參數)
    router.push(`/payment?cardId=${data.id}`);
  }

  // 重新編輯
  function handleEdit() {
    router.push("/upload");
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-blue-100 to-white py-8">
      <h2 className="text-3xl font-bold mb-6 text-blue-800 tracking-wider">名片預覽</h2>
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md mx-auto border border-gray-200"
  style={{ background: form.theme_color || "#fff" }}>
        <div className="mb-2 text-lg"><strong>姓名：</strong>{form.name}</div>
        <div className="mb-2 text-lg"><strong>公司：</strong>{form.company}</div>
        <div className="mb-2 text-lg"><strong>Email：</strong>{form.email}</div>
        <div className="mb-2"><strong>分類：</strong>
          <span className="mr-1 text-blue-700">{form.category1}</span>
          <span className="mr-1 text-blue-500">{form.category2}</span>
          <span className="text-blue-400">{form.category3}</span>
        </div>
        <div className="mb-2 text-lg"><strong>地區：</strong>
          <span className="mr-1">{form.citys}</span>
          <span>{form.area}</span>
        </div>
        <div className="mb-2"><strong>Line：</strong>{form.line}</div>
        <div className="mb-2"><strong>手機：</strong>{form.mobile}</div>
        <div className="mb-2"><strong>其他聯絡：</strong>{form.contact_other}</div>
        <div className="mb-2"><strong>自我簡介：</strong>{form.intro}</div>
        <div className="mb-2 flex items-center"><strong>主題色：</strong>
          <span style={{background: form.theme_color, padding: "2px 16px", borderRadius: "6px", marginLeft:8, border:'1px solid #ccc'}}>{form.theme_color}</span>
        </div>
        <div className="grid grid-cols-2 gap-6 mt-6">
          <div>
            <div className="font-bold mb-1 text-gray-600">正面</div>
            {previewFront && <img src={previewFront} alt="名片正面" className="rounded shadow w-full h-40 object-cover" />}
          </div>
          <div>
            <div className="font-bold mb-1 text-gray-600">背面</div>
            {previewBack && <img src={previewBack} alt="名片背面" className="rounded shadow w-full h-40 object-cover" />}
          </div>
        </div>
        {/* 按鈕列 */}
        <div className="flex gap-4 my-8 justify-center">
          <button
            className="px-6 py-3 rounded bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold shadow"
            onClick={handleEdit}
            disabled={loading}
          >重新編輯</button>
          <button
            className="px-6 py-3 rounded bg-blue-600 hover:bg-blue-800 text-white font-bold shadow"
            onClick={handlePublish}
            disabled={loading}
          >馬上上架</button>
        </div>
        {msg && <div className={`text-center font-bold ${msg.includes('失敗') ? "text-red-600" : "text-green-700"}`}>{msg}</div>}
      </div>
    </div>
  );
}
