import { SurfacePage, Tabs } from "../../../components/surface";
import { EditRequestList } from "../../../components/edit-request-list";
export default function EditorRequests() { return <SurfacePage role="editor" title="Incoming requests." action="Manage gigs" actionHref="/editor/gigs"><Tabs labels={["All", "New", "In progress", "Delivered"]} /><div className="mt-6"><EditRequestList role="editor" /></div></SurfacePage>; }
