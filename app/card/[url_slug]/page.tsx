import CardPage from "./CardPage";

export default function Page({ params }: { params: { url_slug: string } }) {
  return <CardPage url_slug={params.url_slug} />;
}
