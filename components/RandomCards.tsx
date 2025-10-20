"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"

export default function RandomCards() {
  const [cards, setCards] = useState<any[]>([])

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from('cards')
        .select('id, name, job, company, image_url_front, url_slug')
        .order('random()')
        .limit(6)
      setCards(data || [])
    }
    fetchData()
  }, [])


  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
      {cards.map(card => (
        <Link
          key={card.id}
          href={`/card/${card.url_slug}`}
          className="bg-white rounded shadow flex flex-col items-center p-4 hover:bg-blue-50 transition"
        >
          <img src={card.image_url_front} alt={card.name} className="w-24 h-24 object-cover rounded mb-2" />
          <div className="font-bold text-blue-900">{card.name}</div>
          <div className="text-gray-500">{card.job}</div>
          <div className="text-xs text-gray-400">{card.company}</div>
        </Link>
      ))}
    </div>
  )
}
