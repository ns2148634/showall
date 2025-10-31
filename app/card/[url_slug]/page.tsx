import CardPage from "./CardPage";

export default function Page({ params }: { params: { url_slug: string } }) {
  console.log('page.tsx params:', params);
  return <CardPage url_slug={params.url_slug} />;
}

