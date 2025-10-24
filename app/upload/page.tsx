"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import CategorySelector from "@/components/CategorySelector";
import AreaSelector from "@/components/AreaSelector";

// 背景色
const BG_COLORS = [
  { color: "#FFFFFF", name: "白" },
  { color: "#EAF6FF", name: "淺藍" },
  { color: "#FFFBE0", name: "淺黃" },
  { color: "#EBFAE0", name: "淺綠" },
  { color: "#FFE5E5", name: "淺紅" },
  { color: "#F4F4F5", name: "淺灰" },
  { color: "#F3E8FF", name: "淺紫" }
];

export default function UploadCardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [categories, setCategories] = useState<any[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const [form, setForm] = useState({
    email: "",
    company: "",
    name: "",
    category1: "",
    category2: "",
    category3: "",
    citys: "",
    area: "",
    line: "",
    mobile: "",
    contact_other: "",
    intro: "",
    theme_color: BG_COLORS[0].color,
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

  useEffect(() => {
    const ref = searchParams.get("referrer");
    if (ref) setForm(f => ({ ...f, referrer: ref }));
  }, [searchParams]);

  useEffect(() => {
    async function fetchData() {
      const { data: cats } = await supabase.from('categories').select('*').order('sort_order');
      setCategories(cats || []);
      const { data: cityObjs } = await supabase.from('cities').select('citys, sort_order').neq('citys', null).order('sort_order');
      setCities(["全部", ...Array.from(new Set(cityObjs?.map(c => c.citys).filter(Boolean)))]);
    }
    fetchData();
  }, []);

  useEffect(() => {
    async function fetchAreas() {
      if (!form.citys || form.citys === "全部") { setAreas(["全部"]); setForm(f => ({ ...f, area: "全部" })); return; }
      const { data: ds } = await supabase.from('cities').select('district, sort_order').eq('citys', form.citys).order('sort_order');
      setAreas(["全部", ...Array.from(new Set(ds?.map(a => a.district).filter(Boolean)))]);
      setForm(f => ({ ...f, area: "全部" }));
    }
    fetchAreas();
  }, [form.citys]);

  // 檔案處理
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
    // 驗證略...

    // 圖片上傳略...

    // 產生 url_slug
    function genSlug(name: string): string {
      return encodeURIComponent(
        (name || "user") + "-" + Math.floor(Math.random() * 10000000)
      );
    }
    const url_slug = genSlug(form.name);

    // 主分類/次/細分類名稱
    const category_main = categories.find(cat => String(cat.id) === String(form.category1))?.name || "";
    const category_sub = categories.find(cat => String(cat.id) === String(form.category2))?.name || "";
    const category_detail = categories.find(cat => String(cat.id) === String(form.category3))?.name || "";

    // 插入名片
    const { error, data: newCard } = await supabase
      .from("cards")
      .insert([
        {
          ...form,
          url_slug,
          category_main,
          category_sub,
          category_detail,
          image_url_front: form.image_url_front,
          image_url_back: form.image_url_back,
          created_at: new Date().toISOString(),
          published: false,
          payment_status: "pending",
        }
      ])
      .select()
      .single();

    if (error || !newCard) {
      setMsg("資料上架失敗: " + error?.message);
      setLoading(false);
      return;
    }

    // 推薦碼/獎勵機制略...

    setLoading(false);
    setMsg("資料已提交並 email 寄送，請完成付款...");
    router.push(`/payment?cardId=${newCard.id}`);
  }

  function handlePreview() {
    setMsg("");
    setLoading(true);
    window.sessionStorage.setItem("previewForm", JSON.stringify(form));
    window.sessionStorage.setItem("previewFront", previewFront);
    window.sessionStorage.setItem("previewBack", previewBack);
    window.sessionStorage.setItem("categories", JSON.stringify(categories));
    router.push("/preview");
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-lg mx-auto py-10">
        <form className="space-y-4 bg-white p-6 rounded-lg shadow" onSubmit={e => e.preventDefault()}>
          <h2 className="text-xl font-bold text-center text-gray-700 mb-6">名片上傳</h2>
          {/* 分類元件 */}
          <CategorySelector
            categories={categories}
            selectedMain={form.category1}
            setSelectedMain={val => setForm(f => ({ ...f, category1: val }))}
            selectedSub={form.category2}
            setSelectedSub={val => setForm(f => ({ ...f, category2: val }))}
            selectedThird={form.category3}
            setSelectedThird={val => setForm(f => ({ ...f, category3: val }))}
          />
          {/* 地區元件 */}
          <AreaSelector
            cities={cities}
            selectedCity={form.citys}
            setSelectedCity={val => setForm(f => ({ ...f, citys: val }))}
            areas={areas}
            selectedArea={form.area}
            setSelectedArea={val => setForm(f => ({ ...f, area: val }))}
          />
          {/* 其他欄位一樣插入 */}
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
          <textarea className="border p-2 rounded w-full" value={form.intro}
            maxLength={300} onChange={e => setForm(f => ({ ...f, intro: e.target.value }))}
            placeholder="簡介 / 專業 / 資歷 / 推薦" rows={3} />
          {/* 背景色 */}
          <select className="border p-2 rounded w-full" value={form.theme_color}
            onChange={e => setForm(f => ({ ...f, theme_color: e.target.value }))}>
            {BG_COLORS.map(opt => <option key={opt.color} value={opt.color}>{opt.name}</option>)}
          </select>
          {/* 推薦碼 */}
          <input type="text" className="border p-2 rounded w-full" value={form.referrer}
            maxLength={30} onChange={e => setForm(f => ({ ...f, referrer: e.target.value }))}
            placeholder="推薦碼（如果朋友給你的話）" />
          {/* 圖片上傳 */}
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => handleFileChange(e, "front")} />
          {previewFront && (<img src={previewFront} alt="預覽正面" className="w-32 mb-2"/>)}
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => handleFileChange(e, "back")} />
          {previewBack && (<img src={previewBack} alt="預覽背面" className="w-32 mb-2"/>)}
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
