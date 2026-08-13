import { SurfacePage } from "../../../../components/surface";
import { MessageThread } from "../../../../components/message-thread";
export default async function CreatorThread({ params }: { params: Promise<{ threadId: string }> }) { const { threadId } = await params; return <SurfacePage role="creator" title="Conversation" eyebrow={`Thread ${threadId}`}><MessageThread threadId={threadId} role="creator" /></SurfacePage>; }
