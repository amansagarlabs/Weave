import { SurfacePage } from "../../../components/surface";
import { CreatorSettingsForm } from "../../../components/creator-settings-form";

export default function CreatorSettings() {
  return (
    <SurfacePage role="creator" title="Creator settings." description="Manage your account email, language preference, and the public profile that sits behind your workspace.">
      <CreatorSettingsForm />
    </SurfacePage>
  );
}
