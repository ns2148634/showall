"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"

const PAGE_SIZE = 10

export default function CategoryPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [mainCats, setMainCats] = useState<any[]>([])
  const [subCats, setSubCats] = useState<any[]>([])
  const [thirdCats, setThirdCats] = useState<any[]>([])
  const [selectedMain, setSelectedMain] = useState("")
  const [selectedSub, setSelectedSub] = useState("")
  const [selectedThird, setSelectedThird] = useState("")
  const [cities, setCities] = useState<string[]>([])
  const [areas, setAreas] = useState<string[]>([])
  const [selectedCity, setSelectedCity] = useState("全部")
  const [selectedArea, setSelectedArea] = useState("全部")
  const [order, setOrder] = useState("random")
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [cards, setCards] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // Init
  useEffect(() => {
    async function fetchData() {
      const { data: cats } = await supabase.from('categories').select('*')
      setCategories(cats || [])
      setMainCats((cats || []).filter(row => row.level === 1))
      const { data: cityObjs } = await supabase.from('cities').select('citys').neq('citys', null)
      setCities(["全部", ...Array.from(new Set(cityObjs?.map(c => c.citys).filter(Boolean)))])
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (!selectedMain) { setSubCats([]); setSelectedSub(""); setThirdCats([]); setSelectedThird(""); return }
    setSubCats(categories.filter(row => row.level === 2 && row.parent_id == selectedMain))
    setSelectedSub(""); setThirdCats([]); setSelectedThird("")
  }, [selectedMain, categories])
  useEffect(() => {
    if (!selectedSub) { setThirdCats([]); setSelectedThird(""); return }
    setThirdCats(categories.filter(row => row.level === 3 && row.parent_id == selectedSub))
    setSelectedThird("")
  }, [selectedSub, categories])
  useEffect(() => {
    async function fetchAreas() {
      if (selectedCity === "全部") { setAreas(["全部"]); setSelectedArea("全部"); return }
      const { data: ds } = await supabase.from('cities').select('district').eq('citys', selectedCity)
      setAreas(["全部", ...Array.from(new Set(ds?.map(a => a.district).filter(Boolean)))])
      setSelectedArea("全部")
    }
    fetchAreas()
  }, [selectedCity])

  useEffect(() => {
    fetchCards()
    // eslint-disable-next-line
  }, [selectedMain, selectedSub, selectedThird, selectedCity, selectedArea, order, page])

  async function fetchCards() {
    setLoading(true)
    let query = supabase.from('cards').select('*', { count: "exact" })
      .eq('is_paid', true)
    if (selectedMain) query = query.eq('category1', categories.find(c => c.id == selectedMain)?.name)
    if (selectedSub) query = query.eq('category2', categories.find(c => c.id == selectedSub)?.name)
    if (selectedThird) query = query.eq('category3', categories.find(c => c.id == selectedThird)?.name)
    if (selectedCity !== "全部") query = query.eq('citys', selectedCity)
    if (selectedArea !== "全部") query = query.eq('area', selectedArea)
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
        {/* 下拉選單＋排序 */}
        <div className="flex flex-wrap gap-6 mb-8 justify-center">
          <div className="flex flex-col items-start">
            <label className="mb-1 font-bold text-gray-600">主分類</label>
            <select
              className="p-2 rounded border"
              value={selectedMain}
              onChange={e => setSelectedMain(e.target.value)}
            >
              <option value="">全部</option>
              {mainCats.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
            </select>
          </div>
          <div className="flex flex-col items-start">
            <label className="mb-1 font-bold text-gray-600">次分類</label>
            <select
              className="p-2 rounded border"
              value={selectedSub}
              onChange={e => setSelectedSub(e.target.value)}
              disabled={!selectedMain}
            >
              <option value="">全部</option>
              {subCats.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
            </select>
          </div>
          <div className="flex flex-col items-start">
            <label className="mb-1 font-bold text-gray-600">細分類</label>
            <select
              className="p-2 rounded border"
              value={selectedThird}
              onChange={e => setSelectedThird(e.target.value)}
              disabled={!selectedSub}
            >
              <option value="">全部</option>
              {thirdCats.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
            </select>
          </div>
          <div className="flex flex-col items-start">
            <label className="mb-1 font-bold text-gray-600">城市</label>
            <select
              className="p-2 rounded border"
              value={selectedCity}
              onChange={e => setSelectedCity(e.target.value)}
            >
              {cities.map(city => <option key={city}>{city}</option>)}
            </select>
          </div>
          <div className="flex flex-col items-start">
            <label className="mb-1 font-bold text-gray-600">行政區</label>
            <select
              className="p-2 rounded border"
              value={selectedArea}
              onChange={e => setSelectedArea(e.target.value)}
            >
              {areas.map(area => <option key={area}>{area}</option>)}
            </select>
          </div>
          <div className="flex flex-col items-start">
            <label className="mb-1 font-bold text-gray-600">排序</label>
            <select className="p-2 rounded border" value={order} onChange={e=>setOrder(e.target.value)}>
              <option value="random">隨機排序</option>
              <option value="created">最新刊登</option>
              <option value="views">瀏覽最多</option>
            </select>
          </div>
        </div>
        {/* 結果列表 */}
               <div className="text-gray-700 mb-2">{loading ? "載入中..." : `共 ${total} 筆結果`}</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
          {cards.map(card => (
            <Link key={card.id} href={`/card/${card.url_slug}`}>
              <div className="bg-white rounded shadow flex flex-col items-center p-4 hover:shadow-md">
                <img src={card.image_url_front} alt={card.name} className="w-24 h-24 object-cover rounded mb-2" />
                <div className="font-bold text-blue-900">{card.name}</div>
                <div className="text-gray-500">{card.job}</div>
                <div className="text-xs text-gray-400">{card.company}</div>
                <div className="text-xs text-gray-400">{card.citys}{card.area && "・" + card.area}</div>
              </div>
            </Link>
          ))}
        </div>
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
