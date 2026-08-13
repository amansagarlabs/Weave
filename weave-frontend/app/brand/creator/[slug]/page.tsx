import { PublicCreatorProfile } from "../../../../components/marketplace";

export default async function BrandCreatorProfile({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PublicCreatorProfile slug={slug} variant="brand" />;
}
