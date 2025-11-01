import CardPage from "./CardPage";

export default function Page({ params }: { params: { url_slug?: string } }) {
  const url_slug = params?.url_slug ?? "";
  return <CardPage url_slug={url_slug} />;
}
