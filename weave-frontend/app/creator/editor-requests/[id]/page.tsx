import { SurfacePage } from "../../../../components/surface";
import { EditRequestDetail } from "../../../../components/edit-request-detail";
export default async function CreatorEditorRequestDetail({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <SurfacePage role="creator" title={`Edit request ${id}`} eyebrow="Editor delivery"><EditRequestDetail id={id} role="creator" /></SurfacePage>; }
