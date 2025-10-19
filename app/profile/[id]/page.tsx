import ProfileCard from "./ProfileCard";

export default async function Page({ params }) {
  // 模擬含正反面圖片的資料
  const data = {
    name: "王小明",
    category: "設計服務",
    region: "台北市",
    imgFront: "/card-demo-front.jpg",  // 名片正面示意圖
    imgBack: "/card-demo-back.jpg",    // 名片反面示意圖
    about: "專業設計 · 創意製作 · 品牌策略",
    profileUrl: `https://abcdn.tw/profile/${params.id}`,
  };

  return (
    <main className="min-h-screen bg-gradient-to-tr from-sky-100 to-blue-50 flex items-center justify-center">
      <ProfileCard data={data} />
    </main>
  );
}
