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

  // 推薦人自動帶入
  useEffect(() => {
    const ref = searchParams.get("referrer") || searchParams.get("referrer_slug");
    if (ref) setForm(f => ({ ...f, referrer_slug: ref }));
  }, [searchParams]);

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
      const { data: ds } = await supabase.from('cities').select('district').eq('citys', form.citys);
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
      {/* 名片上傳注意事項彈窗 */}
      {showTipsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-8 text-gray-800 relative">
            <button
              className="absolute top-3 right-4 text-2xl text-gray-400 hover:text-red-600"
              onClick={() => setShowTipsModal(false)}
              title="關閉"
              type="button"
            >×</button>
            <h2 className="text-2xl font-bold mb-4 text-blue-700 text-center">💡 上傳前請注意，填得越好曝光越高！</h2>
            <div className="space-y-4 text-lg">
              <div>
                <span className="font-bold text-blue-700">1️⃣ 個人簡介與經營項目要明確</span><br />
                <span className="text-gray-700">請寫清楚你的服務內容、專長與常用關鍵字（如：健康管理、美甲、保險規劃）。越明確，越容易被搜尋與推薦！</span>
              </div>
              <div>
                <span className="font-bold text-blue-700">2️⃣ 聯絡方式請完整填寫</span><br />
                <span className="text-gray-700">建議填上 Email、手機、LINE、Facebook 等通路，讓客戶能快速找到你。</span>
              </div>
              <div>
                <span className="font-bold text-blue-700">3️⃣ 地區選擇請精確</span><br />
                <span className="text-gray-700">使用者會依地區搜尋，選越細、曝光越高！</span>
              </div>
              <div>
                <span className="font-bold text-green-700">4️⃣ 填得完整，推薦更容易！</span><br />
                <span className="text-gray-700">系統會優先推薦資料完整的名片，讓你獲得更多曝光與合作機會。</span>
              </div>
              <div className="mt-4 text-base text-yellow-700">
                📢 <b>上架費用：100元／年</b><br />
                一次上架，全年曝光不下架！<br />
                同時參加「📱抽 iPhone 17」活動，上傳越早越快開獎！
              </div>
              <div className="mt-2 text-green-700 text-base font-bold">
                ✅ 按「開始上傳」即表示同意上架規範並進行繳費。
              </div>
            </div>
            <button
              className="block w-full py-2 mt-6 rounded bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 transition"
              onClick={() => setShowTipsModal(false)}
              type="button"
            >
              知道了，開始上傳
            </button>
          </div>
        </div>
      )}

      <main className="max-w-lg mx-auto py-10">
        {/* 以下表單內容同你原始設計，略 */}
        {/* 省略，請用你原本完整表單區塊 */}
      </main>
      <footer className="text-center text-gray-400 text-sm py-6 border-t mt-12">
        &copy; 2025 SHOWALL 名片+
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
