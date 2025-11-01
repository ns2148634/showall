import CardPage from "./CardPage";

export default async function Page({ params }: { params: any }) {
  const realParams = await params;
  // 只要拿 params.url_slug，不要 decode/encode
  const url_slug = realParams?.url_slug ?? "";

  return <CardPage url_slug={url_slug} />;
}
