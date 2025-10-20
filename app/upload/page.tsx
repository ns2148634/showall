"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const COLORS = [
  "#F5F5F5", "#EAF6FF", "#F9F6EF",
  "#FFD700", "#FDC1C5", "#A6E1FA", "#46C2D6",
  "#1A2636", "#3C4251", "#212121"
];

export default function UploadCardPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [mainCats, setMainCats] = useState<any[]>([]);
  const [subCats, setSubCats] = useState<any[]>([]);
  const [thirdCats, setThirdCats] = useState<any[]>([]);
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
    theme_color: COLORS[0],
    image_url_front: "",
    image_url_back: ""
  });
  const [imgFront, setImgFront] = useState<File | null>(null);
  const [imgBack, setImgBack] = useState<File | null>(null);
  const [previewFront, setPreviewFront] = useState<string>("");
  const [previewBack, setPreviewBack] = useState<string>("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const { data: cats } = await supabase.from('categories').select('*');
      setCategories(cats || []);
      setMainCats((cats || []).filter(row => row.level === 1));
      const { data: cityObjs } = await supabase.from('cities').select('citys').neq('citys', null);
      setCities(["全部", ...Array.from(new Set(cityObjs?.map(c => c.citys).filter(Boolean)))]);
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (!form.category1) { setSubCats([]); setForm(f => ({ ...f, category2: "" })); setThirdCats([]); setForm(f => ({ ...f, category3: "" })); return; }
    setSubCats(categories.filter(row => row.level === 2 && row.parent_id == form.category1));
    setForm(f => ({ ...f, category2: "" })); setThirdCats([]); setForm(f => ({ ...f, category3: "" }));
  }, [form.category1, categories]);

  useEffect(() => {
    if (!form.category2) { setThirdCats([]); setForm(f => ({ ...f, category3: "" })); return; }
    setThirdCats(categories.filter(row => row.level === 3 && row.parent_id == form.category2));
    setForm(f => ({ ...f, category3: "" }));
  }, [form.category2, categories]);

  useEffect(() => {
    async function fetchAreas() {
      if (form.citys === "" || form.citys === "全部") { setAreas(["全部"]); setForm(f => ({ ...f, area: "全部" })); return; }
      const { data: ds } = await supabase.from('cities').select('district').eq('citys', form.citys);
      setAreas(["全部", ...Array.from(new Set(ds?.map(a => a.district).filter(Boolean)))]);
      setForm(f => ({ ...f, area: "全部" }));
    }
    fetchAreas();
  }, [form.citys]);

  function handleFileChange(
    e: React.ChangeEvent<HTMLInputElement>,
    type: "front" | "back"
  ) {
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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    if (!form.email.match(/.+@.+\..+/) || form.email.length > 120) { setMsg("請填正確電子郵件（最多120字）"); setLoading(false); return; }
    if (form.company.length > 30) { setMsg("公司/組織最多30字"); setLoading(false); return; }
    if (form.name.length > 20) { setMsg("姓名/暱稱最多20字"); setLoading(false); return; }
    if (form.line.length > 30) { setMsg("Line最多30字"); setLoading(false); return; }
    if (form.mobile.length > 30) { setMsg("手機最多30字"); setLoading(false); return; }
    if (form.contact_other.length > 30) { setMsg("其他聯絡最多30字"); setLoading(false); return; }
    if (form.intro.length > 30) { setMsg("簡介最多30字"); setLoading(false); return; }
    if (!imgFront) { setMsg("需上傳名片正面！"); setLoading(false); return; }

    let image_url_front = "";
    if (imgFront) {
      const frontPath = `front/${Date.now()}_${imgFront.name}`;
      const { error: frontError } = await supabase.storage
        .from('card-images')
        .upload(frontPath, imgFront);
      if (frontError) { setMsg("名片正面圖片上傳失敗"); setLoading(false); return; }
      image_url_front = supabase.storage.from('card-images').getPublicUrl(frontPath).data.publicUrl;
    }

    let image_url_back = "";
    if (imgBack) {
      const backPath = `back/${Date.now()}_${imgBack.name}`;
      const { error: backError } = await supabase.storage
        .from('card-images')
        .upload(backPath, imgBack);
      if (backError) { setMsg("名片背面圖片上傳失敗"); setLoading(false); return; }
      image_url_back = supabase.storage.from('card-images').getPublicUrl(backPath).data.publicUrl;
    }

    const { error } = await supabase.from('cards').insert([{
      ...form,
      image_url_front,
      image_url_back,
      created_at: new Date().toISOString()
    }]);
    setLoading(false);

    if (!error) setMsg("上傳成功！");
    else setMsg("發生錯誤，請稍後再試");
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-lg mx-auto py-10">
        <form className="space-y-4 bg-white p-6 rounded-lg shadow" onSubmit={handleSubmit}>
          <h2 className="text-xl font-bold text-center text-gray-700 mb-6">名片上傳</h2>
          {/* 電子郵件 */}
          <div>
            <label className="font-bold text-gray-600 mb-1 block">
              電子郵件<span className="text-red-500">*</span> (限120字)
            </label>
            <input type="email" className="border p-2 rounded w-full" required value={form.email} maxLength={120}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          {/* 公司名稱 */}
          <div>
            <label className="font-bold text-gray-600 mb-1 block">公司名稱／組織名稱 (限30字)</label>
            <input type="text" className="border p-2 rounded w-full" value={form.company} maxLength={30}
              onChange={e => setForm(f => ({ ...f, company: e.target.value }))} />
          </div>
          {/* 姓名 */}
          <div>
            <label className="font-bold text-gray-600 mb-1 block">姓名／暱稱 (限20字)</label>
            <input type="text" className="border p-2 rounded w-full" value={form.name} maxLength={20}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          {/* 三層分類 */}
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="mb-1 text-gray-600 font-bold block">職業主分類</label>
              <select className="border rounded p-2" value={form.category1} onChange={e => setForm(f => ({ ...f, category1: e.target.value }))}>
                <option value="">請選擇</option>
                {mainCats.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 text-gray-600 font-bold block">次分類</label>
              <select className="border rounded p-2" value={form.category2} onChange={e => setForm(f => ({ ...f, category2: e.target.value }))}
                disabled={!form.category1}>
                <option value="">請選擇</option>
                {subCats.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 text-gray-600 font-bold block">細分類</label>
              <select className="border rounded p-2" value={form.category3} onChange={e => setForm(f => ({ ...f, category3: e.target.value }))}
                disabled={!form.category2}>
                <option value="">請選擇</option>
                {thirdCats.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
              </select>
            </div>
          </div>
          {/* 城市/行政區 */}
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="mb-1 text-gray-600 font-bold block">所在城市</label>
              <select className="border rounded p-2" value={form.citys} onChange={e => setForm(f => ({ ...f, citys: e.target.value }))}>
                {cities.map(city => <option key={city}>{city}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 text-gray-600 font-bold block">行政區</label>
              <select className="border rounded p-2" value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))}>
                {areas.map(area => <option key={area}>{area}</option>)}
              </select>
            </div>
          </div>
          {/* Line */}
          <div>
            <label className="font-bold text-gray-600 mb-1 block">Line (限30字)</label>
            <input type="text" className="border p-2 rounded w-full" value={form.line} maxLength={30}
              onChange={e => setForm(f => ({ ...f, line: e.target.value }))} />
          </div>
          {/* 手機 */}
          <div>
            <label className="font-bold text-gray-600 mb-1 block">手機 (限30字)</label>
            <input type="text" className="border p-2 rounded w-full" value={form.mobile} maxLength={30}
              onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))} />
          </div>
          {/* 其他聯絡 */}
          <div>
            <label className="font-bold text-gray-600 mb-1 block">其他連絡方式 (限30字)</label>
            <input type="text" className="border p-2 rounded w-full" value={form.contact_other} maxLength={30}
              onChange={e => setForm(f => ({ ...f, contact_other: e.target.value }))} />
          </div>
          {/* 自我簡介 */}
          <div>
            <label className="font-bold text-gray-600 mb-1 block">自我簡介（限30字）</label>
            <input type="text" maxLength={30} className="border p-2 rounded w-full" value={form.intro}
              onChange={e => setForm(f => ({ ...f, intro: e.target.value }))} />
          </div>
          {/* 名片正面 */}
          <div>
            <label className="font-bold text-gray-600 mb-1 block">名片正面<span className="text-red-500">*</span></label>
            <div className="text-xs text-gray-500 mb-1">
              檔案限 JPG/PNG/WEBP，最大2MB
            </div>
            <input type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              required onChange={e => handleFileChange(e, "front")} />
            {previewFront && <img src={previewFront} alt="正面預覽" className="mt-1 rounded w-32 h-32 object-cover" />}
          </div>
          {/* 名片背面 */}
          <div>
            <label className="font-bold text-gray-600 mb-1 block">名片背面</label>
            <div className="text-xs text-gray-500 mb-1">
              檔案限 JPG/PNG/WEBP，最大2MB
            </div>
            <input type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              onChange={e => handleFileChange(e, "back")} />
            {previewBack && <img src={previewBack} alt="背面預覽" className="mt-1 rounded w-32 h-32 object-cover" />}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-6 rounded bg-blue-600 text-white text-lg font-bold hover:bg-blue-700 transition"
          >
            {loading ? "上傳中..." : "上傳預覽"}
          </button>
          {msg && <div className={`mt-3 text-center font-bold ${msg.includes('成功') ? "text-green-600" : "text-red-500"}`}>{msg}</div>}
        </form>
      </main>
      <footer className="text-center text-gray-400 text-sm py-6 border-t mt-12">
        &copy; 2025 SHOWALL 百業名片網
      </footer>
    </div>
  );
}
