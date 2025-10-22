import Link from 'next/link'
import RandomCards from '../components/RandomCards'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      

      <main className="max-w-3xl mx-auto py-10">
       <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
  <Link href="/search" className="block">
    <div className="bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl px-0 py-8 shadow-2xl flex flex-col items-center transition-transform hover:scale-105 active:scale-95 cursor-pointer">
      <span className="text-4xl mb-3 drop-shadow">🔍</span>
      <span className="text-lg font-bold tracking-wide mb-1 text-white">找名片</span>
      <span className="text-xs text-cyan-100 text-center">快速搜尋、找人找公司</span>
    </div>
  </Link>
  <Link href="/category" className="block">
    <div className="bg-gradient-to-br from-green-400 to-blue-400 rounded-2xl px-0 py-8 shadow-2xl flex flex-col items-center transition-transform hover:scale-105 active:scale-95 cursor-pointer">
      <span className="text-4xl mb-3 drop-shadow">📂</span>
      <span className="text-lg font-bold tracking-wide mb-1 text-white">分類瀏覽</span>
      <span className="text-xs text-blue-100 text-center">依主題、產業、縣市分類</span>
    </div>
  </Link>
  <Link href="/upload" className="block">
    <div className="bg-gradient-to-br from-yellow-400 to-pink-400 rounded-2xl px-0 py-8 shadow-2xl flex flex-col items-center transition-transform hover:scale-105 active:scale-95 cursor-pointer">
      <span className="text-4xl mb-3 drop-shadow">⏫</span>
      <span className="text-lg font-bold tracking-wide mb-1 text-white">上傳名片</span>
      <span className="text-xs text-pink-100 text-center">新創、商家與個人都能刊登</span>
    </div>
  </Link>
</div>


        <h3 className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">最新推薦名片</h3>
       const { data, error } = await supabase
  .from('cards')
  .select('id, name, company, image_url_front, url_slug')
  .eq('published', true)
  .order('created_at', { ascending: false })
  .limit(10);


      </main>
      <footer className="text-center text-gray-400 text-sm py-6 border-t mt-12">
        &copy; 2025 SHOWALL 百業名片網
      </footer>
    </div>
  )
}
