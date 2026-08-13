import { SurfacePage, StandardEmpty } from "../../../components/surface";
import { Tabs } from "../../../components/surface";
export default function CreatorMessages() { return <SurfacePage role="creator" title="Messages." action="Browse editors" actionHref="/creator/hire-editor"><Tabs labels={["All", "Unread", "Active briefs"]} /><div className="mt-6"><StandardEmpty title="Your inbox is quiet." copy="When a brand or editor reaches out, you’ll see the conversation and its work context here." href="/brand/discover" action="Explore brands" /></div></SurfacePage>; }
