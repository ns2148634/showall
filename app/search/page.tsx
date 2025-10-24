"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { supabase } from "@/lib/supabaseClient"
import AreaSelector from "@/components/AreaSelector"
import RandomCards from "@/components/RandomCards"

const PAGE_SIZE = 10

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

  // 抓取城市（拿掉 sort_order）
  useEffect(() => {
    async function fetchCities() {
      const { data: cityObjs } = await supabase
        .from('cities')
        .select('citys');  // ← 只抓 citys
      
      const uniqueCities = Array.from(new Set(cityObjs?.map(c => c.citys).filter(Boolean)))
        .sort();  // ← 字母排序
      
      setCities(["全部", ...uniqueCities]);
    }
    fetchCities()
  }, [])

  // 根據選擇的城市抓地區（拿掉 sort_order）
  useEffect(() => {
    async function fetchAreas() {
      if (selectedCity === "全部") {
        setAreas(["全部"]);
        setSelectedArea("全部");
        return;
      }
      const { data: ds } = await supabase
        .from('cities')
        .select('district')  // ← 只抓 district
        .eq('citys', selectedCity)
      
      const uniqueAreas = Array.from(new Set(ds?.map(a => a.district).filter(Boolean)))
        .sort();  // ← 字母排序
      
      setAreas(["全部", ...uniqueAreas])
      setSelectedArea("全部")
    }
    fetchAreas()
  }, [selectedCity])

  const hasCondition =
    keyword.trim() ||
    (selectedCity && selectedCity !== "全部") ||
    (selectedArea && selectedArea !== "全部") ||
    order !== "random" ||
    page > 1

  useEffect(() => {
    if (!hasCondition) return
    fetchCards()
  }, [page, order, selectedCity, selectedArea, keyword])

  async function fetchCards() {
    setLoading(true)
    let query = supabase.from('cards').select('*', { count: "exact" }).eq('published', true)
    if (selectedCity !== "全部") query = query.eq('citys', selectedCity)
    if (selectedArea !== "全部") query = query.eq('area', selectedArea)
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
      ].join(','))
    }
    if (order === "created") query = query.order('created_at', { ascending: false })
    else if (order === "views") query = query.order('views', { ascending: false })
    const from = (page-1)*PAGE_SIZE
    const to = page*PAGE_SIZE-1
    const { data, count } = await query.range(from, to)
    setCards(data || [])
    setTotal(count || 0)
    setLoading(false)
  }

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
          <AreaSelector
            cities={cities}
            selectedCity={selectedCity}
            setSelectedCity={setSelectedCity}
            areas={areas}
            selectedArea={selectedArea}
            setSelectedArea={setSelectedArea}
          />
          <select className="p-2 rounded border" value={order} onChange={e=>setOrder(e.target.value)}>
            <option value="random">隨機排序</option>
            <option value="created">刊登最近</option>
            <option value="views">瀏覽最多</option>
          </select>
          <button type="submit" className="bg-blue-600 text-white rounded px-4">搜尋</button>
        </form>
        
        <div className="text-gray-700 mb-2">{loading ? "載入中..." : `共 ${total} 筆結果`}</div>
        
        {/* 隨機10張名片（沒條件時） */}
        {!hasCondition && <RandomCards limit={10} />}
        
        {/* 有條件時才顯示 cards 列表 */}
        {hasCondition &&
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
            {cards.map(card => (
              <Link key={card.id} href={`/card/${card.url_slug}`}>
                <div className="rounded shadow hover:shadow-lg transition flex flex-col items-center p-4">
                  <Image
                    src={card.image_url_front}
                    alt={card.name}
                    width={96}
                    height={96}
                    className="w-24 h-24 object-cover rounded mb-2"
                  />
                  <div className="font-bold text-blue-900">{card.name}</div>
                  <div className="text-gray-500">{card.job}</div>
                  <div className="text-xs text-gray-400">{card.company}</div>
                  <div className="text-xs text-gray-400">{card.citys}{card.area && "・" + card.area}</div>
                </div>
              </Link>
            ))}
          </div>
        }
        
        {hasCondition &&
          <div className="flex flex-wrap gap-2 justify-center items-center my-6">
            {Array.from({length: Math.ceil(total/PAGE_SIZE)}, (_,i) => (
              <button
                key={i}
                className={`px-3 py-1 rounded ${page===i+1 ? "bg-blue-700 text-white" : "bg-white text-blue-700 border"}`}
                onClick={()=>setPage(i+1)}
              >{i+1}</button>
            ))}
          </div>
        }
      </main>
      <footer className="text-center text-gray-400 text-sm py-6 border-t mt-12">
        &copy; 2025 SHOWALL 百業名片網
      </footer>
    </div>
  )
}
