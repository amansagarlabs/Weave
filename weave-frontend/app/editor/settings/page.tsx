import { SurfacePage } from "../../../components/surface";
import { EditorProfileForm } from "../../../components/editor-profile-form";
import { BillingSettingsCard } from "../../../components/billing-settings-card";
import { MfaSettingsCard } from "../../../components/mfa-settings-card";
export default function EditorSettings() { return <SurfacePage role="editor" title="Editor settings." description="Manage your public portfolio and profile details."><div className="space-y-6"><EditorProfileForm mode="settings" /><BillingSettingsCard /><MfaSettingsCard /></div></SurfacePage>; }
