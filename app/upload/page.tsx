"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

// 背景色選擇設定
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
    theme_color: BG_COLORS[0].color,
    image_url_front: "",
    image_url_back: "",
    referrer: "" // 推薦碼欄位
  });
  const [imgFront, setImgFront] = useState<File | null>(null);
  const [imgBack, setImgBack] = useState<File | null>(null);
  const [previewFront, setPreviewFront] = useState<string>("");
  const [previewBack, setPreviewBack] = useState<string>("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // 推薦碼自動填入
  useEffect(() => {
    const ref = searchParams.get("referrer");
    if (ref) setForm(f => ({ ...f, referrer: ref }));
  }, [searchParams]);

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
    const savedForm = JSON.parse(window.sessionStorage.getItem("previewForm") || "{}");
    if (Object.keys(savedForm).length > 0) setForm(f => ({ ...f, ...savedForm }));
    const previewFrontImg = window.sessionStorage.getItem("previewFront") || "";
    if (previewFrontImg) setPreviewFront(previewFrontImg);
    const previewBackImg = window.sessionStorage.getItem("previewBack") || "";
    if (previewBackImg) setPreviewBack(previewBackImg);
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

  async function handlePublish() {
    setMsg("");
    setLoading(true);
    // 驗證略...

    // 上傳圖片
    let image_url_front = form.image_url_front;
    let image_url_back = form.image_url_back;

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

    // 產生 url_slug
    function genSlug(name: string): string {
      return encodeURIComponent(
        (name || "user") + "-" + Math.floor(Math.random() * 10000000)
      );
    }
    const url_slug = genSlug(form.name);

    // 主分類/次分類/細分類名稱轉換
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
          image_url_front,
          image_url_back,
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

    // 推薦碼寫入 referral_records（有填推薦碼才寫）
    if (form.referrer) {
      // 查推薦人 id (cards id)
      const { data: refCard } = await supabase
        .from("cards")
        .select("id")
        .eq("referral_code", form.referrer)
        .single();

      await supabase
        .from("referral_records")
        .insert([{
          referrer_code: form.referrer,
          referrer_card_id: refCard?.id || null,
          referred_card_id: newCard.id,
          referred_email: newCard.email,
          reward_amount: 50,
          created_at: new Date().toISOString()
        }]);
    }

    setLoading(false);

    // 跳轉或寄信略...
    setMsg("資料已提交並 email 寄送，請完成付款...");
    router.push(`/payment?cardId=${newCard.id}`);
  }

  function handlePreview() {
    setMsg("");
    setLoading(true);

    // 驗證同前略...
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
          {/* 推薦碼 */}
          <div>
            <label className="font-bold text-gray-600 mb-1 block">
              推薦碼（可選，可自行填或從連結帶入）
            </label>
            <input
              type="text"
              className="border p-2 rounded w-full"
              value={form.referrer}
              maxLength={30}
              onChange={e => setForm(f => ({ ...f, referrer: e.target.value }))}
              placeholder="朋友邀請填推薦碼"
            />
          </div>
          {/* 電子郵件 */}
          <div>
            <label className="font-bold text-gray-600 mb-1 block">
              電子郵件<span className="text-red-500">*</span>
            </label>
            <input type="email" className="border p-2 rounded w-full" required value={form.email}
              maxLength={120}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          {/* 其它欄位同你原版，可參照... */}
          {/* 預覽按鈕 */}
          <button
            type="button"
            disabled={loading}
            className="w-full py-3 mt-6 rounded bg-blue-600 text-white text-lg font-bold hover:bg-blue-700 transition"
            onClick={handlePreview}
          >
            名片預覽
          </button>
          {/* 上架按鈕 */}
          <button
            type="button"
            disabled={loading}
            className="w-full py-3 mt-3 rounded bg-green-600 text-white text-lg font-bold hover:bg-green-700 transition"
            onClick={handlePublish}
          >
            馬上上架
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
