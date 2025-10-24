// app/components/RandomCardsServer.tsx
import { createClient } from '@/lib/supabase-server' // 客製化 server-side Supabase client

export default async function RandomCardsServer({ limit = 10 }) {
  const supabase = createClient();
  const { data } = await supabase
    .from('cards')
    .select('id, name, job, company, image_url_front, url_slug')
    .eq('published', true)
    .order('RANDOM()')
    .limit(limit);

  if (!data) return <div>沒有名片資料</div>;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
      {data.map(card => (
        <a key={card.id} href={`/card/${card.url_slug}`} className="bg-white rounded shadow flex flex-col items-center p-4 hover:shadow-md">
          <img src={card.image_url_front} alt={card.name} className="w-24 h-24 object-cover rounded mb-2" />
          <div className="font-bold text-blue-900">{card.name}</div>
          <div className="text-gray-500">{card.job}</div>
          <div className="text-xs text-gray-400">{card.company}</div>
        </a>
      ))}
    </div>
  )
}
