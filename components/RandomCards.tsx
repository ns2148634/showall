"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { supabase } from "@/lib/supabaseClient"

type Card = {
  id: number;
  name: string;
  job?: string;
  company?: string;
  image_url_front: string;
  url_slug: string;
}

export default function RandomCards({ limit = 10 }: { limit?: number }) {
  const [cards, setCards] = useState<Card[]>([])

  useEffect(() => {
    async function fetchCards() {
      const { data } = await supabase
        .from('cards')
        .select('id, name, job, company, image_url_front, url_slug')
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(limit)
      
      if (data) setCards(data)
    }
    fetchCards()
  }, [limit])

  if (!cards.length) return <div className="text-center text-gray-400">暫無名片</div>

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
      {cards.map(card => (
        <Link key={card.id} href={`/card/${card.url_slug}`} className="block">
          <div className="rounded shadow hover:shadow-lg transition text-center p-4">
            <Image
              src={card.image_url_front}
              alt={card.name}
              width={96}
              height={96}
              className="w-24 h-24 object-cover rounded mx-auto mb-2"
            />
            <div className="font-bold text-blue-900">{card.name}</div>
            {card.job && <div className="text-gray-500 text-sm">{card.job}</div>}
            {card.company && <div className="text-xs text-gray-400">{card.company}</div>}
          </div>
        </Link>
      ))}
    </div>
  )
}
