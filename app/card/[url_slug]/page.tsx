import CardPage from "./CardPage";

export default function Page({ params }: { params: { url_slug: string } }) {
  // 在這裡加 console log
  console.log('page.tsx params:', params);
  return <CardPage url_slug={params.url_slug} />;
}
