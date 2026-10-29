import { SurfacePage, Tabs } from "../../../components/surface";
import { EditRequestList } from "../../../components/edit-request-list";
export default function CreatorEditorRequests() { return <SurfacePage role="creator" title="Editor requests." action="Hire an editor" actionHref="/creator/hire-editor"><Tabs labels={["All", "Awaiting response", "In progress", "Complete"]} /><div className="mt-6"><EditRequestList role="creator" /></div></SurfacePage>; }
