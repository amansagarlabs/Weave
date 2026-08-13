import { SurfacePage } from "../../../../components/surface";
import { MessageThread } from "../../../../components/message-thread";
export default async function BrandThread({ params }: { params: Promise<{ threadId: string }> }) { const { threadId } = await params; return <SurfacePage role="brand" title="Conversation" eyebrow={`Thread ${threadId}`}><MessageThread threadId={threadId} role="brand" /></SurfacePage>; }
