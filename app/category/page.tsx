"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"
import CategorySelector from "@/components/CategorySelector"
import AreaSelector from "@/components/AreaSelector"
import RamdonCards from "@/components/ramdoncards"

const PAGE_SIZE = 10

export default function CategoryPage() {
  const [categories, setCategories] = useState([])
  const [selectedMain, setSelectedMain] = useState("")
  const [selectedSub, setSelectedSub] = useState("")
  const [selectedThird, setSelectedThird] = useState("")
  const [cities, setCities] = useState<string[]>([])
  const [areas, setAreas] = useState<string[]>([])
  const [selectedCity, setSelectedCity] = useState("全部")
  const [selectedArea, setSelectedArea] = useState("全部")
  const [keyword, setKeyword] = useState("")
  const [order, setOrder] = useState("random")
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [cards, setCards] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchData() {
      const { data: cats } = await supabase.from('categories').select('*').order('sort_order')
      setCategories(cats || [])
      const { data: cityObjs } = await supabase.from('cities').select('citys').neq('citys', null)
      setCities(["全部", ...Array.from(new Set(cityObjs?.map(c => c.citys).filter(Boolean)))])
    }
    fetchData()
  }, [])

  useEffect(() => {
    async function fetchAreas() {
      if (selectedCity === "全部") { setAreas(["全部"]); setSelectedArea("全部"); return }
      const { data: ds } = await supabase.from('cities').select('district').eq('citys', selectedCity)
      setAreas(["全部", ...Array.from(new Set(ds?.map(a => a.district).filter(Boolean)))])
      setSelectedArea("全部")
    }
    fetchAreas()
  }, [selectedCity])

  // 判斷是否有篩選條件
  const hasCondition =
    selectedMain || selectedSub || selectedThird ||
    (selectedCity && selectedCity !== "全部") ||
    (selectedArea && selectedArea !== "全部") ||
    keyword.trim() || order !== "random" || page > 1

  // 只有有條件時才搜尋資料
  useEffect(() => {
    if (!hasCondition) return
    fetchCards()
    // eslint-disable-next-line
  }, [selectedMain, selectedSub, selectedThird, selectedCity, selectedArea, order, page, keyword])

  async function fetchCards() {
    setLoading(true)
    let query = supabase.from('cards').select('*', { count: "exact" }).eq('published', true)
    if (selectedMain) query = query.eq('category1', Number(selectedMain))
    if (selectedSub) query = query.eq('category2', Number(selectedSub))
    if (selectedThird) query = query.eq('category3', Number(selectedThird))
    if (selectedCity !== "全部") query = query.eq('citys', selectedCity)
    if (selectedArea !== "全部") query = query.eq('area', selectedArea)
    if (keyword.trim()) {
      query = query.or([
        `name.ilike.%${keyword.trim()}%`,
        `company.ilike.%${keyword.trim()}%`,
        `title.ilike.%${keyword.trim()}%`,
        `profile.ilike.%${keyword.trim()}%`,
        `citys.ilike.%${keyword.trim()}%`,
        `area.ilike.%${keyword.trim()}%`
      ].join(','))
    }
    if (order === "created") query = query.order('created_at', { ascending: false })
    else if (order === "views") query = query.order('views', { ascending: false })
    else query = query.order('random()')
    const from = (page-1)*PAGE_SIZE
    const to = page*PAGE_SIZE-1
    const { data, count } = await query.range(from, to)
    setCards(data || [])
    setTotal(count || 0)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-3xl mx-auto py-10">
        {/* 下拉選單＋搜尋條件 */}
        <div className="flex flex-wrap gap-4 justify-center mb-6">
          <CategorySelector
            categories={categories}
            selectedMain={selectedMain}
            setSelectedMain={setSelectedMain}
            selectedSub={selectedSub}
            setSelectedSub={setSelectedSub}
            selectedThird={selectedThird}
            setSelectedThird={setSelectedThird}
          />
          <AreaSelector
            cities={cities}
            selectedCity={selectedCity}
            setSelectedCity={setSelectedCity}
            areas={areas}
            selectedArea={selectedArea}
            setSelectedArea={setSelectedArea}
          />
          <input
            type="text"
            value={keyword}
            maxLength={30}
            placeholder="關鍵字（姓名、簡介…）"
            className="border rounded p-2 w-44"
            onChange={e=>setKeyword(e.target.value)}
          />
          <select className="p-2 rounded border" value={order} onChange={e=>setOrder(e.target.value)}>
            <option value="random">隨機排序</option>
            <option value="created">最新刊登</option>
            <option value="views">瀏覽最多</option>
          </select>
        </div>
        <div className="text-gray-700 mb-2">{loading ? "載入中..." : `共 ${total} 筆結果`}</div>

        {/* 隨機10張名片（沒條件） */}
        {!hasCondition && <RamdonCards limit={10} />}

        {/* 有條件時才出現 cards 列表 */}
        {hasCondition &&
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
  {cards.map(card => (
    <Link key={card.id} href={`/card/${card.url_slug}`}>
      {/* 移除 bg-white、p-*，僅保留 shadow/rounded/hover */}
      <div className="rounded shadow hover:shadow-lg transition flex flex-col items-center">
        <img src={card.image_url_front} alt={card.name} className="w-24 h-24 object-cover rounded mb-2" />
        {/* 下面如有要顯示名片內容再加 */}
        <div className="font-bold text-blue-900">{card.name}</div>
        <div className="text-gray-500">{card.job}</div>
        <div className="text-xs text-gray-400">{card.company}</div>
        <div className="text-xs text-gray-400">{card.citys}{card.area && "・" + card.area}</div>
      </div>
    </Link>
  ))}
</div>

        }
      </main>
    </div>
  )
}
