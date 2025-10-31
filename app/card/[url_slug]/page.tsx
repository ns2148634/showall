import CardPage from "./CardPage";

// Next.js 15+ 支援 async/await 頁面 function，動態路由 params 有機會是 Promise
export default async function Page({ params }: { params: { url_slug: string } }) {
  // 如遇某些部署或 edge 環境 params 是 Promise，這樣寫更保險
  // const { url_slug } = await params; ← 如 params 真的是 Promise 才需要這行

  const { url_slug } = params;

  console.log("page.tsx url_slug:", url_slug);

  if (!url_slug) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-500 font-bold">參數錯誤</div>
      </div>
    );
  }

  return <CardPage url_slug={url_slug} />;
}
