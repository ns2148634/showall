"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import AreaSelector from "@/components/AreaSelector";
import RandomCards from "@/components/RandomCards";

const PAGE_SIZE = 10;

export default function SearchPage() {
  const [showTipsModal, setShowTipsModal] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!localStorage.getItem("search_modal_shown")) {
        setTimeout(() => setShowTipsModal(true), 500);
        localStorage.setItem("search_modal_shown", "1");
      }
    }
  }, []);

  const [keyword, setKeyword] = useState("");
  const [cities, setCities] = useState<string[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState("全部");
  const [selectedArea, setSelectedArea] = useState("全部");
  const [order, setOrder] = useState("random");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();

  let currentUrl = "/";
  if (typeof window !== "undefined") {
    currentUrl = window.location.pathname + window.location.search;
  }

  useEffect(() => {
    if (searchParams) {
      const kw = searchParams.get("keyword");
      const city = searchParams.get("city");
      const area = searchParams.get("area");
      const orderBy = searchParams.get("order");
      const pageNo = searchParams.get("page");

      if (kw !== null) setKeyword(kw);
      if (city !== null) setSelectedCity(city);
      if (area !== null) setSelectedArea(area);
      if (orderBy !== null) setOrder(orderBy);
      if (pageNo !== null && !isNaN(Number(pageNo))) setPage(Number(pageNo));
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    async function fetchCities() {
      const { data: cityObjs } = await supabase.from('cities').select('citys');
      const uniqueCities = Array.from(new Set(cityObjs?.map(c => c.citys).filter(Boolean))).sort();
      setCities(["全部", ...uniqueCities]);
    }
    fetchCities();
  }, []);

  useEffect(() => {
    async function fetchAreas() {
      if (selectedCity === "全部") {
        setAreas(["全部"]);
        setSelectedArea("全部");
        return;
      }
      const { data: ds } = await supabase.from('cities').select('district').eq('citys', selectedCity);
      const uniqueAreas = Array.from(new Set(ds?.map(a => a.district).filter(Boolean))).sort();
      setAreas(["全部", ...uniqueAreas]);
      setSelectedArea("全部");
    }
    fetchAreas();
  }, [selectedCity]);

  const hasCondition =
    keyword.trim() ||
    (selectedCity && selectedCity !== "全部") ||
    (selectedArea && selectedArea !== "全部") ||
    order !== "random" ||
    page > 1;

  useEffect(() => {
    if (!hasCondition) return;
    fetchCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, order, selectedCity, selectedArea, keyword]);

  async function fetchCards() {
    setLoading(true);
    let query = supabase.from('cards').select('*', { count: "exact" }).eq('published', true);
    if (selectedCity !== "全部") query = query.eq('citys', selectedCity);
    if (selectedArea !== "全部") query = query.eq('area', selectedArea);
    if (keyword.trim()) {
      query = query.or([
        `name.ilike.%${keyword.trim()}%`,
        `company.ilike.%${keyword.trim()}%`,
        `tag1.ilike.%${keyword.trim()}%`,
        `tag2.ilike.%${keyword.trim()}%`,
        `tag3.ilike.%${keyword.trim()}%`,
        `tag4.ilike.%${keyword.trim()}%`,
        `intro.ilike.%${keyword.trim()}%`,
        `citys.ilike.%${keyword.trim()}%`,
        `area.ilike.%${keyword.trim()}%`
      ].join(','));
    }
    if (order === "created") query = query.order('created_at', { ascending: false });
    else if (order === "views") query = query.order('views', { ascending: false });
    const from = (page - 1) * PAGE_SIZE;
    const to = page * PAGE_SIZE - 1;
    const { data, count } = await query.range(from, to);
    setCards(data || []);
    setTotal(count || 0);
    setLoading(false);
  }

  function doSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPage(1);
    const url = `/search?keyword=${encodeURIComponent(keyword)}&city=${encodeURIComponent(selectedCity)}&area=${encodeURIComponent(selectedArea)}&order=${order}&page=1`;
    router.replace(url);
    fetchCards();
  }

  const handleCloseModal = (e: React.MouseEvent<HTMLButtonElement>) => {
    setShowTipsModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 搜尋技巧彈窗 */}
      {showTipsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-8 text-gray-800 relative">
            <button className="absolute top-3 right-4 text-2xl text-gray-400 hover:text-red-600"
              onClick={handleCloseModal} title="關閉">×</button>
            <h2 className="text-2xl font-bold mb-4 text-blue-700 text-center">搜尋技巧</h2>
            <div className="space-y-4 text-lg">
              <div><span className="font-bold text-blue-700">1. 關鍵字多元組合搜尋</span><br />可用「保母」、「教練」、「美甲」、「南山人壽」、「房仲」等專業、公司、商品名稱搜尋。</div>
              <div><span className="font-bold text-blue-700">2. 地區</span><br />選擇所在地區，精準找在地專家或熱門服務商。</div>
              <div><span className="font-bold text-blue-700">3. 以公司、品牌、姓名都能搜尋</span><br />例：找「TOYOTA、健身教練、舞蹈老師」都可直接輸入名稱，或用中文/英文查詢。</div>
            </div>
            <button className="block w-full py-2 mt-6 rounded bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 transition"
              onClick={handleCloseModal}>知道了，開始搜尋</button>
          </div>
        </div>
      )}
      <main className="max-w-3xl mx-auto py-10">
        {/* 美化搜尋表單卡片 */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <form className="flex flex-wrap gap-4 justify-center items-end" onSubmit={doSearch}>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 mb-1 ml-1">關鍵字</span>
              <input
                type="text"
                value={keyword}
                maxLength={30}
                placeholder="姓名、簡介…"
                className="border rounded-lg p-3 w-44 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300 transition text-gray-700"
                onChange={e => setKeyword(e.target.value)}
              />
            </div>
            <div className="flex flex-col">
              <AreaSelector
                cities={cities}
                selectedCity={selectedCity}
                setSelectedCity={setSelectedCity}
                areas={areas}
                selectedArea={selectedArea}
                setSelectedArea={setSelectedArea}
              // (原本你 AreaSelector 預設就是第一項 "全部"，不用更改)
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 mb-1 ml-1">排序</span>
              <select className="p-3 rounded-lg border bg-gray-50 w-36 text-gray-700" value={order} onChange={e => setOrder(e.target.value)}>
                <option value="random">隨機排序</option>
                <option value="created">刊登最近</option>
                <option value="views">瀏覽最多</option>
              </select>
            </div>
            <button type="submit" className="bg-blue-600 text-white font-bold rounded-lg px-6 py-3 shadow hover:bg-blue-700 transition text-lg mt-4">
              搜尋
            </button>
          </form>
        </div>
        <div className="text-gray-700 mb-2">{loading ? "載入中..." : `共 ${total} 筆結果`}</div>
        {hasCondition &&
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10">
            {cards.map(card => (
              !!card.url_slug && !!card.image_url_front && (
                <Link
                  key={card.id}
                  href={`/card/${card.url_slug}?from=${encodeURIComponent(currentUrl)}`}
                >
                  <Image
                    src={card.image_url_front}
                    alt={card.name}
                    width={220}
                    height={140}
                    className="w-full h-auto max-w-xs object-contain rounded-lg shadow-xl hover:shadow-2xl bg-white transition cursor-pointer"
                  />
                </Link>
              )
            ))}
          </div>
        }

        {hasCondition &&
          <div className="flex flex-wrap gap-2 justify-center items-center my-6">
            {Array.from({ length: Math.ceil(total / PAGE_SIZE) }, (_, i) => (
              <button
                key={i}
                className={`px-3 py-1 rounded ${page === i + 1 ? "bg-blue-700 text-white" : "bg-white text-blue-700 border"}`}
                onClick={() => {
                  setPage(i + 1);
                  router.replace(
                    `/search?keyword=${encodeURIComponent(keyword)}&city=${encodeURIComponent(selectedCity)}&area=${encodeURIComponent(selectedArea)}&order=${order}&page=${i + 1}`
                  );
                }}
              >{i + 1}</button>
            ))}
          </div>
        }
      </main>
      <footer className="text-center text-gray-400 text-sm py-6 border-t mt-12">
        &copy; 2025 SHOWALL 名片+
      </footer>
    </div>
  );
}
