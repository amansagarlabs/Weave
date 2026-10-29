import { PublicCreatorProfile } from "../../../components/marketplace";
import { Footer } from "../../../components/footer";

export default async function PublicCreatorProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <><PublicCreatorProfile slug={slug} variant="creator" /><Footer /></>;
}
