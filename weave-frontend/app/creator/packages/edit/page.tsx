import { SurfacePage } from "../../../../components/surface";
import { PackageForm } from "../../../../components/package-form";
export default async function EditCreatorPackage({ searchParams }: { searchParams: Promise<{ id?: string }> }) { const params = await searchParams; return <SurfacePage role="creator" title="Edit your package." eyebrow="Package menu"><PackageForm mode="edit" packageId={params.id} /></SurfacePage>; }
