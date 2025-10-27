"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

// 生成唯一 url_slug
function genSlug(name: string): string {
  const base = encodeURIComponent((name || "user").trim().substring(0, 20));
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return `${base}-${timestamp}${random}`;
}

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
      // 1. 上傳圖片到 Supabase Storage
      const frontBlob = await fetch(previewFront).then(r => r.blob());
      const frontFileName = `${Date.now()}-front.jpg`;
      const { data: frontUpload, error: frontError } = await supabase.storage
        .from('card-images')
        .upload(frontFileName, frontBlob, { contentType: 'image/jpeg' });
      if (frontError) throw new Error("正面圖片上傳失敗：" + frontError.message);

      const frontUrl = supabase.storage
        .from('card-images')
        .getPublicUrl(frontFileName).data.publicUrl;

      let backUrl = "";
      if (previewBack) {
        const backBlob = await fetch(previewBack).then(r => r.blob());
        const backFileName = `${Date.now()}-back.jpg`;
        const { data: backUpload, error: backError } = await supabase.storage
          .from('card-images')
          .upload(backFileName, backBlob, { contentType: 'image/jpeg' });
        if (backError) throw new Error("背面圖片上傳失敗：" + backError.message);

        backUrl = supabase.storage
          .from('card-images')
          .getPublicUrl(backFileName).data.publicUrl;
      }

      // 2. 生成 url_slug
      const urlSlug = genSlug(form.name || form.email);

      // 3. 定義 cardUrl
      const cardUrl = `https://www.showall.tw/card/${urlSlug}`;

      // 4. 寫入 cards table
      const cardData = {
        email: form.email,
        name: form.name || "",
        company: form.company || "",
        citys: form.citys && form.citys !== "" ? form.citys : "全部",
        area: form.area && form.area !== "" ? form.area : "全部",
        line: form.line || "",
        mobile: form.mobile || "",
        contact_other: form.contact_other || "",
        tag1: form.tag1 || "",
        tag2: form.tag2 || "",
        tag3: form.tag3 || "",
        tag4: form.tag4 || "",
        intro: form.intro || "",
        theme_color: form.theme_color || "#FFFFFF",
        image_url_front: frontUrl,
        image_url_back: backUrl,
        url_slug: urlSlug,
        published: false,
        referrer_slug: form.referrer_slug || null // 統一用唯一碼欄
      };

      const { data: insertData, error: insertError } = await supabase
        .from('cards')
        .insert([cardData])
        .select();

      if (insertError) throw new Error("資料寫入失敗：" + insertError.message);

      const cardId = insertData[0].id;

      // 5. 如果有推薦人，記錄到 referrals table
      if (form.referrer_slug && form.referrer_slug.trim()) {
        await supabase.from('referrals').insert([{
          referrer_slug: form.referrer_slug.trim(),
          referee_email: form.email,
          referee_card_id: cardId,
          status: 'pending'
        }]);
      }

      // 6. 查目前已上架名片進度（活動用）
      const { count: cardCount } = await supabase
        .from("cards")
        .select("id", { count: "exact", head: true })
        .eq("published", true);

      // 7. 寄信給用戶（抽iPhone17活動進度、推薦說明）
      await fetch("/api/sendMail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: form.email,
          subject: "您的 SHOWALL 名片已建立 - 抽 iPhone 17 活動進度",
          html: `
          <div style="font-family: Arial,sans-serif;line-height:1.7;">
            <h2 style="color:#eab308;">🎁 您已成功參加「抽 iPhone 17」活動！</h2>
            <p>您已成功建立 <strong>SHOWALL 名片</strong>，並獲得抽獎資格！</p>
            <p>活動辦法：當全站名片 <b>累積上架滿 1000 張</b>，我們會抽一位幸運得主送出 <b style="color:#ff3366">iPhone 17</b>！</p>
            <div style="font-size:20px;margin:20px 0;">
              <b>目前進度：</b> <span style="color:#2563eb">${cardCount ?? 0}</span> / 1000 張
              <span style="margin-left:15px;color:#f59e42;">（每小時更新一次）</span>
            </div>
            <hr style="margin:24px 0;" />
            <h3 style="color:#16a34a;">邀請朋友再加抽獎資格</h3>
            <p>每成功推薦 1 人上傳名片，再多 1 次抽獎資格（無上限）</p>
            <p>
              <a href="https://www.showall.tw/upload?referrer=${urlSlug}"
                style="display:inline-block;padding:10px 22px;background:#2563eb;color:white;text-decoration:none;border-radius:6px;font-weight:bold;">
                專屬推薦連結
              </a>
            </p>
            <hr style="margin:22px 0;" />
            <p style="color:#888;font-size:13px;">
              此信件由系統自動發送，請勿直接回覆。如需協助請聯絡 <a href="mailto:service@showall.tw">service@showall.tw</a>
            </p>
          </div>
          `,
        }),
      });

      window.sessionStorage.removeItem("previewForm");
      window.sessionStorage.removeItem("previewFront");
      window.sessionStorage.removeItem("previewBack");
      router.push(`/payment?card_id=${cardId}`);
    } catch (err: any) {
      console.error(err);
      setMsg(err.message || "上架失敗，請稍後再試");
      setLoading(false);
    }
  }

  function handleBack() {
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
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-blue-100 to-white py-8 px-4">
      <div
        className="rounded-lg shadow-2xl p-6 w-full max-w-md mx-auto border border-gray-200"
        style={{ background: form?.theme_color || "#fff" }}
      >
        {/* 名片圖片區 */}
        <div className="space-y-4 mb-6">
          {previewFront && (
            <div>
              <div className="font-bold mb-2 text-gray-700">名片正面</div>
              <img
                src={previewFront}
                alt="名片正面"
                className="rounded shadow w-full object-contain"
                style={{ maxHeight: 300, background: "#fff" }}
              />
            </div>
          )}
          {previewBack && (
            <div>
              <div className="font-bold mb-2 text-gray-700">名片背面</div>
              <img
                src={previewBack}
                alt="名片背面"
                className="rounded shadow w-full object-contain"
                style={{ maxHeight: 300, background: "#fff" }}
              />
            </div>
          )}
        </div>

        {/* 基本資訊區 */}
        <div className="space-y-3 mb-6">
          <div className="text-xl font-bold text-gray-800">{form?.name}</div>
          {form?.company && <div className="text-gray-600"><strong>公司：</strong>{form.company}</div>}
          <div className="text-gray-600"><strong>Email：</strong>{form?.email}</div>
          {(form?.citys || form?.area) && (
            <div className="text-gray-600">
              <strong>地區：</strong>
              {form?.citys} {form?.area && form?.area !== "全部" && `・${form.area}`}
            </div>
          )}
          {form?.line && <div className="text-gray-600"><strong>LINE：</strong>{form.line}</div>}
          {form?.mobile && <div className="text-gray-600"><strong>手機：</strong>{form.mobile}</div>}
          {form?.contact_other && <div className="text-gray-600"><strong>其他聯絡：</strong>{form.contact_other}</div>}
        </div>

        {/* 標籤區 */}
        {(form?.tag1 || form?.tag2 || form?.tag3 || form?.tag4) && (
          <div className="mb-6">
            <div className="font-bold text-gray-700 mb-2">經營項目</div>
            <div className="flex flex-wrap gap-2">
              {form?.tag1 && <span className="px-3 py-1 rounded-full bg-cyan-100 text-cyan-700 text-sm">{form.tag1}</span>}
              {form?.tag2 && <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm">{form.tag2}</span>}
              {form?.tag3 && <span className="px-3 py-1 rounded-full bg-teal-100 text-teal-700 text-sm">{form.tag3}</span>}
              {form?.tag4 && <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm">{form.tag4}</span>}
            </div>
          </div>
        )}

        {/* 簡介區 */}
        {form?.intro && (
          <div className="mb-6">
            <div className="font-bold text-gray-700 mb-2">關於我</div>
            <p className="text-gray-600 whitespace-pre-wrap">{form.intro}</p>
          </div>
        )}

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
        {/* 提示訊息 */}
        {msg && (
          <div className="mt-4 text-center font-bold text-red-500">
            {msg}
          </div>
        )}
      </div>
    </div>
  );
}
