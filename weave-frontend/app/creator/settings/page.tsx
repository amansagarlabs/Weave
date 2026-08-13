import { FormCard, SurfacePage } from "../../../components/surface";
export default function CreatorSettings() { return <SurfacePage role="creator" title="Creator settings." description="Manage account, GSTIN, notifications, and language preferences."><FormCard title="Account preferences" fields={["Email", "GSTIN", "Notification preference", "Language"]} /></SurfacePage>; }
