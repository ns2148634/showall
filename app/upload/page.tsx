"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import AreaSelector from "@/components/AreaSelector";

function UploadCardPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showTipsModal, setShowTipsModal] = useState(false);
  useEffect(() => { setTimeout(() => setShowTipsModal(true), 500); }, []);
  const [cities, setCities] = useState<string[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const [form, setForm] = useState({
    email: "",
    company: "",
    name: "",
    citys: "",
    area: "",
    line: "",
    mobile: "",
    contact_other: "",
    tag1: "",
    tag2: "",
    tag3: "",
    tag4: "",
    intro: "",
    theme_color: "#FFFFFF",
    image_url_front: "",
    image_url_back: "",
    referrer_slug: ""
  });
  const [imgFront, setImgFront] = useState<File | null>(null);
  const [imgBack, setImgBack] = useState<File | null>(null);
  const [previewFront, setPreviewFront] = useState<string>("");
  const [previewBack, setPreviewBack] = useState<string>("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const BG_COLORS = [
    { color: "#FFFFFF", name: "白" },
    { color: "#EAF6FF", name: "淺藍" },
    { color: "#FFFBE0", name: "淺黃" },
    { color: "#EBFAE0", name: "淺綠" },
    { color: "#FFE5E5", name: "淺紅" },
    { color: "#F4F4F5", name: "淺灰" }
  ];

  // 推薦人自動帶入
  useEffect(() => {
    const ref = searchParams.get("referrer") || searchParams.get("referrer_slug");
    if (ref) setForm(f => ({ ...f, referrer_slug: ref }));
  }, [searchParams]);

  // 城市「不排序」直接交給 AreaSelector
  useEffect(() => {
    async function fetchData() {
      const { data: cityObjs } = await supabase.from('cities').select('citys');
      const rawCities = Array.from(new Set(cityObjs?.map(c => c.citys).filter(Boolean)));
      setCities(["全部", ...rawCities]);
    }
    fetchData();
  }, []);

  useEffect(() => {
    async function fetchAreas() {
      if (!form.citys || form.citys === "全部") {
        setAreas(["全部"]);
        setForm(f => ({ ...f, area: "全部" }));
        return;
      }
      const { data: ds } = await supabase
        .from('cities').select('district').eq('citys', form.citys);
      const uniqueAreas = Array.from(new Set(ds?.map(a => a.district).filter(Boolean))).sort();
      setAreas(["全部", ...uniqueAreas]);
      setForm(f => ({ ...f, area: "全部" }));
    }
    fetchAreas();
  }, [form.citys]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>, type: "front" | "back") {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) { setMsg("只允許 JPG、PNG、WebP 格式"); return; }
    if (file.size > 2 * 1024 * 1024) { setMsg("圖片需小於 2MB"); return; }
    const img = new window.Image();
    img.onload = () => {
      let maxW = 1200, maxH = 720;
      let w = img.width, h = img.height;
      let ratio = Math.min(maxW / w, maxH / h, 1);
      let nw = Math.round(w * ratio), nh = Math.round(h * ratio);
      const canvas = document.createElement('canvas');
      canvas.width = nw;
      canvas.height = nh;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0, nw, nh);
      let outType = file.type === "image/webp" ? "image/webp" :
        file.type === "image/png" ? "image/png" : "image/jpeg";
      let dataUrl = canvas.toDataURL(outType, outType !== "image/png" ? 0.8 : 1);
      if (type === "front") { setImgFront(file); setPreviewFront(dataUrl); }
      else { setImgBack(file); setPreviewBack(dataUrl); }
      setMsg("");
    };
    img.onerror = () => setMsg("圖片載入錯誤");
    img.src = URL.createObjectURL(file);
  }

  async function handlePublish() {
    if (!form.email) { setMsg("請填寫電子信箱"); return; }
    if (!previewFront) { setMsg("請上傳名片正面"); return; }
    setMsg(""); setLoading(true);
    // 上傳邏輯略
    setLoading(false);
  }

  function handlePreview() {
    if (!form.email) { setMsg("請填寫電子信箱"); return; }
    if (!previewFront) { setMsg("請上傳名片正面"); return; }
    setMsg(""); setLoading(true);
    window.sessionStorage.setItem("previewForm", JSON.stringify(form));
    window.sessionStorage.setItem("previewFront", previewFront);
    window.sessionStorage.setItem("previewBack", previewBack);
    router.push("/preview");
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 名片上傳技巧彈窗 */}
      {showTipsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-8 text-gray-800 relative">
            <button className="absolute top-3 right-4 text-2xl text-gray-400 hover:text-red-600"
              onClick={() => setShowTipsModal(false)}
              title="關閉">×</button>
            <h2 className="text-2xl font-bold mb-4 text-blue-700 text-center">上傳名片技巧</h2>
            <div className="space-y-4 text-lg">
              <div><span className="font-bold text-blue-700">1. 個人簡介與經營項目要明確</span><br />寫清楚你的服務專長、特色及常用關鍵字（如：健康管理、美甲保險），越明確越容易被搜尋。</div>
              <div><span className="font-bold text-blue-700">2. 聯絡方式詳細填寫</span><br />建議填全：Email、手機、LINE、Facebook、社群等通路，方便客戶聯絡。</div>
              <div><span className="font-bold text-blue-700">3. 地區選精確</span><br />用戶常用地區分類搜尋，選擇越細曝光機會越高。</div>
              <div><span className="font-bold text-green-700">4. 填得完整，系統推薦更容易到手！</span></div>
            </div>
            <button className="block w-full py-2 mt-6 rounded bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 transition" onClick={() => setShowTipsModal(false)}>知道了，開始編輯名片</button>
          </div>
        </div>
      )}

      <main className="max-w-lg mx-auto py-10">
        <form className="space-y-4 bg-white p-6 rounded-lg shadow" onSubmit={e => e.preventDefault()}>
          {/* email欄 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">電子信箱 <span className="text-red-500">*</span></label>
            <input type="email" className="border p-2 rounded w-full" required value={form.email} maxLength={120}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="請輸入電子信箱" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">姓名/暱稱 <span className="text-gray-500 text-xs">(上限30字)</span></label>
            <input type="text" className="border p-2 rounded w-full" value={form.name} maxLength={30}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="請輸入姓名或暱稱" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">公司 / 組織 <span className="text-gray-500 text-xs">(上限20字)</span></label>
            <input type="text" className="border p-2 rounded w-full" value={form.company} maxLength={20}
              onChange={e => setForm(f => ({ ...f, company: e.target.value }))} placeholder="請輸入公司或組織團體名稱" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">LINE ID <span className="text-gray-500 text-xs">(上限30字)</span></label>
            <input type="text" className="border p-2 rounded w-full" value={form.line} maxLength={30}
              onChange={e => setForm(f => ({ ...f, line: e.target.value }))} placeholder="請輸入 LINE ID" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">手機 <span className="text-gray-500 text-xs">(上限20字)</span></label>
            <input type="text" className="border p-2 rounded w-full" value={form.mobile} maxLength={20}
              onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))} placeholder="請輸入手機號碼" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">其他聯絡方式 <span className="text-gray-500 text-xs">(上限60字)</span></label>
            <input type="text" className="border p-2 rounded w-full" value={form.contact_other} maxLength={60}
              onChange={e => setForm(f => ({ ...f, contact_other: e.target.value }))} placeholder="可填 Instagram、Facebook 等" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">所在地區</label>
            <AreaSelector
              cities={cities}
              selectedCity={form.citys}
              setSelectedCity={val => setForm(f => ({ ...f, citys: val }))}
              areas={areas}
              selectedArea={form.area}
              setSelectedArea={val => setForm(f => ({ ...f, area: val }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">名片正面 <span className="text-red-500">*</span></label>
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => handleFileChange(e, "front")} className="w-full" />
            {previewFront && (
              <div className="mt-2 flex justify-center">
                <img src={previewFront} alt="預覽正面" className="w-32 rounded shadow hover:shadow-lg transition" style={{ objectFit: "contain" }} />
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">名片背面</label>
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => handleFileChange(e, "back")} className="w-full" />
            {previewBack && (
              <div className="mt-2 flex justify-center">
                <img src={previewBack} alt="預覽背面" className="w-32 rounded shadow hover:shadow-lg transition" style={{ objectFit: "contain" }} />
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">推薦人專屬碼（自動填入）</label>
            <input type="text" name="referrer_slug" value={form.referrer_slug} readOnly className="border p-2 rounded w-full bg-gray-50" placeholder="由推薦人連結自動填入" />
            <p className="text-xs text-gray-500 mt-1">如果你是朋友推薦進來，這裡會自動帶入推薦專屬碼。</p>
          </div>
          <button type="button" disabled={loading} className="w-full py-3 mt-6 rounded bg-blue-600 text-white text-lg font-bold hover:bg-blue-700 transition disabled:opacity-50" onClick={handlePreview}>
            預覽名片
          </button>
          {msg && (
            <div className={`mt-3 text-center font-bold ${msg.includes('成功') ? "text-green-600" : "text-red-500"}`}>
              {msg}
            </div>
          )}
        </form>
      </main>
      <footer className="text-center text-gray-400 text-sm py-6 border-t mt-12">
        &copy; 2025 SHOWALL 百業名片網
      </footer>
    </div>
  );
}

export default function UploadCardPage() {
  return (
    <Suspense>
      <UploadCardPageInner />
    </Suspense>
  );
}
