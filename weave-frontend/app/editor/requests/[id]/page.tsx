import { SurfacePage } from "../../../../components/surface";
import { EditRequestDetail } from "../../../../components/edit-request-detail";
export default async function EditorRequestDetail({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <SurfacePage role="editor" title={`Request ${id}`} eyebrow="Delivery workspace" action="Back to requests" actionHref="/editor/requests"><EditRequestDetail id={id} role="editor" /></SurfacePage>; }
