"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import AreaSelector from "@/components/AreaSelector";

function UploadCardPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showTipsModal, setShowTipsModal] = useState(false);
  useEffect(() => {
    setTimeout(() => setShowTipsModal(true), 500);
  }, []);

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
    { color: "#F4F4F5", name: "淺灰" },
  ];

  useEffect(() => {
    const ref = searchParams.get("referrer_slug");
    if (ref) setForm(f => ({ ...f, referrer_slug: ref }));
  }, [searchParams]);

  useEffect(() => {
    async function fetchData() {
      const { data: cityObjs } = await supabase
        .from('cities')
        .select('citys');
      const uniqueCities = Array.from(new Set(cityObjs?.map(c => c.citys).filter(Boolean)))
        .sort();
      setCities(["全部", ...uniqueCities]);
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
        .from('cities')
        .select('district')
        .eq('citys', form.citys);
      const uniqueAreas = Array.from(new Set(ds?.map(a => a.district).filter(Boolean)))
        .sort();
      setAreas(["全部", ...uniqueAreas]);
      setForm(f => ({ ...f, area: "全部" }));
    }
    fetchAreas();
  }, [form.citys]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>, type: "front" | "back") {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      setMsg("只允許 JPG、PNG、WebP 格式");
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
    if (!form.email) {
      setMsg("請填寫電子信箱");
      return;
    }
    if (!previewFront) {
      setMsg("請上傳名片正面");
      return;
    }
    setMsg("");
    setLoading(true);
    // 上傳邏輯略
    setLoading(false);
  }

  function handlePreview() {
    if (!form.email) {
      setMsg("請填寫電子信箱");
      return;
    }
    if (!previewFront) {
      setMsg("請上傳名片正面");
      return;
    }
    setMsg("");
    setLoading(true);
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
            <button
              className="absolute top-3 right-4 text-2xl text-gray-400 hover:text-red-600"
              onClick={() => setShowTipsModal(false)}
              title="關閉"
            >×</button>
            <h2 className="text-2xl font-bold mb-4 text-blue-700 text-center">上傳名片技巧</h2>
            <div className="space-y-4 text-lg">
              <div>
                <span className="font-bold text-blue-700">1. 個人簡介與經營項目要明確</span><br />
                寫清楚你的服務專長、特色及常用關鍵字（如：健康管理、美甲保險），越明確越容易被搜尋。
              </div>
              <div>
                <span className="font-bold text-blue-700">2. 名片圖片要清晰、最好含LOGO或QR碼</span><br />
                建議正面照片清楚、有設計感，勿失真或拼接。可加企業LOGO、QR碼增加辨識。
              </div>
              <div>
                <span className="font-bold text-blue-700">3. 聯絡方式詳細填寫</span><br />
                建議填全：Email、手機、LINE、Facebook、社群等通路，方便客戶聯絡。
              </div>
              <div>
                <span className="font-bold text-blue-700">4. 地區/分類選精確</span><br />
                用戶常用地區、產業分類搜尋，選擇越細曝光機會越高。
              </div>
              <div>
                <span className="font-bold text-green-700">5. 填得完整，系統推薦更容易到手！</span>
              </div>
            </div>
            <button
              className="block w-full py-2 mt-6 rounded bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 transition"
              onClick={() => setShowTipsModal(false)}
            >知道了，開始編輯名片</button>
          </div>
        </div>
      )}

      <main className="max-w-lg mx-auto py-10">
        <form className="space-y-4 bg-white p-6 rounded-lg shadow" onSubmit={e => e.preventDefault()}>
          {/* ----下方表單內容維持原 code，不要動---- */}
          {/* ...你的原表單所有項目... */}
          {/* ...copy 一樣下去，略... */}
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
