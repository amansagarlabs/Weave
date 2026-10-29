import { SurfacePage } from "../../../components/surface";
import { CreatorSettingsForm } from "../../../components/creator-settings-form";
import { BillingSettingsCard } from "../../../components/billing-settings-card";
import { MfaSettingsCard } from "../../../components/mfa-settings-card";

export default function CreatorSettings() {
  return (
    <SurfacePage role="creator" title="Creator settings." description="Manage your account email, language preference, and the public profile that sits behind your workspace.">
      <div className="space-y-6">
        <CreatorSettingsForm />
        <BillingSettingsCard />
        <MfaSettingsCard />
      </div>
    </SurfacePage>
  );
}
