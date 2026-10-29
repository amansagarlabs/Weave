import { SurfacePage, Tabs } from "../../../components/surface";
import { MessageInbox } from "../../../components/message-inbox";
export default function BrandMessages() { return <SurfacePage role="brand" title="Messages." action="Discover creators" actionHref="/brand/discover"><Tabs labels={["All", "Unread", "Active briefs"]} /><div className="mt-6"><MessageInbox role="brand" /></div></SurfacePage>; }
