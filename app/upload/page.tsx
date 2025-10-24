"use client";
import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import AreaSelector from "@/components/AreaSelector";

// 子元件負責主內容
function UploadCardPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

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
    referrer: ""
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
    { color: "#F4F4F5", name: "淺灰" },
    { color: "#F3E8FF", name: "淺紫" }
  ];
  // form 初始值已有 theme_color: "#FFFFFF"

  useEffect(() => {
    const ref = searchParams.get("referrer");
    if (ref) setForm(f => ({ ...f, referrer: ref }));
  }, [searchParams]);

  useEffect(() => {
    async function fetchData() {
      const { data: cityObjs } = await supabase
        .from('cities')
        .select('citys, sort_order')
        .neq('citys', null)
        .order('sort_order');
      setCities(["全部", ...Array.from(new Set(cityObjs?.map(c => c.citys).filter(Boolean)))]);
    }
    fetchData();
  }, []);

  useEffect(() => {
    async function fetchAreas() {
      if (!form.citys || form.citys === "全部") { setAreas(["全部"]); setForm(f => ({ ...f, area: "全部" })); return; }
      const { data: ds } = await supabase
        .from('cities')
        .select('district, sort_order')
        .eq('citys', form.citys)
        .order('sort_order');
      setAreas(["全部", ...Array.from(new Set(ds?.map(a => a.district).filter(Boolean)))]);
      setForm(f => ({ ...f, area: "全部" }));
    }
    fetchAreas();
  }, [form.citys]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>, type: "front" | "back") {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      setMsg("只允許 JPG、PNG、WEBP 格式");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setMsg("圖片需小於 2MB");
      return;
    }
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
      if (type === "front") {
        setImgFront(file);
        setPreviewFront(dataUrl);
      } else {
        setImgBack(file);
        setPreviewBack(dataUrl);
      }
      setMsg("");
    };
    img.onerror = () => setMsg("圖片載入錯誤");
    img.src = URL.createObjectURL(file);
  }

  async function handlePublish() {
    setMsg("");
    setLoading(true);
    // 驗證/上傳略
    setLoading(false);
  }

  function handlePreview() {
    setMsg("");
    setLoading(true);
    window.sessionStorage.setItem("previewForm", JSON.stringify(form));
    window.sessionStorage.setItem("previewFront", previewFront);
    window.sessionStorage.setItem("previewBack", previewBack);
    router.push("/preview");
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-lg mx-auto py-10">
        <form className="space-y-4 bg-white p-6 rounded-lg shadow" onSubmit={e => e.preventDefault()}>
          <h2 className="text-xl font-bold text-center text-gray-700 mb-6">名片上傳</h2>
          <AreaSelector
            cities={cities}
            selectedCity={form.citys}
            setSelectedCity={(val: string) => setForm(f => ({ ...f, citys: val }))}
            areas={areas}
            selectedArea={form.area}
            setSelectedArea={(val: string) => setForm(f => ({ ...f, area: val }))}
          />
          <input type="email" className="border p-2 rounded w-full" required value={form.email}
            maxLength={120} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            placeholder="電子信箱" />
          <input type="text" className="border p-2 rounded w-full" required value={form.name}
            maxLength={30} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="姓名" />
          <input type="text" className="border p-2 rounded w-full" value={form.company}
            maxLength={60} onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
            placeholder="公司 / 服務品牌" />
          <input type="text" className="border p-2 rounded w-full" value={form.line}
            maxLength={30} onChange={e => setForm(f => ({ ...f, line: e.target.value }))}
            placeholder="LINE ID" />
          <input type="text" className="border p-2 rounded w-full" value={form.mobile}
            maxLength={20} onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))}
            placeholder="手機" />
          <input type="text" className="border p-2 rounded w-full" value={form.contact_other}
            maxLength={60} onChange={e => setForm(f => ({ ...f, contact_other: e.target.value }))}
            placeholder="其他聯絡方式（可填 Instagram 等）" />

          {/* 四欄關鍵字，預顯示，限定10個字 */}
          <input type="text" className="border p-2 rounded w-full" value={form.tag1}
            maxLength={10} onChange={e => setForm(f => ({ ...f, tag1: e.target.value }))}
            placeholder="主關鍵字（例如：美甲、美睫、美髮）" />
          <input type="text" className="border p-2 rounded w-full" value={form.tag2}
            maxLength={10} onChange={e => setForm(f => ({ ...f, tag2: e.target.value }))}
            placeholder="次關鍵字一（例如：人壽保險、產物保險）" />
          <input type="text" className="border p-2 rounded w-full" value={form.tag3}
            maxLength={10} onChange={e => setForm(f => ({ ...f, tag3: e.target.value }))}
            placeholder="次關鍵字二（例如：水電、木工）" />
          <input type="text" className="border p-2 rounded w-full" value={form.tag4}
            maxLength={10} onChange={e => setForm(f => ({ ...f, tag4: e.target.value }))}
            placeholder="次關鍵字三（例如：健康管理、家教、教練）" />

          {/* 自我簡介，預設顯示 */}
          <textarea className="border p-2 rounded w-full" value={form.intro}
            maxLength={300} onChange={e => setForm(f => ({ ...f, intro: e.target.value }))}
            placeholder="請簡短描述您的服務與特色" rows={3} />
          <select
            className="border p-2 rounded w-full"
            value={form.theme_color}
            onChange={e => setForm(f => ({ ...f, theme_color: e.target.value }))}
          >
            {BG_COLORS.map(opt =>
              <option key={opt.color} value={opt.color}>{opt.name}</option>
            )}
          </select>

          {/* 圖片上傳 */}
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => handleFileChange(e, "front")} />
          {previewFront && (
            <div className="mt-2 flex justify-center">
              <img
                src={previewFront}
                alt="預覽正面"
                className="w-32 rounded shadow hover:shadow-lg transition"
                style={{ objectFit: "contain" }}
              />
            </div>
          )}
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => handleFileChange(e, "back")} />
          {previewBack && (
            <div className="mt-2 flex justify-center">
              <img
                src={previewBack}
                alt="預覽背面"
                className="w-32 rounded shadow hover:shadow-lg transition"
                style={{ objectFit: "contain" }}
              />
            </div>
          )}

          <button type="button" disabled={loading}
            className="w-full py-3 mt-6 rounded bg-blue-600 text-white text-lg font-bold hover:bg-blue-700 transition"
            onClick={handlePreview}>名片預覽</button>
          <button type="button" disabled={loading}
            className="w-full py-3 mt-3 rounded bg-green-600 text-white text-lg font-bold hover:bg-green-700 transition"
            onClick={handlePublish}>馬上上架</button>
          {msg && <div className={`mt-3 text-center font-bold ${msg.includes('成功') ? "text-green-600" : "text-red-500"}`}>{msg}</div>}
        </form>
      </main>
      <footer className="text-center text-gray-400 text-sm py-6 border-t mt-12">
        &copy; 2025 SHOWALL 百業名片網
      </footer>
    </div>
  );
}

// 外層 Suspense 包裹
export default function UploadCardPage() {
  return (
    <Suspense>
      <UploadCardPageInner />
    </Suspense>
  );
}
