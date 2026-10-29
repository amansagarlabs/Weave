import { SurfacePage } from "../../../../components/surface";
import { PackageForm } from "../../../../components/package-form";
export default async function EditEditorGig({ searchParams }: { searchParams: Promise<{ id?: string }> }) { const params = await searchParams; return <SurfacePage role="editor" title="Edit your gig." eyebrow="Gig menu"><PackageForm mode="edit" role="editor" packageId={params.id} /></SurfacePage>; }
