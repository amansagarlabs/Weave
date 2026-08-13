import { PublicCreatorProfile } from "../../../components/marketplace";

export default async function PublicCreatorProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PublicCreatorProfile slug={slug} variant="creator" />;
}
