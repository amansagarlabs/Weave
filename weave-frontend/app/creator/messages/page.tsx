import { SurfacePage, Tabs } from "../../../components/surface";
import { MessageInbox } from "../../../components/message-inbox";
export default function CreatorMessages() { return <SurfacePage role="creator" title="Messages." action="Browse editors" actionHref="/creator/hire-editor"><Tabs labels={["All", "Unread", "Active briefs"]} /><div className="mt-6"><MessageInbox role="creator" /></div></SurfacePage>; }
