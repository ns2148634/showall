"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import AreaSelector from "@/components/AreaSelector";

export default function EditCardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [form, setForm] = useState<any>(null);
  const [tokenValid, setTokenValid] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // 城市/地區下拉
  const [cities, setCities] = useState<string[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const token = searchParams.get("token");

  // 載入 token 與卡片資料
  useEffect(() => {
    if (!token) return setMsg("缺少驗證連結");
    async function fetchData() {
      const { data: tokens, error: err1 } = await supabase
        .from("edit_tokens")
        .select("*")
        .eq("token", token)
        .eq("used", false)
        .single();
      if (err1 || !tokens) return setMsg("連結錯誤或已失效");
      if (new Date(tokens.expires_at) < new Date()) {
        setMsg("連結已過期，請重新申請");
        return;
      }
      const { data: cardData, error: err2 } = await supabase
        .from("cards")
        .select("*")
        .eq("url_slug", tokens.card_slug)
        .single();
      if (err2 || !cardData) return setMsg("未找到原始名片資料");
      setForm(cardData);
      setTokenValid(true);
    }
    fetchData();
  }, [token]);

  useEffect(() => {
    async function fetchCities() {
      const { data: cityObjs } = await supabase.from('cities').select('citys');
      const rawCities = Array.from(new Set(cityObjs?.map(c => c.citys).filter(Boolean)));
      setCities(["全部", ...rawCities]);
    }
    fetchCities();
  }, []);

  useEffect(() => {
    async function fetchAreas() {
      if (!form?.citys || form.citys === "全部") {
        setAreas(["全部"]);
        setForm((f: any) => ({ ...f, area: "全部" }));
        return;
      }
      const { data: ds } = await supabase.from('cities').select('district').eq('citys', form.citys);
      const uniqueAreas = Array.from(new Set(ds?.map(a => a.district).filter(Boolean))).sort();
      setAreas(["全部", ...uniqueAreas]);
      setForm((f: any) => ({ ...f, area: uniqueAreas.includes(f.area) ? f.area : "全部" }));
    }
    if (form?.citys) fetchAreas();
    // eslint-disable-next-line
  }, [form?.citys]);

  async function handleSave() {
    if (!form.email) { setMsg("請填寫電子信箱"); return; }
    if (!form.name) { setMsg("請填姓名"); return; }
    setLoading(true);

    const { error } = await supabase
      .from("cards")
      .update(form)
      .eq("url_slug", form.url_slug);

    await supabase
      .from("edit_tokens")
      .update({ used: true })
      .eq("token", token);

    setLoading(false);
    if (error) {
      setMsg("更新失敗：" + error.message);
    } else {
      setMsg("✅ 資料已更新，連結已失效");
      setTokenValid(false);
    }
  }

  // 刪除（下架）名片
  async function handleDelete() {
    if (!form?.url_slug) return setMsg("無效名片，無法刪除！");
    if (!confirm("確定要下架並刪除此名片？此操作不可復原！")) return;
    setLoading(true);
    const { error } = await supabase
      .from("cards")
      .delete()
      .eq("url_slug", form.url_slug);
    setLoading(false);
    if (error) {
      setMsg("下架失敗：" + error.message);
    } else {
      setMsg("已成功下架，名片資料已刪除。");
      setTimeout(() => router.push("/"), 1800); // 可跳回首頁或列表頁
    }
  }

  if (!tokenValid)
    return <div className="min-h-screen flex items-center justify-center"><div className="text-center text-red-500 font-bold">{msg || "資料載入中..."}</div></div>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      <main className="max-w-lg mx-auto py-10 w-full">
        <h2 className="text-xl font-bold text-blue-700 mb-6 text-center">名片資料修改</h2>
        <form className="space-y-4 bg-white p-6 rounded-lg shadow" onSubmit={e => { e.preventDefault(); handleSave(); }}>
          {/* 基本資料欄位 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">電子信箱 <span className="text-red-500">*</span></label>
            <input type="email" className="border p-2 rounded w-full" required value={form.email}
              onChange={e => setForm((f: any) => ({ ...f, email: e.target.value }))} maxLength={120} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">姓名/暱稱 <span className="text-gray-500 text-xs">(上限30字)</span></label>
            <input type="text" className="border p-2 rounded w-full" value={form.name}
              onChange={e => setForm((f: any) => ({ ...f, name: e.target.value }))} maxLength={30} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">公司 / 組織</label>
            <input type="text" className="border p-2 rounded w-full" value={form.company ?? ""}
              onChange={e => setForm((f: any) => ({ ...f, company: e.target.value }))} maxLength={20} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">LINE ID</label>
            <input type="text" className="border p-2 rounded w-full" value={form.line ?? ""}
              onChange={e => setForm((f: any) => ({ ...f, line: e.target.value }))} maxLength={30} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">手機</label>
            <input type="text" className="border p-2 rounded w-full" value={form.mobile ?? ""}
              onChange={e => setForm((f: any) => ({ ...f, mobile: e.target.value }))} maxLength={20} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">其他聯絡方式</label>
            <input type="text" className="border p-2 rounded w-full" value={form.contact_other ?? ""}
              onChange={e => setForm((f: any) => ({ ...f, contact_other: e.target.value }))} maxLength={60} />
          </div>
          {/* 地區選擇 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">所在地區</label>
            <AreaSelector
              cities={cities}
              selectedCity={form.citys}
              setSelectedCity={val => setForm((f: any) => ({ ...f, citys: val }))}
              areas={areas}
              selectedArea={form.area}
              setSelectedArea={val => setForm((f: any) => ({ ...f, area: val }))}
            />
          </div>
          {/* 經營項目 */}
          {["tag1", "tag2", "tag3", "tag4"].map((t, i) => (
            <div key={t}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{`經營項目 ${i + 1}`}</label>
              <input type="text" className="border p-2 rounded w-full" value={form[t] ?? ""}
                onChange={e => setForm((f: any) => ({ ...f, [t]: e.target.value }))} maxLength={30} />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">簡介 / 服務特色</label>
            <textarea className="border p-2 rounded w-full" rows={4} value={form.intro ?? ""}
              onChange={e => setForm((f: any) => ({ ...f, intro: e.target.value }))} maxLength={300} />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-6 rounded bg-blue-600 text-white text-lg font-bold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "儲存中..." : "送出修改"}
          </button>
          {/* 提示＆訊息 */}
          <div className="mt-4 text-yellow-700 font-bold text-center">
            若需要重新上傳名片正面或背面，請重新使用上傳功能(重新上架)。
          </div>
          {msg && (
            <div className="mt-3 text-center font-bold text-green-600">
              {msg}
            </div>
          )}
        </form>
        {/* 下架刪除按鈕 */}
        <button
          type="button"
          className="w-full py-3 mt-4 rounded bg-red-600 text-white text-lg font-bold hover:bg-red-700 transition"
          onClick={handleDelete}
          disabled={loading}
        >
          {loading ? "下架中..." : "下架（刪除名片）"}
        </button>
      </main>
      <footer className="text-center text-gray-400 text-sm py-6 border-t mt-8">
        &copy; 2025 SHOWALL 名片+
      </footer>
    </div>
  );
}
