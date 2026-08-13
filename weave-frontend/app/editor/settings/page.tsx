import { FormCard, SurfacePage } from "../../../components/surface";
export default function EditorSettings() { return <SurfacePage role="editor" title="Editor settings." description="Manage your profile, payment preferences, and notifications."><FormCard title="Account preferences" fields={["Display name", "Payment-link email", "Notification preference", "Language"]} /></SurfacePage>; }
