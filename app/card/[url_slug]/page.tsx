import CardPage from "./CardPage";

// Next.js 15+ 某些部署 params 真的是 Promise，所以這樣寫更穩
export default async function Page({ params }: { params: any }) {
  // 保險起見都 await
  const realParams = await params;
  const url_slug = realParams?.url_slug ?? "";

  console.log("page.tsx url_slug（await解 Promise結果）:", url_slug);

  if (!url_slug) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-500 font-bold">參數錯誤</div>
      </div>
    );
  }

  return <CardPage url_slug={url_slug} />;
}
