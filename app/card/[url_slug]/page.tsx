import CardPage from "./CardPage";

export default function Page({ params }: { params: { url_slug: string } }) {
  // server component 拿 params，再明確 props 傳下 client
  return <CardPage url_slug={params.url_slug} />;
}
