"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

// 產生唯一 url_slug（建議寫法）
function genSlug(name: string): string {
  return encodeURIComponent(
    (name || "user") + "-" + Math.floor(Math.random() * 10000000)
  );
}

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

  async function handlePublish() {
    setMsg("");
    setLoading(true);
    let image_url_front = form.image_url_front;
    let image_url_back = form.image_url_back;

    // -------- 圖片上傳 --------
    if (previewFront && !image_url_front) {
      const front_blob = await (await fetch(previewFront)).blob();
      const fname = `front/${Date.now()}.jpg`;
      const { error: frontError } = await supabase.storage
        .from("card-images")
        .upload(fname, front_blob, { upsert: true });
      if (frontError) {
        setMsg("正面圖片上傳失敗");
        setLoading(false);
        return;
      }
      image_url_front = supabase.storage
        .from("card-images")
        .getPublicUrl(fname).data.publicUrl;
    }
    if (previewBack && !image_url_back) {
      const back_blob = await (await fetch(previewBack)).blob();
      const fname = `back/${Date.now()}.jpg`;
      const { error: backError } = await supabase.storage
        .from("card-images")
        .upload(fname, back_blob, { upsert: true });
      if (backError) {
        setMsg("背面圖片上傳失敗");
        setLoading(false);
        return;
      }
      image_url_back = supabase.storage
        .from("card-images")
        .getPublicUrl(fname).data.publicUrl;
    }

    // 產生專屬網址
    const url_slug = genSlug(form.name);

    // ===== 插入資料到 Supabase =====
    const { error, data } = await supabase
      .from("cards")
      .insert([
        {
          ...form,
          url_slug,
          image_url_front,
          image_url_back,
          created_at: new Date().toISOString(),
          published: false,
          payment_status: "pending",
        },
      ])
      .select()
      .single();

    if (error) {
      setMsg("資料上架失敗: " + error.message);
      setLoading(false);
      return;
    }

    setLoading(false);

    // 寄專屬網址至 email
    const cardUrl = `https://www.showall.tw/card/${url_slug}`;
    await fetch("/api/sendMail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: form.email,
        subject: "您的 SHOWALL 名片專屬網址已建立",
        html: `
          <div>您好，您已建立 SHOWALL 專屬名片網址：</div>
          <div><a href="${cardUrl}">${cardUrl}</a></div>
          <br>
          <div>立即回到網站確認資料與付款，或分享此網址給朋友！</div>
          <div style="margin-top:1em;color:#00b300;font-weight:bold">
            邀請朋友註冊上傳名片 <br> 成功推薦即享每人50元回饋！
          </div>
        `,
      }),
    });

    setMsg("資料已提交並 email 寄送，請完成付款...");
    router.push(`/payment?cardId=${data.id}`);
  }

  function handleEdit() {
    router.push("/upload");
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-blue-100 to-white py-8">
      <h2 className="text-3xl font-bold mb-6 text-blue-800 tracking-wider">
        名片預覽
      </h2>
      <div
        className="rounded-lg shadow-2xl p-8 w-full max-w-md mx-auto border border-gray-200"
        style={{ background: form.theme_color || "#fff" }}
      >
        <div className="mb-2 text-lg"><strong>姓名：</strong>{form.name}</div>
        <div className="mb-2 text-lg"><strong>公司：</strong>{form.company}</div>
        <div className="mb-2 text-lg"><strong>Email：</strong>{form.email}</div>
        <div className="mb-2 text-lg">
          <strong>地區：</strong><span className="mr-1">{form.citys}</span><span>{form.area}</span>
        </div>
        <div className="mb-2"><strong>Line：</strong>{form.line}</div>
        <div className="mb-2"><strong>手機：</strong>{form.mobile}</div>
        <div className="mb-2"><strong>其他聯絡：</strong>{form.contact_other}</div>

        {/* 四tag關鍵字 */}
        <div className="mb-2 flex flex-wrap gap-2">
          <strong className="w-full">關鍵字：</strong>
          {form.tag1 && <span className="px-2 py-1 rounded bg-cyan-100 text-cyan-700 text-sm">{form.tag1}</span>}
          {form.tag2 && <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-sm">{form.tag2}</span>}
          {form.tag3 && <span className="px-2 py-1 rounded bg-teal-100 text-teal-700 text-sm">{form.tag3}</span>}
          {form.tag4 && <span className="px-2 py-1 rounded bg-indigo-100 text-indigo-700 text-sm">{form.tag4}</span>}
        </div>
        <div className="mb-2">
          <strong>自我簡介：</strong>
          {form.intro}
        </div>

        {/* 前/背面 */}
        <div className="flex flex-col gap-4 my-6">
          <div>
            <div className="font-bold mb-1 text-gray-600">正面</div>
            {previewFront && (
              <img
                src={previewFront}
                alt="名片正面"
                className="rounded shadow w-full object-contain"
                style={{ maxHeight: 240, background: "#fff" }}
              />
            )}
          </div>
          <div>
            <div className="font-bold mb-1 text-gray-600">背面</div>
            {previewBack && (
              <img
                src={previewBack}
                alt="名片背面"
                className="rounded shadow w-full object-contain"
                style={{ maxHeight: 240, background: "#fff" }}
              />
            )}
          </div>
        </div>

        {/* 按鈕區 */}
        <div className="flex gap-4 my-8 justify-center">
          <button
            className="px-6 py-3 rounded bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold shadow"
            onClick={handleEdit}
            disabled={loading}
          >
            重新編輯
          </button>
          <button
            className="px-6 py-3 rounded bg-blue-600 hover:bg-blue-800 text-white font-bold shadow"
            onClick={handlePublish}
            disabled={loading}
          >
            馬上上架
          </button>
        </div>
        {msg && (
          <div className={`text-center font-bold ${msg.includes("失敗") ? "text-red-600" : "text-green-700"}`}>{msg}</div>
        )}
      </div>
    </div>
  );
}
