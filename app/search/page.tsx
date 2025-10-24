"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"
const PAGE_SIZE = 10; // 或你要的分頁大小

export default function SearchPage() {
  const [keyword, setKeyword] = useState("")
  const [cities, setCities] = useState<string[]>([])
  const [areas, setAreas] = useState<string[]>([])
  const [selectedCity, setSelectedCity] = useState("全部")
  const [selectedArea, setSelectedArea] = useState("全部")
  const [order, setOrder] = useState("random")
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [cards, setCards] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
 
  // 載入所有城市/地區選單
  useEffect(() => {
    async function fetchCities() {
      const { data: cityObjs } = await supabase.from('cities').select('citys').neq('citys', null)
      setCities(["全部", ...Array.from(new Set(cityObjs?.map(c => c.citys).filter(Boolean)))])
    }
    fetchCities()
  }, [])

  // 城市→區域下拉
  useEffect(() => {
    async function fetchAreas() {
      if (selectedCity === "全部") { setAreas(["全部"]); setSelectedArea("全部"); return }
      const { data: ds } = await supabase.from('cities').select('district').eq('citys', selectedCity)
      setAreas(["全部", ...Array.from(new Set(ds?.map(a => a.district).filter(Boolean)))])
      setSelectedArea("全部")
    }
    fetchAreas()
  }, [selectedCity])

  // 查詢
  useEffect(() => {
    fetchCards()
    // eslint-disable-next-line
  }, [page, order, selectedCity, selectedArea])

  async function fetchCards() {
    setLoading(true)
    let query = supabase.from('cards').select('*', { count: "exact" }).eq('published', true)
   
if (keyword.trim()) {
  query = query.or(
    [
      `name.ilike.%${keyword.trim()}%`,
      `company.ilike.%${keyword.trim()}%`,
      `category_main.ilike.%${keyword.trim()}%`,
      `category_sub.ilike.%${keyword.trim()}%`,
      `category_detail.ilike.%${keyword.trim()}%`,
      `intro.ilike.%${keyword.trim()}%`,
      `citys.ilike.%${keyword.trim()}%`,
      `area.ilike.%${keyword.trim()}%`
    ].join(',')
  )
}

    if (selectedCity !== "全部") query = query.eq('citys', selectedCity)
    if (selectedArea !== "全部") query = query.eq('area', selectedArea)

    // 排序
    if (order === "created") query = query.order('created_at', { ascending: false })
    else if (order === "views") query = query.order('views', { ascending: false })
    else query = query.order('random')

    // 分頁
    const from = (page-1)*PAGE_SIZE
    const to = page*PAGE_SIZE-1

    const { data, count } = await query.range(from, to)
    setCards(data || [])
    setTotal(count || 0)
    setLoading(false)
  }

  // 重新搜尋要還原分頁
  function doSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPage(1)
    fetchCards()
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-3xl mx-auto py-10">
        {/* 搜尋條件 */}
        <form className="flex flex-wrap gap-4 justify-center mb-6" onSubmit={doSearch}>
          <input
            type="text"
            value={keyword}
            maxLength={30}
            placeholder="關鍵字（姓名、簡介…）"
            className="border rounded p-2 w-44"
            onChange={e=>setKeyword(e.target.value)}
          />
          <select className="p-2 rounded border" value={selectedCity} onChange={e=>setSelectedCity(e.target.value)}>
            {cities.map(city => <option key={city}>{city}</option>)}
          </select>
          <select className="p-2 rounded border" value={selectedArea} onChange={e=>setSelectedArea(e.target.value)}>
            {areas.map(area => <option key={area}>{area}</option>)}
          </select>
          <select className="p-2 rounded border" value={order} onChange={e=>setOrder(e.target.value)}>
            <option value="random">隨機排序</option>
            <option value="created">刊登最近</option>
            <option value="views">瀏覽最多</option>
          </select>
          <button type="submit" className="bg-blue-600 text-white rounded px-4">搜尋</button>
        </form>
        {/* 結果 */}
        <div className="text-gray-700 mb-2">{loading ? "載入中..." : `共 ${total} 筆結果`}</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
          {cards.map(card => (
            <Link key={card.id} href={`/card/${card.id}`}>
              <div className="bg-white rounded shadow flex flex-col items-center p-4 hover:shadow-md">
                <img src={card.image_url_front} alt={card.name} className="w-24 h-24 object-cover rounded mb-2" />
                <div className="font-bold text-blue-900">{card.name}</div>
                <div className="text-gray-500">{card.company}</div>
                <div className="text-xs text-gray-400">{card.citys}{card.area && "・"+card.area}</div>
              </div>
            </Link>
          ))}
        </div>
        {/* 分頁 */}
        <div className="flex flex-wrap gap-2 justify-center items-center my-6">
          {Array.from({length: Math.ceil(total/PAGE_SIZE)}, (_,i) => (
            <button
              key={i}
              className={`px-3 py-1 rounded ${page===i+1 ? "bg-blue-700 text-white" : "bg-white text-blue-700 border"}`}
              onClick={()=>setPage(i+1)}
            >{i+1}</button>
          ))}
        </div>
      </main>
      <footer className="text-center text-gray-400 text-sm py-6 border-t mt-12">
        &copy; 2025 SHOWALL 百業名片網
      </footer>
    </div>
  )
}
